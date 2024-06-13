// papers.js
const express = require('express');
const { getPapers, updatePaperBookmarkStatus } = require('../database/db');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const endDate = new Date();
        endDate.setDate(endDate.getDate());
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);

        const filters = {
            timeSpan: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            }
        };

        const papers = await getPapers(filters);

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
