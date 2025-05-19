const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const { authenticate } = require('../middleware/auth.middleware');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Change from '/utilizatori' to just '/' since the path prefix is set in index.js
router.get('/', authenticate, async (req, res) => {
  try {
    const { sortBy = 'id_utilizator', sortOrder = 'asc', filterDate } = req.query;

    const allowedSortColumns = ['id_utilizator', 'email', 'rol', 'data_creare'];
    const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id_utilizator';

    let query = supabase.from('utilizatori').select('*');

    if (filterDate) {
      query = query.gte('data_creare', `${filterDate}T00:00:00`)
                  .lte('data_creare', `${filterDate}T23:59:59`);
    }

    const { data, error } = await query.order(validSortBy, { ascending: sortOrder === 'asc' });
    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change from '/utilizatori/:id' to '/:id'
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const tablesToClear = [
      'interval_acces_angajati',
      'loguri_prezenta',
      'utilizatori_divizii',
      'angajati'
    ];

    for (const table of tablesToClear) {
      const { error } = await supabase.from(table).delete().eq('id_utilizator', id);
      if (error) throw error;
    }

    const { error: utilError } = await supabase
      .from('utilizatori')
      .delete()
      .eq('id_utilizator', id);
    if (utilError) throw utilError;

    res.json({ message: 'Utilizator șters cu succes' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Change from '/utilizatori/me' to '/me'
router.get('/me', authenticate, async (req, res) => {
  try {
    const authUserId = req.user.id;

    // Find application user record
    const { data: util, error: utilErr } = await supabase
      .from('utilizatori')
      .select('id_utilizator, email, rol, data_creare')
      .eq('auth_id', authUserId)
      .single();
    if (utilErr || !util) throw utilErr || new Error('Utilizatorul nu a fost găsit');

    // Fetch related angajati data
    const { data: angajati, error: angErr } = await supabase
      .from('angajati')
      .select('*')
      .eq('id_utilizator', util.id_utilizator);
    if (angErr) throw angErr;

    res.json({ ...util, angajati });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
