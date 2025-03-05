import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createProject } from '@/api/projects';
import styles from '@/styles/pages/CreateProject.module.css';

function CreateProject() {
  const { orgId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Название проекта обязательно');
      return;
    }

    try {
      const response = await createProject(orgId, formData);
      if (response.status === 200) {
        navigate(`/organizations/${orgId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании проекта');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Создание проекта</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название проекта *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submitButton}>
          Создать проект
        </button>
      </form>
    </div>
  );
}

export default CreateProject; 