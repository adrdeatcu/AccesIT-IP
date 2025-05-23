const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth.middleware');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY  // Use service role key instead of anonymous key
);

router.get('/', authenticate, async (req, res) => {
  console.log('GET /api/vizitatori accessed with query:', req.query); // Debug log
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
      sortBy = 'ora_intrare',
      sortOrder = 'desc',
      filterDate
    } = req.query;

    const allowedSortColumns = ['id_vizitator', 'nume', 'ora_intrare', 'ora_iesire'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'ora_intrare';

    let query = supabase
      .from('vizitatori')
      .select(`id_vizitator, nume, ora_intrare, ora_iesire`);

    if (filterDate) {
      query = query
        .gte('ora_iesire', `${filterDate}T00:00:00`)
        .lte('ora_intrare', `${filterDate}T23:59:59`);
    }

    query = query.order(validSortBy, { ascending: sortOrder === 'asc' });

    const { data: allLogs, error: logsError } = await query;
    if (logsError) throw logsError;

    // Transform directly into the shape your TS expects
    const transformedData = allLogs.map((log) => ({
      id_vizitator: log.id_vizitator,
      nume: log.nume,
      ora_intrare: log.ora_intrare,
      ora_iesire: log.ora_iesire,
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Eroare la încărcarea logurilor', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
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