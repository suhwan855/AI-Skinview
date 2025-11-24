from pydantic import BaseModel


class RoutineRequest(BaseModel):
    user_key: str

class DeleteRoutineRequest(BaseModel):
    preset_id: int
    user_key: str