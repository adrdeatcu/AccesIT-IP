const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/register
router.post('/', async (req, res) => {
  try {
    const { email, password, phone, display_name, rol, angajat } = req.body;

    console.log('Received registration data:', req.body);

    if (!email || !password || !rol) {
      return res.status(400).json({ error: 'Email, password și rol sunt obligatorii.' });
    }
    if (angajat && !angajat.id_divizie) { // Ensure id_divizie is present if angajat data is provided
        return res.status(400).json({ error: 'ID Divizie este obligatoriu pentru angajat.' });
    }

    // Create Supabase Auth user
    const { data, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      phone,
      user_metadata: { display_name },
      email_confirm: true, // Consider setting to false if you want email verification
      app_metadata: { providers: ['email'] }
    });
    if (authError) throw authError;

    const authUser = data.user;

    if (!authUser || !authUser.id) { // Check authUser.id
      console.error('authUser missing id:', authUser);
      return res.status(500).json({ error: 'Eroare la extragerea ID-ului utilizatorului din Auth.' });
    }

    // Inserare în tabela utilizatori
    const { data: utilRows, error: utilError } = await supabase
      .from('utilizatori')
      .insert({
        auth_id: authUser.id,
        email: authUser.email, // Use authUser.email for consistency
        rol,
        data_creare: new Date().toISOString()
      })
      .select('id_utilizator') // Ensure you select the PK of utilizatori
      .single();
    if (utilError) throw utilError;

    const idUtilizator = utilRows.id_utilizator; // Get the newly created id_utilizator

    // Optionally insert into angajati table
    if (angajat) {
      const angajatData = {
        id_utilizator: idUtilizator, // Use the id_utilizator from the insert
        nume: angajat.nume,
        prenume: angajat.prenume,
        poza: angajat.poza,
        nr_legitimatie: angajat.nr_legitimatie,
        id_divizie: angajat.id_divizie,
        cod_bluetooth: angajat.cod_bluetooth,
        identificator_smartphone: angajat.identificator_smartphone,
        nr_masina: angajat.nr_masina,
        acces_activ: angajat.acces_activ ?? true,
        badge_acordat_de: angajat.badge_acordat_de,
        // data_creare is usually handled by default value or trigger in DB for angajati
      };
      const { error: angError } = await supabase.from('angajati').insert(angajatData);
      if (angError) throw angError;

      // Insert into utilizatori_divizii table
      // This assumes that if an 'angajat' is being created, they are associated with their 'id_divizie'
      const { error: utilDivError } = await supabase
        .from('utilizatori_divizii')
        .insert({
          id_utilizator: idUtilizator,
          id_divizie: angajat.id_divizie,
          data_creare: new Date().toISOString()
        });
      if (utilDivError) throw utilDivError;
    }

    return res.status(201).json({
      message: 'Înregistrare reușită. Utilizator, angajat (dacă este cazul) și asociere divizie create.',
      user: {
        id_utilizator: idUtilizator,
        auth_id: authUser.id,
        email: authUser.email,
        rol
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    // Provide more specific error messages if possible
    if (error.code && error.details) { // Check for Supabase specific error structure
        return res.status(500).json({ error: error.message, details: error.details, code: error.code });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

