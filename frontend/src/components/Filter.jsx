import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { faBookmark } from '@fortawesome/free-solid-svg-icons/faBookmark';

import '../styles/Filter.css';

const Filter = ({ filterState, setFilterState, setShowSettings }) => {
    const filters = ['Daily', 'Weekly', 'Monthly', 'Bookmarked'];

    const bookmarkClass = 'bookmark' + (filterState === "Bookmarked" ? ' bookmarked' : '');
    return (
        <div className="filters">
            {filters.map((filter) => (
                <button
                    key={filter}
                    className={filter === filterState ? 'filter active' : 'filter'}
                    onClick={() => setFilterState(filter)}
                >
                    {filter === 'Bookmarked' ? <FontAwesomeIcon icon={faBookmark} className={bookmarkClass} /> : filter}
                </button>
            ))}
            <button onClick={() => setShowSettings(true)}>
                <FontAwesomeIcon icon={faCog} />
            </button>
        </div>
    );
};

export default Filter;
