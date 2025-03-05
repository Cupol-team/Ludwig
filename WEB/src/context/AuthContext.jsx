import React, { createContext, useState, useEffect } from 'react';
import { loginApi, getProfile } from '../api/auth';
import Notification from '../components/Notification';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
    const [profile, setProfile] = useState(null);

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setProfile(null);
    };

    useEffect(() => {
        if (localStorage.getItem('token') && !profile) {
            getProfile()
                .then(profileData => {
                    if (!profileData.uuid) {
                        console.error("Получен профиль без uuid:", profileData);
                        logout();
                        Notification.error("Ошибка: поле uuid не найдено. Пожалуйста, авторизуйтесь снова.");
                    } else {
                        setProfile(profileData);
                    }
                })
                .catch(err => {
                    console.error("Ошибка при получении профиля при загрузке:", err);
                    logout();
                    Notification.error("Ошибка при получении профиля. Пожалуйста, авторизуйтесь снова.");
                });
        }
    }, []);

    const login = async (email, password) => {
        const data = await loginApi(email, password);
        localStorage.setItem('token', data.access_token);
        setIsAuthenticated(true);

        const profileData = await getProfile();
        if (!profileData.uuid) {
            console.error("Получен профиль без uuid:", profileData);
            logout();
            Notification.error("Ошибка: поле uuid не найдено. Пожалуйста, авторизуйтесь снова.");
            return null;
        }

        setProfile(profileData);

        return data;
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, profile }}>
            {children}
        </AuthContext.Provider>
    );
}; 