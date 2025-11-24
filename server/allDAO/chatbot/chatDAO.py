import psycopg2
import psycopg2.extras
from openai import AzureOpenAI
import json
from datetime import date, datetime
import pytz
import re

class ChatDAO:
    def __init__(self, openai_client: AzureOpenAI, embedding_model_name: str, chat_model_name: str, db_conn, redis_conn):
        self.client = openai_client
        self.embedding_model = embedding_model_name
        self.chat_model = chat_model_name
        self.db_conn = db_conn
        self.redis_conn = redis_conn
        self.kst = pytz.timezone("Asia/Seoul")

    # --- 메인 라우터 ---
    def process_chat_request(self, user_key: str, received_text: str) -> dict:
        session_data = self._get_session_data(user_key)
        current_state = session_data.get("state", "initial_message")
        
        handler_map = {
            "initial_message": self._handle_initial_message,
            "product_recommendation": self._handle_product_recommendation,
            "product_usage": self._handle_product_usage
        }
        handler = handler_map.get(current_state, self._handle_initial_message)
        
        # 핸들러가 모든 처리를 담당하고, 최종 결과와 세션 데이터를 반환합니다.
        response_data, new_session_data = handler(user_key, received_text, session_data)

        self._save_session_data(user_key, new_session_data)
        return response_data
    
    # --- 상태별 handler ---
    # state = initial_message
    def _handle_initial_message(self, user_key: str, received_text: str, session_data: dict) -> tuple[dict, dict]:
        # 컨텍스트 확인
        context = session_data.get("context", {})
        recommended_products = context.get("recommended_products", [])
        
        # 제품 선택 여부 판단
        selected_product = next((p for p in recommended_products if p.get("button_text") == received_text), None)

        # 분기 처리 - 제품 선택
        if selected_product:
            print(f"✅ [{user_key}] 제품 버튼 클릭 감지. `_handle_product_recommendation`으로 위임합니다.")
            session_data["context"]["selected_product"] = selected_product
            return self._handle_product_recommendation(user_key, received_text, session_data)

        # 분기 처리 - 새로운 질문 처리
        chat_history = session_data.get("chat_history", [])
        now_time_str = datetime.now(self.kst).strftime("%p %I:%M").replace("AM", "오전").replace("PM", "오후")

        intent = self._classify_intent(received_text)
        if intent == "단순 대화":
            messages = (
                [{"role": "system", "content": "당신은 친절한 AI 챗봇입니다."}]
                + chat_history
                + [{"role": "user", "content": received_text}]
            )
            response = self.client.chat.completions.create(model=self.chat_model, messages=messages)
            ai_response = response.choices[0].message.content
            
            chat_history.append({"role": "user", "content": received_text, "time": now_time_str})
            chat_history.append({"role": "assistant", "content": ai_response, "time": now_time_str})
            session_data.update({"state": "initial_message", "chat_history": chat_history, "context": {}})
            return {"reply": ai_response}, session_data
        
        else: # 제품 추천
            chat_history.append({"role": "user", "content": received_text, "time": now_time_str})
            user_info = self._get_user_and_skin_data(user_key)
            retrieved_products = self._search_similar_products(user_info, received_text, limit=3)
            ai_response, button_texts = self._get_recommendation_response(user_info, received_text, chat_history, retrieved_products)
            
            chat_history.append({"role": "assistant", "content": ai_response, "time": now_time_str, "quickReplies": button_texts})
            
            new_context = {}
            for i, product in enumerate(retrieved_products):
                product["button_text"] = button_texts[i]
            new_context["recommended_products"] = retrieved_products
            
            session_data.update({"state": "initial_message", "chat_history": chat_history, "context": new_context})
            return {"reply": ai_response, "quick_replies": button_texts}, session_data
        
    # state = product_recommendation
    def _handle_product_recommendation(self, user_key: str, received_text: str, session_data: dict) -> tuple[dict, dict]:

        # 분기 처리 - 프리셋 저장에 대한 대답
        if received_text in ["예", "아니요"]:
            print(f"✅ [{user_key}] 프리셋 저장 여부 답변 감지. `_handle_product_usage`로 위임합니다.")
            return self._handle_product_usage(user_key, received_text, session_data)

        # 분기 처리 - 최초 진입
        chat_history = session_data.get("chat_history", [])
        context = session_data.get("context", {})
        now_time_str = datetime.now(self.kst).strftime("%p %I:%M").replace("AM", "오전").replace("PM", "오후")
        chat_history.append({"role": "user", "content": received_text, "time": now_time_str})

        selected_product = context["selected_product"]
        usage_guide = self._generate_usage_guide(selected_product)
        context["selected_product"]["usage_guide"] = usage_guide

        ai_response = f"{usage_guide}\n\n이 제품 정보를 프리셋에 저장하시겠습니까?"
        quick_replies = ["예", "아니요"]
        
        chat_history.append({"role": "assistant", "content": ai_response, "time": now_time_str, "quickReplies": quick_replies})
        
        session_data.update({"state": "product_recommendation", "chat_history": chat_history, "context": context})
        return {"reply": ai_response, "quick_replies": quick_replies}, session_data
    
    # state = product_usage
    def _handle_product_usage(self, user_key: str, received_text: str, session_data: dict) -> tuple[dict, dict]:
        chat_history = session_data.get("chat_history", [])
        context = session_data.get("context", {})
        now_time_str = datetime.now(self.kst).strftime("%p %I:%M").replace("AM", "오전").replace("PM", "오후")
        chat_history.append({"role": "user", "content": received_text, "time": now_time_str})
        
        if "예" in received_text:
            try:
                preset_title = self._generate_preset_title(chat_history)
                self._save_preset_to_db(user_key, preset_title, context["selected_product"])
                ai_response = "프리셋에 성공적으로 저장되었습니다."
            except Exception as e:
                ai_response = f"프리셋 저장 중 오류가 발생했습니다: {e}"
        else: # "아니요"
            ai_response = "알겠습니다. 다른 궁금한 점이 있다면 편하게 질문해주세요."

        chat_history.append({"role": "assistant", "content": ai_response, "time": now_time_str})
        session_data.update({"state": "initial_message", "chat_history": chat_history, "context": {}})
        return {"reply": ai_response}, session_data

    # --- 헬퍼 함수 ---
    # GPT
    # 채팅 의도 분류
    def _classify_intent(self, user_message: str) -> str:
        messages = [
            {"role": "system", "content": "당신은 사용자 질문의 의도를 [제품 추천] 또는 [단순 대화] 중 하나로만 분류하는 AI입니다."},
            {"role": "user", "content": user_message}
        ]
        try:
            response = self.client.chat.completions.create(model=self.chat_model, messages=messages, max_tokens=20, temperature=0)
            intent = response.choices[0].message.content.strip().replace('[', '').replace(']', '')
            return intent if intent in ["제품 추천", "단순 대화"] else "제품 추천"
        except Exception as e:
            print(f"⚠️ 의도 분류 중 오류 발생: {e}")
            return "제품 추천"
        
    # 사용자 맞춤 제품 검색
    def _search_similar_products(self, user_info: dict, query: str, limit: int) -> list:
        # 1. 사용자 데이터를 임베딩에 적합하게 가공합니다.
        processed_data = self._get_processed_user_data(user_info)
        
        # 2. 상세한 정보를 바탕으로 임베딩 입력을 생성합니다.
        embedding_input = f"""
[사용자 기본 정보]
- 나이: {processed_data['age']}세
- 성별: {processed_data.get('user_profile', {}).get('gender', '알 수 없음')}

[사용자 피부 분석 데이터]
- 안면부 여드름 개수: {processed_data.get('skin_analysis', {}).get('acne_count', 0)}개
- 안면부 여드름 면적 비율: {processed_data.get('skin_analysis', {}).get('acne_area_ratio', 0.0)}%
- 안면부 홍조 면적 비율: {processed_data.get('skin_analysis', {}).get('redness_area_ratio', 0.0)}%

[사용자 설문 조사 데이터 (바우만 피부 타입 테스트)]
- D/O 타입: {processed_data.get('do_desc', '')}
- 최종 피부 타입: {processed_data.get('survey_data', {}).get('baumann_skin_type', '알 수 없음')}

[사용자의 질문]
{query}
"""
        embedding_response = self.client.embeddings.create(input=embedding_input, model=self.embedding_model)
        embedding_vector = embedding_response.data[0].embedding
        
        # 3. DB에서 벡터 검색을 수행합니다.
        vector_sql = "ARRAY[%s]::vector" % ','.join(map(str, embedding_vector))
        with self.db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            search_sql = f"""
            SELECT product_name, product_type, product_ingredients, product_description 
            FROM products_tbl 
            ORDER BY product_embedding <=> {vector_sql} LIMIT {limit};
            """
            cur.execute(search_sql)
            search_results = cur.fetchall()
            return [dict(row) for row in search_results]

    # 제품 추천   
    def _get_recommendation_response(self, user_info: dict, query: str, chat_history: list, products: list) -> tuple[str, list]:
        print("[DEBUG] Calling `_get_recommendation_response`...")
        processed_data = self._get_processed_user_data(user_info)
        history_context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
        retrieved_context = "\n\n".join([f"- 제품명: {p['product_name']}\n  카테고리: {p['product_type']}\n  주요성분: {p['product_ingredients']}\n  제품소개문구: {p['product_description']}" for p in products])
        
        user_prompt = f"""
[이전 대화 내용]
{history_context}

[사용자 기본 정보]
- 나이: {processed_data.get('age', '알 수 없음')}세
- 성별: {processed_data.get('user_profile', {}).get('gender', '알 수 없음')}

[사용자 피부 분석 데이터]
- 안면부 여드름 개수: {processed_data.get('skin_analysis', {}).get('acne_count', 0)}개
- 안면부 여드름 면적 비율: {processed_data.get('skin_analysis', {}).get('acne_area_ratio', 0.0)}%
- 안면부 홍조 면적 비율: {processed_data.get('skin_analysis', {}).get('redness_area_ratio', 0.0)}%

[사용자 설문 조사 데이터 (바우만 피부 타입 테스트)]
- D/O 타입: {processed_data.get('do_desc', '')}
- S/R 타입: {processed_data.get('sr_desc', '')}
- P/N 타입: {processed_data.get('pn_desc', '')}
- W/T 타입: {processed_data.get('wt_desc', '')}
- 최종 피부 타입: {processed_data.get('survey_data', {}).get('baumann_skin_type', '알 수 없음')}

[사용자의 현재 질문]
{query}

[시스템이 찾아낸 관련 제품 목록]
{retrieved_context}

[지시사항]
1. 위의 모든 정보를 종합하여, 사용자에게 찾아낸 3가지 제품을 추천하는 '소개글'을 70자 이내로 작성해주세요.
2. 소개글 마지막에는 "제품 사용법이 궁금하시면 아래 버튼을 클릭해주시고, 다른 문의는 채팅으로 입력해주세요." 라는 안내 문구를 반드시 포함해주세요.
3. 소개글 작성 후, 빈 줄 하나를 띄고(예: \\n\\n), 각 제품에 대한 '간단한 설명'을 15자 이내로 각각 한 줄씩, 총 3줄을 생성해주세요. (제품명은 절대 포함하지 마세요)

[출력 예시]
고객님의 민감한 피부와 보습 고민에 맞춰 다음 제품들을 추천해 드립니다. 제품 사용법이 궁금하시면 아래 버튼을 클릭해주시고, 다른 문의는 채팅으로 입력해주세요.

피부 장벽 강화에 도움
수분 집중 공급 케어
저자극 진정 효과
"""
        messages = [
            {"role": "system", "content": "당신은 대한민국 최고의 피부 관리 전문가입니다. 사용자의 정보를 바탕으로 제품을 소개하고, 지정된 형식에 맞춰 버튼 텍스트를 생성해야 합니다."},
            {"role": "user", "content": user_prompt}
        ]
        response = self.client.chat.completions.create(model=self.chat_model, messages=messages)
        full_response = response.choices[0].message.content
        
        # GPT 응답 처리 및 버튼 텍스트 조합 로직
        parts = full_response.split('\n\n', 1)
        ai_response = parts[0]
        descriptions_str = parts[1] if len(parts) > 1 else ""
        descriptions = [line.strip() for line in descriptions_str.split('\n') if line.strip()]

        # 안전장치: 설명 개수가 제품 개수와 다를 경우
        if len(descriptions) != len(products):
            print(f"⚠️ GPT가 생성한 설명 개수({len(descriptions)})와 제품 개수({len(products)})가 다릅니다. 임의의 설명으로 대체합니다.")
            descriptions = ["상세 정보 보기"] * len(products)

        # Python에서 제품명과 설명을 안전하게 조합
        button_texts = []
        for i, product in enumerate(products):
            button_texts.append(f"{product['product_name']}: {descriptions[i]}")

        return ai_response, button_texts
    
    # 제품 사용 방법 생성
    def _generate_usage_guide(self, product: dict) -> str:
        prompt = f"""
'{product['product_name']}' 제품의 상세한 사용 방법과 주요 성분, 주의사항을 알려줘.

[지시사항]
1. 제품을 추천할 때는 어떤 성분 때문에, 왜 사용자에게 좋은지 그 이유를 반드시 설명해야 합니다.
2. 추천한 제품을 어떤 순서로, 어떻게 사용하면 좋을지 '스킨케어 루틴'을 상세히 제안해주세요. (예: 아침/저녁, 사용 순서, 주의사항 등)
3. 전문가적이고 신뢰도 높은 말투를 사용하되, 너무 딱딱하지 않게 친근한 어조를 유지해주세요.
"""
        response = self.client.chat.completions.create(model=self.chat_model, messages=[{"role": "user", "content": prompt}])
        return response.choices[0].message.content

    # 프리셋 임시 제목 생성
    def _generate_preset_title(self, chat_history: list) -> str:
        history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
        prompt = f"다음 대화 내용의 핵심 주제를 10자 이내의 제목으로 요약해줘.\n\n{history_str}"
        response = self.client.chat.completions.create(model=self.chat_model, messages=[{"role": "user", "content": prompt}], max_tokens=30)
        title = response.choices[0].message.content.strip().replace('"', '').replace("'", "")
        return title

    # 예상 질문 생성    
    def generate_quick_replies(self, user_info: dict) -> list[str]:
        processed_data = self._get_processed_user_data(user_info)
        
        prompt = f"""
[사용자 기본 정보]
- 나이: {processed_data['age']}세
- 성별: {processed_data.get('user_profile', {}).get('gender', '알 수 없음')}

[사용자 피부 분석 데이터]
- 안면부 여드름 개수: {processed_data.get('skin_analysis', {}).get('acne_count', 0)}개
- 안면부 여드름 면적 비율: {processed_data.get('skin_analysis', {}).get('acne_area_ratio', 0.0)}%
- 안면부 홍조 면적 비율: {processed_data.get('skin_analysis', {}).get('redness_area_ratio', 0.0)}%

[사용자 설문 조사 데이터 (바우만 피부 타입 테스트)]
- D/O 타입: {processed_data.get('do_desc', '')}
- S/R 타입: {processed_data.get('sr_desc', '')}
- P/N 타입: {processed_data.get('pn_desc', '')}
- W/T 타입: {processed_data.get('wt_desc', '')}
- 최종 피부 타입: {processed_data.get('survey_data', {}).get('baumann_skin_type', '알 수 없음')}
- 복합성 피부 가능성: {'있음' if processed_data.get('survey_data', {}).get('is_combination_skin') else '낮음'}

위 사용자 데이터를 가진 사람이 AI 뷰티 어드바이저에게 할 법한 질문 4개를 생성해줘. 각 질문은 다음 조건을 반드시 지켜야 해:
1. 제공된 사용자 안면부 피부 분석 데이터와 시용자의 바우만 피부 타입 테스트 설문조사 결과 데이터를 기반으로 질문을 만들어줘. 
2. 여드름 피부 문제에 대한 질문을 필수적으로 2개 생성해줘.
3. 한국어로 작성해줘.
4. 각 질문을 줄바꿈으로만 구분하고, 번호나 다른 기호는 절대 붙이지 마.
"""
        try:
            messages = [
                {"role": "system", "content": "당신은 사용자의 복합적인 피부 데이터를 분석하여, 가장 적절하고 개인화된 스킨케어 질문을 생성하는 AI입니다."},
                {"role": "user", "content": prompt}
            ]
            response = self.client.chat.completions.create(model=self.chat_model, messages=messages, temperature=0.7, max_tokens=200)
            content = response.choices[0].message.content
            quick_replies = [line.strip() for line in content.strip().split("\n") if line.strip()]
            return quick_replies[:4]
        except Exception as e:
            print(f"DAO: 예상 질문 생성 중 오류 -> {e}")
            # 오류가 발생하면 컨트롤러로 예외를 다시 던져서 처리하도록 합니다.
            raise e    

    # Redis
    # Redis에 저장된 정보 호출
    def _get_session_data(self, user_key: str) -> dict:
        session_json = self.redis_conn.get(user_key)
        if session_json:
            return json.loads(session_json)
        return {"state": "initial_message", "chat_history": [], "context": {}}
    
    # Redis에 정보 저장
    def _save_session_data(self, user_key: str, session_data: dict):
        self.redis_conn.set(user_key, json.dumps(session_data, ensure_ascii=False))
        self.redis_conn.expire(user_key, 300)

    # Redis에 채팅 기록 삭제
    def reset_chat_history(self, user_key: str) -> dict:
        self.redis_conn.delete(user_key)
        print(f"✅ [{user_key}] 대화 기록 초기화 완료")
        user_info = self._get_user_and_skin_data(user_key)
        new_quick_replies = self.generate_quick_replies(user_info)
        return {"quick_replies": new_quick_replies}
    
    # DB
    # DB에서 정보 호출
    def _get_user_and_skin_data(self, user_key: str) -> dict:
        """DB에서 사용자의 프로필, 설문, 최신 분석 결과를 조회하여 통합된 딕셔너리로 반환합니다."""
        print(f"🔄 [{user_key}] DB에서 사용자 정보 조회 시도")
        user_info = {}
        with self.db_conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # analysis_photo_tbl에서 가장 최신 기록을 가져오는 서브쿼리를 포함합니다.
            sql = """
                SELECT
                    u.user_birth,
                    u.user_gender,
                    s.survey_skin_do,
                    s.survey_skin_sr,
                    s.survey_skin_pn,
                    s.survey_skin_wt,
                    s.survey_skin_type,
                    s.survey_skin_combination_type,
                    a.analysis_photo_acne_count,
                    a.analysis_photo_acne_area,
                    a.analysis_photo_redness_area
                FROM
                    user_tbl u
                LEFT JOIN
                    survey_tbl s ON u.user_key = s.survey_user_key
                LEFT JOIN
                    (SELECT * FROM analysis_photo_tbl 
                     WHERE analysis_photo_user_key = %s 
                     ORDER BY analysis_photo_date DESC 
                     LIMIT 1) a ON u.user_key = a.analysis_photo_user_key
                WHERE
                    u.user_key = %s;
            """
            cur.execute(sql, (user_key, user_key))
            result = cur.fetchone()

            if result:
                user_info = {
                    "user_profile": {
                        "birth": result["user_birth"].strftime('%Y-%m-%d') if result["user_birth"] else None,
                        "gender": result["user_gender"]
                    },
                    "skin_analysis": {
                        "acne_count": result["analysis_photo_acne_count"],
                        "acne_area_ratio": float(result["analysis_photo_acne_area"]) if result["analysis_photo_acne_area"] is not None else 0.0,
                        "redness_area_ratio": float(result["analysis_photo_redness_area"]) if result["analysis_photo_redness_area"] is not None else 0.0
                    },
                    "survey_data": {
                        "baumann_do_score": int(result["survey_skin_do"]) if result["survey_skin_do"] is not None else 0,
                        "baumann_sr_score": int(result["survey_skin_sr"]) if result["survey_skin_sr"] is not None else 0,
                        "baumann_pn_score": int(result["survey_skin_pn"]) if result["survey_skin_pn"] is not None else 0,
                        "baumann_wt_score": int(result["survey_skin_wt"]) if result["survey_skin_wt"] is not None else 0,
                        "baumann_skin_type": result["survey_skin_type"],
                        "is_combination_skin": result["survey_skin_combination_type"]
                    }
                }
            else:
                # 사용자를 찾지 못한 경우, 빈 구조를 반환하여 오류를 방지합니다.
                print(f"⚠️ [{user_key}] DB에서 사용자 정보를 찾을 수 없습니다.")
                user_info = {
                    "user_profile": {}, "skin_analysis": {}, "survey_data": {}
                }
                
        return user_info
    
    def _save_preset_to_db(self, user_key: str, title: str, product: dict):
        with self.db_conn.cursor() as cur:
            sql = """
                INSERT INTO preset_tbl (preset_user_key, preset_concerns, preset_product_name, preset_usage_guide, preset_date)
                VALUES (%s, %s, %s, %s, %s)
            """
            cur.execute(sql, (user_key, title, product['product_name'], product['usage_guide'], date.today()))
        self.db_conn.commit()
        print(f"✅ [{user_key}] 프리셋 DB 저장 완료: {title}")    
    
    # 사용자 정보 가공
    def _get_processed_user_data(self, user_info: dict) -> dict:
        processed_data = user_info.copy()
        survey_scores = user_info.get("survey_data", {})
        
        # 점수 설명 생성
        do_score = survey_scores.get("baumann_do_score", 0)
        if 33 <= do_score <= 44: do_desc = "매우 유분이 많은 피부 (악지성)"
        elif 27 <= do_score < 33: do_desc = "약간 유분이 많은 피부 (약간 지성)"
        elif 17 <= do_score < 27: do_desc = "약간 건조한 피부 (약간 건성)"
        else: do_desc = "매우 건조한 피부 (건성)"
        
        sr_score = survey_scores.get("baumann_sr_score", 0)
        if 34 <= sr_score <= 72:
            sr_desc = "매우 민감한 피부"
        elif 30 <= sr_score < 34:
            sr_desc = "약간 민감한 피부"
        elif 25 <= sr_score < 30:
            sr_desc = "약간 저항성이 있는 피부"
        else:
            sr_desc = "저항성이 강한 피부"

        pn_score = survey_scores.get("baumann_pn_score", 0)
        if 31 <= pn_score <= 45:
            pn_desc = "과색소침착피부"
        else:
            pn_desc = "비과색소침착피부"

        wt_score = survey_scores.get("baumann_wt_score", 0)
        if 41 <= wt_score <= 85:
            wt_desc = "주름에 취약한 피부"
        else:
            wt_desc = "탄력 있는 피부"

        # 나이 계산
        birth_str = user_info.get("user_profile", {}).get("birth")
        age = "알 수 없음"
        if birth_str:
            today = date.today()
            birth_date = date.fromisoformat(birth_str)
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

        processed_data['age'] = age
        processed_data['do_desc'] = do_desc
        processed_data['sr_desc'] = sr_desc
        processed_data['pn_desc'] = pn_desc
        processed_data['wt_desc'] = wt_desc
        
        return processed_data