import React, { useState } from "react";
import { useAuth } from '../hooks/useAuth';
import Notification from "../components/Notification";
import "../styles/Login.css";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            await login(formData.email, formData.password);
            navigate("/");
        } catch (error) {
            setErrorMsg(error.message || 'Произошла ошибка при входе, попробуйте позже.');
        }
    };

    return (
        <div className="login-container">
            <Notification message={errorMsg} type="error" />
            <form onSubmit={handleSubmit}>
                <h1>Войти</h1>
                <input
                    type="email"
                    placeholder="Введите email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    placeholder="Введите пароль"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <div className="register-link">
                    <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
                </div>
                
                <button type="submit">Войти</button>

            </form>
        </div>
    );
};

export default Login;
