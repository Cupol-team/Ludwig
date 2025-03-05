import React, { useState } from 'react';


const HoverButton = ({ baseStyle, onClick, children }) => {

  const [hover, setHover] = useState(false);

  const style = {

    ...baseStyle,

    background: hover ? 'rgba(139, 92, 246, 0.2)' : baseStyle.background,

  };

  return (

    <button

      style={style}

      onClick={onClick}

      onMouseEnter={() => setHover(true)}

      onMouseLeave={() => setHover(false)}

    >

      {children}

    </button>

  );

};


export const leaveButtonStyle = {
  background: '#ff4d4f',
  color: '#fff',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  minWidth: '120px',
};

export default HoverButton;