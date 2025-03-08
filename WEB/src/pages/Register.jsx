import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CustomDatePicker from "../components/CustomDatePicker";
import Notification from "../components/Notification";
import "../styles/Register.css";
import { registerApi } from "../api/auth";
import { uploadUserAvatar } from "../api/profile";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [errorMsg, setErrorMsg] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [userUuid, setUserUuid] = useState(null);
    const { login } = useAuth();
    
    // Функция для проверки возраста
    const isAgeValid = (birthDate) => {
        const today = new Date();
        const minAgeDate = new Date(
            today.getFullYear() - 7,
            today.getMonth(),
            today.getDate()
        );
        return birthDate <= minAgeDate;
    };
    
    // Состояние формы
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        password: '',
        gender: '1', // По умолчанию мужской
        date_of_birthday: new Date(
            new Date().getFullYear() - 18, // По умолчанию 18 лет назад
            new Date().getMonth(),
            new Date().getDate()
        )
    });
    
    // Состояние валидации
    const [validation, setValidation] = useState({
        email: true,
        password: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        },
        age: true
    });
    
    // Проверка надежности пароля при его изменении
    useEffect(() => {
        const password = formData.password;
        setValidation(prev => ({
            ...prev,
            password: {
                length: password.length >= 8,
                uppercase: /[A-ZА-ЯЁ]/.test(password),
                lowercase: /[a-zа-яё]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            }
        }));
    }, [formData.password]);
    
    // Проверка валидности email
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setValidation(prev => ({
            ...prev,
            email: emailRegex.test(formData.email) || formData.email === ''
        }));
    }, [formData.email]);
    
    // Проверка возраста
    useEffect(() => {
        setValidation(prev => ({
            ...prev,
            age: isAgeValid(formData.date_of_birthday)
        }));
    }, [formData.date_of_birthday]);
    
    // Обработчик изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Обработчик изменения даты рождения
    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            date_of_birthday: date
        }));
    };
    
    // Обработчик загрузки аватара
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    // Функция для очистки выбора аватара
    const clearAvatarSelection = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
    };
    
    // Проверка валидности формы
    const isFormValid = () => {
        // Проверяем, что все поля заполнены
        const allFieldsFilled = 
            formData.name.trim() !== '' && 
            formData.surname.trim() !== '' && 
            formData.email.trim() !== '' && 
            formData.password.trim() !== '' &&
            formData.gender !== '';
        
        // Проверяем валидность email
        const emailValid = validation.email;
        
        // Проверяем надежность пароля (минимум 8 символов)
        const passwordValid = validation.password.length;
        
        // Проверяем возраст
        const ageValid = validation.age;
        
        return allFieldsFilled && emailValid && passwordValid && ageValid;
    };
    
    // Обработчик отправки формы первого шага
    const handleFirstStepSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid()) {
            setErrorMsg('Пожалуйста, заполните все поля корректно');
            return;
        }
        
        try {
            // Отправляем запрос на регистрацию
            const response = await registerApi(formData);
            
            // Сохраняем UUID пользователя из ответа API
            if (response && response.user_uuid) {
                setUserUuid(response.user_uuid);
            }
            
            // Выполняем вход после успешной регистрации
            await login(formData.email, formData.password);
            
            // После успешной регистрации переходим ко второму шагу
            setErrorMsg('');
            setStep(2);
        } catch (error) {
            setErrorMsg(error.message || 'Ошибка при регистрации. Попробуйте позже.');
        }
    };
    
    // Обработчик завершения регистрации
    const handleCompleteRegistration = async () => {
        try {
            // Если выбран аватар и есть UUID пользователя, загружаем аватар
            if (avatarFile && userUuid) {
                console.log("userUuid", userUuid);
                console.log("avatarFile", avatarFile);
                await uploadUserAvatar(userUuid, avatarFile);
            } else if (avatarFile) {
                // Если аватар выбран, но UUID не найден
                console.error("UUID пользователя не найден");
                setErrorMsg('Не удалось загрузить аватар: UUID пользователя не найден');
            }
            
            // Перенаправляем на главную страницу
            navigate("/");
        } catch (error) {
            console.error("Ошибка при загрузке аватара:", error);
            setErrorMsg('Ошибка при загрузке аватара. Вы будете перенаправлены на главную страницу.');
            setTimeout(() => {
                navigate("/");
            }, 3000);
        }
    };
    
    // Расчет надежности пароля (0-100%)
    const calculatePasswordStrength = () => {
        const { length, uppercase, lowercase, number, special } = validation.password;
        let strength = 0;
        
        if (length) strength += 20;
        if (uppercase) strength += 20;
        if (lowercase) strength += 20;
        if (number) strength += 20;
        if (special) strength += 20;
        
        return strength;
    };
    
    // Определение цвета индикатора надежности пароля
    const getPasswordStrengthColor = () => {
        const strength = calculatePasswordStrength();
        if (strength < 40) return "#ff4d4d"; // Красный
        if (strength < 60) return "#ffaa00"; // Оранжевый
        if (strength < 80) return "#ffff00"; // Желтый
        return "#00cc00"; // Зеленый
    };
    
    return (
        <div className="register-container">
            <Notification message={errorMsg} type="error" />
            
            {step === 1 ? (
                // Первый шаг регистрации
                <form onSubmit={handleFirstStepSubmit}>
                    <h1>Регистрация</h1>
                    
                    <input
                        type="text"
                        placeholder="Имя"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    
                    <input
                        type="text"
                        placeholder="Фамилия"
                        name="surname"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                    />
                    
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={!validation.email && formData.email ? 'invalid' : ''}
                        required
                    />
                    {!validation.email && formData.email && (
                        <div className="validation-error">Некорректный email</div>
                    )}
                    
                    <input
                        type="password"
                        placeholder="Пароль"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    
                    {formData.password && (
                        <div className="password-strength">
                            <div className="strength-bar">
                                <div 
                                    className="strength-indicator" 
                                    style={{ 
                                        width: `${calculatePasswordStrength()}%`,
                                        backgroundColor: getPasswordStrengthColor()
                                    }}
                                ></div>
                            </div>
                            <div className="strength-requirements">
                                <div className={validation.password.length ? 'valid' : 'invalid'}>
                                    Минимум 8 символов
                                </div>
                                <div className={validation.password.uppercase ? 'valid' : 'invalid'}>
                                    Заглавные буквы
                                </div>
                                <div className={validation.password.lowercase ? 'valid' : 'invalid'}>
                                    Строчные буквы
                                </div>
                                <div className={validation.password.number ? 'valid' : 'invalid'}>
                                    Цифры
                                </div>
                                <div className={validation.password.special ? 'valid' : 'invalid'}>
                                    Специальные символы
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="gender-selector">
                        <label>Пол:</label>
                        <div className="gender-options">
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="1"
                                    checked={formData.gender === "1"}
                                    onChange={handleChange}
                                />
                                Мужской
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="gender"
                                    value="0"
                                    checked={formData.gender === "0"}
                                    onChange={handleChange}
                                />
                                Женский
                            </label>
                        </div>
                    </div>
                    
                    <div className="date-picker-container">
                        <label>Дата рождения:</label>
                        <CustomDatePicker
                            selected={formData.date_of_birthday}
                            onChange={handleDateChange}
                            showTimeSelect={false}
                        />
                        {!validation.age && (
                            <div className="validation-error">Возраст должен быть не менее 7 лет</div>
                        )}
                    </div>
                    
                    <div className="login-link">
                        <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
                    </div>
                    
                    <button type="submit">Продолжить</button>
                </form>
            ) : (
                // Второй шаг регистрации - загрузка аватара
                <div className="avatar-step">
                    <h1>Загрузите аватар</h1>
                    
                    <div className="avatar-preview-container">
                        {avatarPreview ? (
                            <img 
                                src={avatarPreview} 
                                alt="Предпросмотр аватара" 
                                className="avatar-preview" 
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                <span>{formData.name.charAt(0)}{formData.surname.charAt(0)}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="avatar-upload">
                        {avatarPreview ? (
                            <>
                                <button 
                                    type="button"
                                    onClick={() => document.getElementById('avatar-input').click()}
                                    className="upload-button"
                                >
                                    Изменить
                                </button>
                                <button 
                                    type="button"
                                    onClick={clearAvatarSelection} 
                                    className="clear-button"
                                >
                                    Удалить
                                </button>
                            </>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => document.getElementById('avatar-input').click()}
                                className="upload-button"
                            >
                                Выбрать изображение
                            </button>
                        )}
                        <input
                            id="avatar-input"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    
                    <div className="avatar-actions">
                        <button 
                            onClick={handleCompleteRegistration}
                            className="complete-button"
                        >
                            {avatarFile ? 'Завершить с аватаром' : 'Пропустить'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
