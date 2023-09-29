import React from 'react';

function SquareCircle({ ...props }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="18" height="18" fill="black" />
      <circle cx="8.99998" cy="9" r="6.92308" fill={props.style.color} />
    </svg>
  );
}

export default SquareCircle;
