import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import '../styles/TaskDetailsModal.css';
import { getTaskDetail, editTask } from '../api/tasks';
import axios from 'axios';
import { ProjectContext } from '../context/ProjectContext';
import PriorityIcon from './PriorityIcon';
import { marked } from 'marked';

const TaskDetailsModal = ({ taskUuid, onClose }) => {
  const { orgId, projectUuid } = useParams();
  const { taskTypes, taskStatuses, members } = useContext(ProjectContext);
  const [taskDetail, setTaskDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [previewMarkdown, setPreviewMarkdown] = useState(false);

  // Функция для фильтрации участников (для AsyncSelect)
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

  // Асинхронное получение опций для поиска участников
  const promiseOptions = (inputValue) =>
    new Promise(resolve => {
      setTimeout(() => {
        resolve(filterMembers(inputValue));
      }, 500);
    });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getTaskDetail(orgId, projectUuid, taskUuid, controller.signal)
      .then((response) => {
        if (response.data && response.data.response) {
          let detail = response.data.response;
          const foundType = taskTypes.find((t) => t.uuid === detail.type);
          const foundStatus = taskStatuses.find((s) => s.uuid === detail.status);
          setTaskDetail({
            ...detail,
            typeName: foundType ? foundType.name : detail.type,
            statusName: foundStatus ? foundStatus.name : detail.status,
          });
        }
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
    return () => controller.abort();
  }, [orgId, projectUuid, taskUuid, taskTypes, taskStatuses]);

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      let payload = {};
      if (editFormData.name !== taskDetail.name) {
         payload.name = editFormData.name;
      }
      if (editFormData.description !== taskDetail.description) {
         payload.description = editFormData.description;
      }
      if (editFormData.type !== taskDetail.type) {
         payload.type = editFormData.type;
      }
      if (Number(editFormData.priority) !== Number(taskDetail.priority)) {
         payload.priority = editFormData.priority;
      }
      if (editFormData.status !== taskDetail.status) {
         payload.status = editFormData.status;
      }
      const originalDate = taskDetail.date ? taskDetail.date.slice(0, 10) : '';
      if (editFormData.date !== originalDate) {
         payload.date = editFormData.date;
      }
      // Сравниваем массивы executors
      if (JSON.stringify(editFormData.executors) !== JSON.stringify(taskDetail.executors)) {
         payload.executors = editFormData.executors;
      }
      const updatedData = await editTask(orgId, projectUuid, taskUuid, payload);
      const foundType = taskTypes.find((t) => t.uuid === updatedData.response.type);
      const foundStatus = taskStatuses.find((s) => s.uuid === updatedData.response.status);
      setTaskDetail({
        ...updatedData.response,
        typeName: foundType ? foundType.name : updatedData.response.type,
        statusName: foundStatus ? foundStatus.name : updatedData.response.status,
      });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Функция для преобразования URL в кликабельные ссылки
  const linkify = (text) => {
    if (!text) return text;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    );
  };

  // Функция для вставки markdown-сниппета:
  const insertMarkdown = (snippet) => {
    setEditFormData((prev) => ({
      ...prev,
      description: (prev.description || '') + snippet,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {taskDetail && (
          <div>
            <div className="modal-header">
              {editMode ? (
                <h2>Edit Task</h2>
              ) : (
                <h2>{taskDetail.name}</h2>
              )}
              <div className="modal-header-buttons">
                {!editMode && (
                  <button onClick={() => { setEditMode(true); setEditFormData({ ...taskDetail }); }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
            {editMode ? (
              <form className="edit-task-form" onSubmit={handleSaveChanges}>
                <div className="section">
                  <h3>Name</h3>
                  <input
                    type="text"
                    value={editFormData?.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="section">
                  <h3>Description</h3>
                  <div className="markdown-toolbar">
                    <button 
                      type="button" 
                      onClick={() => setPreviewMarkdown(!previewMarkdown)}
                      className="markdown-toggle-btn"
                    >
                      {previewMarkdown ? "Edit Markdown" : "Preview Markdown"}
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
                      dangerouslySetInnerHTML={{ __html: marked(editFormData?.description || '') }}
                    />
                  ) : (
                    <textarea
                      style={{ minHeight: '200px' }}
                      value={editFormData?.description || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, description: e.target.value })
                      }
                    />
                  )}
                </div>
                <div className="section">
                  <h3>Date</h3>
                  <input
                    type="date"
                    value={editFormData?.date ? editFormData.date.slice(0, 10) : ''}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="section">
                  <h3>Status</h3>
                  <select
                    value={editFormData?.status || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    required
                  >
                    {taskStatuses.map((s) => (
                      <option key={s.uuid} value={s.uuid}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="section">
                  <h3>Type</h3>
                  <select
                    value={editFormData?.type || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                    required
                  >
                    {taskTypes.map((t) => (
                      <option key={t.uuid} value={t.uuid}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="section">
                  <h3>Priority</h3>
                  <select
                    value={editFormData?.priority || 0}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: Number(e.target.value) })}
                    required
                  >
                    <option value={-2}>Minimal</option>
                    <option value={-1}>Low</option>
                    <option value={0}>Medium</option>
                    <option value={1}>High</option>
                    <option value={2}>Critical</option>
                  </select>
                </div>
                <div className="section">
                  <h3>Executors</h3>
                  <AsyncSelect
                    isMulti
                    cacheOptions
                    defaultOptions
                    loadOptions={promiseOptions}
                    onChange={(selectedOptions) => {
                      setEditFormData({
                        ...editFormData,
                        executors: selectedOptions ? selectedOptions.map(option => option.value) : []
                      });
                    }}
                    value={
                      editFormData?.executors
                        ? members
                            .filter(member => editFormData.executors.includes(member.uuid))
                            .map(member => ({
                              value: member.uuid,
                              label: member.surname 
                                ? `${member.name} ${member.surname}${member.email ? ` (${member.email})` : ''}`
                                : `${member.name}${member.email ? ` (${member.email})` : ''}`
                            }))
                        : []
                    }
                    placeholder="Поиск исполнителей..."
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: 'white'
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        color: 'black',
                        backgroundColor: state.isFocused ? '#eee' : 'white'
                      }),
                    }}
                    noOptionsMessage={() => 'Ничего не найдено'}
                    loadingMessage={() => 'загрузка...'}
                  />
                </div>
                <div className="section form-buttons">
                  <button type="button" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={updating}>
                    {updating ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="modal-body">
                <div className="modal-left">
                  <div className="section">
                    <h3>Description</h3>
                    <div 
                      className="task-description" 
                      dangerouslySetInnerHTML={{ __html: marked(taskDetail.description || '') }}
                    />
                  </div>
                  <div className="section">
                    <h3>Date</h3>
                    <p>{new Date(taskDetail.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="modal-right">
                  <div className="section">
                    <h3>Status</h3>
                    <p>{taskDetail.statusName}</p>
                  </div>
                  <div className="section">
                    <h3>Type</h3>
                    <p>{taskDetail.typeName}</p>
                  </div>
                  <div className="section">
                    <h3>Priority</h3>
                    <p>
                      <PriorityIcon priority={taskDetail.priority} />
                    </p>
                  </div>
                  <div className="section">
                    <h3>Executors</h3>
                    <div className="executors">
                      {taskDetail.executors && taskDetail.executors.length > 0 ? (
                        taskDetail.executors.slice(0, 2).map((exec, index) => (
                          <img
                            key={index}
                            src="/favicon.png"
                            alt="executor avatar"
                            className="executor-avatar"
                          />
                        ))
                      ) : (
                        <span>None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsModal; 