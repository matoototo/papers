import { useState, useEffect } from 'react'

import Card from './components/Card'
import { darkTheme, lightTheme } from './themes'

import './App.css'

const App = () => {
    const [systemDarkMode, setSystemDarkMode] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    const [cardData, setCardData] = useState([]);

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

    useEffect(() => {
        fetch('/api/papers')
            .then(res => res.json())
            .then(data => setCardData(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <>
            {cardData.map((card, index) => (
                <Card key={index} {...card} />
            ))}
        </>
    )
}

export default App
