import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="profile-settings">
        <Link to="/profile">
          <img
            src="/favicon.png"
            alt="Профиль"
            className="profile-avatar"
          />
        </Link>
        <button className="settings-button">
          <svg
            fill="currentColor"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M19.14 12.94c.04-.25.06-.52.06-.79s-.02-.54-.06-.79l2.03-1.58a.5.5 0 0 0 .11-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96a7.007 7.007 0 0 0-1.36-.79l-.36-2.65A.5.5 0 0 0 14.5 3h-5a.5.5 0 0 0-.5.42l-.36 2.65c-.48.18-.93.42-1.36.79l-2.39-.96a.5.5 0 0 0-.61.22L2.72 8.92a.5.5 0 0 0 .11.64l2.03 1.58c-.04.25-.06.52-.06.79s.02.54.06.79L2.83 14.91a.5.5 0 0 0-.11.64l1.92 3.32c.14.25.44.34.69.22l2.39-.96c.43.37.88.71 1.36.79l.36 2.65a.5.5 0 0 0 .5.42h5a.5.5 0 0 0 .5-.42l.36-2.65c.48-.18.93-.42 1.36-.79l2.39.96a.5.5 0 0 0 .61-.22l1.92-3.32a.5.5 0 0 0-.11-.64l-2.03-1.58zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header; 