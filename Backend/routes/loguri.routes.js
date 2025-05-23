const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role key instead of anonymous key
);

router.get('/', async (req, res) => {
    try {
        const {
            sortBy = 'data_log',
            sortOrder = 'desc',
            filterDate,
            filterAction
        } = req.query;

        const allowedSortColumns = ['id_log', 'id_utilizator', 'data_log', 'tip_log'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'data_log';

        let query = supabase
            .from('loguri_prezenta')
            .select(`
                id_log,
                id_utilizator,
                data_log,
                tip_log,
                angajati (
                    prenume,
                    nume
                )
            `);

        if (filterDate) {
            query = query.gte('data_log', `${filterDate}T00:00:00`)
                        .lte('data_log', `${filterDate}T23:59:59`);
        }

        if (filterAction) {
            query = query.eq('tip_log', filterAction);
        }

        query = query.order(validSortBy, { ascending: sortOrder === 'asc' });

        const { data: allLogs, error: logsError } = await query;

        if (logsError) throw logsError;

        const usersStatus = new Map();
        const usersIn = [];

        allLogs.forEach(log => {
            const userId = log.id_utilizator;
            if (!usersStatus.has(userId)) {
                usersStatus.set(userId, log.tip_log);
                if (log.tip_log === 'IN') {
                    usersIn.push({
                        id_utilizator: userId,
                        nume_complet: `${log.angajati?.prenume || ''} ${log.angajati?.nume || ''}`,
                        ultima_intrare: log.data_log
                    });
                }
            }
        });

        const transformedData = allLogs.map(log => ({
            id: log.id_log,
            id_utilizator: log.id_utilizator,
            timestamp: log.data_log,
            tip_actiune: log.tip_log,
            nume_complet: `${log.angajati?.prenume || ''} ${log.angajati?.nume || ''}`
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