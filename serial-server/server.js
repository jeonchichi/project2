const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');

const app = express();
const PORT = 3001;

app.use(cors());

let currentCount = 0;
let lastCount = null;

// ✅ 아두이노가 연결된 포트 번호를 정확히 설정
const port = new SerialPort({
  path: 'COM5', // 사용 중인 포트로 변경 (예: COM3, COM5 등)
  baudRate: 115200,
});

// ✅ 시리얼 데이터 수신 처리
port.on('data', (data) => {
  const line = data.toString().trim();

  // ✅ 숫자로만 이루어진 줄만 처리
  if (/^\d+$/.test(line)) {
    const num = parseInt(line);
    if (num !== lastCount) {
      currentCount = num;
      lastCount = num;
      console.log(`[시리얼] 현재 인원 수: ${currentCount}`);
    }
  }
});

// ✅ React에서 현재 인원 수 요청 처리
app.get('/api/count', (req, res) => {
  res.json({ count: currentCount });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 시리얼 서버 실행 중: http://localhost:${PORT}`);
});
