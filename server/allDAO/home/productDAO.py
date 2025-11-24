from fastapi.responses import JSONResponse
from openai import AzureOpenAI
import asyncpg
import json
from datetime import date

class ProductDAO:
    def __init__(self, client: AzureOpenAI, embedding_model_name: str):
        # DB 설정
        self.db_config = {
            "user": "admin",
            "password": "qwe123",
            "database": "ai_skinview",
            "host": "20.81.185.103",
            "port": 5432,
        }
        # [수정] Azure OpenAI 클라이언트 및 모델명 초기화
        self.client = client
        self.embedding_model_name = embedding_model_name

    async def get_product(self, skin_type: str):
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)
            query = """
                SELECT product_name, product_description, product_image, product_link, product_type, product_brand
                FROM products_tbl WHERE product_type = $1
            """
            rows = await conn.fetch(query, skin_type)
            products = [{"product_name": r["product_name"], "product_description": r["product_description"],
                         "product_image": r["product_image"], "product_link": r["product_link"],
                         "product_type": r["product_type"], "product_brand": r["product_brand"]} for r in rows]
            return JSONResponse(content=products)
        except Exception as e:
            return JSONResponse(content={"error": str(e)}, status_code=500)
        finally:
            if conn:
                await conn.close()

    # [수정] 맞춤형 제품 추천
    async def get_advanced_recommendations(self, user_key: str):
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)
            print(f"[INFO] 고급 추천 로직 시작 (User: {user_key})")

            # 1. DB에서 사용자 프로필(개인정보, 설문, 사진 분석 결과) 종합적으로 조회
            user_profile = await self._get_user_profile(conn, user_key)
            
            if not user_profile:
                return JSONResponse(content={"error": "유효하지 않은 사용자 키입니다."}, status_code=404)

            # 2. 조회된 사용자 정보를 바탕으로 나이, 바우만 점수 설명 등 추가 정보 가공
            processed_profile = self._get_processed_user_data(user_profile)
            skin_type = processed_profile.get("survey_skin_type")

            # 3. 사용자의 피부 타입에 대한 상세 정보를 DB에서 조회 (1단계 RAG 검색)
            skin_type_details = await self._get_skin_type_details(conn, skin_type)

            # 4. 사용자 정보와 피부 타입 상세 정보를 합쳐 임베딩을 위한 '슈퍼 프롬프트' 생성
            rag_prompt = self._create_rag_prompt(processed_profile, skin_type_details)
            print(f"[INFO] 생성된 RAG 프롬프트: {rag_prompt[:200]}...")

            # 5. Azure Embedding API를 호출하여 프롬프트를 벡터로 변환
            query_vector = await self._get_embedding(rag_prompt)

            # 6. 생성된 벡터로 DB에서 유사도가 높은 제품 검색 (요청사항: 7개로 변경)
            candidate_products = await self._find_similar_products(conn, query_vector, limit=7)
            
            # 7. 최종 반환 데이터 구조 조립
            final_response = {
                "user_id": user_profile.get("user_id"),
                "recommendations": candidate_products # DB 검색 결과를 바로 사용
            }

            return JSONResponse(content=final_response)

        except Exception as e:
            print(f"[ERROR] 고급 추천 제품 조회 중 오류 발생: {e}")
            return JSONResponse(content={"error": str(e)}, status_code=500)
        finally:
            if conn:
                await conn.close()

    async def _get_user_profile(self, conn, user_key: str):
        """헬퍼 메서드: user_key로 여러 테이블에서 사용자 정보를 조회하고 종합합니다."""
        query = """
            SELECT
                u.user_id, 
                u.user_gender,
                u.user_birth,
                s.survey_skin_type,
                s.survey_skin_do,
                s.survey_skin_sr,
                s.survey_skin_pn,
                s.survey_skin_wt,
                s.survey_skin_combination_type,
                a.analysis_photo_acne_count,
                a.analysis_photo_acne_area,
                a.analysis_photo_redness_area
            FROM user_tbl u
            LEFT JOIN survey_tbl s ON u.user_key = s.survey_user_key
            LEFT JOIN (
                SELECT *, ROW_NUMBER() OVER(PARTITION BY analysis_user_key ORDER BY analysis_photo_date DESC) as rn
                FROM analysis_photo_tbl
            ) a ON u.user_key = a.analysis_user_key AND a.rn = 1
            WHERE u.user_key = $1;
        """
        row = await conn.fetchrow(query, user_key)
        return dict(row) if row else None

    def _get_processed_user_data(self, user_profile: dict) -> dict:
        """헬퍼 메서드: DB에서 가져온 사용자 정보를 가공하여 나이, 점수 설명 등을 추가합니다."""
        processed_data = dict(user_profile)

        # 바우만 점수 설명 생성
        do_score = user_profile.get("survey_skin_do", 0)
        if 33 <= do_score <= 44: processed_data['do_desc'] = "매우 유분이 많은 피부 (악지성)"
        elif 27 <= do_score < 33: processed_data['do_desc'] = "약간 유분이 많은 피부 (약간 지성)"
        elif 17 <= do_score < 27: processed_data['do_desc'] = "약간 건조한 피부 (약간 건성)"
        else: processed_data['do_desc'] = "매우 건조한 피부 (건성)"

        sr_score = user_profile.get("survey_skin_sr", 0)
        if 34 <= sr_score <= 72: processed_data['sr_desc'] = "매우 민감한 피부"
        elif 30 <= sr_score < 34: processed_data['sr_desc'] = "약간 민감한 피부"
        elif 25 <= sr_score < 30: processed_data['sr_desc'] = "약간 저항성이 있는 피부"
        else: processed_data['sr_desc'] = "저항성이 강한 피부"

        pn_score = user_profile.get("survey_skin_pn", 0)
        if 31 <= pn_score <= 45: processed_data['pn_desc'] = "과색소침착피부"
        else: processed_data['pn_desc'] = "비과색소침착피부"

        wt_score = user_profile.get("survey_skin_wt", 0)
        if 41 <= wt_score <= 85: processed_data['wt_desc'] = "주름에 취약한 피부"
        else: processed_data['wt_desc'] = "탄력 있는 피부"

        # 나이 계산
        birth_date = user_profile.get("user_birth")
        if birth_date:
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            processed_data['age'] = age
        else:
            processed_data['age'] = "알 수 없음"
            
        return processed_data

    async def _get_skin_type_details(self, conn, skin_type: str) -> str:
        """헬퍼 메서드: baumann_info_tbl에서 특정 피부 타입의 모든 정보를 가져와 텍스트로 합칩니다."""
        if not skin_type: return ""
        
        query = "SELECT baumann_info_category, baumann_info_content FROM baumann_info_tbl WHERE baumann_info_skin_type = $1;"
        rows = await conn.fetch(query, skin_type)
        
        full_text = "\n".join([f"[{row['baumann_info_category']}]\n{row['baumann_info_content']}" for row in rows])
        print(f"[INFO] {skin_type} 타입에 대한 {len(rows)}개의 상세 정보 조회 완료.")
        return full_text

    def _create_rag_prompt(self, profile: dict, skin_details: str) -> str:
        """헬퍼 메서드: 사용자 정보와 피부 상세 정보를 결합하여 임베딩을 위한 최종 프롬프트를 생성합니다."""
        age = profile.get('age', '알 수 없음')
        age_group = f"{age // 10 * 10}대" if isinstance(age, int) else age
        user_query = "현재 내 피부 상태에 가장 잘 맞는 스킨케어 제품을 추천해줘."

        prompt = f"""
            [사용자 기본 정보]
            - 나이: {age_group}
            - 성별: {profile.get('user_gender', '알 수 없음')}

            [사용자 피부 분석 데이터]
            - 최종 피부 타입: {profile.get('survey_skin_type')}
            - 상세 분석: {profile.get('do_desc')}, {profile.get('sr_desc')}, {profile.get('pn_desc')}, {profile.get('wt_desc')}
            - 복합성 피부 가능성: {'높음' if profile.get('survey_skin_combination_type') else '낮음'}
            - 최근 촬영 사진 분석: 안면부 여드름 {profile.get('analysis_photo_acne_count', 0)}개, 홍조 면적 {profile.get('analysis_photo_redness_area', 0)}%

            [사용자 피부 타입({profile.get('survey_skin_type')}) 상세 정보]
            {skin_details}

            [사용자의 현재 질문]
            {user_query}
        """
        return prompt

    async def _get_embedding(self, text: str) -> list[float]:
        """헬퍼 메서드: Azure Embedding API를 호출합니다."""
        print("[INFO] Azure Embedding API 호출 중...")
        response = await self.client.embeddings.create(input=[text], model=self.embedding_model_name)
        return response.data[0].embedding

    async def _find_similar_products(self, conn, vector: list[float], limit: int = 7):
        """헬퍼 메서드: pgvector의 코사인 유사도를 사용하여 제품을 검색합니다."""
        query = """
            SELECT product_name, product_description, product_image, product_link, product_type
            FROM products_tbl
            ORDER BY product_embedding <=> $1
            LIMIT $2;
        """
        rows = await conn.fetch(query, str(vector), limit)
        print(f"[INFO] 벡터 검색으로 {len(rows)}개의 유사 제품 후보 탐색 완료.")
        return [dict(row) for row in rows]

    async def search_products_by_name(self, keyword: str):
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)

            query = """
                SELECT product_name, product_description, product_image, product_link, product_type
                FROM products_tbl
                WHERE product_name ILIKE '%' || $1 || '%'
            """
            
            rows = await conn.fetch(query, keyword)

            products = [
                {
                    "product_name": row["product_name"],
                    "product_description": row["product_description"],
                    "product_image": row["product_image"],
                    "product_link": row["product_link"],
                    "product_type": row["product_type"],
                }
                for row in rows
            ]

            return JSONResponse(content=products)

        except Exception as e:
            return JSONResponse(content={"error": str(e)}, status_code=500)

        finally:
            if conn:
                await conn.close()