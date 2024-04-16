import React, { useState, useEffect } from 'react';

function OverlayControl() {
    const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  
    useEffect(() => {
      const toggleOverlay = (event) => {
        if (event.key.toLowerCase() === 'm') {
          setIsOverlayVisible(prev => !prev);
        }
      };
  
      window.addEventListener('keydown', toggleOverlay);
      return () => {
        window.removeEventListener('keydown', toggleOverlay);
      };
    }, []);
  
    if (!isOverlayVisible) {
      return null;
    }
  
    return (
      <div id="overlay" style={{ display: isOverlayVisible ? 'block' : 'none' }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          zIndex: 1000 
        }}>
        <img src="/media/Images/wasd-eye.png" alt="WASD controls" style={{
          position: "absolute",
          left: "-40vw",
          top: "10vh",
          maxHeight: "25vh",
          maxWidth: "25vw",
        }}/>
          <p style={{
            position: "absolute",
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: "10px 10px",
            borderRadius: "10px",
            left: "-42vw",
            textAlign: "center"
          }}>
            Use WASD to move around and the mouse to look around.
            <span style={{display: "block"}}>Press escape to leave the 3D environment.</span>
          </p>
          <p style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: "10px 10px",
            borderRadius: "10px",
            textAlign: "center"
          }}>
            Welcome to my portfolio!
            <span style={{display: "block"}}>Press 'M' to show/hide the overlay.</span>
          </p>
        </div>
      </div>
    );
  }

  export default OverlayControl;
