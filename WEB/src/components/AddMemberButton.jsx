import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getOrganizationMembers, addMemberToProject } from '../api/members';
import '../styles/AddMemberButton.css';
import { ProjectContext } from '../context/ProjectContext';
import axios from 'axios';

const AddMemberButton = ({ onMemberAdded }) => {
  const { orgId, projectUuid } = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [organizationMembers, setOrganizationMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { members, roles } = useContext(ProjectContext);

  // Загрузка участников организации при открытии модального окна
  useEffect(() => {
    if (open) {
      const controller = new AbortController();
      setLoading(true);
      
      getOrganizationMembers(orgId, controller.signal)
        .then(orgMembers => {
          // Фильтруем список, исключая уже добавленных участников
          const filteredMembers = orgMembers.filter(orgMember => 
            !members.some(projectMember => projectMember.uuid === orgMember.uuid)
          );
          setOrganizationMembers(filteredMembers);
          setLoading(false);
        })
        .catch(err => {
          if (!axios.isCancel(err)) {
            console.error('Error fetching organization members:', err);
            setError('Не удалось загрузить список участников организации');
            setLoading(false);
          }
        });

      return () => controller.abort();
    }
  }, [open, orgId, members]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMember) {
      setError('Выберите участника для добавления');
      return;
    }
    
    if (!selectedRole) {
      setError('Выберите роль для участника');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await addMemberToProject(orgId, projectUuid, selectedMember, selectedRole);
      setOpen(false);
      setSelectedMember('');
      setSelectedRole('');
      if (onMemberAdded) onMemberAdded();
    } catch (err) {
      console.error('Error adding member to project:', err);
      setError('Не удалось добавить участника в проект');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        className="add-member-button"
        onClick={() => setOpen(true)}
      >
        + Добавить участника
      </button>
      
      {open && (
        <div className="modal-overlay">
          <div className="add-member-modal">
            <button 
              className="close-button"
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
            <h2>Добавить участника в проект</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="member-select">Выберите участника</label>
                <select
                  id="member-select"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  disabled={loading || organizationMembers.length === 0}
                >
                  <option value="">
                    {loading ? 'Загрузка...' : 
                     organizationMembers.length === 0 ? 'Нет доступных участников' : 
                     'Выберите участника'}
                  </option>
                  {organizationMembers.map((member) => (
                    <option key={member.uuid} value={member.uuid}>
                      {member.name} {member.second_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="role-select">Выберите роль</label>
                <select
                  id="role-select"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={loading || !roles || roles.length === 0}
                >
                  <option value="">
                    {roles && roles.length > 0 ? 'Выберите роль' : 'Роли отсутствуют'}
                  </option>
                  {roles && roles.map((role) => (
                    <option key={role.uuid} value={role.uuid}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading || !selectedMember || !selectedRole}
              >
                {loading ? 'Добавление...' : 'Добавить'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddMemberButton; 