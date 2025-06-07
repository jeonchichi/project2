import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Loadmap.css';

const Loadmap = () => {
  const navigate = useNavigate();

  const handleBuildingClick = (buildingId) => {
    navigate(`/building/${buildingId}`);
  };

  return (
    <div className="loadmap">
      <img src="/campusMap.jpg" alt="Campus Map" className="loadmap__image" />
      <button
        className="loadmap__building"
        style={{ top: '10.5%', left: '44.5%' }}
        onClick={() => handleBuildingClick(9)}
      >
        09
      </button>
      /
    </div>
  );
};

export default Loadmap;
