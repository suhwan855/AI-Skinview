from allDAO.check_face.check_face import Check_face
from allDAO.image.imageDAO import ImageDAO
from allDAO.chatbot.chatDAO import ChatDAO
from allDAO.home.product.productDAO import ProductDAO
from allDAO.chatbot.chatRequest import  UserKeyRequest, ChatRequest, ResetRequest, initialize_resources
from allDAO.signup.signupRequest import SignupRequest, hash_password, verify_password
from allDAO.home.product.productRequest import Product
from allDAO.login.loginRequest import UserKeyData, UpdateAddress, UpdatePassword
from allDAO.routine.routine_crud import DeleteRoutineRequest, RoutineRequest
from fastapi import FastAPI, UploadFile, Request, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import AzureOpenAI
from allDAO.image.iPPC import Preprocess_img
from datetime import datetime
import uuid
import psycopg2
import re



AZURE_CONFIG = {
    "api_key": os.getenv("AZURE_OPENAI_KEY"),
    "azure_endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
    "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
}
assert AZURE_CONFIG["api_key"], "AZURE_OPENAI_KEY 환경변수를 설정하세요."
assert AZURE_CONFIG["azure_endpoint"], "AZURE_OPENAI_ENDPOINT 환경변수를 설정하세요."

EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "biniffy-embedding")
DEPLOYMENT_NAME = os.getenv("DEPLOYMENT_NAME", "gpt-4o-mini")

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "ai_skinview"),
    "user": os.getenv("DB_USER", "admin"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
}
assert DB_CONFIG["password"], "DB_PASSWORD 환경변수를 설정하세요."

REDIS_CONFIG = {
    "host": os.getenv("REDIS_HOST", "localhost"),
    "port": int(os.getenv("REDIS_PORT", "6379")),
    "db": int(os.getenv("REDIS_DB", "0")),
    # 비번 쓰는 Redis면 이것도 추가
    "password": os.getenv("REDIS_PASSWORD") or None,
}

client = AzureOpenAI(**AZURE_CONFIG)
app = FastAPI()
pDAO = ProductDAO(client, EMBEDDING_MODEL_NAME)
iDAO = ImageDAO()
check_face = Check_face()
process_img = Preprocess_img()

# --- FastAPI 앱 및 리소스 변수 초기화 ---
chat_dao = None
kst = None
db_conn = None

UPLOAD_DIR = "uploaded_images"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중엔 * / 배포 땐 정확한 도메인으로
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [수정] 사용자 데이터를 종합 분석하고 AI를 활용하여 개인화된 제품을 추천하는 API
@app.post("/get.advanced_recommendations/")
async def get_advanced_recommendations(user_key: str = Form()):
    return await pDAO.get_advanced_recommendations(user_key)

@app.post("/get.products/")
async def get_products(product_type: str = Form()):
    return await pDAO.get_product(product_type)

@app.post("/upload/")
async def upload_camera(
    photo: UploadFile = File(...),
    user_key: str = Form(...),
    date: str = Form(...),
):
    check_result = await check_face.check_face(photo)

    if check_result is not None:
        acne_image, redness_image, acne_count, acne_area, redness_area = check_result
        acne_area = round(acne_area, 2)
        redness_area = round(redness_area, 2)
        print(f"[INFO] 여드름 개수: {acne_count}, 비율: {acne_area}")
        return await iDAO.regImage(acne_image, redness_image, user_key, date, acne_count, acne_area, redness_area)
    else:
        print("Error!")
        return await error_send()

@app.post("/get.data/")
async def getData(
    date: str = Form(...),
    user_key: str = Form(...)
):
    return await iDAO.select(user_key, date)

@app.post("/dates/")
async def get_dates(user_key: str = Form()):
    return await iDAO.get_dates_by_user(user_key)

@app.post("/get.acne/")
async def getAcne(user_key: str = Form(), date: str = Form()):
    return await iDAO.get_acne(user_key, date)

@app.post("/get.dates_acne/")
async def getAcne(user_key: str = Form()):
    return await iDAO.get_dates_with_acne_info(user_key)

####################################################################################################

# 설문조사 값 저장
@app.post("/survey/")
async def upload_survey(
    user_key: str = Form(...),
    skin_do: float = Form(...),
    skin_sr: float = Form(...),
    skin_pn: float = Form(...),
    skin_wt: float = Form(...),
    skin_combination_type: bool = Form(...),
):
    return await iDAO.regSurvey(user_key, skin_do, skin_sr, skin_pn, skin_wt, skin_combination_type)

# 설문조사 결과 불러오기
@app.post("/skin.type/")
async def get_skin_type(user_key: str = Form()):
    return await iDAO.get_skin_type_by_user(user_key)

####################################################################################################

# --- 채팅방 첫 입장 시 호출되는 API ---
@app.post("/start_chat/")
async def start_chat(request: UserKeyRequest):
    try:
        chat_dao = initialize_resources()
        
        session_data = chat_dao._get_session_data(request.user_key)
        chat_history = session_data.get("chat_history", [])
        
        initial_messages = []
        if chat_history:
            # 대화 기록이 있으면, 프론트엔드 형식에 맞게 변환
            for i, msg in enumerate(chat_history):
                message_item = {
                    "id": f"{msg.get('role', 'bot')}-{i}",
                    "type": "bot" if msg.get("role") == "assistant" else "user",
                    "text": msg.get("content", ""),
                    "time": msg.get("time", "")
                }
                if msg.get("quickReplies"):
                    message_item["quickReplies"] = msg.get("quickReplies")
                initial_messages.append(message_item)
        else:
            # 대화 기록이 없으면, 환영 메시지와 새로운 추천 질문 생성
            user_info = chat_dao._get_user_and_skin_data(request.user_key)
            quick_replies = chat_dao.generate_quick_replies(user_info)
            welcome_message = {
                "id": "bot-welcome",
                "type": "bot",
                "text": "무엇을 도와드릴까요?",
                "time": datetime.now(kst).strftime("%p %I:%M").replace("AM", "오전").replace("PM", "오후"),
                "quickReplies": quick_replies
            }
            initial_messages.append(welcome_message)
            # 첫 입장 시, Redis에 기본 세션 생성
            chat_dao._save_session_data(request.user_key, {"state": "initial_message", "chat_history": [], "context": {}})

        initial_data = {"initialMessages": initial_messages}
        headers = {"Access-Control-Allow-Origin": "*"}
        return JSONResponse(content=initial_data, headers=headers)
        
    except Exception as e:
        print(f"❌ [Controller] /start-chat 요청 처리 중 오류 발생: {e}")
        return JSONResponse(status_code=500, content={"error": "채팅방 입장에 실패했습니다."})

# --- 모든 메시지 처리를 담당하는 API ---
@app.post("/message/")
async def receive_message(request: ChatRequest):
    try:
        chat_dao = initialize_resources()
        response_data = chat_dao.process_chat_request(user_key=request.user_key, received_text=request.message)
        headers = {"Access-Control-Allow-Origin": "*"}
        return JSONResponse(content=response_data, headers=headers)
    except Exception as e:
        print(f"❌ [Controller] /message 요청 처리 중 오류 발생: {e}")
        return JSONResponse(status_code=500, content={"reply": "서버 내부 오류가 발생했습니다."})

# --- 초기화 API ---
@app.post("/reset/")
async def reset_chat(request: ResetRequest):
    try:
        print(request.user_key)
        chat_dao = initialize_resources()
        response_data = chat_dao.reset_chat_history(user_key=request.user_key)
        headers = {"Access-Control-Allow-Origin": "*"}
        return JSONResponse(content=response_data, headers=headers)
    except Exception as e:
        print(f"❌ [Controller] /reset 요청 처리 중 오류 발생: {e}")
        return JSONResponse(status_code=500, content={"error": "대화 기록 초기화에 실패했습니다."})


####################################################################################################

@app.post("/checkId/")
async def check_id(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    
    if not user_id:
        raise HTTPException(400, "user_id 필요")
    
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM user_tbl WHERE user_id = %s;", (user_id,))
        exists = cur.fetchone()
        return {"available": not bool(exists)}
    finally:
        cur.close()
        conn.close()

@app.post("/checkEmail/")
async def check_email(request: Request):
    data = await request.json()
    print("[서버] /checkEmail 호출, 데이터:", data)
    print(f"Received checkEmail request: {data}")  # 요청 들어오는지 로그
    email = data.get("user_email")
 
    if not email:
        raise HTTPException(400, "user_email 필요")
 
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM user_tbl WHERE user_email = %s", (email,))
        exists = cur.fetchone()
        return {"available": not bool(exists)}
    finally:
        cur.close()
        conn.close()

@app.post("/checkPhonenumber/")
async def check_phone_number(request: Request):
    data = await request.json()
    phone_number = data.get("phone_number")
 
    if not phone_number:
        raise HTTPException(status_code=400, detail="phone_number 필요")
 
    # 전화번호 유효성 검사 (예: '01012345678' 형식, 숫자 11자리)
    if not re.fullmatch(r"010\d{8}", phone_number):
        raise HTTPException(status_code=400, detail="전화번호 형식이 잘못되었습니다. 예: 01012345678")
 
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT 1 FROM user_tbl WHERE user_phone_number = %s;",
            (phone_number,)
        )
        exists = cur.fetchone()
        return {"available": not bool(exists)}
    finally:
        cur.close()
        conn.close()

@app.post("/signup/")
async def signup(request: Request):
    data = await request.json()
    
    # 필수 필드 확인
    required_fields = [
        "user_id", "user_password", "user_phone_number",
        "user_birth", "user_gender", "user_address"
    ]
    for field in required_fields:
        if not data.get(field):
            raise HTTPException(400, f"{field} 필수")
 
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        # 아이디, 이메일, 전화번호 중복 검사
        cur.execute("""
            SELECT 1 FROM user_tbl
            WHERE user_id = %s OR user_email = %s OR user_phone_number = %s;
        """, (data["user_id"], data.get("user_email"), data["user_phone_number"]))
 
        if cur.fetchone():
            raise HTTPException(400, "이미 사용된 아이디/이메일/전화번호입니다.")
 
        # 비밀번호 해싱 및 회원 추가
        hashed_pw = hash_password(data["user_password"])
        user_key = str(uuid.uuid5(uuid.NAMESPACE_DNS, data["user_id"]))
        cur.execute("""
            INSERT INTO user_tbl (
                user_key, user_id, user_password, user_phone_number,
                user_email, user_birth, user_gender, user_address
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s);
        """, (
            user_key, data["user_id"], hashed_pw, data["user_phone_number"],
            data.get("user_email"), data["user_birth"],
            data["user_gender"], data["user_address"]
        ))
        conn.commit()
        return {"message": "회원가입 성공", "user_key": user_key}
    finally:
        cur.close()
        conn.close()

@app.post("/login/")
async def login(request: Request):
    data = await request.json()
    user_id = data.get("user_id")
    password = data.get("user_password")

    if not user_id or not password:
        raise HTTPException(status_code=400, detail="user_id와 user_password 필요")

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute(
            """
            SELECT user_key, user_password FROM user_tbl WHERE user_id = %s;
        """,
            (user_id,),
        )
        user = cur.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="회원 정보가 없습니다.")

        user_key, hashed_pw = user

        # 여기서 verify_password 결과 출력
        if not verify_password(password, hashed_pw):
            print(f"비밀번호 불일치: 입력된 비밀번호={password}, 해시된 비밀번호={hashed_pw}")
            raise HTTPException(status_code=401, detail="비밀번호가 틀렸습니다.")
        else:
            print(f"비밀번호 일치: user_id={user_id}")

        cur.execute(
            """
                SELECT 1 
                FROM survey_tbl 
                WHERE survey_user_key = %s 
                LIMIT 1;
            """,
            (user_key,)
        )
        survey_exists = cur.fetchone() is not None
        print("설문조사 존재 여부 : ", survey_exists)

        return {
            "message": "로그인 성공",
            "user_key": user_key,
            "hasSurvey": survey_exists,
        }

    finally:
        cur.close()
        conn.close()

@app.post("/getUserInfo/")
async def get_user_info(request: Request):
    """
    유저키를 사용하여 user_tbl에서 사용자 정보를 검색하고 반환합니다.
    """
    data = await request.json()
    user_key = data.get("user_key")

    if not user_key:
        raise HTTPException(status_code=400, detail="user_key가 필요합니다.")

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        # user_tbl에서 필요한 컬럼들만 선택합니다.
        # 비밀번호는 보안상 제외했습니다.
        cur.execute(
            """
            SELECT user_key, user_id, user_phone_number, user_email, user_birth, user_gender, user_address 
            FROM user_tbl 
            WHERE user_key = %s;
            """,
            (user_key,)
        )
        user_info = cur.fetchone()

        if user_info:
            columns = [desc[0] for desc in cur.description]
            user_data = dict(zip(columns, user_info))
            return user_data
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"데이터베이스 오류: {e}")
    finally:
        cur.close()
        conn.close()
    
    raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

# user_key를 받아 survey_tbl에서 설문조사 결과를 가져오는 함수
@app.post("/showSurveyResult/")
async def show_survey_result(request: Request):
    """
    유저키를 사용하여 survey_tbl에서 설문조사 결과를 검색하고 반환합니다.
    """
    data = await request.json()
    user_key = data.get("user_key")

    if not user_key:
        raise HTTPException(status_code=400, detail="user_key가 필요합니다.")

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        # survey_tbl에서 설문조사 관련 컬럼을 조회합니다.
        # survey_user_key 컬럼을 통해 user_tbl과 연결합니다.
        cur.execute(
            """
            SELECT survey_skin_do, survey_skin_sr, survey_skin_pn, survey_skin_wt, survey_skin_type, survey_skin_combination_type
            FROM survey_tbl 
            WHERE survey_user_key = %s;
            """,
            (user_key,),
        )
        survey_info = cur.fetchone()

        if survey_info:
            columns = [desc[0] for desc in cur.description]
            survey_data = dict(zip(columns, survey_info))
            print(survey_data)
            return survey_data
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"데이터베이스 오류: {e}")
    finally:
        cur.close()
        conn.close()

    raise HTTPException(status_code=404, detail="설문조사 결과를 찾을 수 없습니다.")


@app.post("/user/updatePassword/")
async def update_user_password(request: Request):
    """
    user_id를 사용하여 사용자의 비밀번호를 업데이트합니다.
    """
    data = await request.json()
    user_id = data.get("user_id")
    new_password = data.get("new_password")

    if not user_id or not new_password:
        raise HTTPException(
            status_code=400, detail="user_id와 new_password가 필요합니다."
        )

    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        hashed_pw = hash_password(new_password)
        cur.execute(
            """
            UPDATE user_tbl 
            SET user_password = %s
            WHERE user_id = %s;
            """,
            (hashed_pw, user_id),
        )
        conn.commit()

        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"message": "비밀번호가 성공적으로 업데이트되었습니다."}
    except psycopg2.Error as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"데이터베이스 오류: {e}")
    finally:
        cur.close()
        conn.close()

# 새로운 엔드포인트 추가
@app.post("/user/updateAddress/")
async def update_user_address(address_data: UpdateAddress):
    """
    user_id를 사용하여 사용자의 주소 정보를 업데이트합니다.
    """
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute(
            """
            UPDATE user_tbl
            SET user_address = %s
            WHERE user_id = %s;
            """,
            (address_data.user_address, address_data.user_id)
        )
        conn.commit()
 
        if cur.rowcount == 0:
            # 업데이트된 행이 없으면 사용자 ID가 존재하지 않는 경우
            raise HTTPException(status_code=404, detail="User not found")
       
        return {"message": "주소 정보가 성공적으로 업데이트되었습니다."}
    finally:
        cur.close()
        conn.close()
        




# user_key를 사용하여 모든 루틴을 조회합니다.
@app.post("/routine/get/")
async def get_routines(request: RoutineRequest):
    user_key = request.user_key
    if not user_key:
        raise HTTPException(status_code=400, detail="user_key가 필요합니다.")

    print("user_key:", user_key)
    print("DB_CONFIG:", DB_CONFIG)  # DB 연결 정보 확인

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute(
            """
            SELECT preset_id, preset_product_name, preset_usage_guide, preset_concerns, preset_date
            FROM preset_tbl
            WHERE preset_user_key = %s
            ORDER BY preset_date DESC;
            """,
            (user_key,),
        )
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        routines = [dict(zip(columns, row)) for row in rows]
        return {"routines": routines}
    except Exception as e:
        print("DB 쿼리 또는 연결 중 에러:", e)
        raise HTTPException(status_code=500, detail=f"DB 오류: {e}")
    finally:
        try:
            cur.close()
            conn.close()
        except:
            pass



@app.post("/routine/delete/")
async def delete_routine(request: DeleteRoutineRequest):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    try:
        cur.execute(
            """
            DELETE FROM preset_tbl
            WHERE preset_id = %s AND preset_user_key = %s;
            """,
            (request.preset_id, request.user_key),
        )
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="해당 루틴을 찾을 수 없습니다.")
        conn.commit()
        return {"message": "루틴이 성공적으로 삭제되었습니다."}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"루틴 삭제 중 DB 오류: {e}")
    finally:
        cur.close()
        conn.close()