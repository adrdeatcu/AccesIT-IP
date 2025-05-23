const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role key instead of anonymous key
);

router.get('/', async (req, res) => {
    try {
        const { 
            sortBy = 'id_utilizator', 
            sortOrder = 'asc',
            filterDate 
        } = req.query;
        
        const allowedSortColumns = ['id_utilizator', 'nume', 'prenume', 'data_acordarii'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id_utilizator';
        
        let query = supabase
            .from('angajati')
            .select('*')
            .order(validSortBy, { ascending: sortOrder === 'asc' });

        // Add date filter if provided
        if (filterDate) {
            query = query.gte('data_acordarii', `${filterDate}T00:00:00`)
                        .lte('data_acordarii', `${filterDate}T23:59:59`);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Eroare la încărcarea angajaților' });
    }
});

module.exports = router;