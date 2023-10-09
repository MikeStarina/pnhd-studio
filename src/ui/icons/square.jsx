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
      <rect width="18" height="18" fill="black" />
    </svg>
  );
}

export default Square;
