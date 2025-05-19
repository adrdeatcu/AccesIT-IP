// routes/utilizatori.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ─── GET /api/normal-profile/:id ────────────────────────────────────────────────
// Fetch a user (utilizatori) together with their angajati row
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('utilizatori')
      .select(`
        id_utilizator,
        email,
        rol,
        data_creare,
        angajati (
          prenume,
          nume,
          poza,
          nr_legitimatie,
          id_divizie,
          cod_bluetooth,
          identificator_smartphone,
          nr_masina,
          acces_activ,
          badge_acordat_de,
          data_acordarii,
          data_modificare
        )
      `)
      .eq('id_utilizator', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Utilizator inexistent' });

    res.json(data);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Eroare la încărcarea utilizatorului', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, oldPassword, newPassword, rol, angajat } = req.body;

  try {
    // Handle password update if provided
    if (oldPassword && newPassword) {
      // First verify old password
      const { data: user, error: userError } = await supabase
        .from('utilizatori')
        .select('parola_hash')
        .eq('id_utilizator', id)
        .single();

      if (userError) throw userError;

      const isValidPassword = await bcrypt.compare(oldPassword, user.parola_hash);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid old password' });
      }

      // Hash new password
      const parola_hash = await bcrypt.hash(newPassword, 10);
      const { error: updateError } = await supabase
        .from('utilizatori')
        .update({ 
          email,
          parola_hash 
        })
        .eq('id_utilizator', id);

      if (updateError) throw updateError;
    } else {
      // Just update email
      const utilPayload = {
        ...(email && { email }),
        ...(rol && { rol })
      };
      
      const { error: utilError } = await supabase
        .from('utilizatori')
        .update(utilPayload)
        .eq('id_utilizator', id);
      
      if (utilError) {
        console.error('Error updating utilizatori:', utilError);
        throw utilError;
      }
    }

    // Update angajati table if angajat data is provided
    if (angajat) {
      const angPayload = {
        ...(angajat.prenume && { prenume: angajat.prenume }),
        ...(angajat.nume && { nume: angajat.nume }),
        ...(angajat.poza && { poza: angajat.poza }),
        ...(angajat.nr_legitimatie && { nr_legitimatie: angajat.nr_legitimatie }),
        ...(angajat.id_divizie && { id_divizie: angajat.id_divizie }),
        ...(angajat.cod_bluetooth && { cod_bluetooth: angajat.cod_bluetooth }),
        ...(angajat.identificator_smartphone && { identificator_smartphone: angajat.identificator_smartphone }),
        ...(angajat.nr_masina && { nr_masina: angajat.nr_masina }),
        ...(typeof angajat.acces_activ === 'boolean' && { acces_activ: angajat.acces_activ }),
        ...(angajat.badge_acordat_de && { badge_acordat_de }),
        data_modificare: new Date().toISOString()
      };

      console.log('Updating angajati with payload:', angPayload);

      const { error: angError } = await supabase
        .from('angajati')
        .update(angPayload)
        .eq('id_utilizator', id);

      if (angError) {
        console.error('Error updating angajati:', angError);
        throw angError;
      }
    }

    // Return the updated data
    const { data: updatedData, error: fetchError } = await supabase
      .from('utilizatori')
      .select(`
        id_utilizator,
        email,
        rol,
        data_creare,
        angajati (
          prenume,
          nume,
          poza,
          nr_legitimatie,
          id_divizie,
          cod_bluetooth,
          identificator_smartphone,
          nr_masina,
          acces_activ,
          badge_acordat_de
        )
      `)
      .eq('id_utilizator', id)
      .single();

    if (fetchError) throw fetchError;

    res.json({
      message: 'Utilizator actualizat cu succes',
      data: updatedData
    });

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ 
      error: 'Eroare la actualizarea utilizatorului', 
      details: err.message 
    });
  }
});

module.exports = router;
