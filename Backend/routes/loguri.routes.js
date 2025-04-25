const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/loguri-prezenta', async (req, res) => {
    try {
        // Get all logs ordered by timestamp
        const { data: allLogs, error: logsError } = await supabase
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
            .order('data_log', { ascending: false });

        if (logsError) throw logsError;

        // Calculate users currently IN
        const usersStatus = new Map();
        const usersIn = [];

        allLogs.forEach(log => {
            const userId = log.id_utilizator;
            // Only process if we haven't seen this user yet
            if (!usersStatus.has(userId)) {
                usersStatus.set(userId, log.tip_log);
                if (log.tip_log === 'IN') {
                    usersIn.push({
                        id_utilizator: userId,
                        nume_utilizator: log.angajati?.utilizatori?.nume_utilizator,
                        ultima_intrare: log.data_log
                    });
                }
            }
        });

        // Transform logs data for the table
        const transformedData = allLogs.map(log => ({
            id: log.id_log,
            id_utilizator: log.id_utilizator,
            timestamp: log.data_log,
            tip_actiune: log.tip_log,
            nume_utilizator: log.angajati?.utilizatori?.nume_utilizator || 'Unknown'
        }));

        // Send both the users in count and the logs data
        res.json({
            usersCurrentlyIn: usersIn.length,
            usersInDetails: usersIn,
            logs: transformedData
        });

    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ 
            error: 'Eroare la încărcarea logurilor',
            details: error.message 
        });
    }
});

module.exports = router;