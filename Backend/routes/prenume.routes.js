const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/angajati/:id_utilizator', async (req, res) => {
    try {
        const { id_utilizator } = req.params;

        // Fetch the prenume from the angajati table
        const { data, error } = await supabase
            .from('angajati')
            .select('prenume')
            .eq('id_utilizator', id_utilizator)
            .single();

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching prenume:', error);
        res.status(500).json({ error: 'Failed to fetch prenume' });
    }
});

module.exports = router;