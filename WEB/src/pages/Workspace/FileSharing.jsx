import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { uploadFile, getFiles, downloadFile, deleteFile } from '../../api/files';
import { useParams } from 'react-router-dom';
import CreateEntityButton from '../../components/CreateEntityButton';
import FileUploadModal from '../../components/FileUploadModal';
import FileList from '../../components/FileList';
import '../../styles/FileSharing.css';
import { AuthContext } from '../../context/AuthContext';

function FileSharing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const { orgId, projectUuid } = useParams();
  const { profile } = useContext(AuthContext);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchFiles() {
      try {
        const fileData = await getFiles({ project_uuid: projectUuid, signal: controller.signal });
        console.log(fileData);
        // Если fileData не является массивом, используем пустой массив.
        setFiles(Array.isArray(fileData) ? fileData : []);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("File fetch aborted");
        } else {
          console.error("Error fetching files:", error);
        }
      }
    }
    fetchFiles();
    return () => controller.abort();
  }, [projectUuid]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileUpload = async (payload) => {
    console.log(orgId, projectUuid);
    console.log("File upload payload:", payload);
    try {
      const response = await uploadFile({
        file: payload.file,
        organization_uuid: orgId,
        project_uuid: projectUuid,
        expire_time: payload.availableUntil,
        max_downloads: payload.maxDownloads,
      });
      console.log("File uploaded successfully:", response);
    window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
      Notification.error("Произошла ошибка при загрузке файла.");
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile({
        file_id: file.uuid,
        fileName: `${file.name}${file.extension ? `.${file.extension}` : ""}`
      });
      setTimeout(() => {
        window.location.reload();
    }, 1000);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDelete = async (file) => {
    try {
      await deleteFile({ file_id: file.uuid });
      setFiles(prevFiles => prevFiles.filter(f => f.uuid !== file.uuid));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="file-sharing-container">
      <div
        className="file-sharing-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
      >
        <h2>Файлообменник</h2>
        <CreateEntityButton 
          type="upload file" 
          onClick={handleOpenModal}
        />
      </div>
      {files && files.length > 0 && (
        <FileList 
          files={files} 
          onDownload={handleDownload} 
          onDelete={handleDelete} 
          profileUuid={profile?.uuid} 
        />
      )}
      <FileUploadModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFileUpload} />
    </div>
  );
}

export default FileSharing;