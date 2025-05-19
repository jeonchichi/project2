const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');

const app = express();
app.use(cors());

let currentCount = 0;

// ✅ 아두이노 연결 포트 확인 후 수정 (ex: COM4, /dev/ttyUSB0)
const port = new SerialPort({
  path: 'COM4',
  baudRate: 9600,
});

// 아두이노로부터 데이터 수신
port.on('data', (data) => {
  const input = data.toString().trim();
  const num = parseInt(input);
  if (!isNaN(num)) {
    currentCount = num;
    console.log(`[시리얼] 현재 인원 수: ${currentCount}`);
  }
});

// React에서 count 요청
app.get('/api/count', (req, res) => {
  res.json({ count: currentCount });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ 시리얼 서버 실행 중: http://localhost:${PORT}`);
});
