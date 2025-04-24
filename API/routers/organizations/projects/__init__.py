from .role import router as projects_role_router
from .member import router as projects_members_router
from .task import router as projects_task_router
from .type import router as projects_task_types_router
from .status import router as projects_statuses_router
from .info import router as projects_info_router
from .setting import router as projects_setting_router

#__all__ = ["projects_role_router"] # TODO: Разобраться нахуя нужен этот __all__, но на всякий пока что я его тут
# TODO:  писать не буду, а в остальном буду (А ПОТОМУ ЧТО Я МОГУ)