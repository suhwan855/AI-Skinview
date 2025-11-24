from openai import AzureOpenAI
from pydantic import BaseModel
from .chatDAO import ChatDAO
import psycopg2
import redis
import pytz


# --- 설정 정보 ---
# ===== Azure OpenAI =====
AZURE_CONFIG = {
    "api_key": os.getenv("AZURE_OPENAI_KEY"),
    "azure_endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
    "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
}
assert AZURE_CONFIG["api_key"], "AZURE_OPENAI_KEY 환경변수를 설정하세요."
assert AZURE_CONFIG["azure_endpoint"], "AZURE_OPENAI_ENDPOINT 환경변수를 설정하세요."

# ===== Model names (시크릿은 아니지만 env로 빼두면 배포 편함) =====
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "biniffy-embedding")
DEPLOYMENT_NAME = os.getenv("DEPLOYMENT_NAME", "gpt-4o-mini")

# ===== Postgres =====
DB_CONFIG = {
    "dbname": os.getenv("DB_NAME", "ai_skinview"),
    "user": os.getenv("DB_USER", "admin"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
}
assert DB_CONFIG["password"], "DB_PASSWORD 환경변수를 설정하세요."

# ===== Redis =====
REDIS_CONFIG = {
    "host": os.getenv("REDIS_HOST", "localhost"),
    "port": int(os.getenv("REDIS_PORT", "6379")),
    "db": int(os.getenv("REDIS_DB", "0")),
    "password": os.getenv("REDIS_PASSWORD"),  # 비번 없으면 None으로 들어감
}

chat_dao = None

# --- Pydantic 요청 모델 정의 ---
class UserKeyRequest(BaseModel):
    user_key: str

class ChatRequest(BaseModel):
    user_key: str
    message: str

class ResetRequest(BaseModel):
    user_key: str

# chatRequest.py

def initialize_resources():
    global chat_dao
    
    if chat_dao is None:
        print("🚀 [Controller] 최초 요청 감지: 리소스를 초기화합니다.")
        try:
            db_conn = psycopg2.connect(**DB_CONFIG)
            openai_client = AzureOpenAI(**AZURE_CONFIG)
            redis_conn = redis.Redis(**REDIS_CONFIG, decode_responses=True)
            redis_conn.ping()
            
            chat_dao = ChatDAO(
                openai_client=openai_client, 
                embedding_model_name=EMBEDDING_MODEL_NAME,
                chat_model_name=DEPLOYMENT_NAME,
                db_conn=db_conn,
                redis_conn=redis_conn
            )
            print("✅ [Controller] DB, Redis, OpenAI 리소스 초기화 성공")
        except Exception as e:
            print(f"❌ [Controller] 리소스 초기화 중 심각한 오류 발생: {e}")
            raise e
            
    # ✅ 이 줄을 추가하여 chat_dao가 초기화되었든 아니든 항상 반환하게 합니다.
    # 만약 위에서 예외가 발생했다면 이 부분까지 오지 않습니다.
    return chat_dao