// frontend/src/component/ArduinoSerial.jsx
import React, { useEffect, useState } from 'react';

function ArduinoSerial() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/count');
        const data = await res.json();
        setCount(data.count);
      } catch (err) {
        console.error('시리얼 서버 연결 실패:', err);
      }
    };

    fetchCount(); // 최초 1회
    const interval = setInterval(fetchCount, 1000); // 1초마다 반복 요청
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>현재 인원 수: {count}</h3>
      <p style={{ color: count > 0 ? 'green' : 'gray' }}>
        {count > 0 ? '사용 중' : '비어 있음'}
      </p>
    </div>
  );
}

export default ArduinoSerial;
