import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './mypage.css';

const API_URL = 'http://localhost:8080';

const Mypage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    department: '',
    studentId: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldpassword: '',
    newpassword: '',
    confirmPassword: '',
  });
  const [deleteData, setDeleteData] = useState({
    password: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [messageType, setMessageType] = useState('info');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMessage('로그인이 필요합니다.');
          setMessageType('error');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.user) {
          setUserInfo(response.data.user);
        } else if (response.data) {
          setUserInfo(response.data);
        }
      } catch (error) {
        setMessage('사용자 정보를 불러오는데 실패했습니다.');
        setMessageType('error');
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newpassword !== passwordData.confirmPassword) {
      const message = '새 비밀번호가 일치하지 않습니다.';
      setMessage(message);
      setMessageType('error');
      window.alert(message);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // eslint-disable-next-line no-unused-vars
      const response = await axios.patch(
        `${API_URL}/auth/password`,
        {
          oldpassword: passwordData.oldpassword,
          newpassword: passwordData.newpassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const successMessage = '비밀번호 변경 성공';
      setMessage(successMessage);
      setMessageType('success');
      window.alert(successMessage);
      setShowPasswordModal(false);
      setPasswordData({
        oldpassword: '',
        newpassword: '',
        confirmPassword: '',
      });

      localStorage.removeItem('token');

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      let errorMessage = '서버와의 통신 중 오류가 발생했습니다.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = '사용자를 찾을 수 없습니다.';
        } else if (error.response.status === 401) {
          errorMessage = '기존 비밀번호가 일치하지 않습니다.';
        } else if (error.response.status === 400) {
          errorMessage = '비밀번호는 특수문자를 포함해야 합니다.';
        } else {
          errorMessage =
            error.response.data.message || '비밀번호 변경에 실패했습니다.';
        }
      }
      setMessage(errorMessage);
      setMessageType('error');
      window.alert(errorMessage);
      console.error('Error changing password:', error);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/auth/delete`, {
        data: { password: deleteData.password },
        headers: { Authorization: `Bearer ${token}` },
      });

      const successMessage = '회원 탈퇴가 완료되었습니다.';
      setMessage(successMessage);
      setMessageType('success');
      window.alert(successMessage);
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      let errorMessage = '회원 탈퇴에 실패했습니다.';
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
      setMessageType('error');
      window.alert(errorMessage);
      console.error('Error deleting account:', error);
    }
  };
  const getInitial = () => {
    return userInfo.name ? userInfo.name.charAt(0) : '?';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>회원정보</h1>
      </div>

      {message && (
        <div className={`message message-${messageType}`}>{message}</div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>정보를 불러오는 중...</p>
        </div>
      ) : (
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">
              <span className="avatar-text">{getInitial()}</span>
            </div>
          </div>

          <div className="profile-info">
            <div className="info-item">
              <div className="info-icon">👤</div>
              <div className="info-content">
                <label>이름</label>
                <p>{userInfo.name || '정보 없음'}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">🏢</div>
              <div className="info-content">
                <label>학과</label>
                <p>{userInfo.department || '정보 없음'}</p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">🎓</div>
              <div className="info-content">
                <label>학번</label>
                <p>{userInfo.studentId || '정보 없음'}</p>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="btn change-password"
              onClick={() => setShowPasswordModal(true)}
            >
              비밀번호 변경
            </button>
            <button
              className="btn delete-account"
              onClick={() => setShowDeleteModal(true)}
            >
              <span className="btn-icon">⚠️</span>
              회원 탈퇴
            </button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>비밀번호 변경</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    oldpassword: '',
                    newpassword: '',
                    confirmPassword: '',
                  });
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={userInfo.studentId || ''}
                style={{ display: 'none' }}
                readOnly
              />
              <div className="form-group">
                <label>현재 비밀번호</label>
                <div className="input-container">
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={passwordData.oldpassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldpassword: e.target.value,
                      })
                    }
                    placeholder="현재 비밀번호를 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>새 비밀번호</label>
                <div className="input-container">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.newpassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newpassword: e.target.value,
                      })
                    }
                    placeholder="새 비밀번호를 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>새 비밀번호 확인</label>
                <div className="input-container">
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn save">
                  저장
                </button>
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      oldpassword: '',
                      newpassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>회원 탈퇴</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteData({ password: '' });
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="warning-container">
              <svg
                className="warning-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9V14M12 17.5V17.51M4.98207 19H19.0179C20.5615 19 21.5233 17.3256 20.7455 16L13.7276 4C12.9498 2.67444 11.0502 2.67444 10.2724 4L3.25452 16C2.47675 17.3256 3.43849 19 4.98207 19Z"
                  stroke="#E74C3C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="warning">
                정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <form onSubmit={handleDeleteAccount}>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={userInfo.studentId || ''}
                style={{ display: 'none' }}
                readOnly
              />
              <div className="form-group">
                <label>비밀번호 확인</label>
                <div className="input-container">
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={deleteData.password}
                    onChange={(e) =>
                      setDeleteData({ ...deleteData, password: e.target.value })
                    }
                    placeholder="비밀번호를 입력하세요"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn delete">
                  탈퇴하기
                </button>
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteData({ password: '' });
                  }}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mypage;
