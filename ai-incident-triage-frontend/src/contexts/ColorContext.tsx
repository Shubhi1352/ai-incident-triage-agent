"use client";

import React, { createContext, useContext, useState } from "react";

interface ColorState {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  lightColors: string[];
}

interface ColorContextType extends ColorState {
  changeColors: () => void;
}

const ColorContext = createContext<ColorContextType | undefined>(undefined);

const randomColors = (count: number): string[] => {
  return new Array(count).fill(0).map(() =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  );
};

const generateColors = (): ColorState => {
  const [primary, secondary, tertiary] = randomColors(3);
  const lights = randomColors(4);

  return {
    primaryColor: primary,
    secondaryColor: secondary,
    tertiaryColor: tertiary,
    lightColors: lights
  };
};

export const ColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Only ONE state
  const [colors, setColors] = useState<ColorState>({
    primaryColor: "#0c1588",
    secondaryColor: "#8965f6",
    tertiaryColor: "#5a3df0",
    lightColors: ["#ffffff","#eeeeff","#ddddff","#ccccff"]
  });

  const changeColors = () => {
    setColors(generateColors());
  };

  return (
    <ColorContext.Provider value={{ ...colors, changeColors }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColors = () => {
  const context = useContext(ColorContext);
  if (!context) throw new Error("useColors must be used within ColorProvider");
  return context;
};