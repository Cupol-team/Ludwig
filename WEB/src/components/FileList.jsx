import React from 'react';
import PropTypes from 'prop-types';
import FileItem from './FileItem';

function FileList({ files, onDownload, onDelete, profileUuid }) {
  return (
    <ul className="file-list">
      {files.map(file => (
        <FileItem 
          key={file.id} 
          file={file} 
          onDownload={onDownload} 
          onDelete={onDelete}
          profileUuid={profileUuid}
        />
      ))}
    </ul>
  );
}

FileList.propTypes = {
  files: PropTypes.array.isRequired,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
  profileUuid: PropTypes.string,
};

export default FileList;