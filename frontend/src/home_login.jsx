import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './home_login.css';

const UserInfoCard = ({ user }) => (
  <div className="login-card user-profile-card">
    <div className="user-info-content">
      <div className="user-avatar">
        <span className="avatar-text">{user.name.charAt(0)}</span>
      </div>
      <div className="user-info-item">
        <div className="user-info-details">
          <h3>{user.name}</h3>
          <div className="info-chip">
            <i className="info-icon">🎓</i>
            <p>학번: {user.studentId}</p>
          </div>
          <div className="info-chip">
            <i className="info-icon">🏢</i>
            <p>학과: {user.department}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LoginForm = ({
  studentId,
  password,
  error,
  isLoading,
  setStudentId,
  setPassword,
  handleLogin,
}) => (
  <div className="login-card">
    <div className="login-header">
      <h1 className="login-title">빈 강의실 서비스</h1>
    </div>
    {error && <div className="login-error">{error}</div>}

    <form onSubmit={handleLogin} className="login-form">
      <div className="form-field">
        <label htmlFor="studentId">Student ID</label>
        <div className="input-container">
          <input
            type="text"
            id="studentId"
            autoComplete="current-studentId"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="학번을 입력하세요."
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <div className="input-container">
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요."
            required
          />
        </div>
      </div>

      <button type="submit" className="login-button" disabled={isLoading}>
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
    </form>
  </div>
);

const Login = ({ isLoggedIn, setIsLoggedIn }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState({ name: '', studentId: '', department: '' });

  const fetchUserInfo = async (token) => {
    try {
      const res = await axios.get('http://localhost:8080/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const userInfo = res.data.user;

      setUser({
        name: userInfo.name,
        studentId: userInfo.studentId,
        department: userInfo.department,
      });
      setIsLoggedIn(true);
    } catch (err) {
      console.error('인증 실패:', err);

      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status:', err.response.status);
      }
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchUserInfo(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoggedIn]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        const res = await axios.post('http://localhost:8080/auth/login', {
          studentId,
          password,
        });

        const token = res.data.accessToken;

        localStorage.setItem('token', token);

        await fetchUserInfo(token);
      } catch (err) {
        setError('로그인에 실패했습니다. 학번과 비밀번호를 확인해주세요.');
        console.error('로그인 오류:', err);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [studentId, password, setIsLoggedIn]
  );

  return (
    <div className="login-container">
      <div className="login-notice-wrapper">
        {isLoggedIn ? (
          <UserInfoCard user={user} />
        ) : (
          <LoginForm
            studentId={studentId}
            password={password}
            error={error}
            isLoading={isLoading}
            setStudentId={setStudentId}
            setPassword={setPassword}
            handleLogin={handleLogin}
          />
        )}

        <div className="notice-card">
          <div className="notice-header">
            <h1 className="notice-title">공지사항</h1>
          </div>
          <div className="notice-content">
            <div className="notice-item">
              <h3>25.04.04 시간표 업데이트</h3>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <span className="notice-date">2025.04.04</span>
            </div>
            <div className="notice-item">
              <h3>25.04.04 시간표 업데이트</h3>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <span className="notice-date">2025.04.04</span>
            </div>
            <div className="notice-item">
              <h3>25.04.04 시간표 업데이트</h3>
              <p>11번 건물 강의실 시간표 업데이트 완료</p>
              <span className="notice-date">2025.04.04</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
