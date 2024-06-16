// Filter.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';

import '../styles/Filter.css';

const Filter = ({ activeFilter, setActiveFilter, setShowSettings }) => {
    const filters = ['Daily', 'Weekly', 'Monthly'];

    return (
        <div className="filters">
            {filters.map((filter) => (
                <button
                    key={filter}
                    className={filter === activeFilter ? 'active' : ''}
                    onClick={() => setActiveFilter(filter)}
                >
                    {filter}
                </button>
            ))}
            <button onClick={() => setShowSettings(true)}>
                <FontAwesomeIcon icon={faCog} />
            </button>
        </div>
    );
};

export default Filter;
