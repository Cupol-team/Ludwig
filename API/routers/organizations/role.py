from fastapi import APIRouter

router = APIRouter(
    prefix="/{organization_uuid}/role",
    tags=["Organization Role"],
)


@router.get("/get")
async def get_role():
    return {"message": "pizdec"}

