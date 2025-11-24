from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
import datetime
from typing import Optional


# 비밀번호 암호화 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password hashing function
def hash_password(password: str):
    return pwd_context.hash(password)

# 비밀번호 검증
def verify_password(plain_password: str, hashed_password: str) -> bool:
    result = pwd_context.verify(plain_password, hashed_password)
    print(
        f"verify_password 호출됨: plain_password={plain_password}, hashed_password={hashed_password}, 결과={result}"
    )
    return result

# 요청 바디 Pydantic 모델
class SignupRequest(BaseModel):
    user_key: Optional[str] = None  # 서버에서 자동 생성
    user_id: str
    user_password: str
    user_phone_number: str
    user_email: Optional[EmailStr] = None
    user_birth: datetime.date
    user_gender: str
    user_address: str