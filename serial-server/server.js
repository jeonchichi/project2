const express = require('express');
const { SerialPort } = require('serialport'); // 최신 방식
const { ReadlineParser } = require('@serialport/parser-readline'); // 최신 방식
const cors = require('cors');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// ✅ 반드시 객체 형식으로 path & baudRate 지정
const port = new SerialPort({
  path: 'COM3',      // 아두이노가 연결된 포트 이름
  baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let latestValue = 0;

parser.on('data', (data) => {
  const clean = data.trim();
  if (clean === '0' || clean === '1') {
    latestValue = parseInt(clean);
    console.log('💡 아두이노 값:', latestValue);
  }
});

app.get('/api/latest-value', (req, res) => {
  res.json({ value: latestValue });
});

app.listen(PORT, () => {
  console.log(`✅ 시리얼 서버 실행 중 → http://localhost:${PORT}`);
});
