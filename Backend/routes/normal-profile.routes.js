// routes/utilizatori.js
const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth.middleware'); // Make sure you have this middleware

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Current setup
);

// ─── GET /api/normal-profile/:id ────────────────────────────────────────────────
// Fetch a user (utilizatori) together with their angajati row
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params; // This 'id' from the route might be the id_utilizator
  try {
    // The user is authenticated by the 'authenticate' middleware.
    // req.user should contain the authenticated user's details from Supabase Auth.
    const authUserId = req.user.id; // This is the Supabase Auth user ID (UUID)

    // Fetch the id_utilizator from your 'utilizatori' table based on the authUserId
    const { data: utilizatorData, error: utilizatorError } = await supabase
      .from('utilizatori')
      .select('id_utilizator')
      .eq('auth_id', authUserId)
      .single();

    if (utilizatorError) throw utilizatorError;
    if (!utilizatorData) return res.status(404).json({ error: 'Utilizator (internal) inexistent' });

    // Now use utilizatorData.id_utilizator to fetch the profile if needed,
    // or if the :id in the route is already the id_utilizator and RLS handles access.
    // For profile display, the RLS policies should ensure the user only sees their own data.

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
      .eq('id_utilizator', utilizatorData.id_utilizator) // Use the fetched id_utilizator
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profil utilizator inexistent' });

    res.json(data);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Eroare la încărcarea profilului utilizatorului', details: err.message });
  }
});


// ─── PUT /api/normal-profile/change-password ───────────────────────────────────
// Route specifically for changing the password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userEmail = req.user.email; // Get email from the authenticated user object

    if (!oldPassword) {
      return res.status(400).json({ error: 'Parola veche este obligatorie.' });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.' });
    }
    if (!userEmail) {
        return res.status(400).json({ error: 'Email utilizator negăsit. Reconectați-vă.' });
    }

    // 1. Verify the old password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: oldPassword,
    });

    if (signInError) {
      console.error('Old password verification failed:', signInError);
      return res.status(400).json({ error: 'Parola veche este incorectă.', details: signInError.message });
    }

    // 2. Update to the new password
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Supabase password update error:', updateError);
      return res.status(400).json({ error: 'Nu s-a putut actualiza parola.', details: updateError.message });
    }

    res.json({ message: 'Parola a fost actualizată cu succes.' });

  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Eroare la schimbarea parolei.', details: err.message });
  }
});

// ─── PUT /api/normal-profile/change-email ───────────────────────────────────
router.put('/change-email', authenticate, async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;
    const authenticatedUserEmail = req.user.email; // Current email from JWT

    if (!currentPassword) {
      return res.status(400).json({ error: 'Parola curentă este obligatorie pentru schimbarea emailului.' });
    }
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) { // Basic email format validation
      return res.status(400).json({ error: 'Adresa de email nouă nu este validă.' });
    }
    if (!authenticatedUserEmail) {
        return res.status(400).json({ error: 'Email utilizator curent negăsit. Reconectați-vă.' });
    }
    if (newEmail === authenticatedUserEmail) {
        return res.status(400).json({ error: 'Noua adresă de email este identică cu cea curentă.' });
    }

    // 1. Verify the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authenticatedUserEmail,
      password: currentPassword,
    });

    if (signInError) {
      console.error('Current password verification for email change failed:', signInError);
      return res.status(400).json({ error: 'Parola curentă este incorectă.', details: signInError.message });
    }

    // 2. Update the email
    // Supabase will send a confirmation email to the new address.
    // The email is not actually changed until the user clicks the confirmation link.
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (updateError) {
      console.error('Supabase email update error:', updateError);
      // Check for specific errors, e.g., if the new email is already in use by another user
      if (updateError.message.includes('User already registered')) { // Example check, actual message might vary
        return res.status(400).json({ error: 'Această adresă de email este deja utilizată de alt cont.', details: updateError.message });
      }
      return res.status(400).json({ error: 'Nu s-a putut iniția schimbarea emailului.', details: updateError.message });
    }

    res.json({ message: `Un email de confirmare a fost trimis la ${newEmail}. Vă rugăm verificați emailul pentru a finaliza schimbarea.` });

  } catch (err) {
    console.error('Error changing email:', err);
    res.status(500).json({ error: 'Eroare la schimbarea emailului.', details: err.message });
  }
});


// ─── PUT /api/normal-profile/:id (for other profile updates) ──────────────────
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params; // This is likely id_utilizator
  const updates = req.body;

  // Remove password and email from updates if it exists, to prevent accidental changes here
  if (updates.password || updates.oldPassword || updates.newPassword) {
    delete updates.password;
    delete updates.oldPassword;
    delete updates.newPassword;
  }
  if (updates.email || updates.newEmail || updates.currentPassword) {
    delete updates.email;
    delete updates.newEmail;
    delete updates.currentPassword;
  }


  try {
    // Ensure the authenticated user is the one whose profile is being updated
    const authUserId = req.user.id; // Supabase Auth User ID

    const { data: utilizatorData, error: utilizatorError } = await supabase
      .from('utilizatori')
      .select('id_utilizator')
      .eq('auth_id', authUserId)
      .single();

    if (utilizatorError) throw utilizatorError;
    if (!utilizatorData || utilizatorData.id_utilizator !== parseInt(id)) {
      return res.status(403).json({ error: 'Forbidden: Nu aveți permisiunea să actualizați acest profil.' });
    }

    // Separate updates for 'utilizatori' and 'angajati' tables
    const { angajati: angajatiUpdates, ...utilizatoriUpdates } = updates;

    // Update 'utilizatori' table (e.g., rol, if allowed and handled)
    // Be careful what fields you allow to be updated here.
    // For 'rol', you might want specific logic or admin-only access.
    if (Object.keys(utilizatoriUpdates).length > 0) {
        // Example: only allow 'email' to be updated if you implement email change flow
        // For now, let's assume no direct 'utilizatori' table fields are updated here other than via Supabase Auth
    }


    // Update 'angajati' table
    if (angajatiUpdates && Object.keys(angajatiUpdates).length > 0) {
      const { data: angajatData, error: angajatError } = await supabase
        .from('angajati')
        .update(angajatiUpdates)
        .eq('id_utilizator', id) // id here is id_utilizator
        .select()
        .single();

      if (angajatError) {
        console.error('Error updating angajati:', angajatError);
        return res.status(400).json({ error: 'Eroare la actualizarea datelor angajatului.', details: angajatError.message });
      }
       if (!angajatData) {
        return res.status(404).json({ error: 'Datele angajatului pentru acest utilizator nu au fost găsite.' });
      }
    }

    res.json({ message: 'Profilul a fost actualizat cu succes.' });

  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Eroare la actualizarea profilului.', details: err.message });
  }
});
module.exports = router;
