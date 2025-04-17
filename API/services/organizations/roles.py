from uuid import UUID
from db import create_session
from db.organizations.base.role import Role
from db.organizations.base.role_data import RoleData
from fastapi import HTTPException, status

def get_default_role(organization_uuid: UUID) -> UUID:
    """
    Получает UUID дефолтной роли (например, с самым низким уровнем доступа) для организации.
    Если роль не найдена, возвращает ошибку 404.
    
    :param organization_uuid: UUID организации
    :return: UUID дефолтной роли
    """
    try:
        session = create_session()
        
        # Получаем первую роль (обычно это роль с наименьшими привилегиями)
        # В реальной системе нужно добавить логику выбора дефолтной роли
        role = session.query(Role).filter(Role.organization_uuid == organization_uuid).first()
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No default role found for the organization"
            )
        
        return role.uuid
    
    except Exception as ex:
        # Логируем ошибку и возвращаем более понятное сообщение пользователю
        print(f"Error getting default role: {ex}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get default role for organization"
        ) 