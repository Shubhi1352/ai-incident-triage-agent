"use client";
// src/components/HeroContent.tsx
import React from 'react';
import styles from './HeroContent.module.css';

const HeroContent: React.FC = () => {
  return (
    <div className={styles.hero}>
      <h1>BETWEEN</h1>
      <h2>ERRORS</h2>
      <a target="_blank" href="https://www.framer.com/@kevin-levron/">Framer Component</a>
    </div>
  );
};

export default HeroContent;