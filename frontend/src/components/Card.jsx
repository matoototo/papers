// Card.jsx
import { useState } from 'react';

import katex from 'katex';
import 'katex/dist/katex.min.css';
import Markdown from 'markdown-to-jsx';
import { format, parseISO } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons/faBookmark';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';

import '../styles/Card.css';

const Card = ({ arxiv_id, title, authors, abstract, date, url, thumbnail, hidden, bookmarked }) => {
    const [isExpanded, setExpanded] = useState(false);
    const [isBookmarked, setBookmarked] = useState(bookmarked);
    const [markdownText, setMarkdownText] = useState(abstract); // TODO: Stream from API

    const authorsString = authors.join(', ');
    const expandedClass = 'card' + (isExpanded ? ' expanded' : '');
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

    const InlineLatex = ({ children }) => {
        const latexContent = children.map(child =>
            typeof child === 'string' ? child : child.props.children
        ).join('');
        const html = katex.renderToString(latexContent, {
            throwOnError: false,
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const BlockLatex = ({ children }) => {
        const latexContent = children.map(child =>
            typeof child === 'string' ? child : child.props.children
        ).join('');

        const html = katex.renderToString(latexContent, {
            displayMode: true,
            throwOnError: false,
        });
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };

    const wrapLatex = (content) => {
        const latexRegex = /(?<!\\)\$\$?([\s\S]+?)\$?\$/g;
        return content.replace(latexRegex, (match, latexContent) => {
            const trimmedContent = latexContent.trim();
            if (match.startsWith('$$')) {
                return `<BlockLatex>\`${trimmedContent}\`</BlockLatex>`;
            } else {
                return `<InlineLatex>\`${trimmedContent}\`</InlineLatex>`;
            }
        });
    };

    return (
        <div className={expandedClass} onClick={() => setExpanded(!isExpanded)}>
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
                {!isExpanded && <p className="abstract">{abstract}</p>}
                {isExpanded && <Markdown className="markdown" options={{ overrides: { InlineLatex, BlockLatex } }}>{wrapLatex(markdownText)}</Markdown>}
            </div>
            <div className="meta">
                <FontAwesomeIcon icon={faBookmark} className={bookmarkClass} onClick={toggleBookmark} />
                <p className="date">{date}</p>
            </div>
        </div>
    );
};

export default Card;
