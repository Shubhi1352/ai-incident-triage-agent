// src/contexts/ColorContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ColorContextType {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  lightColors: string[];
  changeColors: () => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

const randomColors = (count: number): string[] => {
    return new Array(count).fill(0).map(() => 
      "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    );
  };

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState(randomColors(1)[0]);
  const [secondaryColor, setSecondaryColor] = useState(randomColors(1)[0]);
  const [tertiaryColor, setTertiaryColor] = useState(randomColors(1)[0]);
  const [lightColors, setLightColors] = useState(randomColors(4));

  const changeColors = () => {
    const [newPrimary, newSecondary, newTertiary] = randomColors(3);
    const newLightColors = randomColors(4);
    
    setPrimaryColor(newPrimary);
    setSecondaryColor(newSecondary);
    setTertiaryColor(newTertiary);
    setLightColors(newLightColors);
  };
  
  return (
    <ColorContext.Provider value={{
      primaryColor,
      secondaryColor,
      tertiaryColor,
      lightColors,
      changeColors
    }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error("useColors must be used within a ColorProvider");
  }
  return context;
};