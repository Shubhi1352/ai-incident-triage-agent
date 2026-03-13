// src/components/CreateIncidentForm.tsx
import React from 'react';
import styles from './CreateIncidentForm.module.css';
import { useColors } from '@/contexts/ColorContext';

const CreateIncidentForm: React.FC = () => {
  const { primaryColor, secondaryColor } = useColors();
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Create Incident</h1>
      <form className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input type="text" className={styles.input} placeholder="Enter incident title" 
          style={{
            borderColor: primaryColor,
            boxShadow: `0 0 10px ${primaryColor}20`
          }}/>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea className={styles.textarea} placeholder="Enter incident description" rows={5} 
          style={{
            borderColor: primaryColor,
            boxShadow: `0 0 10px ${primaryColor}20`
          }}/>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Severity</label>
          <select className={styles.select} style={{
            borderColor: primaryColor,
            boxShadow: `0 0 10px ${primaryColor}20`
          }}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button type="submit" className={styles.button} style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          boxShadow: `0 10px 20px ${primaryColor}30`
        }}>Create Incident</button>
      </form>
    </div>
  );
};

export default CreateIncidentForm;