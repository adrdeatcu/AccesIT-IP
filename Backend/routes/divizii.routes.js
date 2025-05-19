const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Get all divisions
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('divizii')
            .select('*')
            .order('nume_divizie');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching divisions:', error);
        res.status(500).json({ error: 'Eroare la încărcarea diviziilor' });
    }
});

module.exports = router;