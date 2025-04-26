import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './head.css';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [setIsLoggedIn]);

  return (
    <header className="header">
      <div className="header__container">
        
        <nav className="header__nav">
          {isLoggedIn ? (
            <>
              <Link to="/loadmap" className="header__link">
                캠퍼스 맵
              </Link>
              <Link to="/component/mypage" className="header__link">
                회원정보
              </Link>
              <button onClick={handleLogout} className="header__button">
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/component/signup" className="header__button">
              회원가입
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

// testsdfsd

export default Header;
