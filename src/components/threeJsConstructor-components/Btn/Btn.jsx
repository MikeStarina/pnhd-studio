/* eslint-disable react/react-in-jsx-scope */
import { forwardRef } from 'react';

const Btn = forwardRef(({ text, rotate }, ref) => (
  <button
    type="button"
    onClick={() => {
      ref.current?.setPosition(rotate[0], rotate[1], rotate[2], true);
    }}
  >
    {text}
  </button>
));

export default Btn;
