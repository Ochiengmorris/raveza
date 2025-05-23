"use client";

import React from "react";
import Confetti from "react-confetti";

const ConfettiComp = () => {
  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={500}
      recycle={false}
      gravity={0.1}
    />
  );
};

export default ConfettiComp;
