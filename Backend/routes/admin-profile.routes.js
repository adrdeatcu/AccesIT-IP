const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.put('/:id', async (req, res) => {
     const { id } = req.params;
  const { email, newPassword, rol, angajat } = req.body;

  try {
    // 1. Fetch auth_id din utilizatori
    const { data: userRow, error: fetchError } = await supabase
      .from('utilizatori')
      .select('auth_id')
      .eq('id_utilizator', id)
      .single();

    if (fetchError) throw fetchError;

    const auth_id = userRow.auth_id;

    // 2. Actualizează parola (dacă e cazul)
    if (newPassword) {
      const { error: pwError } = await supabase.auth.admin.updateUserById(auth_id, {
        password: newPassword
      });
      if (pwError) throw pwError;
    }

    // 3. Actualizează emailul și rolul în utilizatori
    const updatePayload = {};
    if (email) updatePayload.email = email;
    if (rol) updatePayload.rol = rol;

    if (Object.keys(updatePayload).length > 0) {
      const { error: utilError } = await supabase
        .from('utilizatori')
        .update(updatePayload)
        .eq('id_utilizator', id);

      if (utilError) throw utilError;
    }

    // 4. Upsert în angajati (dacă sunt date)
    if (angajat) {
      const { data: existing, error: checkError } = await supabase
        .from('angajati')
        .select('id_utilizator')
        .eq('id_utilizator', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        const { error: updateError } = await supabase
          .from('angajati')
          .update(angajat)
          .eq('id_utilizator', id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('angajati')
          .insert({ ...angajat, id_utilizator: id });
        if (insertError) throw insertError;
      }
    }

    res.json({
      success: true,
      message: 'Profil actualizat cu succes'
    });

  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({
      error: 'Eroare la actualizarea profilului',
      details: err.message
    });
  }
});

module.exports = router;