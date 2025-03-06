import React, { useState, useEffect, useRef } from 'react';
import '../styles/CustomDatePicker.css';

const CustomDatePicker = ({ selected, onChange, disabled, showTimeSelect = true }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(selected || new Date());
  const wrapperRef = useRef(null);

  // Закрытие календаря при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Определяем первый день месяца и количество дней
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDay = firstDayOfMonth.getDay(); // воскресенье = 0
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  // Формируем массив недель для календарной таблицы
  const weeks = [];
  let week = [];
  for (let i = 0; i < startDay; i++) {
    week.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  const handleDateClick = (day) => {
    if (!day) return;
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
      selected ? selected.getHours() : 12,
      selected ? selected.getMinutes() : 0
    );
    onChange(newDate);
    setShowCalendar(false);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Обработка изменения времени в формате HH:MM
  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const newDate = new Date(selected ? selected : currentDate);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    onChange(newDate);
  };

  return (
    <div className="custom-datepicker-wrapper" ref={wrapperRef}>
      <input
        type="text"
        readOnly
        className="custom-datepicker-input"
        value={selected ? selected.toLocaleDateString() : ''}
        onClick={() => {
          if (!disabled) setShowCalendar(true);
        }}
        disabled={disabled}
      />
      {showCalendar && (
        <div className="custom-datepicker-calendar" onClick={(e) => e.stopPropagation()}>
          <div className="calendar-header">
            <button type="button" onClick={prevMonth}>&lt;</button>
            <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button type="button" onClick={nextMonth}>&gt;</button>
          </div>
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Вс</th>
                <th>Пн</th>
                <th>Вт</th>
                <th>Ср</th>
                <th>Чт</th>
                <th>Пт</th>
                <th>Сб</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((weekRow, wi) => (
                <tr key={wi}>
                  {weekRow.map((day, di) => (
                    <td
                      key={di}
                      className={
                        day && selected && day === selected.getDate() &&
                        currentDate.getMonth() === selected.getMonth()
                          ? 'selected'
                          : ''
                      }
                      onClick={() => day && handleDateClick(day)}
                    >
                      {day ? day : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {showTimeSelect && ( // Отображаем выбор времени, если showTimeSelect равно true
            <div className="time-selector">
              <label>Время:</label>
              <input
                type="time"
                onChange={handleTimeChange}
                defaultValue={
                  selected
                    ? `${selected.getHours().toString().padStart(2, '0')}:${selected.getMinutes().toString().padStart(2, '0')}`
                    : '12:00'
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;