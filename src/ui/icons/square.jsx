import React from 'react';

function Square({ ...props }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="0.5"
        y="0.5"
        width="17"
        height="17"
        stroke="black"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

export default Square;
