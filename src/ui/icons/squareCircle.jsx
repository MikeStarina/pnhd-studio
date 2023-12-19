import React from 'react';

function SquareCircle({ ...props }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="1" width="18" height="18" stroke="black" strokeDasharray="2 2" />
      <circle cx="9.99998" cy="10" r="6.42308" fill={props.style.color} stroke="black" />
    </svg>
  );
}

export default SquareCircle;
