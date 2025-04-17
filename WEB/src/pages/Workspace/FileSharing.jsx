import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { uploadFile, getFiles, downloadFile, deleteFile } from '../../api/files';
import { useParams } from 'react-router-dom';
import CreateEntityButton from '../../components/CreateEntityButton';
import FileUploadModal from '../../components/FileUploadModal';
import FileList from '../../components/FileList';
import '../../styles/FileSharing.css';
import { AuthContext } from '../../context/AuthContext';

// Компонент для отображения ошибок
const ErrorMessage = ({ message }) => (
  <div className="error-message" style={{ 
    textAlign: 'center', 
    padding: '20px', 
    color: '#ff6b6b', 
    background: 'rgba(255, 107, 107, 0.1)', 
    borderRadius: '8px',
    border: '1px solid rgba(255, 107, 107, 0.3)'
  }}>
    <p>{message}</p>
  </div>
);

// Компонент для индикатора загрузки
const LoadingSpinner = () => (
  <div className="loading-container" style={{ textAlign: 'center', padding: '40px 0' }}>
    <div className="spinner" style={{ 
      width: '40px', 
      height: '40px', 
      margin: '0 auto', 
      border: '4px solid rgba(111, 66, 193, 0.2)', 
      borderRadius: '50%', 
      borderTop: '4px solid #6f42c1',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
    <p style={{ marginTop: '16px', color: '#bbb' }}>Загрузка файлов...</p>
  </div>
);

function FileSharing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const { orgId, projectUuid } = useParams();
  const { profile } = useContext(AuthContext);

  const fetchFiles = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const fileData = await getFiles({ project_uuid: projectUuid });
      console.log('Получены файлы:', fileData);
      
      // Если fileData не является массивом, используем пустой массив
      if (Array.isArray(fileData)) {
        setFiles(fileData);
      } else {
        console.warn('API вернул не массив:', fileData);
        setFiles([]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке файлов:", error);
      setErrorMessage('Не удалось загрузить файлы. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Создаем контроллер для отмены запроса при размонтировании компонента
    const controller = new AbortController();
    
    // Вызываем функцию загрузки файлов
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        
        const fileData = await getFiles({ 
          project_uuid: projectUuid, 
          signal: controller.signal 
        });
        
        console.log('Получены файлы:', fileData);
        
        if (Array.isArray(fileData)) {
          setFiles(fileData);
        } else {
          console.warn('API вернул не массив:', fileData);
          setFiles([]);
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Запрос файлов отменен");
        } else {
          console.error("Ошибка при загрузке файлов:", error);
          setErrorMessage('Не удалось загрузить файлы. Пожалуйста, попробуйте позже.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Вызываем функцию загрузки
    loadFiles();
    
    // Функция очистки при размонтировании
    return () => {
      controller.abort();
    };
  }, [projectUuid]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileUpload = async (payload) => {
    try {
      setIsLoading(true);
      console.log("Параметры загрузки файла:", {
        file: payload.file.name,
        organization_uuid: orgId,
        project_uuid: projectUuid,
        expire_time: payload.availableUntil,
        max_downloads: payload.maxDownloads,
      });
      
      const response = await uploadFile({
        file: payload.file,
        organization_uuid: orgId,
        project_uuid: projectUuid,
        expire_time: payload.availableUntil,
        max_downloads: payload.maxDownloads,
      });
      
      console.log("Файл успешно загружен:", response);
      
      // Обновляем список файлов после успешной загрузки
      await fetchFiles();
    } catch (error) {
      console.error("Ошибка при загрузке файла:", error);
      setErrorMessage("Произошла ошибка при загрузке файла.");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false); // Закрываем модальное окно после попытки загрузки
    }
  };

  const handleDownload = async (file) => {
    try {
      setIsLoading(true);
      await downloadFile({
        file_id: file.uuid,
        fileName: `${file.name}${file.extension ? `${file.extension}` : ""}`
      });
      
      console.log("Файл успешно скачан:", file.name);
      
      // Обновляем список файлов, чтобы показать обновленное количество скачиваний
      setTimeout(() => {
        fetchFiles();
      }, 1000);
    } catch (error) {
      console.error("Ошибка при скачивании файла:", error);
      setErrorMessage("Произошла ошибка при скачивании файла.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (file) => {
    try {
      setIsLoading(true);
      await deleteFile({ file_id: file.uuid });
      
      console.log("Файл успешно удален:", file.name);
      
      // Обновляем список файлов после удаления
      setFiles(prevFiles => prevFiles.filter(f => f.uuid !== file.uuid));
    } catch (error) {
      console.error("Ошибка при удалении файла:", error);
      setErrorMessage("Произошла ошибка при удалении файла.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="file-sharing-container">
      <div className="file-sharing-header">
        <h2>Файлообменник</h2>
        <CreateEntityButton 
          type="upload file" 
          onClick={handleOpenModal}
        />
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} />
      ) : files && files.length > 0 ? (
        <FileList 
          files={files} 
          onDownload={handleDownload} 
          onDelete={handleDelete} 
          profileUuid={profile?.uuid} 
        />
      ) : (
        <div className="empty-file-list">
          <p>В этом проекте пока нет загруженных файлов.</p>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Нажмите кнопку "Загрузить файл", чтобы добавить файл.</p>
        </div>
      )}
      
      <FileUploadModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFileUpload} />
    </div>
  );
}

export default FileSharing;