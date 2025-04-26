import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../component/room_style.css';

const ClassRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('월');
  const [lectures, setLectures] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = ['월', '화', '수', '목', '금'];
  const currentRoom = roomId;
  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 8);

  const parseTimeSlot = (timeCode) => {
    const day = timeCode.charAt(0);
    const periodCode = timeCode.substring(1);

    if (isNaN(periodCode)) {
      switch (periodCode) {
        case 'A':
          return { day, start: '09:00', end: '10:15' };
        case 'B':
          return { day, start: '10:30', end: '11:45' };
        case 'C':
          return { day, start: '12:00', end: '13:15' };
        case 'D':
          return { day, start: '13:30', end: '14:45' };
        case 'E':
          return { day, start: '15:00', end: '16:15' };
        case 'F':
          return { day, start: '16:30', end: '17:45' };
        case 'G':
          return { day, start: '18:00', end: '19:15' };
        default:
          return null;
      }
    } else {
      const period = parseInt(periodCode);
      switch (period) {
        case 0:
          return { day, start: '08:00', end: '08:50' };
        case 1:
          return { day, start: '09:00', end: '09:50' };
        case 2:
          return { day, start: '10:00', end: '10:50' };
        case 3:
          return { day, start: '11:00', end: '11:50' };
        case 4:
          return { day, start: '12:00', end: '12:50' };
        case 5:
          return { day, start: '13:00', end: '13:50' };
        case 6:
          return { day, start: '14:00', end: '14:50' };
        case 7:
          return { day, start: '15:00', end: '15:50' };
        case 8:
          return { day, start: '16:00', end: '16:50' };
        case 9:
          return { day, start: '17:00', end: '17:50' };
        case 10:
          return { day, start: '18:00', end: '18:50' };
        default:
          return null;
      }
    }
  };

  const parseTimeCode = (timeCode) => {
    const slots = [];
    const parts = timeCode.split('/');

    let currentDay = '';
    for (const part of parts) {
      if (days.includes(part.charAt(0))) {
        currentDay = part.charAt(0);
        const period = part.substring(1);
        const slot = parseTimeSlot(currentDay + period);
        if (slot) slots.push(slot);
      } else {
        const slot = parseTimeSlot(currentDay + part);
        if (slot) slots.push(slot);
      }
    }

    return slots;
  };

  useEffect(() => {
    const fetchLectureData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/courses?room=${roomId}-0`
        );

        const courseData = response.data;

        const lecturesByDay = {};

        courseData.forEach((course) => {
          const timeSlots = parseTimeCode(course.time);

          timeSlots.forEach((slot) => {
            if (!lecturesByDay[slot.day]) {
              lecturesByDay[slot.day] = [];
            }

            lecturesByDay[slot.day].push({
              start: slot.start,
              end: slot.end,
              title: course.courseName,
            });
          });
        });

        setLectures(lecturesByDay);
        setLoading(false);
      } catch (err) {
        console.error('강의 데이터를 가져오는 중 오류 발생:', err);
        setError('강의 데이터를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    fetchLectureData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const renderTimeTableGrid = () => {
    if (loading) {
      return (
        <div className="loading-message">강의 데이터를 불러오는 중...</div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    return (
      <div className="timetable-grid">
        <div className="time-header">시간</div>
        {days.map((day) => (
          <div
            key={day}
            className={`day-header ${day === selectedDay ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day}
          </div>
        ))}

        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="time-slot">{`${time}:00`}</div>
            {days.map((day) => {
              const lectureList = lectures[day] || [];

              return (
                <div
                  key={`${day}-${time}`}
                  className={`grid-cell ${
                    day === selectedDay ? 'active-column' : ''
                  }`}
                >
                  {lectureList.map((lecture, idx) => {
                    const [startHour, startMin] = lecture.start
                      .split(':')
                      .map(Number);
                    const [endHour, endMin] = lecture.end
                      .split(':')
                      .map(Number);

                    const slotStart = time * 60;
                    const slotEnd = (time + 1) * 60;
                    const lectureStart = startHour * 60 + parseInt(startMin);
                    const lectureEnd = endHour * 60 + parseInt(endMin);

                    const isOverlap = !(
                      lectureEnd <= slotStart || lectureStart >= slotEnd
                    );
                    if (!isOverlap) return null;

                    const top = Math.max(
                      0,
                      ((lectureStart - slotStart) / 60) * 100
                    );
                    const bottom =
                      Math.min(1, (lectureEnd - slotStart) / 60) * 100;
                    const height = bottom - top;

                    return (
                      <div
                        key={idx}
                        className="lecture-color-fill"
                        style={{
                          top: `${top}%`,
                          height: `${height}%`,
                        }}
                        title={`${lecture.title} (${lecture.start}~${lecture.end})`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderLectureList = () => {
    if (loading) {
      return (
        <div className="loading-message">강의 데이터를 불러오는 중...</div>
      );
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    return days.map((day) => {
      let dayLectures = lectures[day] || [];

      dayLectures = [...dayLectures].sort((a, b) => {
        const timeToMinutes = (timeStr) => {
          const [hours, minutes] = timeStr.split(':').map(Number);
          return hours * 60 + minutes;
        };

        return timeToMinutes(a.start) - timeToMinutes(b.start);
      });

      return (
        <div key={day} className="day-lecture-group">
          <h3 className="day-title">{day}</h3>
          {dayLectures.length === 0 ? (
            <p className="no-lectures">이 요일에는 강의가 없습니다.</p>
          ) : (
            <ul className="lecture-list">
              {dayLectures.map((lecture, index) => (
                <li key={index}>
                  {lecture.start} ~ {lecture.end} &nbsp; &nbsp;{lecture.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    });
  };

  return (
    <div className="classroom-schedule-container">
      <div className="classroom-header">
        <h1>{currentRoom} 강의실 시간표</h1>
        <button className="back-button" onClick={() => navigate(-1)}>
          돌아가기
        </button>
      </div>

      <div className="schedule-content">
        <div className="timetable-section">
          <h2>시간표</h2>
          {renderTimeTableGrid()}
        </div>

        <div className="lecture-list-section">
          <h2>강의 목록</h2>
          {renderLectureList()}
        </div>
      </div>
    </div>
  );
};

export default ClassRoom;
