// Card.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import '../styles/Card.css';

const Card = ({ title, authors, abstract, date, url, thumbnailUrl, hidden, bookmarked }) => {
    const authorsString = authors.join(', ');

    return (
        <div className="card">
            <img src={thumbnailUrl} alt={title} />
            <div className="content">
                <h2 className="title">
                    {title}
                    <a href={url} target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="icon" />
                    </a>
                </h2>
                <p className="authors">{authorsString}</p>
                <hr />
                <p className="abstract">{abstract}</p>
            </div>
            <div className="meta">
                <p className="date">{date}</p>
            </div>
        </div>
    );
}

export default Card;
