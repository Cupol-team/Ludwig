import React, { useState } from 'react';
import { updateMemberRole } from '../api/members';
import '../styles/EditMemberRoleModal.css';

function EditMemberRoleModal({ organizationUuid, projectUuid, memberUuid, roles, currentRoleUuid, onClose, onRoleUpdated }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Фильтруем список ролей, исключая текущую роль пользователя
  const availableRoles = roles.filter(role => role.uuid !== currentRoleUuid);

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      await updateMemberRole(
        organizationUuid,
        projectUuid,
        memberUuid,
        selectedRole,
        controller.signal
      );
      
      if (onRoleUpdated) onRoleUpdated();
      onClose();
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Не удалось обновить роль участника');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="edit-member-modal">
        <div className="modal-header">
          <h2 className="modal-title">Изменить роль участника</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form className="edit-member-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role-select">Выберите новую роль</label>
            {availableRoles.length > 0 ? (
              <select
                id="role-select"
                value={selectedRole}
                onChange={handleRoleChange}
                required
              >
                <option value="">Выберите роль</option>
                {availableRoles.map(role => (
                  <option key={role.uuid} value={role.uuid}>
                    {role.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="no-roles-message">Нет доступных ролей для изменения</div>
            )}
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <div className="modal-actions">
            <button 
              type="submit" 
              disabled={loading || !selectedRole || availableRoles.length === 0}
            >
              {loading ? "Обновление..." : "Сохранить"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditMemberRoleModal; 