// db.js
const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);

const insertPaper = async (paper) => {
    await db.none(`
        INSERT INTO arxiv_metadata (arxiv_id, title, authors, abstract, date, url, categories, thumbnail)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
        paper.id,
        paper.title,
        paper.authors,
        paper.abstract,
        paper.date,
        paper.url,
        paper.categories,
        paper.thumbnailUrl
    ]);
};

const getPaperByArxivId = async (arxivId) => {
    return await db.oneOrNone('SELECT id FROM arxiv_metadata WHERE arxiv_id = $1', [arxivId]);
};

const getPapers = async (filters, page = 1, perPage = 20) => {
    let whereClauses = [];
    let values = [];
    let orderByClause = '';
    let offset = (page - 1) * perPage;

    if (filters.timeSpan) {
        whereClauses.push('date BETWEEN $1 AND $2');
        values.push(filters.timeSpan.start);
        values.push(filters.timeSpan.end);
    }

    if (filters.categories && filters.categories.length > 0) {
        whereClauses.push('categories && $' + (values.length + 1) + '::text[]');
        values.push(filters.categories);
    }

    if (filters.embedding) {
        orderByClause = `ORDER BY abstract_embedding <=> $${values.length + 1}`;
        values.push(filters.embedding);
    } else {
        orderByClause = 'ORDER BY date DESC';
    }

    let query = `
        SELECT * FROM arxiv_metadata
        ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
        ${orderByClause}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    values.push(perPage, offset);

    return await db.any(query, values);
};

const getPapersWithoutThumbnails = async () => {
    return await db.any('SELECT * FROM arxiv_metadata WHERE thumbnail IS NULL');
};

const updatePaperThumbnail = async (id, thumbnailUrl) => {
    await db.none('UPDATE arxiv_metadata SET thumbnail = $1 WHERE id = $2', [thumbnailUrl, id]);
};

const updatePaperBookmarkStatus = async (arxivId, bookmarked) => {
    await db.none('UPDATE arxiv_metadata SET bookmarked = $1 WHERE arxiv_id = $2', [bookmarked, arxivId]);
};

module.exports = {
    insertPaper,
    getPaperByArxivId,
    getPapers,
    getPapersWithoutThumbnails,
    updatePaperThumbnail,
    updatePaperBookmarkStatus,
};
