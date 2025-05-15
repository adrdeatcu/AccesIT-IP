const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;

        // Input validation
        if (!email || !parola) {
            return res.status(400).json({ error: 'Email-ul și parola sunt obligatorii' });
        }

        // Find user by email
        const { data: users, error: findError } = await supabase
            .from('utilizatori')
            .select('*')
            .eq('email', email);

        if (findError) {
            console.error('Database error:', findError);
            throw findError;
        }

        // Check if any user was found
        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'Email sau parolă incorecte' });
        }

        const user = users[0];

        // Compare passwords
        const validPassword = await bcrypt.compare(parola, user.parola_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email sau parolă incorecte' });
        }

        // Generate JWT token 
        const token = jwt.sign(
            {
                id_utilizator: user.id_utilizator,
                email: user.email,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // Send success response
        res.json({
            message: 'Autentificare reușită',
            user: {
                id_utilizator: user.id_utilizator,
                email: user.email,
                rol: user.rol
            },
            token
        });

    } catch (error) {
        console.error('Eroare la autentificare:', error);
        res.status(500).json({ 
            error: 'Eroare la autentificare',
            details: error.message 
        });
    }
});

module.exports = router;