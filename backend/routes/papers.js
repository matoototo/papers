// papers.js
const express = require('express');
const { getPapers, updatePaperBookmarkStatus, fuzzySearchPapers } = require('../database/db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { filter, page = 1, perPage = 20, searchTerm } = req.query;

        if (searchTerm) {
            const papers = await fuzzySearchPapers(searchTerm, page, perPage);
            return res.json(papers);
        }

        const endDate = new Date();
        let startDate = new Date();

        switch (filter) {
            case 'Weekly':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case 'Monthly':
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case 'Daily':
            default:
                startDate.setDate(endDate.getDate() - 1);
                break;
        }

        const filters = {
            timeSpan: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            }
        };

        const papers = await getPapers(filters, page, perPage);

        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/bookmark', async (req, res) => {
    try {
        const { arxiv_id, bookmarked } = req.body;
        await updatePaperBookmarkStatus(arxiv_id, bookmarked);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
