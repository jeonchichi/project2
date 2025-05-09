// src/component/ArduinoSerial.jsx
import React, { useState } from 'react';
import './arduino.css';

function ArduinoSerial({ roomId }) {
  const [count, setCount]       = useState(0);
  const [connected, setConnected] = useState(false);
  const [portRef, setPortRef]     = useState(null);
  const [readerRef, setReaderRef] = useState(null);
  const [decoderRef, setDecoderRef] = useState(null);
  const [pipePromise, setPipePromise] = useState(null);

  // ==== 1) 연결 + 읽기 세팅 ====
  const connectSerial = async () => {
    if (connected) {
      console.log(`[${roomId}] 이미 연결된 상태입니다.`);
      return;
    }

    let port;
    // 1-1) 사용자 포트 선택 취소 처리
    try {
      port = await navigator.serial.requestPort();
    } catch (err) {
      if (err.name === 'NotFoundError') {
        console.warn(`[${roomId}] 포트 선택 취소됨`);
        return;
      }
      console.error(`[${roomId}] 포트 요청 실패:`, err);
      return;
    }

    try {
      // 1-2) 이미 열려 있다면 에러 무시
      await port.open({ baudRate: 9600 }).catch(e => {
        if (!e.message.includes('already open')) throw e;
      });

      setPortRef(port);
      setConnected(true);

      // 1-3) 텍스트 디코더 스트림 + 파이프
      const decoder = new TextDecoderStream();
      const pipe = port.readable.pipeTo(decoder.writable);
      setDecoderRef(decoder);
      setPipePromise(pipe);

      const reader = decoder.readable.getReader();
      setReaderRef(reader);

      // 1-4) 읽기 루프: "1"→+1, "0"→-1
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const t = value.trim();
        if (t === '1')      setCount(c => c + 1);
        else if (t === '0') setCount(c => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error(`[${roomId}] 시리얼 연결/읽기 오류:`, err);
      setConnected(false);
    }
  };

  // ==== 2) 안전한 연결 해제 ====
  const disconnectSerial = async () => {
    try {
      // 2-1) reader 취소 + 락 해제
      if (readerRef) {
        await readerRef.cancel();
        readerRef.releaseLock();
        setReaderRef(null);
      }
      // 2-2) decoder 스트림 취소 + writable abort
      if (decoderRef) {
        await decoderRef.readable.cancel().catch(()=>{});
        await decoderRef.writable.abort().catch(()=>{});
        setDecoderRef(null);
      }
      // 2-3) pipe 중단
      if (pipePromise) {
        await pipePromise.catch(()=>{});
        setPipePromise(null);
      }
      // 2-4) 포트 닫기
      if (portRef) {
        await portRef.close().catch(()=>{});
        setPortRef(null);
      }
      console.log(`[${roomId}] 연결 해제 완료`);
    } catch (err) {
      console.error(`[${roomId}] 연결 해제 중 오류:`, err);
    } finally {
      setConnected(false);
      setCount(0);
    }
  };

  return (
    <div className="arduino-serial">
      {!connected ? (
        <button
          className="arduino-button connect"
          onClick={() => connectSerial()}
        >
          아두이노 연결하기
        </button>
      ) : (
        <button
          className="arduino-button disconnect"
          onClick={() => disconnectSerial()}
        >
          연결 해제
        </button>
      )}

      <p className="arduino-status">
        현재 인원 수: {count}
        <br />
        상태:&nbsp;
        <span className={count > 0 ? 'in-use' : 'empty'}>
          {count > 0 ? '사용 중' : '비어 있음'}
        </span>
      </p>
    </div>
  );
}

export default ArduinoSerial;
