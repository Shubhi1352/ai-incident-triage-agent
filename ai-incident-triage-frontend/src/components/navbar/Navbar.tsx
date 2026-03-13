// src/components/navbar/Navbar.tsx
'use client';

import React from 'react';
import styles from './Navbar.module.css';
import { useColors } from '@/contexts/ColorContext';
import { usePage } from '@/contexts/PageContext';

const Navbar: React.FC = () => {
  const { primaryColor, secondaryColor } = useColors();
  const { navigateTo } = usePage();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={() => navigateTo("home")} style={{ cursor: 'pointer' }}>
        <span className={styles.logoText} style={{
          backgroundImage: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>BETWEEN</span>
      </div>

      <div className={styles.navLinks}>
        <a href="#" className={styles.navLink} onClick={(e) => { 
          e.preventDefault(); 
          navigateTo("create"); 
        }}>Create</a>
        <a href="#" className={styles.navLink} onClick={(e) => { 
          e.preventDefault(); 
          navigateTo("history"); 
        }}>History</a>
      </div>
    </nav>
  );
};

export default Navbar;