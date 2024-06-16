// user.js
const express = require('express');
const { getUser, updateUser } = require('../database/db');
const { getPreferenceEmbedding } = require('../utils/aiServer');
const router = express.Router();

router.get('/preferences', async (req, res) => {
    try {
        const userId = 1; // TODO: Get from request
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ preferenceText: user.preference_text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/preferences', async (req, res) => {
    try {
        const userId = 1; // TODO: Get from request
        const { preferenceText } = req.body;

        if (typeof preferenceText !== 'string') {
            return res.status(400).json({ message: 'Invalid preference text' });
        }

        await getUser(userId); // TODO: Remove

        const preferenceEmbedding = await getPreferenceEmbedding(preferenceText);
        await updateUser(userId, {
            preference_text: preferenceText,
            preference_embedding: preferenceEmbedding
        });

        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
