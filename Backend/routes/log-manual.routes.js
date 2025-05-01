const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/loguri-manuale', async (req, res) => {

});

router.post('/loguri-manuale', async (req, res) => {
    try {
        const { id_utilizator, tip_log } = req.body;
        
        // Validate input
        if (!id_utilizator || !tip_log) {
            return res.status(400).json({ error: 'ID utilizator și tipul de log sunt obligatorii' });
        }

        if (!['IN', 'OUT'].includes(tip_log)) {
            return res.status(400).json({ error: 'Tipul de log trebuie să fie IN sau OUT' });
        }

        // Check if user exists
        const { data: existingUser, error: userError } = await supabase
            .from('utilizatori')
            .select('id_utilizator')
            .eq('id_utilizator', id_utilizator)
            .single();

        if (userError || !existingUser) {
            return res.status(404).json({ error: 'Utilizatorul nu există' });
        }

        const { data, error } = await supabase
            .from('loguri_prezenta')
            .insert([
                {
                    id_utilizator,
                    tip_log,
                    data_log: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating manual log:', error);
        res.status(500).json({ error: 'Eroare la crearea logului manual' });
    }
});

module.exports = router;
