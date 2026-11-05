import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CSS/Calendar.css';

const CalendarComponent = ({ onDateClick }) => {
  return (
    <div data-testid="calendar-container">
      <Calendar onClickDay={(value) => onDateClick(value)} />
    </div>
  );
};

export default CalendarComponent;
