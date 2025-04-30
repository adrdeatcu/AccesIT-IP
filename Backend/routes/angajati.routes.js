const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/angajati', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('angajati')
            .select('*')
            .order('nume');

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Eroare la încărcarea angajaților' });
    }
});

module.exports = router;