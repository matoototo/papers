// papers.js
const express = require('express');
const fetchArxivPapers = require('../utils/arxivUtils');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        const endTimestamp = endDate.toISOString();
        const categories = ['cs.AI', 'stat.ML', 'cs.LG', 'cs.CV', 'cs.CL', 'cs.NE', 'cs.RO', 'cs.SY', 'cs.GT', 'cs.AR', 'cs.SE', 'cs.PL', 'cs.SD', 'cs.DC', 'cs.SC', 'cs.MA', 'cs.CG', 'cs.CE', 'cs.MM', 'cs.HC', 'cs.IR', 'cs.DB', 'cs.DL', 'cs.CY', 'cs.FL', 'cs.GL', 'cs.GR', 'cs.HC', 'cs.IR', 'cs.IT', 'cs.LO', 'cs.MA', 'cs.MM', 'cs.MS', 'cs.NA', 'cs.NE', 'cs.NI', 'cs.OH', 'cs.OS', 'cs.PF', 'cs.PL', 'cs.RO', 'cs.SC', 'cs.SD', 'cs.SE', 'cs.SI', 'cs.SY'];

        const papers = await fetchArxivPapers(endTimestamp, categories);
        res.json(papers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;