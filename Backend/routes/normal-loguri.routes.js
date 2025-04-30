const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/normal-loguri/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const { data: userLogs, error } = await supabase
            .from('loguri_prezenta')
            .select(`
                id_log,
                id_utilizator,
                data_log,
                tip_log,
                angajati (
                    utilizatori (
                        nume_utilizator
                    )
                )
            `)
            .eq('id_utilizator', userId)
            .order('data_log', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        // Transform data for frontend
        const transformedData = userLogs.map(log => ({
            id: log.id_log,
            id_utilizator: log.id_utilizator,
            timestamp: log.data_log,
            tip_actiune: log.tip_log,
            nume_utilizator: log.angajati?.utilizatori?.nume_utilizator || 'Unknown'
        }));

        res.json(transformedData);
    } catch (error) {
        console.error('Error fetching user logs:', error);
        res.status(500).json({ 
            error: 'Eroare la încărcarea logurilor utilizatorului',
            details: error.message 
        });
    }
});

module.exports = router;