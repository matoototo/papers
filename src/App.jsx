import { useState, useEffect } from 'react'

import Card from './components/Card'

import cardData from './dummy/cardData'
import { darkTheme, lightTheme } from './themes'

import './App.css'

const App = () => {
    const [systemDarkMode, setSystemDarkMode] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        const themeStyles = systemDarkMode ? darkTheme : lightTheme;
        Object.keys(themeStyles).forEach(key => {
            const value = themeStyles[key];
            document.documentElement.style.setProperty(key, value);
        });
    }, [systemDarkMode]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => setSystemDarkMode(e.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <>
        <Card {...cardData} />
        <Card {...cardData} />
        <Card {...cardData} />
        </>
    )
}

export default App
