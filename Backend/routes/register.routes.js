const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/register', async (req, res) => {
    try {
        const { nume_utilizator, parola, rol } = req.body;

        // Input validation
        if (!nume_utilizator || !parola) {
            return res.status(400).json({ error: 'Numele de utilizator și parola sunt obligatorii' });
        }

        // Check if username already exists
        const { data: existingUser, error: findError } = await supabase
            .from('utilizatori')
            .select('*')
            .eq('nume_utilizator', nume_utilizator)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            // Handle unexpected errors
            throw findError;
        }

        if (existingUser) {
            return res.status(409).json({ error: 'Acest nume de utilizator există deja' });
        }

        // Hash the password
        const saltRounds = 10;
        const parola_hash = await bcrypt.hash(parola, saltRounds);

        // Insert new user into the database
        const { data: newUser, error: insertError } = await supabase
            .from('utilizatori')
            .insert([
                {
                    nume_utilizator,
                    parola_hash,
                    rol: rol || 'Normal', // Default role if not specified
                    data_creare: new Date()
                }
            ])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // Respond with the newly created user (excluding the password hash)
        res.status(201).json({
            message: 'Utilizator înregistrat cu succes',
            user: {
                id_utilizator: newUser.id_utilizator,
                nume_utilizator: newUser.nume_utilizator,
                rol: newUser.rol,
                data_creare: newUser.data_creare
            }
        });
    } catch (error) {
        console.error('Eroare la înregistrare:', error);
        res.status(500).json({ error: error.message || 'Eroare la înregistrarea utilizatorului' });
    }
});

module.exports = router;