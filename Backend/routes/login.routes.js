const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/login', async (req, res) => {
    try {
        const { nume_utilizator, parola } = req.body;

        // Input validation
        if (!nume_utilizator || !parola) {
            return res.status(400).json({ error: 'Numele de utilizator și parola sunt obligatorii' });
        }

        // Find user by username
        const { data: user, error: findError } = await supabase
            .from('utilizatori')
            .select('*')
            .eq('nume_utilizator', nume_utilizator)
            .single();

        if (findError) {
            throw findError;
        }

        if (!user) {
            return res.status(401).json({ error: 'Nume de utilizator sau parolă incorecte' });
        }

        // Compare passwords
        const validPassword = await bcrypt.compare(parola, user.parola_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Nume de utilizator sau parolă incorecte' });
        }

        // Send success response
        res.json({
            message: 'Autentificare reușită',
            user: {
                id_utilizator: user.id_utilizator,
                nume_utilizator: user.nume_utilizator,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Eroare la autentificare:', error);
        res.status(500).json({ error: error.message || 'Eroare la autentificare' });
    }
});

module.exports = router;