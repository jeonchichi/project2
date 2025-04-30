import React, { useState } from 'react';

function ArduinoSerial() {
  const [count, setCount] = useState(0);       // 사람 수 카운트
  const [connected, setConnected] = useState(false); // 연결 여부

  const connectSerial = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setConnected(true);

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable.getReader();

      while (true) {
        const { value, done } = await inputStream.read();
        if (done) break;
        if (value) {
          const trimmed = value.trim();

          if (trimmed === '1') {
            setCount((prev) => prev + 1);
            console.log('➡️ 사람 들어옴: +1 →', count + 1);
          } else if (trimmed === '0') {
            setCount((prev) => Math.max(0, prev - 1));
            console.log('⬅️ 사람 나감: -1 →', Math.max(0, count - 1));
          }
        }
      }
    } catch (err) {
      console.error('❌ 시리얼 연결 실패:', err);
    }
  };

  return (
    <div>
      <button onClick={connectSerial}>아두이노 연결하기</button>
      {connected && (
        <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
          현재 인원 수: {count}
          <br />
          현재 강의실 상태:{' '}
          <span style={{ color: count > 0 ? 'red' : 'green' }}>
            {count > 0 ? '사용 중' : '비어 있음'}
          </span>
        </div>
      )}
    </div>
  );
}

export default ArduinoSerial;
