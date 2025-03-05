from pydantic import BaseModel


class UserBaseData(BaseModel):
    name: str = None
    surname: str = None
    gender: str = None
    date_of_birthday: str = None
    email: str = None
    password: str = None