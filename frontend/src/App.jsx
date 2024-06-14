import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

import Card from './components/Card';
import Filter from './components/Filter';
import { darkTheme, lightTheme } from './themes';

import './App.css';

const App = () => {
    const [systemDarkMode, setSystemDarkMode] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    const [cardData, setCardData] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Daily');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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
        setCardData([]);
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

    return (
        <>
        <div className="outerContainer">
            <div className="header">
                <h1>{activeFilter} Papers</h1>
                <Filter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </div>
            <div className="search">
                <input type="text" placeholder="Search..." onChange={handleSearchChange} />
            </div>
            <div className="cardList">
                {cardData.map((card, index) => (
                    <Card key={index} {...card} />
                ))}
            </div>
            {loading && <div>Loading...</div>}
        </div>
        </>
    );
};

export default App;
