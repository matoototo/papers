// Card.jsx
import { useState } from 'react';
import { format, parseISO } from 'date-fns';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons/faBookmark';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';

import '../styles/Card.css';

const Card = ({ arxiv_id, title, authors, abstract, date, url, thumbnail, hidden, bookmarked }) => {
    const [isBookmarked, setBookmarked] = useState(bookmarked);

    const authorsString = authors.join(', ');
    const bookmarkClass = 'bookmark-icon' + (isBookmarked ? ' bookmarked' : '');

    const thumbnailUrl = thumbnail ? `/api/${thumbnail}` : 'https://placehold.co/150x212';

    date = format(parseISO(date), 'MMMM d, yyyy');

    const toggleBookmark = async () => {
        try {
            const response = await fetch('/api/papers/bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ arxiv_id, bookmarked: !isBookmarked }),
            });

            if (response.ok) {
                setBookmarked(!isBookmarked);
            } else {
                console.error('Failed to update bookmark status:', response.statusText);
            }
        } catch (error) {
            console.error('Failed to update bookmark status:', error);
        }
    };

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
                <FontAwesomeIcon icon={faBookmark} className={bookmarkClass} onClick={toggleBookmark} />
                <p className="date">{date}</p>
            </div>
        </div>
    );
};

export default Card;
