const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with error checking
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('FATAL ERROR: Missing Supabase credentials (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1); // Exit if credentials are not set
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST / (mounted at /api/adaugare-vizitator)
router.post('/', async (req, res) => {
    try {
        const { nume, tip_log, data_log } = req.body;
        
        console.log('Received data for new visitor log:', { nume, tip_log, data_log }); // Debug log

        // Validate required fields
        if (!nume || typeof nume !== 'string' || !nume.trim()) {
            return res.status(400).json({ error: 'Numele este obligatoriu și trebuie să fie un text valid.' });
        }
        
        // Convert "intrare"/"iesire" to "IN"/"OUT" if they're sent from frontend
        let displayTipLog = tip_log;
        if (tip_log === 'intrare') displayTipLog = 'IN';
        if (tip_log === 'iesire') displayTipLog = 'OUT';
        
        // Validate tip_log after conversion
        if (!displayTipLog || (displayTipLog !== 'IN' && displayTipLog !== 'OUT')) {
            return res.status(400).json({ 
                error: 'Tipul logului este obligatoriu și trebuie să fie "IN" sau "OUT".' 
            });
        }
        
        if (!data_log) {
            return res.status(400).json({ error: 'Data logului este obligatorie.' });
        }

        // Parse and validate date
        const logDate = new Date(data_log);
        if (isNaN(logDate.getTime())) {
            return res.status(400).json({ error: 'Format invalid pentru data logului.' });
        }

        // Proceed with insert using the display value
        const { data, error: insertError } = await supabase
            .from('vizitatori')
            .insert([{
                nume: nume.trim(),
                tip_log: displayTipLog, // Store "IN" or "OUT" in the database
                data_log: logDate.toISOString()
            }])
            .select()
            .single();

        if (insertError) {
            console.error('Supabase insert error:', insertError);
            return res.status(400).json({
                error: 'Eroare la inserarea înregistrării în baza de date.',
                details: insertError.message,
                code: insertError.code
            });
        }

        return res.status(201).json({
            message: 'Înregistrare vizitator adăugată cu succes!',
            data
        });

    } catch (err) {
        console.error('Unexpected server error in adaugare-vizitator:', err);
        return res.status(500).json({
            error: 'Eroare internă a serverului.',
            details: err.message
        });
    }
});

module.exports = router;
