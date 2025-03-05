from pydantic_settings import BaseSettings, SettingsConfigDict

class Config(BaseSettings):
    UPLOAD_FOLDER: str = "uploads"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    PRODUCTION: bool = False


    model_config = SettingsConfigDict(env_file='.env')

config = Config()