import React from 'react';
import '../styles/Loader.css';

const Loader = ({ size = 'normal' }) => {
    const sizeClass = size === 'small' ? 'loader-small' : '';
    
    return (
        <div className={`loader-container ${sizeClass}`}>
            <div className={`loader ${sizeClass}`}></div>
        </div>
    );
};

export default Loader;