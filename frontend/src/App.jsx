import { useState, useEffect } from 'react'

import Card from './components/Card'
import Filter from './components/Filter'
import { darkTheme, lightTheme } from './themes'

import './App.css'

const App = () => {
    const [systemDarkMode, setSystemDarkMode] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    const [cardData, setCardData] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Daily');

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
        fetch(`/api/papers?filter=${activeFilter}`)
            .then(res => res.json())
            .then(data => setCardData(data))
            .catch(err => console.error(err));
    }, [activeFilter]);

    return (
        <>
        <div className="outerContainer">
            <div className="header">
                <h1>{activeFilter} Papers</h1>
                <Filter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </div>
            <div className="search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="cardList">
                {cardData.map((card, index) => (
                    <Card key={index} {...card} />
                ))}
            </div>
        </div>
        </>
    )
}

export default App;
