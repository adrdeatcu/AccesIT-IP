const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/register', async (req, res) => {
    try {
        const { nume_utilizator, parola, rol, angajat } = req.body;

        // Input validation - only check username and password
        if (!nume_utilizator || !parola) {
            return res.status(400).json({ error: 'Numele de utilizator și parola sunt obligatorii' });
        }

        // Check if username already exists (no CNP check)
        const { data: existingUser, error: findError } = await supabase
            .from('utilizatori')
            .select('*')
            .eq('nume_utilizator', nume_utilizator)
            .single();

        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }

        if (existingUser) {
            return res.status(400).json({ error: 'Numele de utilizator există deja' });
        }

        // Hash password
        const parola_hash = await bcrypt.hash(parola, 10);

        // Insert new user
        const { data: newUser, error: insertError } = await supabase
            .from('utilizatori')
            .insert([
                {
                    nume_utilizator,
                    parola_hash,
                    rol: rol || 'Normal',
                    data_creare: new Date()
                }
            ])
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        // Insert employee data with all required fields
        if (angajat) {
            const currentTime = new Date().toISOString();
            const { error: angajatError } = await supabase
                .from('angajati')
                .insert([
                    {
                        id_utilizator: newUser.id_utilizator,
                        prenume: angajat.prenume,
                        nume: angajat.nume,
                        cnp: angajat.cnp,
                        poza: angajat.poza,
                        nr_legitimatie: angajat.nr_legitimatie,
                        id_divizie: angajat.id_divizie,
                        cod_bluetooth: angajat.cod_bluetooth,
                        identificator_smartphone: angajat.identificator_smartphone,
                        nr_masina: angajat.nr_masina,
                        acces_activ: angajat.acces_activ, // Use the value from frontend
                        cnp_acordat_de: angajat.cnp_acordat_de,
                        badge_acordat_de: angajat.badge_acordat_de,
                        data_acordarii: currentTime,
                        data_modificare: null
                    }
                ]);

            if (angajatError) {
                // If employee creation fails, delete the user
                await supabase
                    .from('utilizatori')
                    .delete()
                    .eq('id_utilizator', newUser.id_utilizator);
                
                throw angajatError;
            }
        }

        res.status(201).json({
            message: 'Utilizator și angajat înregistrați cu succes',
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