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

    if (!email || !password || !rol) {
      return res.status(400).json({ error: 'Email, password și rol sunt obligatorii.' });
    }

    // Create Supabase Auth user
  const { data, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  phone,
  user_metadata: { display_name },
  email_confirm: true,
  app_metadata: { providers: ['email'] }
});
if (authError) throw authError;

const authUser = data.user; // <- extragi user-ul

// Verificare pentru debugging
if (!authUser || !authUser.email) {
  console.error('authUser missing email:', authUser);
  return res.status(500).json({ error: 'Eroare la extragerea emailului utilizatorului.' });
}

// Inserare în tabela utilizatori
const { data: utilRows, error: utilError } = await supabase
  .from('utilizatori')
  .insert({
    auth_id: authUser.id,
    email: email,
    rol,
    data_creare: new Date().toISOString()
  })
  .select('id_utilizator')
  .single();
if (utilError) throw utilError;

    // Optionally insert into angajati table
    if (angajat) {
      const angajatData = {
        id_utilizator: utilRows.id_utilizator,
        nume: angajat.nume,
        prenume: angajat.prenume,
        nr_legitimatie: angajat.nr_legitimatie,
        id_divizie: angajat.id_divizie,
        cod_bluetooth: angajat.cod_bluetooth,
        identificator_smartphone: angajat.identificator_smartphone,
        nr_masina: angajat.nr_masina,
        acces_activ: angajat.acces_activ ?? true,
        badge_acordat_de: angajat.badge_acordat_de,
        data_creare: new Date().toISOString()
      };
      const { error: angError } = await supabase.from('angajati').insert(angajatData);
      if (angError) throw angError;
    }

    return res.status(201).json({
      message: 'Înregistrare reușită',
      user: {
        id_utilizator: utilRows.id_utilizator,
        auth_id: authUser.id,
        email: authUser.email,
        rol
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

