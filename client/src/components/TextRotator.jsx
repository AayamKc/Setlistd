import React, { useState, useEffect } from 'react';

const TextRotator = () => {
  const words = ['Discover', 'Share', 'Enjoy'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('fade-in');

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationClass('fade-out');
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setAnimationClass('fade-in');
      }, 500); // Half of the animation duration
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`animated-text ${animationClass}`}>
      {words[currentWordIndex]}
    </span>
  );
};

export default TextRotator;