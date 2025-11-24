import uuid
import datetime
import traceback
import asyncpg
from azure.storage.blob import BlobServiceClient
from fastapi.responses import JSONResponse
import cv2
from torch import hamming_window


class ImageDAO:
    def __init__(self):
        # ✅ .env에서 Azure Blob 연결 문자열 읽기
        self.connect_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        assert self.connect_str, "AZURE_STORAGE_CONNECTION_STRING 환경변수를 설정하세요."

        # 컨테이너 이름도 env로 빼면 더 깔끔 (선택)
        self.acne_container_name = os.getenv("AZURE_ACNE_CONTAINER", "acneimage")
        self.redness_container_name = os.getenv("AZURE_REDNESS_CONTAINER", "rednessimage")

        self.blob_service_client = BlobServiceClient.from_connection_string(
            self.connect_str
        )


        # DB 설정
        self.db_config = {
            "user": "admin",
            "password": "qwe123",
            "database": "ai_skinview",
            "host": "20.81.185.103",
            "port": 5432,
        }

    ###########################################################################################################################################################################
    async def regSurvey(self, user_key, skin_do:float, skin_sr:float, skin_pn:float, skin_wt:float, skin_combination_type:bool):
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            print(f"[DEBUG] 받은 파일 id: {user_key}")
            print(f"[DEBUG] 요청 받은 데이터 - user_key: {user_key}, od: {skin_do}, sr: {skin_sr}, pn: {skin_pn}, wt: {skin_wt}")

            # skin_type 계산
            skin_type = self.calculate_survey_result(skin_do, skin_sr, skin_pn, skin_wt)
            print(f"[DEBUG] {user_key}의 피부타입은: {skin_type}")
            print(f"[DEBUG] {user_key}의 피부타입은: {skin_combination_type}")


            conn = await asyncpg.connect(**self.db_config)

            # 수정
            select_sql = """
                SELECT survey_user_key FROM survey_tbl
                WHERE survey_user_key = $1
            """
            existing = await conn.fetchrow(select_sql, user_key)
            print(f"[DEBUG] Existing data: {existing}")

            if existing:
                update_sql = """
                    UPDATE survey_tbl
                    SET survey_skin_do = $1,
                        survey_skin_sr = $2,
                        survey_skin_pn = $3,
                        survey_skin_wt = $4,
                        survey_skin_type = $5,
                        survey_skin_combination_type = $6
                    WHERE survey_user_key = $7
                """
                await conn.execute(
                    update_sql, skin_do, skin_sr, skin_pn, skin_wt, skin_type, skin_combination_type, user_key, 
                )
                print("[DEBUG] DB record updated")
                return JSONResponse({"result": "설문조사 수정 성공"}, headers=headers)
            else:
                insert_sql = """
                    INSERT INTO survey_tbl (survey_user_key, survey_skin_do, survey_skin_sr, survey_skin_pn, survey_skin_wt, survey_skin_type, survey_skin_combination_type)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """
                await conn.execute(
                    insert_sql, user_key, skin_do, skin_sr, skin_pn, skin_wt, skin_type, skin_combination_type
                )
                print("[DEBUG] DB record inserted")
                return JSONResponse({"result": "설문조사 성공"}, headers=headers)

        except Exception as e:
            print("[ERROR] 저장 중 오류:\n" + traceback.format_exc())
            return JSONResponse({"error": str(e)}, status_code=500)
        # except Exception as e:
        #     print(f"[ERROR] 저장 중 오류: {e}")
        #     return JSONResponse({"error": str(e)}, status_code=500)
        finally:
            if conn:
                await conn.close()

    def calculate_survey_result(self, skin_do:float, skin_sr:float, skin_pn:float, skin_wt:float):
        calculate = [
            ("유분/건조", skin_do, [
                (27, 44, "O"),  # 유분
                (11, 26, "D"),  # 건조
            ]),

            ("민감/저항", skin_sr, [
                (30, 75, "S"),  # 민감한 피부
                (18, 29, "R"),  # 저항력이 있는 피부
            ]),

            ("색소 침착", skin_pn, [
                (31, 45, "P"),  # 색소성(Pigmented)
                (10, 30, "N"),  # 비색소성(Non-Pigmented)
            ]),

            ("주름", skin_wt, [
                (41, 85, "W"),  # 주름성 (Wrinkled) 
                (20, 40, "T"),  # 비주름성 (Tight) 
            ]),
        ]

        skin_type = ""
        for test_name, score, criteria in calculate:
            for min_s, max_s, symbol in criteria:
                if min_s <= score <= max_s:
                    skin_type += symbol
                    break
            print(f"{test_name} 결과: {symbol}")
        print(f"[DEBUG] 계산 결과: {skin_type}")

        return skin_type

    # 설문조사 결과값 불러오기
    async def get_skin_type_by_user(self, user_key):
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)

            select_sql = """
                SELECT DISTINCT survey_skin_type
                FROM survey_tbl
                WHERE survey_user_key = $1
            """

            rows = await conn.fetch(select_sql, user_key)
            skin_type = [str(rows[0]["survey_skin_type"])]
            print(f"[DEBUG] DB에서 받은 값: {skin_type}")

            return JSONResponse({"skin_type": skin_type}, headers=h)

        except Exception as e:
            print("DB Error:", e)
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)

        finally:
            if conn:
                await conn.close()

    async def get_skin_type_by_user(self, user_key):
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)

            select_sql = """
                SELECT DISTINCT survey_skin_type
                FROM survey_tbl
                WHERE survey_user_key = $1
            """

            rows = await conn.fetch(select_sql, user_key)
            skin_type = [str(rows[0]["survey_skin_type"])]
            print(f"[DEBUG] DB에서 받은 값: {skin_type}")

            return JSONResponse({"skin_type": skin_type}, headers=h)

        except Exception as e:
            print("DB Error:", e)
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)

        finally:
            if conn:
                await conn.close()

###########################################################################################################################################################################

    async def regImage(
        self,
        acne_image,
        redness_image,
        user_key,
        date: str,
        acne_count,
        acne_area,
        redness_area,
    ):
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            print(f"[DEBUG] 받은 날짜: {date}")
            print(f"[DEBUG] 받은 파일 id: {user_key}")

            # 문자열 → datetime.date 변환
            date_obj = datetime.date.fromisoformat(date)

            # DB 연결
            conn = await asyncpg.connect(**self.db_config)

            # 파일 읽기
            # image = await photo.read()
            success1, encoded_acne_image = cv2.imencode(".jpg", acne_image)
            success2, encoded_redness_image = cv2.imencode(".jpg", redness_image)
            if not (success1 and success2):
                raise RuntimeError("이미지를 다시 JPG로 인코딩하지 못했습니다.")
            acne_data = encoded_acne_image.tobytes()
            redness_data = encoded_redness_image.tobytes()

            print(f"[DEBUG] Blob data size: {len(acne_data)} bytes")
            print(f"[DEBUG] Blob data size: {len(redness_data)} bytes")

            # 새 파일 이름 및 업로드
            acne_filename = f"{uuid.uuid4()}.jpg"
            redness_filename = f"{uuid.uuid4()}.jpg"

            acne_blob_client = self.blob_service_client.get_blob_client(
                container=self.acne_container_name, blob=acne_filename
            )
            redness_blob_client = self.blob_service_client.get_blob_client(
                container=self.redness_container_name, blob=redness_filename
            )

            acne_blob_client.upload_blob(acne_data, overwrite=True)
            redness_blob_client.upload_blob(redness_data, overwrite=True)

            acne_url = f"https://{self.blob_service_client.account_name}.blob.core.windows.net/{self.acne_container_name}/{acne_filename}"
            redness_url = f"https://{self.blob_service_client.account_name}.blob.core.windows.net/{self.redness_container_name}/{redness_filename}"

            # acne_url = acne_blob_client.url
            # redness_url = redness_blob_client.url

            # print(f"[DEBUG] Blob uploaded: {url}")

            # 기존 이미지 조회
            select_sql = """
                SELECT analysis_photo_user_key, analysis_photo_date, analysis_photo_acne_url, analysis_photo_redness_url FROM analysis_photo_tbl
                WHERE analysis_photo_user_key = $1 AND analysis_photo_date = $2
            """
            existing = await conn.fetchrow(select_sql, user_key, date_obj)
            print(f"[DEBUG] Existing data: {existing}")

            if existing:
                # 기존 Blob 삭제
                old_acne_url = existing["analysis_photo_acne_url"]
                old_redness_url = existing["analysis_photo_redness_url"]

                old_acne_blob_name = old_acne_url.split(
                    f"/{self.acne_container_name}/"
                )[-1].split("?")[0]
                old_redness_blob_name = old_redness_url.split(
                    f"/{self.redness_container_name}/"
                )[-1].split("?")[0]

                old_acne_blob_client = self.blob_service_client.get_blob_client(
                    container=self.acne_container_name, blob=old_acne_blob_name
                )
                old_redness_blob_client = self.blob_service_client.get_blob_client(
                    container=self.redness_container_name, blob=old_redness_blob_name
                )

                # print(f"[DEBUG] Old blob deleted: {old_acne_blob_name}")
                # print(f"[DEBUG] Old blob deleted: {old_redness_blob_name}")

                # DB 업데이트
                try:
                    update_sql = """
                                UPDATE analysis_photo_tbl
                                SET analysis_photo_acne_url = $1,
                                    analysis_photo_redness_url = $2,
                                    analysis_photo_acne_count = $3,
                                    analysis_photo_acne_area = $4,
                                    analysis_photo_redness_area = $5
                                WHERE analysis_photo_user_key = $6 AND analysis_photo_date = $7
                            """

                    await conn.execute(
                        update_sql,
                        acne_url,
                        redness_url,
                        acne_count,
                        acne_area,
                        redness_area,
                        existing["analysis_photo_user_key"],
                        existing["analysis_photo_date"],
                    )
                    # print("[DEBUG] DB record updated")
                    old_acne_blob_client.delete_blob()
                    old_redness_blob_client.delete_blob()
                except Exception as e:
                    print(f"[ERROR] DB업데이트 실패: {e}")
                    try:
                        acne_blob_client.delete_blob()
                    except Exception as ex:
                        print(f"[WARN] 새 acne blob 삭제 실패: {ex}")
                    try:
                        redness_blob_client.delete_blob()
                    except Exception as ex:
                        print(f"[WARN] 새 redness blob 삭제 실패: {ex}")
                    raise

                return JSONResponse(
                    {"result": f"{acne_url, redness_url} 업데이트 성공"}, headers=h
                )
            else:
                # DB 추가
                try:
                    insert_sql = """
                        INSERT INTO analysis_photo_tbl (analysis_photo_user_key, analysis_photo_date, analysis_photo_acne_url, analysis_photo_redness_url, analysis_photo_acne_count, analysis_photo_acne_area, analysis_photo_redness_area)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """
                    await conn.execute(
                        insert_sql,
                        user_key,
                        date_obj,
                        acne_url,
                        redness_url,
                        acne_count,
                        acne_area,
                        redness_area,
                    )
                except Exception as e:
                    print(f"[ERROR] DB삽입 실패: {e}")

                    try:
                        acne_blob_client.delete_blob()
                    except Exception as ex:
                        print(f"[WARN] 새 acne blob 삭제 실패: {ex}")
                    try:
                        redness_blob_client.delete_blob()
                    except Exception as ex:
                        print(f"[WARN] 새 redness blob 삭제 실패: {ex}")
                    raise
                print("[DEBUG] DB record inserted")
                return JSONResponse(
                    {"result": f"{acne_url, redness_url} 추가 성공"}, headers=h
                )

        except Exception as e:
            print("[ERROR]", e)
            traceback.print_exc()
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)
        finally:
            if conn:
                await conn.close()

###########################################################################################################################################################################

    async def select(self, user_key, date: str):
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            # 문자열 → datetime.date 변환
            date_obj = datetime.date.fromisoformat(date)

            conn = await asyncpg.connect(**self.db_config)

            select_sql = """
                SELECT analysis_photo_acne_url, analysis_photo_redness_url FROM analysis_photo_tbl
                WHERE analysis_photo_user_key = $1 AND analysis_photo_date = $2
            """
            row = await conn.fetchrow(select_sql, user_key, date_obj)
            # print(f"[DEBUG] select result: {row}")

            if row:
                return JSONResponse(
                    {
                        "analysis_photo_acne_url": row["analysis_photo_acne_url"],
                        "analysis_photo_redness_url": row["analysis_photo_redness_url"],
                    },
                    headers=h,
                )
            else:
                return JSONResponse({"result": "해당 데이터 없음"}, headers=h)
        except Exception as e:
            print("[ERROR]", e)
            traceback.print_exc()
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)
        finally:
            if conn:
                await conn.close()

    ###########################################################################################################################################################################

    async def get_dates_by_user(self, user_key):
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)

            select_sql = """
                SELECT DISTINCT analysis_photo_date
                FROM analysis_photo_tbl
                WHERE analysis_photo_user_key = $1
                ORDER BY analysis_photo_date DESC
            """

            rows = await conn.fetch(select_sql, user_key)
            dates = [str(row["analysis_photo_date"]) for row in rows]

            return JSONResponse({"dates": dates}, headers=h)

        except Exception as e:
            print("DB Error:", e)
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)

        finally:
            if conn:
                await conn.close()

    ###########################################################################################################################################################################

    async def get_acne(self, user_key: str, date: str):
        """
        user_key, date에 해당하는 여드름 개수와 면적 정보 조회
        """
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            date_obj = datetime.date.fromisoformat(date)
            conn = await asyncpg.connect(**self.db_config)

            select_sql = """
                SELECT analysis_photo_acne_count, analysis_photo_acne_area, analysis_photo_redness_area 
                FROM analysis_photo_tbl 
                WHERE analysis_photo_user_key = $1 AND analysis_photo_date = $2
            """
            row = await conn.fetchrow(select_sql, user_key, date_obj)
            print(f"[DEBUG] get_acne result: {row}")

            if row:
                return JSONResponse(
                    {
                        "acne_count": row["analysis_photo_acne_count"],
                        "acne_area": float(row["analysis_photo_acne_area"]),
                        "redness_area": float(row["analysis_photo_redness_area"]),
                    },
                    headers=h,
                )
            else:
                return JSONResponse({"result": "해당 데이터 없음"}, headers=h)
        except Exception as e:
            print("[ERROR]", e)
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)
        finally:
            if conn:
                await conn.close()

    ############################################################################################################################

    async def get_dates_with_acne_info(self, user_key: str):
        """
        특정 user_key에 대한 날짜, 여드름 개수, 여드름 면적 정보를 모두 조회
        """
        h = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
        }
        conn = None
        try:
            conn = await asyncpg.connect(**self.db_config)

            select_sql = """
                SELECT analysis_photo_date, analysis_photo_acne_count, analysis_photo_acne_area, analysis_photo_redness_area 
                FROM analysis_photo_tbl
                WHERE analysis_photo_user_key = $1
                ORDER BY analysis_photo_date DESC
            """
            rows = await conn.fetch(select_sql, user_key)

            result = [
                {
                    "acne_date": str(row["analysis_photo_date"]),
                    "acne_count": row["analysis_photo_acne_count"],
                    "acne_area": float(row["analysis_photo_acne_area"]),
                    "redness_area": float(row["analysis_photo_redness_area"]),
                }
                for row in rows
            ]

            return JSONResponse({"data": result}, headers=h)

        except Exception as e:
            print("[ERROR]", e)
            return JSONResponse({"result": "DB 오류: " + str(e)}, headers=h)
        finally:
            if conn:
                await conn.close()
