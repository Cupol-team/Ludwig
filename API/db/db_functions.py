import logging
import os
import shutil
import importlib
import datetime
import sys
import traceback
from datetime import date
from typing import Union, List
from fastapi import HTTPException
from .base import Organization
from .base import OrganizationMember
from .base import OrganizationData
from .base import User
from .base import UserData
from .base import UserLoginData

from .base import db_session

from db.organizations.base.role import Role
from db.organizations.base.project import Project
from db.organizations.base.project_data import ProjectData
from db.organizations.base.project_member import ProjectMember
from db.organizations.base.role_data import RoleData
from db.organizations.base.role_permissions import RolePermissions
from db.organizations.base.status import Status
from db.organizations.base.status_data import StatusData
from db.organizations.base.task import Task
from db.organizations.base.task_data import TaskData
from db.organizations.base.task_executor import TaskExecutor
from db.organizations.base.type_of_task import TypeOfTask
from db.organizations.base.type_of_task_data import TypeOfTaskData
from db.organizations.base.user import User

from .base.db_session import global_init, SqlAlchemyBase, create_session

import uuid

import sqlalchemy as sa
import sqlalchemy.orm as orm

from .organizations.base.db_session import SqlAlchemyOrgBase
from .organizations.project_base.db_session import SqlAlchemyProjBase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# TODO: Изменить анальные приколясы с изменением cwd в функциях на указывание .dp в path-e
# TODO: Попытаться избавиться от eval и exec
# TODO: Подчистить корявые try, except

# FIXME: Перед использованием функций, прочитайте: https://github.com/Cupol-team/API/issues/12

def reset_to_project_root(ups: int):
    for _ in range(ups):
        os.chdir(os.path.join(os.pardir))
    print(os.getcwd())


def dynamic_import(module_name):
    loggger = logging.getLogger(__name__)
    # Пытаемся импортировать модуль по заданному пути
    try:
        module = importlib.import_module(module_name)
        return module
    except Exception as ex:
        pass
    except ModuleNotFoundError as e:
        print(f"Ошибка импорта модуля {module_name}: {e}")
        return None


def check_user_exists(email: str) -> bool:
    """
    Проверяет, существует ли пользователь с указанным email
    
    Args:
        email: Email пользователя для проверки
        
    Returns:
        bool: True если пользователь существует, иначе False
    """
    session = db_session.create_session()
    existing_user = session.query(UserLoginData).filter(UserLoginData.email == email).first()
    session.close()
    return existing_user is not None

def new_user(name, surname, email, password, gender, date_of_birthday):
    """
    Создает нового пользователя
    
    Args:
        name: Имя пользователя
        surname: Фамилия пользователя
        email: Email пользователя
        password: Пароль пользователя
        gender: Пол пользователя ("0" - женщина, "1" - мужчина)
        date_of_birthday: Дата рождения пользователя (строка в формате YYYY-MM-DD)
        
    Returns:
        tuple: (user, user_data, user_login_data, user_uuid)
        
    Raises:
        ValueError: Если пользователь с таким email уже существует или отсутствуют обязательные поля
    """
    # Проверяем наличие всех обязательных полей
    if not name or not surname or not email or not password or not gender or not date_of_birthday:
        raise ValueError("All fields (name, surname, email, password, gender, date_of_birthday) are required")
    
    # Проверяем корректность значения gender
    if gender not in ["0", "1"]:
        raise ValueError('Gender must be "0" (female) or "1" (male)')
    
    # Проверяем, существует ли пользователь с таким email
    if check_user_exists(email):
        raise ValueError("User with this email already exists")
    
    # Преобразуем строковую дату в объект date
    try:
        parsed_date = datetime.date.fromisoformat(date_of_birthday)
    except ValueError:
        raise ValueError("Invalid date format. Use YYYY-MM-DD format for date_of_birthday")
        
    user_uuid = uuid.uuid4()

    user = User()
    user.uuid = user_uuid

    user_data = UserData()
    user_data.uuid = user_uuid
    user_data.name = name
    user_data.surname = surname
    user_data.gender = gender
    user_data.date_of_birthday = parsed_date  # Используем преобразованную дату

    user_login_data = UserLoginData()
    user_login_data.uuid = user_uuid
    user_login_data.email = email
    user_login_data.set_password(password)

    session = db_session.create_session()
    session.add(user)
    session.add(user_data)
    session.add(user_login_data)
    session.commit()
    session.close()

    return user, user_data, user_login_data, user_uuid


def new_organization(name, description=""):
    try:
        organization_uuid = uuid.uuid4()

        organization = Organization()
        organization.uuid = organization_uuid
        _org_uuid = f"_{str(organization.uuid).replace('-', '_')}"

        organization_data = OrganizationData()
        organization_data.uuid = organization.uuid
        organization_data.name = name
        if description != "":
            organization_data.description = description

        session = db_session.create_session()
        session.add(organization)
        session.add(organization_data)
        session.commit()
        os.chdir(str(os.getcwd()) + "/db")
        os.makedirs(
            os.path.join(os.getcwd(), "organizations/db", _org_uuid),
            exist_ok=True)
        os.makedirs(
            os.path.join(os.getcwd(), "organizations/db", _org_uuid, "projects"),
            exist_ok=True)

        shutil.copy("base/db_session.py", f"organizations/db/{_org_uuid}/db_session.py")
        shutil.copy("organizations/base/role.py",
                    f"organizations/db/{_org_uuid}/role.py")
        shutil.copy("organizations/base/role_data.py",
                    f"organizations/db/{_org_uuid}/role_data.py")
        shutil.copy("organizations/base/role_permissions.py",
                    f"organizations/db/{_org_uuid}/role_permissions.py")
        shutil.copy("organizations/base/status.py",
                    f"organizations/db/{_org_uuid}/status.py")
        shutil.copy("organizations/base/status_data.py",
                    f"organizations/db/{_org_uuid}/status_data.py")
        shutil.copy("organizations/base/type_of_task.py",
                    f"organizations/db/{_org_uuid}/type_of_task.py")
        shutil.copy("organizations/base/type_of_task_data.py",
                    f"organizations/db/{_org_uuid}/type_of_task_data.py")
        shutil.copy("organizations/base/task.py",
                    f"organizations/db/{_org_uuid}/task.py")
        shutil.copy("organizations/base/task_data.py",
                    f"organizations/db/{_org_uuid}/task_data.py")
        shutil.copy("organizations/base/task_executor.py",
                    f"organizations/db/{_org_uuid}/task_executor.py")
        shutil.copy("organizations/base/user.py",
                    f"organizations/db/{_org_uuid}/user.py")
        shutil.copy("organizations/base/project.py",
                    f"organizations/db/{_org_uuid}/project.py")
        shutil.copy("organizations/base/project_data.py",
                    f"organizations/db/{_org_uuid}/project_data.py")
        shutil.copy("organizations/base/project_member.py",
                    f"organizations/db/{_org_uuid}/project_member.py")

        logger.info("Я ТУТ")
        os.chdir(os.path.join(os.getcwd(), 'organizations', 'base'))
        # if '' not in sys.path:
        #    sys.path.insert(0, '')
        logger.info(os.getcwd())
        # exec(f"import role")
        # exec(f"import role_data")
        # exec(f"import status")
        # exec(f"import status_data")
        # exec(f"import type_of_task")
        # exec(f"import type_of_task_data")
        # exec(f"import task")
        # exec(f"import task_data")
        # exec(f"import task_executor")
        # exec(f"import user")
        # exec(f"import project")
        # exec(f"import project_data")
        # exec(f"import project_member")

        exec(f"import db.organizations.base.db_session "
             f"as db_session{_org_uuid}")
        eval(
            f"db_session{_org_uuid}.global_init(f'../db/{_org_uuid}/org_db.db')")
        logger.info("Я ТАМААА")
        session.close()

        os.chdir(os.path.join(os.getcwd(), '..', 'db', _org_uuid))
        conn_str = f'sqlite:///{"org_db.db".strip()}'
        print(f"Подключение к базе данных: {conn_str}")

        # Создаем движок базы данных
        engine = sa.create_engine(conn_str, echo=True)

        # Создаем таблицы
        SqlAlchemyOrgBase.metadata.create_all(engine)

        logger.info(f'ИМЕЕМ {os.getcwd()}')

    except Exception as ex:
        logger.info(ex)

        exc_type, exc_value, exc_tb = sys.exc_info()
        line_number = exc_tb.tb_lineno
        print("Полная информация об ошибке в функции:")
        logger.info(line_number)
        logger.info(f'текущая директория: {os.getcwd()}')
        logger.info(ex)
        logger.info(exc_tb)
    reset_to_project_root(4)
    return organization, organization_data, organization_uuid


def new_organization_member(user_uuid, organization_uuid, role):
    try:
        organization_member = OrganizationMember()
        organization_member.user_uuid = user_uuid
        organization_member.organization_uuid = organization_uuid

        session = db_session.create_session()
        session.add(organization_member)
        session.commit()
        session.close()

        os.chdir(os.path.join(os.getcwd(), 'db'))
        sys.path.append(os.path.join(os.getcwd()))

        user = User()
        user.uuid = user_uuid
        user.role = role

        _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"

        exec(f"from organizations.db.{_org_uuid} import db_session "
             f"as db_session{_org_uuid}")
        os.chdir(os.path.join(os.getcwd(), "organizations", "db", _org_uuid))
        eval(f"db_session{_org_uuid}.global_init('org_db.db')")
        session = eval(f"db_session{_org_uuid}.create_session()")
        session.add(user)
        session.commit()
        session.close()
    except Exception as ex:
        print(ex)

        exc_type, exc_value, exc_tb = sys.exc_info()
        line_number = exc_tb.tb_lineno
        print("Полная информация об ошибке в функции:")
        print(line_number)
        print(f'текущая директория: {os.getcwd()}')
        print(ex)
        print(exc_tb)
    reset_to_project_root(4)
    return organization_member, user


def new_role(organization_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    Role = eval(
        f"importlib.import_module('.role', package='db.organizations.db.{_org_uuid}')").Role
    RoleData = eval(
        f"importlib.import_module('.role_data', package='db.organizations.db.{_org_uuid}')").RoleData

    role_uuid = uuid.uuid4()

    role = Role()
    role.uuid = role_uuid

    role_data = RoleData()
    role_data.uuid = role_uuid
    role_data.name = name
    if description != "":
        role_data.description = description

    exec(f"from db.organizations.db.{_org_uuid} import db_session "
         f"as db_session{_org_uuid}")
    session = eval(
        f"db_session{_org_uuid}.global_init('db/organizations/db/{_org_uuid}/org_db.db')")
    session = eval(f"db_session{_org_uuid}.create_session()")
    session.add(role)
    session.add(role_data)
    session.commit()
    session.close()

    return role, role_data, role_uuid


def new_status(organization_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    Status = eval(
        f"importlib.import_module('.status', package='organizations.db.{_org_uuid}')").Status
    StatusData = eval(
        f"importlib.import_module('.status_data', package='organizations.db.{_org_uuid}')").StatusData

    status_uuid = uuid.uuid4()

    status = Status()
    status.uuid = status_uuid

    status_data = StatusData()
    status_data.uuid = status_uuid
    status_data.name = name
    if description != "":
        status_data.description = description

    exec(f"from organizations.db.{_org_uuid} import db_session "
         f"as db_session{_org_uuid}")
    session = eval(f"db_session{_org_uuid}.create_session()")
    session.add(status)
    session.add(status_data)
    session.commit()
    session.close()

    return status, status_data, status_uuid


def new_type_of_task(organization_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    TypeOfTask = eval(
        f"importlib.import_module('.type_of_task', package='organizations.db.{_org_uuid}')").TypeOfTask
    TypeOfTaskData = eval(
        f"importlib.import_module('.type_of_task_data', package='organizations.db.{_org_uuid}')").TypeOfTaskData

    type_of_task_uuid = uuid.uuid4()

    type_of_task = TypeOfTask()
    type_of_task.uuid = type_of_task_uuid

    type_of_task_data = TypeOfTaskData()
    type_of_task_data.uuid = type_of_task_uuid
    type_of_task_data.name = name
    if description != "":
        type_of_task_data.description = description

    exec(f"from organizations.db.{_org_uuid} import db_session "
         f"as db_session{_org_uuid}")
    session = eval(f"db_session{_org_uuid}.create_session()")
    session.add(type_of_task)
    session.add(type_of_task_data)
    session.commit()
    session.close()

    return type_of_task, type_of_task_data, type_of_task_uuid


def new_task(organization_uuid, creator, executors, name, type, priority, status, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    Task = eval(
        f"importlib.import_module('.task', package='organizations.db.{_org_uuid}')").Task
    TaskData = eval(
        f"importlib.import_module('.task_data', package='organizations.db.{_org_uuid}')").TaskData

    task_uuid = uuid.uuid4()

    task = Task()
    task.uuid = task_uuid

    task_data = TaskData()
    task_data.uuid = task_uuid
    task_data.creator = creator
    task_data.name = name
    if description != "":
        task_data.description = description
    task_data.type = type
    task_data.priority = priority
    task_data.status = status
    task_data.date = date.today()

    TaskExecutor = eval(
        f"importlib.import_module('.task_executor', package='organizations.db.{_org_uuid}')").TaskExecutor

    task_executors = []
    for i in executors:
        task_executor = TaskExecutor()
        task_executor.user = i
        task_executor.task = task_uuid
        task_executors.append(task_executor)

    exec(f"from organizations.db.{_org_uuid} import db_session "
         f"as db_session{_org_uuid}")
    session = eval(f"db_session{_org_uuid}.create_session()")
    session.add(task)
    session.add(task_data)
    for i in task_executors:
        session.add(i)
    session.commit()
    session.close()

    return task, task_data, task_executors, task_uuid


def new_project(organization_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    try:
        Project = eval(
            f"importlib.import_module('.project', package='db.organizations.db.{_org_uuid}')").Project
        ProjectData = eval(
            f"importlib.import_module('.project_data', package='db.organizations.db.{_org_uuid}')").ProjectData

        project_uuid = uuid.uuid4()
        project = Project()
        project.uuid = project_uuid

        project_data = ProjectData()
        project_data.uuid = project_uuid
        project_data.name = name
        if description != "":
            project_data.description = description

        exec(f"from db.organizations.db.{_org_uuid} import db_session "
             f"as db_session{_org_uuid}")
        session = eval(
            f"db_session{_org_uuid}.global_init('db/organizations/db/{_org_uuid}/org_db.db')")
        session = eval(f"db_session{_org_uuid}.create_session()")
        session.add(project)
        session.add(project_data)
        session.commit()

        _project_uuid = f"_{str(project.uuid).replace('-', '_')}"

        os.mkdir(
            f"db/organizations/db/{_org_uuid}/projects/{_project_uuid}")
        shutil.copy("db/organizations/project_base/db_session.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/db_session.py")
        shutil.copy("db/organizations/project_base/role.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/role.py")
        shutil.copy("db/organizations/project_base/role_data.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/role_data.py")
        shutil.copy("db/organizations/project_base/role_permissions.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/role_permissions.py")
        shutil.copy("db/organizations/project_base/status.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/status.py")
        shutil.copy("db/organizations/project_base/status_data.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/status_data.py")
        shutil.copy("db/organizations/project_base/type_of_task.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/type_of_task.py")
        shutil.copy("db/organizations/project_base/type_of_task_data.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/type_of_task_data.py")
        shutil.copy("db/organizations/project_base/task.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/task.py")
        shutil.copy("db/organizations/project_base/task_data.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/task_data.py")
        shutil.copy("db/organizations/project_base/task_executor.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/task_executor.py")
        shutil.copy("db/organizations/project_base/user.py",
                    f"db/organizations/db/{_org_uuid}"
                    f"/projects/{_project_uuid}/user.py")
        session.close()

        role = eval(
            f"importlib.import_module('.role', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").Role
        role_data = eval(
            f"importlib.import_module('.role_data', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").RoleData
        role_permissions = eval(
            f"importlib.import_module('.role_permissions', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").RolePermissions
        status = eval(
            f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").Status
        status_data = eval(
            f"importlib.import_module('.status_data', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").StatusData
        type_of_task = eval(
            f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").TypeOfTask
        type_of_task_data = eval(
            f"importlib.import_module('.type_of_task_data', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").TypeOfTaskData
        task = eval(
            f"importlib.import_module('.task', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").Task
        task_data = eval(
            f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").TaskData
        task_executor = eval(
            f"importlib.import_module('.task_executor', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").TaskExecutor
        user = eval(
            f"importlib.import_module('.user', package='db.organizations.db.{_org_uuid}"
            f".projects.{_project_uuid}')").User

        exec(
            f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
            f"as db_session{_project_uuid}")
        eval(f"db_session{_project_uuid}"
             f".global_init('db/organizations/db/{_org_uuid}"
             f"/projects/{_project_uuid}/project_db.db')")

        tmp = f'db/organizations/{_org_uuid}/projects/{_project_uuid}/project_db.db'
        os.chdir(os.path.join(os.getcwd(), 'db', 'organizations', 'db', _org_uuid,
                              'projects', _project_uuid))
        print(os.getcwd())
        conn_str = f'sqlite:///{"project_db.db".strip()}'
        print(f"Подключение к базе данных: {conn_str}")

        # Создаем движок базы данных
        engine = sa.create_engine(conn_str, echo=True)

        # Создаем таблицы
        SqlAlchemyProjBase.metadata.create_all(engine)

        session.close()
    except Exception as ex:
        logger.info(ex)

        exc_type, exc_value, exc_tb = sys.exc_info()
        line_number = exc_tb.tb_lineno
        print("Полная информация об ошибке в функции:")
        logger.info(line_number)
        logger.info(f'текущая директория: {os.getcwd()}')
        logger.info(ex)
        logger.info(exc_tb)
    reset_to_project_root(6)
    return project, project_data, project_uuid


def new_project_member(organization_uuid, user_uuid, project_uuid, role):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    ProjectMember = eval(
        f"importlib.import_module('.project_member', package='db.organizations.db.{_org_uuid}')").ProjectMember

    project_member = ProjectMember()
    project_member.user_uuid = user_uuid
    project_member.project_uuid = project_uuid

    exec(f"from db.organizations.db.{_org_uuid} import db_session "
         f"as db_session{_org_uuid}")
    eval(
        f"db_session{_org_uuid}.global_init('db/organizations/db/{_org_uuid}/org_db.db')")
    session = eval(f"db_session{_org_uuid}.create_session()")
    session.add(project_member)
    session.commit()
    session.close()

    User = eval(
        f"importlib.import_module('.user', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").User

    user = User()
    user.uuid = user_uuid
    user.role = role

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")
    session.add(user)
    session.commit()
    session.close()

    return project_member, user


'''==========================db functions: project role=========================='''


def new_project_role(organization_uuid, project_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    Role = eval(
        f"importlib.import_module('.role', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").Role
    RoleData = eval(
        f"importlib.import_module('.role_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").RoleData

    role_uuid = uuid.uuid4()

    role = Role()
    role.uuid = role_uuid

    role_data = RoleData()
    role_data.uuid = role_uuid
    role_data.name = name
    if description != "":
        role_data.description = description

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    session = eval(f"db_session{_project_uuid}.create_session()")
    session.add(role)
    session.add(role_data)
    session.commit()
    session.close()

    return role, role_data, role_uuid


def delete_project_role(organization_uuid, project_uuid, role_uuid) -> bool:
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    Role = eval(
        f"importlib.import_module('.role', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").Role
    RoleData = eval(
        f"importlib.import_module('.role_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").RoleData
    RolePermissions = eval(
        f"importlib.import_module('.role_permissions', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").RolePermissions

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')"
    )
    session = eval(f"db_session{_project_uuid}.create_session()")

    # Удаляем саму роль
    role = session.query(Role).filter(Role.uuid == role_uuid).first()
    if role:
        session.delete(role)

    # Удаляем данные роли
    role_data = session.query(RoleData).filter(RoleData.uuid == role_uuid).first()
    if role_data:
        session.delete(role_data)

    role_permissions = session.query(RolePermissions).filter(RolePermissions.uuid == role_uuid).all()
    for permission in role_permissions:
        session.delete(permission)

    session.commit()
    session.close()

    return True


def update_project_role(organization_uuid, project_uuid, role_uuid, name: str | None = None,
                        description: str | None = None, permissions: str | None = None) -> bool:
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    Role = eval(
        f"importlib.import_module('.role', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").Role
    RoleData = eval(
        f"importlib.import_module('.role_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").RoleData
    RolePermissions = eval(
        f"importlib.import_module('.role_permissions', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").RolePermissions

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')"
    )
    session = eval(f"db_session{_project_uuid}.create_session()")

    role = session.query(Role).filter(Role.uuid == role_uuid).first()
    if not role:
        session.close()
        raise Exception(f"{role_uuid} not found.")

    role_data = session.query(RoleData).filter(RoleData.uuid == role_uuid).first()
    if not role_data:
        session.close()
        raise Exception(f"{role_uuid} not found.")

    if name is not None:
        role_data.name = name
    if description is not None:
        role_data.description = description

    if permissions is not None:
        old_permissions = session.query(RolePermissions).filter(RolePermissions.uuid == role_uuid).all()
        for permission in old_permissions:
            session.delete(permission)

        for permission in permissions:
            new_permission = RolePermissions(uuid=role_uuid, permission=permission)
            session.add(new_permission)

    session.commit()
    session.close()

    return True


'''==========================db functions: project_status=========================='''


def new_project_status(organization_uuid, project_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    Status = eval(
        f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").Status
    StatusData = eval(
        f"importlib.import_module('.status_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").StatusData

    status_uuid = uuid.uuid4()

    status = Status()
    status.uuid = status_uuid

    status_data = StatusData()
    status_data.uuid = status_uuid
    status_data.name = name
    if description != "":
        status_data.description = description

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")
    session.add(status)
    session.add(status_data)
    session.commit()
    session.close()

    return status, status_data, status_uuid


def update_project_status(organization_uuid, project_uuid, status_uuid, name=None, description=None):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    Status = eval(
        f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").Status
    StatusData = eval(
        f"importlib.import_module('.status_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").StatusData

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    status = session.query(Status).filter(Status.uuid == status_uuid).first()
    if not status:
        session.close()
        raise Exception(f"Status with UUID {status_uuid} not found.")

    status_data = session.query(StatusData).filter(StatusData.uuid == status_uuid).first()
    if not status_data:
        session.close()
        raise Exception(f"StatusData with UUID {status_uuid} not found.")

    if name is not None:
        status_data.name = name
    if description is not None:
        status_data.description = description

    session.commit()
    session.close()

    return status_data, status_uuid


def delete_project_status(organization_uuid, project_uuid, status_uuid):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    Status = eval(
        f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").Status
    StatusData = eval(
        f"importlib.import_module('.status_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").StatusData

    TaskData = eval(
        f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").TaskData

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    status = session.query(Status).filter(Status.uuid == status_uuid).first()
    if status:
        session.delete(status)

    status_data = session.query(StatusData).filter(StatusData.uuid == status_uuid).first()
    if status_data:
        session.delete(status_data)

    task_data_entries = session.query(TaskData).filter(TaskData.status == status_uuid).all()
    for task_data in task_data_entries:
        task_data.status = None

    session.commit()

    session.close()
    return f"Status with UUID {status_uuid} has been deleted and task_data status updated."


'''==========================db functions: project_task_type=========================='''


def new_project_type_of_task(organization_uuid, project_uuid, name, description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    TypeOfTask = eval(
        f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").TypeOfTask
    TypeOfTaskData = eval(
        f"importlib.import_module('.type_of_task_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").TypeOfTaskData

    type_of_task_uuid = uuid.uuid4()

    type_of_task = TypeOfTask()
    type_of_task.uuid = type_of_task_uuid

    type_of_task_data = TypeOfTaskData()
    type_of_task_data.uuid = type_of_task_uuid
    type_of_task_data.name = name
    if description != "":
        type_of_task_data.description = description

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}"
         f".global_init('db/organizations/db/{_org_uuid}"
         f"/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")
    session.add(type_of_task)
    session.add(type_of_task_data)
    session.commit()
    session.close()

    return type_of_task, type_of_task_data, type_of_task_uuid


def update_project_type_of_task(organization_uuid, project_uuid, type_of_task_uuid, name=None, description=None):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    TypeOfTask = eval(
        f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TypeOfTask
    TypeOfTaskData = eval(
        f"importlib.import_module('.type_of_task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TypeOfTaskData

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    type_of_task = session.query(TypeOfTask).filter(TypeOfTask.uuid == type_of_task_uuid).first()
    if not type_of_task:
        session.close()
        raise Exception(f"TypeOfTask with UUID {type_of_task_uuid} not found.")

    type_of_task_data = session.query(TypeOfTaskData).filter(TypeOfTaskData.uuid == type_of_task_uuid).first()
    if not type_of_task_data:
        session.close()
        raise Exception(f"TypeOfTaskData with UUID {type_of_task_uuid} not found.")

    if name is not None:
        type_of_task_data.name = name
    if description is not None:
        type_of_task_data.description = description

    session.commit()
    session.close()

    return type_of_task_data, type_of_task_uuid


def delete_project_type_of_task(organization_uuid, project_uuid, type_of_task_uuid):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    TypeOfTask = eval(
        f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TypeOfTask
    TypeOfTaskData = eval(
        f"importlib.import_module('.type_of_task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TypeOfTaskData
    TaskData = eval(
        f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskData

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    tasks_to_update = session.query(TaskData).filter(TaskData.type == type_of_task_uuid).all()
    for task in tasks_to_update:
        task.type = None

    type_of_task_data_row = session.query(TypeOfTaskData).filter(TypeOfTaskData.uuid == type_of_task_uuid).first()
    if type_of_task_data_row:
        session.delete(type_of_task_data_row)

    type_of_task = session.query(TypeOfTask).filter(TypeOfTask.uuid == type_of_task_uuid).first()
    if type_of_task:
        session.delete(type_of_task)

    session.commit()
    session.close()

    return f"Type of task with UUID {type_of_task_uuid} and related data successfully deleted, and task_data.type updated."


'''==========================db functions: project_task=========================='''


def new_project_task(organization_uuid, project_uuid, creator, executors, date, name, type, priority, status,
                     description=""):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    Task = eval(
        f"importlib.import_module('.task', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").Task
    TaskData = eval(
        f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").TaskData

    task_uuid = uuid.uuid4()

    task = Task()
    task.uuid = task_uuid

    task_data = TaskData()
    task_data.uuid = task_uuid
    task_data.creator = creator
    task_data.name = name
    task_data.date = date
    if description != "":
        task_data.description = description
    task_data.type = type
    task_data.priority = priority
    task_data.status = status
    task_data.date = date.today()

    TaskExecutor = eval(
        f"importlib.import_module('.task_executor', package='db.organizations.db.{_org_uuid}"
        f".projects.{_project_uuid}')").TaskExecutor

    task_executors = []
    for i in executors:
        task_executor = TaskExecutor()
        task_executor.user_uuid = i
        task_executor.task_uuid = task_uuid
        task_executors.append(task_executor)

    exec(f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
         f"as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}"
         f".global_init('db/organizations/db/{_org_uuid}"
         f"/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")
    session.add(task)
    session.add(task_data)
    for i in task_executors:
        session.add(i)
    session.commit()
    session.close()

    return task, task_data, task_executors, task_uuid


def update_project_task(organization_uuid, project_uuid, task_uuid, executors=None, date=None, name=None,
                        task_type=None,
                        priority=None, status=None, description=None):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    TaskData = eval(
        f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskData
    TaskExecutor = eval(
        f"importlib.import_module('.task_executor', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskExecutor

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    task_data = session.query(TaskData).filter(TaskData.uuid == task_uuid).first()
    if not task_data:
        session.close()
        raise Exception(f"TaskData with UUID {task_uuid} not found.")

    if name is not None:
        task_data.name = name
    if task_type == "clear":
        task_data.type = ""
    if task_type is not None:
        task_data.type = task_type
    if priority is not None:
        task_data.priority = priority
    if status is not None:
        task_data.status = status
    if description is not None:
        task_data.description = description
    if date is not None:
        task_data.date = date

    if executors is not None:
        session.query(TaskExecutor).filter(TaskExecutor.task_uuid == task_uuid).delete()

        for executor in executors:
            task_executor = TaskExecutor()
            task_executor.user_uuid = executor
            task_executor.task_uuid = task_uuid
            session.add(task_executor)

    session.commit()
    session.close()

    return task_data, task_uuid


def delete_project_task(organization_uuid, project_uuid, task_uuid):
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"

    Task = eval(
        f"importlib.import_module('.task', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").Task
    TaskData = eval(
        f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskData
    TaskExecutor = eval(
        f"importlib.import_module('.task_executor', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskExecutor

    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session "
        f"as db_session{_project_uuid}")
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    task_executors = session.query(TaskExecutor).filter(TaskExecutor.task_uuid == task_uuid).all()
    for executor in task_executors:
        session.delete(executor)

    task_data = session.query(TaskData).filter(TaskData.uuid == task_uuid).first()
    if task_data:
        session.delete(task_data)

    task = session.query(Task).filter(Task.uuid == task_uuid).first()
    if task:
        session.delete(task)

    session.commit()
    session.close()

    return f"Task with UUID {task_uuid} and related data successfully deleted."


def get_user_projects(organization_uuid: uuid.UUID, user_uuid: uuid.UUID) -> List[ProjectData]:
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"

    
    exec(f"from db.organizations.db.{_org_uuid} import db_session as db_session{_org_uuid}")
    eval(f"db_session{_org_uuid}.global_init('db/organizations/db/{_org_uuid}/org_db.db')")
    session = eval(f"db_session{_org_uuid}.create_session()")

    ProjectMember = eval(f"importlib.import_module('.project_member', package='db.organizations.db.{_org_uuid}')").ProjectMember
    ProjectData = eval(f"importlib.import_module('.project_data', package='db.organizations.db.{_org_uuid}')").ProjectData

    projects = session.query(ProjectData).join(
        ProjectMember,
        ProjectData.uuid == ProjectMember.project_uuid
    ).filter(
        ProjectMember.user_uuid == user_uuid
    ).all()
    
    session.close()
    return projects

def get_project_members(organization_uuid, project_uuid):
    """
    Возвращает список участников проекта в виде списка словарей,
    где каждый словарь содержит следующие поля:
      - uuid
      - name
      - surname
      - role

    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :return: Список словарей с данными участника
    """
    try:
        _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
        _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
        
        User = eval(
            f"importlib.import_module('.user', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
        ).User

        exec(
            f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}"
        )
        eval(
            f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')"
        )
        session = eval(f"db_session{_project_uuid}.create_session()")
        
        results = session.query(User.uuid, User.role).all()
        session.close()

        global_session = create_session()
        from .base import UserData
        
        members = []
        for user_uuid, role in results:
            user_data = global_session.query(UserData).filter(UserData.uuid == user_uuid).first()
            name = user_data.name   
            surname = user_data.surname
            members.append({
                "uuid": str(user_uuid),
                "name": name,
                "surname": surname,
                "role": role
            })
        global_session.close()
        return members
    except Exception as e:
        raise e


def get_project_roles(organization_uuid, project_uuid):
    """
    Возвращает информацию обо всех ролях в проекте в виде списка словарей,
    где каждый словарь содержит следующие поля:
      - uuid: идентификатор роли
      - name: название роли (из RoleData)
      - description: описание роли (из RoleData)
    
    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :return: Список словарей с информацией о ролях
    """
    try:
        _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
        _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
        
        Role = eval(
            f"importlib.import_module('.role', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
        ).Role
        
        RoleData = eval(
            f"importlib.import_module('.role_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
        ).RoleData

        exec(
            f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}"
        )
        eval(
            f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')"
        )
        session = eval(f"db_session{_project_uuid}.create_session()")
        
        roles = session.query(Role, RoleData).join(RoleData, Role.uuid == RoleData.uuid).all()
        session.close()
        
        roles_info = []
        for role, role_data in roles:
            roles_info.append({
                "uuid": str(role.uuid),
                "name": role_data.name,
                "description": role_data.description if role_data.description else ""
            })
        return roles_info
    except Exception as e:
        raise e


def get_organization_statuses(organization_uuid: uuid.UUID) -> list:
    """
    Возвращает список всех status-ов для заданной организации.
    Каждый status представлен в виде словаря с полями:
      - uuid: идентификатор статуса
      - name: название статуса
      - description: описание статуса
    
    :param organization_uuid: UUID организации
    :return: Список словарей с информацией о статусах
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    
    # Настройка сессии базы данных для организации
    exec(f"from db.organizations.db.{_org_uuid} import db_session as db_session{_org_uuid}")
    eval(f"db_session{_org_uuid}.global_init('db/organizations/db/{_org_uuid}/org_db.db')")
    session = eval(f"db_session{_org_uuid}.create_session()")
    
    # Динамический импорт классов Status и StatusData
    Status = eval(f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}')").Status
    StatusData = eval(f"importlib.import_module('.status_data', package='db.organizations.db.{_org_uuid}')").StatusData
    
    # Запрос status-ов через объединение (join) Status и StatusData по uuid
    statuses = session.query(Status, StatusData).join(StatusData, Status.uuid == StatusData.uuid).all()
    session.close()
    
    status_list = []
    for status, status_data in statuses:
        status_list.append({
            "uuid": str(status.uuid),
            "name": status_data.name,
            "description": status_data.description if status_data.description else ""
        })
    return status_list


# Новый метод get_project_statuses для получения списка всех статус-ов из проекта
def get_project_statuses(organization_uuid: uuid.UUID, project_uuid: uuid.UUID) -> list:
    """
    Возвращает список всех status-ов для заданного проекта.
    Каждый статус представлен в виде словаря с полями:
      - uuid: идентификатор статуса
      - name: название статуса
      - description: описание статуса
    
    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :return: Список словарей с информацией о статусах проекта
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    
    # Настройка сессии базы данных для проекта
    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}"
    )
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')"
    )
    session = eval(f"db_session{_project_uuid}.create_session()")
    
    # Динамический импорт классов Status и StatusData для проекта
    Status = eval(
        f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
    ).Status
    StatusData = eval(
        f"importlib.import_module('.status_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
    ).StatusData
    
    # Получение статусов через объединение (join) Status и StatusData по uuid
    statuses = session.query(Status, StatusData).join(StatusData, Status.uuid == StatusData.uuid).all()
    session.close()
    
    status_list = []
    for status, status_data in statuses:
        status_list.append({
            "uuid": str(status.uuid),
            "name": status_data.name,
            "description": status_data.description if status_data.description else ""
        })
    return status_list

def get_project_types_of_tasks(organization_uuid: uuid.UUID, project_uuid: uuid.UUID) -> list:
    """
    Возвращает список всех типов тасков для заданного проекта.
    Каждый тип таска представлен в виде словаря с полями:
      - uuid: идентификатор типа таска
      - name: название типа таска
      - description: описание типа таска
    
    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :return: Список словарей с информацией о типах тасков
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    
    # Настройка сессии базы данных для проекта
    exec(
        f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}"
    )
    eval(
        f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')"
    )
    session = eval(f"db_session{_project_uuid}.create_session()")
    
    # Динамический импорт классов TypeOfTask и TypeOfTaskData для проекта
    TypeOfTask = eval(
        f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
    ).TypeOfTask
    TypeOfTaskData = eval(
        f"importlib.import_module('.type_of_task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')"
    ).TypeOfTaskData
    
    # Получаем типы тасков через объединение (join) TypeOfTask и TypeOfTaskData по uuid
    types = session.query(TypeOfTask, TypeOfTaskData).join(TypeOfTaskData, TypeOfTask.uuid == TypeOfTaskData.uuid).all()
    session.close()
    
    types_list = []
    for t, t_data in types:
        types_list.append({
            "uuid": str(t.uuid),
            "name": t_data.name,
            "description": t_data.description if t_data.description else ""
        })
    return types_list

# Новый метод get_organization_types_of_tasks для получения списка всех типов тасков из организации
def get_organization_types_of_tasks(organization_uuid: uuid.UUID) -> list:
    """
    Возвращает список всех типов тасков для заданной организации.
    Каждый тип таска представлен в виде словаря с полями:
      - uuid: идентификатор типа таска
      - name: название типа таска
      - description: описание типа таска
    
    :param organization_uuid: UUID организации
    :return: Список словарей с информацией о типах тасков
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    
    # Настройка сессии базы данных для организации
    exec(f"from db.organizations.db.{_org_uuid} import db_session as db_session{_org_uuid}")
    eval(f"db_session{_org_uuid}.global_init('db/organizations/db/{_org_uuid}/org_db.db')")
    session = eval(f"db_session{_org_uuid}.create_session()")
    
    # Динамический импорт классов TypeOfTask и TypeOfTaskData для организации
    TypeOfTask = eval(f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}')").TypeOfTask
    TypeOfTaskData = eval(f"importlib.import_module('.type_of_task_data', package='db.organizations.db.{_org_uuid}')").TypeOfTaskData
    
    # Получаем типы тасков через объединение (join) TypeOfTask и TypeOfTaskData по uuid
    types = session.query(TypeOfTask, TypeOfTaskData).join(TypeOfTaskData, TypeOfTask.uuid == TypeOfTaskData.uuid).all()
    session.close()
    
    types_list = []
    for t, t_data in types:
        types_list.append({
            "uuid": str(t.uuid),
            "name": t_data.name,
            "description": t_data.description if t_data.description else ""
        })
    return types_list

# Новый метод get_project_tasks для получения всех тасков из проекта
def get_project_tasks(organization_uuid: uuid.UUID, project_uuid: uuid.UUID) -> list:
    """
    Возвращает список всех тасков для заданного проекта.
    Каждый таск представлен в виде словаря с полями:
      - uuid: идентификатор таска
      - creator: UUID создателя таска
      - name: название таска
      - date: дата таска в формате ISO (если указана)
      - description: описание таска
      - type: тип таска
      - priority: приоритет таска
      - status: статус таска
      - executors: список UUID исполнителей
     
    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :return: Список словарей с данными тасков.
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    
    # Настройка сессии для проекта
    exec(f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")
    
    # Динамический импорт моделей TaskData и TaskExecutor
    TaskData = eval(f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskData
    TaskExecutor = eval(f"importlib.import_module('.task_executor', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskExecutor
    
    tasks = session.query(TaskData).all()
    tasks_list = []
    
    for task in tasks:
        # Получаем исполнителей для текущего таска
        executors_rows = session.query(TaskExecutor).filter(TaskExecutor.task_uuid == task.uuid).all()
        executors = [str(executor.user_uuid) for executor in executors_rows]
        
        tasks_list.append({
            "uuid": str(task.uuid),
            "creator": str(task.creator) if hasattr(task, "creator") and task.creator else "",
            "name": task.name if hasattr(task, "name") else "",
            "date": task.date.isoformat() if hasattr(task, "date") and task.date else "",
            "description": task.description if hasattr(task, "description") else "",
            "type": task.type if hasattr(task, "type") else "",
            "priority": task.priority if hasattr(task, "priority") else "",
            "status": task.status if hasattr(task, "status") else "",
            "executors": executors
        })
    
    session.close()
    return tasks_list

def get_project_task(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, task_uuid: uuid.UUID) -> dict:
    """
    Возвращает данные конкретного таска из проекта.
    
    Таск представлен в виде словаря с полями:
      - uuid: идентификатор таска
      - creator: UUID создателя таска  
      - name: название таска
      - date: дата таска в формате ISO (если указана)
      - description: описание таска
      - type: тип таска
      - priority: приоритет таска
      - status: статус таска
      - executors: список UUID исполнителей

    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта 
    :param task_uuid: UUID таска
    :return: Словарь с данными таска или None если таск не найден
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    
    # Настройка сессии для проекта
    exec(f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")
    
    # Динамический импорт моделей
    TaskData = eval(f"importlib.import_module('.task_data', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskData
    TaskExecutor = eval(f"importlib.import_module('.task_executor', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TaskExecutor
    
    # Получаем таск по uuid
    task = session.query(TaskData).filter(TaskData.uuid == task_uuid).first()
    
    if task is None:
        session.close()
        return None
        
    # Получаем исполнителей для таска
    executors_rows = session.query(TaskExecutor).filter(TaskExecutor.task_uuid == task.uuid).all()
    executors = [str(executor.user_uuid) for executor in executors_rows]
    
    task_data = {
        "uuid": str(task.uuid),
        "creator": str(task.creator) if hasattr(task, "creator") and task.creator else "",
        "name": task.name if hasattr(task, "name") else "",
        "date": task.date.isoformat() if hasattr(task, "date") and task.date else "",
        "description": task.description if hasattr(task, "description") else "",
        "type": task.type if hasattr(task, "type") else "",
        "priority": task.priority if hasattr(task, "priority") else "",
        "status": task.status if hasattr(task, "status") else "",
        "executors": executors
    }
    
    session.close()
    return task_data





# ФУНКЦИИ ДЛЯ ПРОВЕРОК И ВАЛИДАЦИИ ДАННЫХ
## В ПРОЕКТАХ:

def is_executor_in_project(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, executor_uuid: uuid.UUID) -> bool:
    """
    Проверяет, существует ли исполнитель (User) с заданным executor_uuid в проекте.

    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :param executor_uuid: UUID исполнителя
    :return: True, если исполнитель найден, иначе False
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    exec(f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    User = eval(f"importlib.import_module('.user', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").User
    exists = session.query(User).filter(User.uuid == executor_uuid).first() is not None
    session.close()
    return exists

def is_type_in_project(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, type_uuid: uuid.UUID) -> bool:
    """
    Проверяет, существует ли тип задачи (TypeOfTask) с заданным type_uuid в проекте.

    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :param type_uuid: UUID типа задачи
    :return: True, если тип задачи найден, иначе False
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    exec(f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    TypeOfTask = eval(f"importlib.import_module('.type_of_task', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").TypeOfTask
    exists = session.query(TypeOfTask).filter(TypeOfTask.uuid == type_uuid).first() is not None
    session.close()
    return exists

def is_status_in_project(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, status_uuid: uuid.UUID) -> bool:
    """
    Проверяет, существует ли статус (Status) с заданным status_uuid в проекте.

    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :param status_uuid: UUID статуса
    :return: True, если статус найден, иначе False
    """
    _org_uuid = f"_{str(organization_uuid).replace('-', '_')}"
    _project_uuid = f"_{str(project_uuid).replace('-', '_')}"
    exec(f"from db.organizations.db.{_org_uuid}.projects.{_project_uuid} import db_session as db_session{_project_uuid}")
    eval(f"db_session{_project_uuid}.global_init('db/organizations/db/{_org_uuid}/projects/{_project_uuid}/project_db.db')")
    session = eval(f"db_session{_project_uuid}.create_session()")

    Status = eval(f"importlib.import_module('.status', package='db.organizations.db.{_org_uuid}.projects.{_project_uuid}')").Status
    exists = session.query(Status).filter(Status.uuid == status_uuid).first() is not None
    session.close()
    return exists


## В ОРГАНИЗАЦИЯХ:

### АВТОМАТИЧЕСКАЯ ЗАВИМОСТЬ ДЛЯ ВАЛИДАЦИИ И ПРОВЕРКИ СУЩЕСТВОВАНИЯ ОРГАНИЗАЦИИ
def verify_is_organization_exists(organization_uuid: str) -> uuid.UUID:
    try:
        parsed_uuid = uuid.UUID(organization_uuid)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organization UUID format.")

    _org_uuid = f"_{str(parsed_uuid).replace('-', '_')}"
    base_dir = os.path.join(os.getcwd(), "db", "organizations", "db")
    org_path = os.path.join(base_dir, _org_uuid)

    if not os.path.isdir(org_path):
        raise HTTPException(status_code=404, detail=f"Organization {organization_uuid} not found")

    return parsed_uuid


### ПРОВЕРКА ДОСТУПА К ПРОЕКТУ В ОРГАНИЗАЦИИ
def is_project_accessible_in_org(organization_uuid: uuid.UUID, project_uuid: uuid.UUID, user_uuid: uuid.UUID) -> bool:
    """
    Проверяет, существует ли проект с заданным project_uuid в организации (organization_uuid)
    и имеет ли пользователь (user_uuid) доступ к этому проекту.

    :param organization_uuid: UUID организации
    :param project_uuid: UUID проекта
    :param user_uuid: UUID пользователя
    :return: True, если проект существует и пользователь является участником, иначе False
    """
    # Используем функцию get_user_projects для получения списка проектов, к которым имеет доступ пользователь
    user_projects = get_user_projects(organization_uuid, user_uuid)
    for proj in user_projects:
        # Сравниваем строковое представление uuid, чтобы избежать возможных несоответствий типа.
        if str(proj.uuid) == str(project_uuid):
            return True
    return False


### ПРОВЕРКА НАХОЖДЕНИЯ ПОЛЬЗОВАТЕЛЯ В ОРГАНИЗАЦИИ
def is_user_in_organization(organization_uuid: uuid.UUID, user_uuid: uuid.UUID) -> bool:
    """
    Проверяет, существует ли пользователь (user_uuid) в организации (organization_uuid).

    :param organization_uuid: UUID организации
    :param user_uuid: UUID пользователя
    :return: True, если пользователь найден в организации, иначе False
    """
    session = db_session.create_session()
    from .base import OrganizationMember
    exists = session.query(OrganizationMember).filter(
        OrganizationMember.user_uuid == user_uuid,
        OrganizationMember.organization_uuid == organization_uuid
    ).first() is not None
    session.close()
    return exists

# Добавляем новую функцию для обновления данных пользователя
def update_user(user_uuid: uuid.UUID, 
                name: Union[str, None] = None, 
                surname: Union[str, None] = None, 
                gender: Union[str, None] = None, 
                password: Union[str, None] = None, 
                email: Union[str, None] = None, 
                date_of_birthday: Union[str, None] = None):
    """
    Обновляет данные пользователя. Все поля являются необязательными,
    поэтому можно обновить только нужное значение.
    
    :param user_uuid: UUID пользователя, данные которого нужно изменить.
    :param name: Новое имя (если указано).
    :param surname: Новая фамилия (если указано).
    :param email: Новый email (если указан).
    :param password: Новый пароль (если указан, будет обработан методом set_password).
    :param gender: Новый пол (если указан).
    :param date_of_birthday: Новая дата рождения (если указана).
    :return: Словарь с сообщением об успешном обновлении.
    """
    session = db_session.create_session()
    
    # Получаем данные пользователя из таблиц UserData и UserLoginData
    user_data = session.query(UserData).filter(UserData.uuid == user_uuid).first()
    user_login_data = session.query(UserLoginData).filter(UserLoginData.uuid == user_uuid).first()
    
    if not user_data or not user_login_data:
        session.close()
        raise Exception("Пользователь не найден")
    
    if name is not None:
        user_data.name = name
    if surname is not None:
        user_data.surname = surname
    if gender is not None:
        user_data.gender = gender
    if date_of_birthday is not None:
        user_data.date_of_birthday = date_of_birthday
    if email is not None:
        user_login_data.email = email
    if password is not None:
        user_login_data.set_password(password)
    
    session.commit()
    session.close()
    return 1

def get_all_user_projects(user_uuid: uuid.UUID) -> List[dict]:
    """
    Возвращает список всех проектов, в которых состоит пользователь, из всех организаций.
    
    :param user_uuid: UUID пользователя
    :return: Список словарей с информацией о проектах
    """
    session = db_session.create_session()
    
    # Получаем все организации, в которых состоит пользователь
    org_members = session.query(OrganizationMember).filter(OrganizationMember.user_uuid == user_uuid).all()
    session.close()
    
    all_projects = []
    
    # Для каждой организации получаем проекты пользователя
    for org_member in org_members:
        organization_uuid = org_member.organization_uuid
        try:
            # Получаем проекты пользователя в текущей организации
            projects = get_user_projects(organization_uuid, user_uuid)
            
            # Получаем данные организации для добавления в результат
            org_session = db_session.create_session()
            org_data = org_session.query(OrganizationData).filter(OrganizationData.uuid == organization_uuid).first()
            org_name = org_data.name if org_data else "Unknown Organization"
            org_session.close()
            
            # Формируем информацию о проектах
            for project in projects:
                project_info = {
                    "project_uuid": project.uuid,
                    "project_name": project.name,
                    "project_description": project.description,
                    "organization_uuid": organization_uuid,
                    "organization_name": org_name
                }
                all_projects.append(project_info)
        except Exception as e:
            logger.error(f"Error getting projects for organization {organization_uuid}: {str(e)}")
            continue
    
    return all_projects

def get_user_organizations(user_uuid: uuid.UUID) -> List[dict]:
    """
    Возвращает список всех организаций, в которых состоит пользователь.
    
    :param user_uuid: UUID пользователя
    :return: Список словарей с информацией об организациях
    """
    session = db_session.create_session()
    
    # Получаем все организации, в которых состоит пользователь
    org_members = session.query(OrganizationMember).filter(OrganizationMember.user_uuid == user_uuid).all()
    
    organizations = []
    
    # Для каждого членства получаем данные организации
    for org_member in org_members:
        organization_uuid = org_member.organization_uuid
        
        # Получаем данные организации
        org_data = session.query(OrganizationData).filter(OrganizationData.uuid == organization_uuid).first()
        
        if org_data:
            organization_info = {
                "uuid": str(organization_uuid),
                "name": org_data.name,
                "description": org_data.description if org_data.description else ""
            }
            organizations.append(organization_info)
    
    session.close()
    return organizations

def get_user_profile(user_uuid: uuid.UUID) -> dict:
    """
    Возвращает информацию о профиле пользователя.
    
    :param user_uuid: UUID пользователя
    :return: Словарь с информацией о пользователе
    """
    session = db_session.create_session()
    
    try:
        # Получаем данные пользователя из обеих таблиц
        user_data = session.query(UserData).filter(UserData.uuid == user_uuid).first()
        user_login_data = session.query(UserLoginData).filter(UserLoginData.uuid == user_uuid).first()
        
        if not user_data or not user_login_data:
            return None
        
        # Формируем информацию о пользователе
        user_info = {
            "uuid": str(user_uuid),
            "email": user_login_data.email,
            "name": user_data.name if user_data.name else "",
            "surname": user_data.surname if user_data.surname else "",
            "gender": user_data.gender if user_data.gender else "",
            "date_of_birthday": user_data.date_of_birthday.isoformat() if user_data.date_of_birthday else None
        }
        
        return user_info
    except Exception as e:
        logger.error(f"Error getting user profile for user {user_uuid}: {str(e)}")
        return None
    finally:
        session.close()
