// db.js
const pgp = require('pg-promise')();
const db = pgp(process.env.DATABASE_URL);
const fuzzysort = require('fuzzysort');

const { streamSummary } = require('../utils/generativeUtils');

const fuzzySearchPapers = async (searchTerm, page = 1, perPage = 20) => {
    const papers = await db.any('SELECT * FROM arxiv_metadata WHERE full_text IS NOT NULL');
    const searchResults = fuzzysort.go(searchTerm, papers, {
        keys: ['title', 'authors', 'abstract', 'categories'],
        threshold: -10000,
    });

    const paginatedResults = searchResults.slice((page - 1) * perPage, page * perPage);
    return paginatedResults.map(result => result.obj);
};

const insertPaperMetadata = async (paper) => {
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
    return await db.oneOrNone('SELECT * FROM arxiv_metadata WHERE arxiv_id = $1', [arxivId]);
};

const getPapers = async (filters, page = 1, perPage = 20) => {
    let whereClauses = ['full_text IS NOT NULL'];
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

const getPapersWithoutEmbeddings = async () => {
    return await db.any('SELECT * FROM (SELECT * FROM arxiv_metadata LIMIT 10) AS subquery WHERE abstract_embedding IS NULL'); // TODO: Remove limit subquery
}

const updatePaperEmbedding = async (id, embedding) => {
    await db.none('UPDATE arxiv_metadata SET abstract_embedding = $1 WHERE id = $2', [embedding, id]);
};

const updatePaperSummary = async (id, summary) => {
    await db.none('UPDATE arxiv_metadata SET summary = $1 WHERE id = $2', [summary, id]);
};

const sanitizeText = (text) => {
    return text.replace(/[\x00-\x1F\x7F]/g, '');
};

const updatePaperFullText = async (id, fullText) => {
    const sanitizedText = sanitizeText(fullText);
    await db.none('UPDATE arxiv_metadata SET full_text = $1 WHERE id = $2', [sanitizedText, id]);
};

async function* getPaperSummary(arxivId) {
    const paper = await getPaperByArxivId(arxivId);
    if (!paper) {
        throw new Error(`Paper with arxiv_id ${arxivId} not found`);
    }

    if (paper.summary) {
        yield paper.summary;
    } else {
        if (!paper.full_text) {
            throw new Error(`Full text for paper with arxiv_id ${arxivId} not available`);
        }

        const summaryStream = streamSummary(paper.full_text);
        let summary = '';
        for await (const chunk of summaryStream) {
            if (chunk !== undefined) {
                summary += chunk;
                yield chunk;
            }
        }
        await updatePaperSummary(paper.id, summary);
    }
}


module.exports = {
    insertPaperMetadata,
    getPaperByArxivId,
    getPapers,
    getPapersWithoutThumbnails,
    getPapersWithoutEmbeddings,
    updatePaperThumbnail,
    updatePaperBookmarkStatus,
    updatePaperEmbedding,
    updatePaperSummary,
    updatePaperFullText,
    fuzzySearchPapers,
    getPaperSummary,
};
