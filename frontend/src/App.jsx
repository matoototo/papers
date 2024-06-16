import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

import Card from './components/Card';
import Filter from './components/Filter';
import SettingsModal from './components/SettingsModal';
import { darkTheme, lightTheme } from './themes';

import './App.css';

const App = () => {
    const [systemDarkMode, setSystemDarkMode] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [cardData, setCardData] = useState([]);
    const [activeFilter, setActiveFilter] = useState(localStorage.getItem('activeFilter') || 'Daily');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [preferenceText, setPreferenceText] = useState(''); // TODO: Fetch from API
    const [savingPreferenceText, setSavingPreferenceText] = useState(false);

    const fetchPapers = (filter, page, searchTerm = '') => {
        setLoading(true);
        const url = new URL('/api/papers', window.location.origin);
        url.searchParams.append('filter', filter);
        url.searchParams.append('page', page);
        if (searchTerm) {
            url.searchParams.append('searchTerm', searchTerm);
        }

        fetch(url)
            .then(res => res.json())
            .then(data => {
                setCardData(prevData => (page === 1 ? data : [...prevData, ...data]));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const fetchPreferences = async () => {
        try {
            const response = await fetch('/api/user/preferences');
            if (!response.ok) {
                throw new Error('Failed to fetch preferences');
            }
            const data = await response.json();
            setPreferenceText(data.preferenceText);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPreferences();
    }, []);

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
        setPage(1);
        fetchPapers(activeFilter, 1, searchTerm);
    }, [activeFilter, searchTerm]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop
                >= document.documentElement.offsetHeight - 200 && !loading) {
                setPage(page + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, loading]);

    useEffect(() => {
        if (page > 1) {
            fetchPapers(activeFilter, page, searchTerm);
        }
    }, [page]);

    const debouncedSearch = useCallback(debounce((value) => {
        setSearchTerm(value);
        setPage(1);
    }, 300), []);

    const handleSearchChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleSavePreferences = async (text) => {
        setSavingPreferenceText(true);
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ preferenceText: text }),
            });
            if (!response.ok) {
                throw new Error('Failed to save preferences');
            }
            setPreferenceText(text);
        } catch (error) {
            console.error(error);
        } finally {
            setSavingPreferenceText(false);
            setShowSettings(false);

            setPage(1);
            fetchPapers(activeFilter, 1, searchTerm);
        }
    };

    const handleCancel = () => {
        setShowSettings(false);
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        localStorage.setItem('activeFilter', filter);
    };

    return (
        <>
        <div className="outerContainer">
            <div className="header">
                <h1>{activeFilter} Papers ✨</h1>
                <Filter activeFilter={activeFilter} setActiveFilter={handleFilterChange} setShowSettings={setShowSettings} />
            </div>
            <div className="search">
                <input type="text" placeholder="Search..." onChange={handleSearchChange} />
            </div>
            <div className="cardList">
                {cardData.map((card, index) => (
                    <Card key={index} {...card} />
                ))}
            </div>
            {showSettings && (
                <SettingsModal
                    preferenceText={preferenceText}
                    onSave={handleSavePreferences}
                    onCancel={handleCancel}
                    saving={savingPreferenceText}
                />
            )}
        </div>
        </>
    );
};

export default App;
