import { useState } from 'react';
import './FloatingWindows.css';

const FloatingWindow = ({ title, content, initialX = 100, initialY = 100, onClose }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });

  const handleMouseDown = (e) => {
    const initialX = e.clientX - position.x;
    const initialY = e.clientY - position.y;

    const handleMouseMove = (e) => {
      setPosition({
        x: e.clientX - initialX,
        y: e.clientY - initialY,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="floating-window"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      <div className="floating-window-title" onMouseDown={handleMouseDown}>
        <span>{title}</span>
        <button className="close-btn" onClick={onClose}>
          X
        </button>
      </div>
      <div className="floating-window-content">
        {content}
      </div>
    </div>
  );
};

export default FloatingWindow;