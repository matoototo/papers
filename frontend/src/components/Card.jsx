// Card.jsx
import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons/faBookmark';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';

import '../styles/Card.css';

const Card = ({ title, authors, abstract, date, url, thumbnail, hidden, bookmarked }) => {
    const [isBookmarked, setBookmarked] = useState(bookmarked);

    const authorsString = authors.join(', ');
    const bookmarkClass = 'bookmark-icon' + (isBookmarked ? ' bookmarked' : '');

    const thumbnailUrl = thumbnail ? `/api/${thumbnail}` : 'https://placehold.co/150x212';

    return (
        <div className="card">
            <img src={thumbnailUrl} alt={title} />
            <div className="content">
                <h2 className="title">
                    <span className="title-text">{title}</span>
                    <a href={url} target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="icon" />
                    </a>
                </h2>
                <p className="authors">{authorsString}</p>
                <hr />
                <p className="abstract">{abstract}</p>
            </div>
            <div className="meta">
                <FontAwesomeIcon icon={faBookmark} className={bookmarkClass} onClick={() => setBookmarked(!isBookmarked)} />
                <p className="date">{date}</p>
            </div>
        </div>
    );
}

export default Card;