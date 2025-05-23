const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const util = require('util');

// Initialize Supabase client with error checking
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase credentials');
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Change from '/adaugare-vizitator' to just '/'
router.post('/', async (req, res) => {
    try {
        const { nume, ora_intrare, ora_iesire } = req.body;
        
        console.log('Received data:', { nume, ora_intrare, ora_iesire }); // Debug log

        // Validate required fields
        if (!nume?.trim()) {
            return res.status(400).json({ error: 'Numele este obligatoriu' });
        }

        // Parse and validate dates
        const intrareDate = new Date(ora_intrare);
        const iesireDate = new Date(ora_iesire);

        if (isNaN(intrareDate.getTime()) || isNaN(iesireDate.getTime())) {
            return res.status(400).json({ error: 'Format invalid pentru dată și oră' });
        }

        if (iesireDate < intrareDate) {
            return res.status(400).json({ error: 'Ora ieșirii nu poate fi mai mică decât ora intrării' });
        }

        // Proceed with insert
        const { data, error: insertError } = await supabase
            .from('vizitatori')
            .insert([{
                nume: nume.trim(),
                ora_intrare: intrareDate.toISOString(),
                ora_iesire: iesireDate.toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Insert error:', insertError);
            return res.status(400).json({
                error: 'Eroare la inserare în baza de date',
                details: insertError.message
            });
        }

        return res.status(201).json({
            message: 'Vizitator adăugat cu succes!',
            data
        });

    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({
            error: 'Eroare internă a serverului',
            details: err.message
        });
    }
});

module.exports = router;
