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
      <button
        className="loadmap__building"
        style={{ top: '65.5%', left: '41.5%' }}
        onClick={() => handleBuildingClick(56)}
      >
        56
      </button>
      <button
        className="loadmap__building"
        style={{ top: '15.5%', left: '52.5%' }}
        onClick={() => handleBuildingClick(6)}
      >
        06
      </button>
      <button
        className="loadmap__building"
        style={{ top: '37.5%', left: '63.5%' }}
        onClick={() => handleBuildingClick(4)}
      >
        04
      </button>
      <button
        className="loadmap__building"
        style={{ top: '49.5%', left: '59.5%' }}
        onClick={() => handleBuildingClick(5)}
      >
        05
      </button>
      <button
        className="loadmap__building"
        style={{ top: '37.5%', left: '55%' }}
        onClick={() => handleBuildingClick(11)}
      >
        11
      </button>
      <button
        className="loadmap__building"
        style={{ top: '26.5%', left: '59.5%' }}
        onClick={() => handleBuildingClick(2)}
      >
        02
      </button>
      <button
        className="loadmap__building"
        style={{ top: '35.5%', left: '34.5%' }}
        onClick={() => handleBuildingClick(3)}
      >
        03
      </button>
      <button
        className="loadmap__building"
        style={{ top: '43.7%', left: '56.2%' }}
        onClick={() => handleBuildingClick(26)}
      >
        26
      </button>
    </div>
  );
};

export default Loadmap;
