import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getRoles as getProjectRoles, createProjectRole } from '../../api/roles';
import Loader from '../../components/Loader';
import Notification from '../../components/Notification';
import '../../styles/roles.css';
import RestrictedComponent from '../../components/RestrictedComponent';

// Список всех доступных пермишшенов
const PERMISSION_GROUPS = [
  { 
    id: 'task', 
    label: 'Задачи', 
    permissions: [
      { id: "task.create", label: "Создание задач" },
      { id: "task.edit", label: "Редактирование задач" },
      { id: "task.delete", label: "Удаление задач" },
    ]
  },
  { 
    id: 'project', 
    label: 'Проект', 
    permissions: [
      { id: "project.edit", label: "Редактирование проекта" },
      { id: "project.delete", label: "Удаление проекта" },
    ]
  },
  { 
    id: 'member', 
    label: 'Участники', 
    permissions: [
      { id: "project.member.add", label: "Добавление участников" },
      { id: "project.member.edit", label: "Редактирование участников" },
      { id: "project.member.delete", label: "Удаление участников" },
    ]
  },
  { 
    id: 'role', 
    label: 'Роли', 
    permissions: [
      { id: "project.role.create", label: "Создание ролей" },
      { id: "project.role.edit", label: "Редактирование ролей" },
      { id: "project.role.delete", label: "Удаление ролей" },
    ]
  },
  { 
    id: 'status', 
    label: 'Статусы задач', 
    permissions: [
      { id: "task.status.create", label: "Создание статусов задач" },
      { id: "task.status.edit", label: "Редактирование статусов задач" },
      { id: "task.status.delete", label: "Удаление статусов задач" },
    ]
  },
  { 
    id: 'type', 
    label: 'Типы задач', 
    permissions: [
      { id: "task.type.create", label: "Создание типов задач" },
      { id: "task.type.edit", label: "Редактирование типов задач" },
      { id: "task.type.delete", label: "Удаление типов задач" },
    ]
  },
];

function Roles() {
  const { orgId, projectUuid } = useParams();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedRole, setExpandedRole] = useState(null);
  const [newRole, setNewRole] = useState({ 
    name: '', 
    description: '', 
    permissions: [] 
  });
  const controllerRef = useRef(null);

  // Функция для выбора правильной формы слова в зависимости от числа
  const getPluralForm = (number, one, two, five) => {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  };

  // Функция для преобразования старого формата пермишшенов в новый
  const convertLegacyPermission = (permission) => {
    // Если пермишшен уже в новом формате (содержит точки), возвращаем как есть
    if (permission.includes('.')) {
      return permission;
    }
    
    // Для автоматического преобразования используем простую логику:
    // add_project_member -> project.member.add
    // edit_task -> task.edit
    if (permission.startsWith('create_')) {
      const resource = permission.replace('create_', '');
      if (resource === 'task') {
        return 'task.create';
      } else if (resource.startsWith('task_')) {
        const subResource = resource.replace('task_', '');
        return `task.${subResource}.create`;
      } else if (resource.startsWith('project_')) {
        const subResource = resource.replace('project_', '');
        return `project.${subResource}.create`;
      }
    } else if (permission.startsWith('edit_')) {
      const resource = permission.replace('edit_', '');
      if (resource === 'task') {
        return 'task.edit';
      } else if (resource === 'project') {
        return 'project.edit';
      } else if (resource.startsWith('task_')) {
        const subResource = resource.replace('task_', '');
        return `task.${subResource}.edit`;
      } else if (resource.startsWith('project_')) {
        const subResource = resource.replace('project_', '');
        return `project.${subResource}.edit`;
      }
    } else if (permission.startsWith('delete_')) {
      const resource = permission.replace('delete_', '');
      if (resource === 'task') {
        return 'task.delete';
      } else if (resource === 'project') {
        return 'project.delete';
      } else if (resource.startsWith('task_')) {
        const subResource = resource.replace('task_', '');
        return `task.${subResource}.delete`;
      } else if (resource.startsWith('project_')) {
        const subResource = resource.replace('project_', '');
        return `project.${subResource}.delete`;
      }
    } else if (permission.startsWith('add_')) {
      const resource = permission.replace('add_', '');
      if (resource === 'project_member') {
        return 'project.member.add';
      }
    }
    
    // Если автоматическое преобразование не сработало, используем готовое соответствие
    const mappings = {
      'add_project_member': 'project.member.add',
      'edit_project_member': 'project.member.edit',
      'delete_project_member': 'project.member.delete',
      
      'create_project_role': 'project.role.create',
      'edit_project_role': 'project.role.edit',
      'delete_project_role': 'project.role.delete',
      
      'create_task': 'task.create',
      'edit_task': 'task.edit',
      'delete_task': 'task.delete',
      
      'create_task_status': 'task.status.create',
      'edit_task_status': 'task.status.edit',
      'delete_task_status': 'task.status.delete',
      
      'create_task_type': 'task.type.create',
      'edit_task_type': 'task.type.edit',
      'delete_task_type': 'task.type.delete',
      
      'edit_project': 'project.edit',
      'delete_project': 'project.delete'
    };
    
    return mappings[permission] || permission;
  };

  // Функция для получения человеко-читаемого названия пермишшена
  const getPermissionLabel = (permissionId) => {
    // Преобразуем старые форматы в новые для поиска подходящей метки
    const normalizedPermissionId = permissionId.includes('.') ? 
      permissionId : 
      convertLegacyPermission(permissionId);
    
    for (const group of PERMISSION_GROUPS) {
      const permission = group.permissions.find(p => p.id === normalizedPermissionId);
      if (permission) {
        return permission.label;
      }
    }
    
    // Если метка не найдена, пытаемся создать читаемое название из ID
    if (permissionId.includes('.')) {
      // Для нового формата
      const parts = permissionId.split('.');
      return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    } else {
      // Для старого формата
      const parts = permissionId.split('_');
      return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    }
  };

  // Функция для группировки пермишшенов по категориям
  const groupPermissionsByCategory = (permissions) => {
    const grouped = {};
    
    // Сначала преобразуем все пермишшены в новый формат для сравнения
    const normalizedPermissions = permissions.map(p => 
      p.includes('.') ? p : convertLegacyPermission(p)
    );
    
    // Определяем порядок категорий для сортировки
    const categoryOrder = [
      'Задачи',
      'Проект',
      'Участники',
      'Роли',
      'Статусы задач',
      'Типы задач'
    ];
    
    // Группируем по категориям
    PERMISSION_GROUPS.forEach(group => {
      const permissionsInGroup = [];
      
      // Проверяем каждый пермишшен
      for (let i = 0; i < permissions.length; i++) {
        const originalPermission = permissions[i];
        const normalizedPermission = normalizedPermissions[i];
        
        // Если пермишшен принадлежит этой группе, добавляем
        if (group.permissions.some(gp => gp.id === normalizedPermission)) {
          permissionsInGroup.push(originalPermission);
        }
      }
      
      if (permissionsInGroup.length > 0) {
        // Сортируем пермишшены по алфавиту
        const sortedPermissions = permissionsInGroup
          .map(p => getPermissionLabel(p))
          .sort((a, b) => a.localeCompare(b, 'ru'));
        
        grouped[group.label] = sortedPermissions;
      }
    });
    
    // Добавляем неизвестные пермишшены в отдельную категорию
    const unknownPermissions = [];
    for (let i = 0; i < permissions.length; i++) {
      const originalPermission = permissions[i];
      const normalizedPermission = normalizedPermissions[i];
      
      // Если пермишшен не принадлежит ни одной группе
      const belongsToAnyGroup = PERMISSION_GROUPS.some(group => 
        group.permissions.some(gp => gp.id === normalizedPermission)
      );
      
      if (!belongsToAnyGroup) {
        unknownPermissions.push(originalPermission);
      }
    }
    
    if (unknownPermissions.length > 0) {
      grouped['Другие права'] = unknownPermissions
        .map(p => getPermissionLabel(p))
        .sort((a, b) => a.localeCompare(b, 'ru'));
    }
    
    // Создаем новый объект с отсортированными категориями
    const orderedGrouped = {};
    
    // Сначала добавляем категории в определенном порядке
    categoryOrder.forEach(category => {
      if (grouped[category]) {
        orderedGrouped[category] = grouped[category];
      }
    });
    
    // Затем добавляем остальные категории
    Object.keys(grouped).forEach(category => {
      if (!categoryOrder.includes(category)) {
        orderedGrouped[category] = grouped[category];
      }
    });
    
    return orderedGrouped;
  };

  const toggleRoleExpand = (uuid) => {
    if (expandedRole === uuid) {
      setExpandedRole(null);
    } else {
      setExpandedRole(uuid);
    }
  };

  const fetchRoles = useCallback(async () => {
    controllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      const data = await getProjectRoles(orgId, projectUuid, controllerRef.current.signal);
      setRoles(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Ошибка загрузки ролей проекта');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, projectUuid]);

  useEffect(() => {
    fetchRoles();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchRoles]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (newRole.name.trim() === '') return;
    const controller = new AbortController();
    try {
      const created = await createProjectRole(orgId, projectUuid, newRole, controller.signal);
      setRoles(prev => [...prev, created]);
      setNewRole({ name: '', description: '', permissions: [] });
      setIsCreating(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Обработчик изменения состояния чекбокса пермишшенов
  const handlePermissionChange = (permissionId) => {
    setNewRole(prev => {
      if (prev.permissions.includes(permissionId)) {
        return {
          ...prev,
          permissions: prev.permissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId]
        };
      }
    });
  };

  // Обработчик выбора/отмены всех пермишшенов в группе
  const handleGroupPermissionChange = (groupPermissions, isChecked) => {
    setNewRole(prev => {
      let updatedPermissions;
      
      if (isChecked) {
        // Добавляем все пермишшены группы
        const permissionIds = groupPermissions.map(p => p.id);
        const newPermissions = [...prev.permissions];
        
        permissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        
        updatedPermissions = newPermissions;
      } else {
        // Удаляем все пермишшены группы
        const permissionIds = groupPermissions.map(p => p.id);
        updatedPermissions = prev.permissions.filter(id => !permissionIds.includes(id));
      }
      
      return {
        ...prev,
        permissions: updatedPermissions
      };
    });
  };

  // Проверка, выбраны ли все пермишшены в группе
  const isGroupChecked = (groupPermissions) => {
    return groupPermissions.every(p => newRole.permissions.includes(p.id));
  };

  // Проверка, выбран ли хотя бы один пермишшен в группе
  const isGroupPartiallyChecked = (groupPermissions) => {
    return groupPermissions.some(p => newRole.permissions.includes(p.id)) && 
           !groupPermissions.every(p => newRole.permissions.includes(p.id));
  };

  if (isLoading) return <Loader />;
  if (error) return <Notification message={error} type="error" />;

  return (
    <div className="roles-container">
      <h2>Роли проекта</h2>
      <button className="create-role-btn" onClick={() => setIsCreating(true)}>
        Создать роль
      </button>

      {isCreating && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Создание новой роли</h3>
              <button 
                className="close-modal" 
                onClick={() => setIsCreating(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="modal-form">
              <div className="form-group">
                <label>Название</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Описание</label>
                <textarea
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
              
              <div className="form-group permissions-group">
                <label>Права доступа</label>
                <div className="permissions-list">
                  {PERMISSION_GROUPS.map(group => (
                    <div key={group.id} className="permission-group">
                      <div className="permission-group-header">
                        <label className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={isGroupChecked(group.permissions)}
                            ref={input => {
                              if (input) {
                                input.indeterminate = isGroupPartiallyChecked(group.permissions);
                              }
                            }}
                            onChange={(e) => handleGroupPermissionChange(group.permissions, e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          <span className="group-label">{group.label}</span>
                        </label>
                      </div>
                      <div className="permission-group-items">
                        {group.permissions.map(permission => (
                          <label key={permission.id} className="checkbox-container permission-item">
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                            />
                            <span className="checkmark"></span>
                            <span>{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Создать</button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setIsCreating(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ul className="roles-list">
        {roles.map(role => (
          <li key={role.uuid} className="role-item">
            <div className="role-info">
              <div className="role-name">{role.name}</div>
              <div className="role-description">{role.description || 'Нет описания'}</div>
              {role.permissions && role.permissions.length > 0 && (
                <div className="role-permissions-wrapper">
                  <div 
                    className="role-permissions"
                    onClick={() => toggleRoleExpand(role.uuid)}
                  >
                    <span className="permissions-count">
                      {role.permissions.length} {getPluralForm(role.permissions.length, 'право доступа', 'права доступа', 'прав доступа')}
                      <span className="expand-icon">{expandedRole === role.uuid ? '▼' : '▶'}</span>
                    </span>
                  </div>
                  
                  {expandedRole === role.uuid && (
                    <div className="permissions-details">
                      {Object.entries(groupPermissionsByCategory(role.permissions)).map(([category, permissions]) => (
                        <div key={category} className="permission-category">
                          <div className="permission-category-name">{category} ({permissions.length})</div>
                          <ul className="permission-items">
                            {permissions.map(permission => (
                              <li key={permission} className="permission-item-detail">{permission}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Roles; 