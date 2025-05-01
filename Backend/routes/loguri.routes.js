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
        const {
            sortBy = 'data_log',
            sortOrder = 'desc',
            filterDate,
            filterAction
        } = req.query;

        const allowedSortColumns = ['id_log', 'id_utilizator', 'nume_utilizator', 'data_log', 'tip_log'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'data_log';

        let query = supabase
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
            `);

        // Add date filter if provided
        if (filterDate) {
            query = query.gte('data_log', `${filterDate}T00:00:00`)
                        .lte('data_log', `${filterDate}T23:59:59`);
        }

        // Add action type filter if provided
        if (filterAction) {
            query = query.eq('tip_log', filterAction);
        }

        // Add sorting
        query = query.order(validSortBy, { ascending: sortOrder === 'asc' });

        const { data: allLogs, error: logsError } = await query;

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