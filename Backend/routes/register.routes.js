const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Utilizator = require('../models/utilizator');

router.post('/register', async (req, res) => {
    try {
        const { nume_utilizator, parola, rol } = req.body;

        // Input validation
        if (!nume_utilizator || !parola) {
            return res.status(400).json({
                error: 'Numele de utilizator și parola sunt obligatorii'
            });
        }

        // Check if username already exists
        const existingUser = await Utilizator.findOne({
            where: { nume_utilizator }
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'Acest nume de utilizator există deja'
            });
        }

        // Hash the password
        const saltRounds = 10;
        const parola_hash = await bcrypt.hash(parola, saltRounds);

        // Create new user
        const newUser = await Utilizator.create({
            nume_utilizator,
            parola_hash,
            rol: rol || 'Angajat', // Default role if not specified
            data_creare: new Date()
        });

        // Remove password hash from response
        const userResponse = {
            id_utilizator: newUser.id_utilizator,
            nume_utilizator: newUser.nume_utilizator,
            rol: newUser.rol,
            data_creare: newUser.data_creare
        };

        res.status(201).json({
            message: 'Utilizator înregistrat cu succes',
            user: userResponse
        });

    } catch (error) {
        console.error('Eroare la înregistrare:', error);
        res.status(500).json({
            error: 'Eroare la înregistrarea utilizatorului'
        });
    }
});

module.exports = router;