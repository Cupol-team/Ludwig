from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from routers import auth_router, organization_router, upload_router, user_router

from db import global_init

from services.upload import create_upload_folder

global_init("db/base/base.db")
create_upload_folder()

app = FastAPI(title="ludwig api")

# TODO: https://github.com/Cupol-team/API/issues/13

origins = [
    "http://localhost:3000",  # Для разработки (Vite)
    "http://127.0.0.1:3000",  # Для локального хоста
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Разрешённые домены
    allow_credentials=True,  # Разрешение отправлять cookies/авторизацию
    allow_methods=["*"],  # Разрешённые методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешённые заголовки
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(organization_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to the API!"}
