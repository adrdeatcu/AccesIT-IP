const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const ANON_KEY = process.env.SUPABASE_KEY;
const URL      = process.env.SUPABASE_URL;

// POST /api/login
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email și password sunt obligatorii.' });
    }

    // 1) Sign in with anon key
    const supabase = createClient(URL, ANON_KEY);
    const {
      data: { session, user },
      error: signInError
    } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !session) {
      return res.status(401).json({
        error: signInError?.message || 'Autentificare eșuată.'
      });
    }

    // 2) Create a new client scoped with the user's access token
    const authClient = createClient(URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${session.access_token}` } }
    });

    // 3) Fetch the application record under RLS
    const { data: utilUser, error: fetchError } = await authClient
      .from('utilizatori')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (fetchError || !utilUser) {
      return res.status(404).json({ error: 'User application record not found.' });
    }

    // 4) Respond with token + user
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
