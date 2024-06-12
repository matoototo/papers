// papers.js
const express = require('express');
const router = express.Router();

const dummyPapers = require('../dummy/cardData');

router.get('/', (req, res) => {
    res.json(dummyPapers);
});

module.exports = router;
