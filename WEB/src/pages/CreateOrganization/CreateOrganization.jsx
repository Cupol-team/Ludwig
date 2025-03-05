import { useState   } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganization } from '@/api/organizations';
import styles from '@/styles/pages/CreateOrganization.module.css';


function CreateOrganization() {
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
      setError('Название организации обязательно');
      return;
    }

    try {
      const response = await createOrganization(formData);
      if (response.status === 200) {
        navigate('/organizations');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при создании организации');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Создание организации</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Название организации *</label>
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
          Создать организацию
        </button>
      </form>
    </div>
  );
}

export default CreateOrganization; 