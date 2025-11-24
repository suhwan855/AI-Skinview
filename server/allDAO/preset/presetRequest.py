from pydantic import BaseModel

class RoutineItem(BaseModel):
    preset_user_key: str
    preset_product_name: str
    preset_usage_guide: str
    preset_concerns: str
    preset_date: str  # ISO 날짜 문자열