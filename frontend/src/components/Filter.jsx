// Filter.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';

import '../styles/Filter.css';

const Filter = ({ activeFilter, setActiveFilter }) => {
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
            <button>
                <FontAwesomeIcon icon={faCog} />
            </button>
        </div>
    );
};

export default Filter;
