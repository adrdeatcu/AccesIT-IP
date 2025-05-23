const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth.middleware');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get('/', authenticate, async (req, res) => {
  console.log('GET /api/vizitatori accessed with query:', req.query);
  try {
    // Log the auth context
    console.log('Auth context:', req.user);

    // Test database connection and user role
    const { data: user, error: userError } = await supabase
        .from('utilizatori')
        .select('rol')
        .eq('auth_id', req.user.id)
        .single();

    if (userError) {
        console.error('Error fetching user role:', userError);
        return res.status(500).json({ error: 'Error fetching user role' });
    }

    console.log('User role:', user.rol);

    const {
      sortBy = 'data_log',  // Default to data_log instead of ora_intrare
      sortOrder = 'desc',
      filterDate
    } = req.query;

    // Update column names to match the new schema
    const allowedSortColumns = ['id_vizitator', 'nume', 'tip_log', 'data_log'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'data_log';

    let query = supabase
      .from('vizitatori')
      .select('id_vizitator, nume, tip_log, data_log'); // Updated column names

    if (filterDate) {
      // Updated date filtering for the new schema
      // This assumes data_log is a timestamp column
      query = query
        .gte('data_log', `${filterDate}T00:00:00`)
        .lt('data_log', `${filterDate}T23:59:59.999`);
    }

    query = query.order(validSortBy, { ascending: sortOrder === 'asc' });

    const { data: logs, error: logsError } = await query;
    if (logsError) throw logsError;

    // No need for complex transformation since the schema matches the frontend expectation
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Eroare la încărcarea logurilor', details: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('vizitatori')
      .delete()
      .eq('id_vizitator', Number(id));

    if (error) throw error;
    res.json({ message: 'Înregistrare ștearsă cu succes' });
  } catch (err) {
    console.error('Error deleting log:', err);
    res.status(500).json({ error: 'Eroare la ștergerea înregistrării', details: err.message });
  }
});

module.exports = router;