const express = require('express');
const router = express.Router();
const { handleSendString } = require('../Controllers/stringController');

// Test endpoint for ESP32
router.get('/test', (req, res) => {
    res.json({ message: 'ESP32 API is working!' });
});

// POST endpoint to receive string from ESP32
router.post('/send-string', express.json(), handleSendString);

// GET endpoint to receive string from ESP32
router.get('/send-string', (req, res) => {
    // Access the string from query parameters
    const receivedString = req.query.string;
    
    if (!receivedString) {
        console.log('⚠️ Warning: No string received in GET request');
        return res.status(400).json({ error: 'No string provided in query parameters' });
    }

    // Use the same handler as POST
    req.body = { string: receivedString };
    handleSendString(req, res);
});

module.exports = router;