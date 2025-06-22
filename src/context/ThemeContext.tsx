import React, { createContext, useContext, useState, ReactNode } from 'react';

const light = {
  background: '#f8fafc',
  card: '#fff',
  cardAlt: '#e0e7ef',
  text: '#2a4d69',
  textAlt: '#22343c',
  border: '#2a4d69',
  inputBg: '#f8fafc',
  placeholder: '#888',
  iconBg: '#2a4d69',
  btn: '#2a4d69',
  btnText: '#fff',
  sectionTitle: '#2a4d69',
  seeLaterBg: '#e0e7ef',
};

const dark = {
  background: '#181a20',
  card: '#23262f',
  cardAlt: '#23262f',
  text: '#fff',
  textAlt: '#e0e7ef',
  border: '#fff',
  inputBg: '#23262f',
  placeholder: '#aaa',
  iconBg: '#fff',
  btn: '#2a4d69',
  btnText: '#fff',
  sectionTitle: '#fff',
  seeLaterBg: '#23262f',
};

type Theme = typeof light;

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  theme: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  theme: light,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? dark : light;
  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}