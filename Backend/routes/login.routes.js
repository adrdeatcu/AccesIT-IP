const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY  // anon/public key
);

// POST /api/login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email și password sunt obligatorii.' });
    }

    // Authenticate via Supabase
    const { data: { session, user }, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !session) {
      return res.status(401).json({ error: signInError?.message || 'Autentificare eșuată.' });
    }

    // Fetch application user record
    const { data: utilUser, error: fetchError } = await supabase
      .from('utilizatori')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    if (fetchError || !utilUser) {
      return res.status(404).json({ error: 'User application record not found.' });
    }

    return res.json({
      message: 'Login reușit',
      token: session.access_token,
      user: {
        id_utilizator: utilUser.id_utilizator,
        auth_id: user.id,
        email: utilUser.email,
        rol: utilUser.rol
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
