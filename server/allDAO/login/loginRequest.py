from pydantic import BaseModel

class UserKeyData(BaseModel):    
    user_key: str

class UpdateAddress(BaseModel):
    user_id: str
    user_address: str

class UpdatePassword(BaseModel):
    user_id: str
    new_password: str