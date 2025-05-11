const express = require('express');
const router  = express.Router();
const { createClient } = require('@supabase/supabase-js');
const util = require('util');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.post('/adaugare-vizitator', async (req, res) => {
    try {
      let { cnp, ora_intrare, ora_iesire } = req.body;
  
      if (!cnp || !ora_intrare || !ora_iesire) {
        return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii' });
      }
  
      const result = await supabase
        .from('vizitator')
        .insert([{ cnp, ora_intrare, ora_iesire }])
        .select();
  
      console.log('🔍 Supabase insert RESULT:', util.inspect(result, { showHidden: true, depth: null }));
  
      if (result.error) {
        console.error('Eroare Supabase:', result.error.message || result.error);
        return res.status(400).json({
          error: 'Eroare la inserare în baza de date. Verifică datele trimise.'
        });
      }
  
      // ✅ Success message with inserted data
      return res.status(201).json({
        message: 'Vizitator adăugat cu succes!',
        data: result.data?.[0] || null
      });
  
    } catch (err) {
      console.error('Unexpected error adding visitor:', err);
      return res.status(500).json({ error: err.message || 'Eroare internă a serverului' });
    }
  });

module.exports = router;
