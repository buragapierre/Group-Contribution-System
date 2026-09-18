import { useMemo, useState } from 'react';
import './DeadlineCalendar.css';

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDeadline(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export default function DeadlineCalendar({ tasks = [] }) {
  const firstTaskDate = tasks[0]?.deadline ? parseDeadline(tasks[0].deadline) : new Date();
  const [visibleDate, setVisibleDate] = useState(
    new Date(firstTaskDate.getFullYear(), firstTaskDate.getMonth(), 1),
  );
  const [hoveredDate, setHoveredDate] = useState(null);

  const tasksByDate = useMemo(() => tasks.reduce((dates, task) => {
    if (!task.deadline) return dates;
    (dates[task.deadline] ||= []).push(task);
    return dates;
  }, {}), [tasks]);

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(new Date());
  const calendarDays = [
    ...Array.from({ length: firstDay }, (_, index) => ({ empty: true, key: `empty-${index}` })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1);
      const key = dateKey(date);
      return { day: index + 1, key, tasks: tasksByDate[key] || [] };
    }),
  ];

  const changeMonth = (direction) => {
    setVisibleDate(current => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  return (
    <section className="deadline-calendar st-card" aria-label="Task deadline calendar">
      <div className="card-head">
        <div>
          <h2>{visibleDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <p>Task deadlines</p>
        </div>
        <div className="calendar-controls">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">›</button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdays.map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="calendar-days">
        {calendarDays.map(day => {
          if (day.empty) return <span className="calendar-day calendar-day-empty" key={day.key} />;
          const hasDeadline = day.tasks.length > 0;
          const isHovered = hoveredDate === day.key;
          return (
            <div
              key={day.key}
              className={`calendar-day${day.key === todayKey ? ' calendar-day-today' : ''}${hasDeadline ? ' calendar-day-deadline' : ''}`}
              onMouseEnter={() => hasDeadline && setHoveredDate(day.key)}
              onMouseLeave={() => setHoveredDate(null)}
              onFocus={() => hasDeadline && setHoveredDate(day.key)}
              onBlur={() => setHoveredDate(null)}
              tabIndex={hasDeadline ? 0 : undefined}
              aria-label={hasDeadline ? `${day.day}: ${day.tasks.map(task => task.title).join(', ')}` : String(day.day)}
            >
              <span>{day.day}</span>
              {hasDeadline && <i aria-hidden="true">{day.tasks.length > 1 ? day.tasks.length : ''}</i>}
              {isHovered && (
                <div className="calendar-deadline-popover" role="tooltip">
                  <strong>{day.tasks.length === 1 ? 'Task deadline' : `${day.tasks.length} task deadlines`}</strong>
                  {day.tasks.map(task => (
                    <div className="calendar-popover-task" key={task.id}>
                      <b>{task.title}</b>
                      <span>{task.priority} priority · {task.progress}% complete</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="calendar-legend"><span /> Deadline</div>
    </section>
  );
}
