import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const PickerContainer = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const Select = styled.select`
  background-color: #2b2b2b;
  border: 1px solid ${props => props.disabled ? '#444' : '#6f42c1'};
  border-radius: 8px;
  padding: 12px 16px;
  color: ${props => props.disabled ? '#aaa' : 'white'};
  font-size: 16px;
  appearance: none; /* Удаляет стандартную стрелку */
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  outline: none;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    border-color: #8a5cf5;
  }
  
  &:focus {
    border-color: #8a63d2;
    box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.2);
  }
  
  /* Стили для кастомной стрелки выпадающего списка */
  background-image: linear-gradient(45deg, transparent 50%, ${props => props.disabled ? '#666' : '#6f42c1'} 50%), 
                    linear-gradient(135deg, ${props => props.disabled ? '#666' : '#6f42c1'} 50%, transparent 50%);
  background-position: 
    calc(100% - 20px) calc(1em + 2px),
    calc(100% - 15px) calc(1em + 2px);
  background-size: 
    5px 5px,
    5px 5px;
  background-repeat: no-repeat;
  opacity: ${props => props.disabled ? '0.8' : '1'};
`;

const DaySelect = styled(Select)`
  flex: 0.8;
  min-width: 70px;
`;

const MonthSelect = styled(Select)`
  flex: 1.2;
  min-width: 100px;
`;

const YearSelect = styled(Select)`
  flex: 1;
  min-width: 90px;
`;

// Месяцы на русском языке (короткие названия)
const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

const BirthdayPicker = ({ value, onChange, disabled = false }) => {
  // Инициализация с текущей датой или переданной датой
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  
  // Обновление компонента при изменении входного значения (value)
  useEffect(() => {
    if (value) {
      const dateObj = new Date(value);
      
      if (!isNaN(dateObj.getTime())) {
        setDay(dateObj.getDate().toString());
        setMonth((dateObj.getMonth()).toString()); // 0-11
        setYear(dateObj.getFullYear().toString());
      }
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);
  
  // Получение количества дней в выбранном месяце и году
  const getDaysInMonth = (month, year) => {
    // month в JS начинается с 0 (январь - 0)
    return new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
  };
  
  // Генерация массива годов (от текущего года - 100 до текущего года)
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 100; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse(); // От самого нового к самому старому
  };
  
  // Обработчики изменения значений
  const handleDayChange = (e) => {
    if (disabled) return;
    
    const newDay = e.target.value;
    setDay(newDay);
    updateDate(newDay, month, year);
  };
  
  const handleMonthChange = (e) => {
    if (disabled) return;
    
    const newMonth = e.target.value;
    setMonth(newMonth);
    
    // Проверяем, нужно ли скорректировать день (например, если было 31 марта, а выбрали февраль)
    let newDay = day;
    const daysInNewMonth = getDaysInMonth(newMonth, year);
    if (parseInt(day) > daysInNewMonth) {
      newDay = daysInNewMonth.toString();
      setDay(newDay);
    }
    
    updateDate(newDay, newMonth, year);
  };
  
  const handleYearChange = (e) => {
    if (disabled) return;
    
    const newYear = e.target.value;
    setYear(newYear);
    
    // Проверяем, нужно ли скорректировать день (для февраля в високосный год)
    let newDay = day;
    const daysInMonth = getDaysInMonth(month, newYear);
    if (parseInt(day) > daysInMonth) {
      newDay = daysInMonth.toString();
      setDay(newDay);
    }
    
    updateDate(newDay, month, newYear);
  };
  
  // Обновление даты и вызов callback-функции
  const updateDate = (day, month, year) => {
    if (day && month && year) {
      // Создаем новую дату в формате ISO 8601
      const date = new Date(parseInt(year), parseInt(month), parseInt(day));
      const isoDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (onChange) {
        onChange(isoDate);
      }
    }
  };
  
  // Генерация дней для выбранного месяца и года
  const renderDays = () => {
    const days = [];
    const daysInMonth = month && year ? getDaysInMonth(month, year) : 31;
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <option key={`day-${i}`} value={i}>
          {i < 10 ? `0${i}` : i}
        </option>
      );
    }
    
    return days;
  };
  
  return (
    <PickerContainer>
      <DaySelect 
        value={day} 
        onChange={handleDayChange} 
        disabled={disabled}
      >
        <option value="" disabled>День</option>
        {renderDays()}
      </DaySelect>
      
      <MonthSelect 
        value={month} 
        onChange={handleMonthChange} 
        disabled={disabled}
      >
        <option value="" disabled>Месяц</option>
        {MONTHS.map((name, index) => (
          <option key={`month-${index}`} value={index}>{name}</option>
        ))}
      </MonthSelect>
      
      <YearSelect 
        value={year} 
        onChange={handleYearChange} 
        disabled={disabled}
      >
        <option value="" disabled>Год</option>
        {getYears().map(year => (
          <option key={`year-${year}`} value={year}>{year}</option>
        ))}
      </YearSelect>
    </PickerContainer>
  );
};

export default BirthdayPicker; 