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

module.exports = {
    insertPaper,
    getPaperByArxivId,
};
