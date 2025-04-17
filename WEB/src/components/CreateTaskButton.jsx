import React, { useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import { createTask } from '../api/tasks';
import { ProjectContext } from '../context/ProjectContext';
import axios from 'axios';
import { marked } from 'marked';
import '../styles/TaskCreationModal.css';

const CreateTaskButton = ({ onTaskCreated }) => {
  const { orgId, projectUuid } = useParams();
  const { taskTypes, taskStatuses, members } = useContext(ProjectContext);
  
  // Начальное состояние задачи
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    priority: 0,
    status: '',
    date: new Date().toISOString().slice(0, 10),
    executors: []
  });
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояние для выбора исполнителей через react-select
  const [selectedExecutors, setSelectedExecutors] = useState([]);
  
  // Состояние для предпросмотра Markdown
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  
  // Функция для вставки markdown-сниппета в описание
  const insertMarkdown = (snippet) => {
    setFormData({
      ...formData,
      description: (formData.description || '') + snippet,
    });
  };
  
  // Фильтрация участников с учетом имени, фамилии и email
  const filterMembers = (inputValue) => {
    return members
      .filter(member => {
        const fullName = `${member.name} ${member.surname || ''}`.toLowerCase();
        return fullName.includes(inputValue.toLowerCase()) ||
               (member.email && member.email.toLowerCase().includes(inputValue.toLowerCase()));
      })
      .map(member => ({
        value: member.uuid,
        label: member.surname 
          ? `${member.name} ${member.surname}${member.email ? ` (${member.email})` : ''}` 
          : `${member.name}${member.email ? ` (${member.email})` : ''}`
      }));
  };
  
  // Асинхронное получение опций для поиска исполнителей
  const promiseOptions = (inputValue) =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterMembers(inputValue));
      }, 500);
    });
  
  // Обработчик выбора исполнителей
  const handleExecutorsSelectChange = (selectedOptions) => {
    setSelectedExecutors(selectedOptions);
    setFormData({
      ...formData,
      executors: selectedOptions ? selectedOptions.map(option => option.value) : []
    });
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    
    try {
      const data = await createTask(orgId, projectUuid, formData, controller.signal);
      
      // Создаем полный объект задачи для добавления в список
      // Это решает проблему пустых значений до обновления страницы
      const newTask = {
        ...data,
        uuid: data.uuid || data.id || `temp-${Date.now()}`, // В зависимости от того, что возвращает API
        name: formData.name,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        status: formData.status,
        date: formData.date,
        executors: formData.executors
      };
      
      // Очищаем форму
      setFormData({
        name: '',
        description: '',
        type: '',
        priority: 0,
        status: '',
        date: new Date().toISOString().slice(0, 10),
        executors: []
      });
      
      setSelectedExecutors([]);
      setOpen(false);
      
      // Передаем полный объект задачи обратно в родительский компонент
      if(onTaskCreated) onTaskCreated(newTask);
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Ошибка при создании задачи:', err);
        setError(err.response?.data?.message || err.message || 'Произошла ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  // Проверка обязательных полей: название, тип, статус и исполнители должны быть заполнены
  const formIsValid =
    formData.name.trim() !== '' &&
    formData.type.trim() !== '' &&
    formData.status.trim() !== '';
  
  // Кастомные стили для AsyncSelect
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white'
    }),
    option: (provided, state) => ({
      ...provided,
      color: 'black',
      backgroundColor: state.isFocused ? '#eee' : 'white'
    }),
  };
  
  return (
    <>
      <button 
        className="create-task-button"
        onClick={() => setOpen(true)}
      >
        + Создать задачу
      </button>
      
      {open && (
        <div className="modal-overlay">
          <div className="task-creation-modal">
            <button className="modal-close" onClick={() => setOpen(false)}>
              &times;
            </button>
            <h2>Создание задачи</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="task-name">Название</label>
                <input
                  id="task-name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              {/* Поле описания с поддержкой Markdown */}
              <div className="form-group">
                <label htmlFor="task-description">Описание (поддержка Markdown)</label>
                <div className="markdown-toolbar">
                  <button 
                    type="button" 
                    onClick={() => setPreviewMarkdown(!previewMarkdown)}
                    className="markdown-toggle-btn"
                  >
                    {previewMarkdown ? "Редактировать Markdown" : "Предпросмотр Markdown"}
                  </button>
                </div>
                <div className="markdown-buttons">
                  <button type="button" onClick={() => insertMarkdown("*italic*")}>Italic</button>
                  <button type="button" onClick={() => insertMarkdown("**bold**")}>Bold</button>
                  <button type="button" onClick={() => insertMarkdown("~~strikethrough~~")}>Strikethrough</button>
                  <button type="button" onClick={() => insertMarkdown("***bold italic***")}>Bold Italic</button>
                  <button type="button" onClick={() => insertMarkdown("> ")}>Quote</button>
                  <button type="button" onClick={() => insertMarkdown(">> ")}>Nested Quote</button>
                  <button type="button" onClick={() => insertMarkdown("    ")}>Code Block</button>
                  <button type="button" onClick={() => insertMarkdown("- ")}>Unordered List</button>
                  <button type="button" onClick={() => insertMarkdown("1. ")}>Ordered List</button>
                  <button type="button" onClick={() => insertMarkdown("[text](url)")}>Link</button>
                  <button type="button" onClick={() => insertMarkdown("![alt text](url)")}>Image</button>
                </div>
                {previewMarkdown ? (
                  <div 
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: marked(formData.description || '') }}
                  />
                ) : (
                  <textarea
                    id="task-description"
                    name="description"
                    placeholder="Введите описание задачи (не обязательно)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ minHeight: '200px' }}
                  />
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="task-type">
                  Тип {taskTypes && taskTypes.length > 0 && <span className="required">*</span>}
                </label>
                <select 
                  id="task-type"
                  name="type" 
                  value={formData.type} 
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={!(taskTypes && taskTypes.length > 0)}
                  required={taskTypes && taskTypes.length > 0}
                >
                  <option value="">
                    {taskTypes && taskTypes.length > 0 ? "Выберите тип" : "Типы отсутствуют"}
                  </option>
                  {taskTypes && taskTypes.length > 0 && taskTypes.map((t) => (
                    <option key={t.uuid} value={t.uuid}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-priority">Приоритет</label>
                <select 
                  id="task-priority"
                  name="priority" 
                  value={formData.priority} 
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                >
                  <option value={-2}>Минимальный</option>
                  <option value={-1}>Низкий</option>
                  <option value={0}>Средний</option>
                  <option value={1}>Высокий</option>
                  <option value={2}>Критичный</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-status">
                  Статус {taskStatuses && taskStatuses.length > 0 && <span className="required">*</span>}
                </label>
                <select 
                  id="task-status"
                  name="status" 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={!(taskStatuses && taskStatuses.length > 0)}
                  required={taskStatuses && taskStatuses.length > 0}
                >
                  <option value="">
                    {taskStatuses && taskStatuses.length > 0 ? "Выберите статус" : "Статусы отсутствуют"}
                  </option>
                  {taskStatuses && taskStatuses.length > 0 && taskStatuses.map((s) => (
                    <option key={s.uuid} value={s.uuid}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="task-date">Дата</label>
                <input 
                  id="task-date"
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="task-executors">
                  Исполнители
                </label>
                <AsyncSelect
                  isMulti
                  cacheOptions
                  defaultOptions
                  loadOptions={promiseOptions}
                  onChange={handleExecutorsSelectChange}
                  value={selectedExecutors}
                  placeholder="Поиск исполнителей..."
                  styles={customStyles}
                  noOptionsMessage={() => 'Ничего не найдено'}
                  loadingMessage={() => 'загрузка...'}
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button 
                type="submit" 
                disabled={loading || !formIsValid}
                style={{
                  backgroundColor: loading || !formIsValid ? "#ccc" : "#8b5cf6",
                  color: loading || !formIsValid ? "#666" : "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loading || !formIsValid ? "not-allowed" : "pointer"
                }}
              >
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTaskButton; 