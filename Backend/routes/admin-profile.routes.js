const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.put('/admin-profile/:id', async (req, res) => {
    const { id } = req.params;
    const { nume_utilizator, newPassword, rol, angajat } = req.body;

    try {
        // Build update payload
        const updatePayload = {};
        
        if (nume_utilizator) updatePayload.nume_utilizator = nume_utilizator;
        if (rol) updatePayload.rol = rol;
        
        // If password change requested, hash it
        if (newPassword) {
            updatePayload.parola_hash = await bcrypt.hash(newPassword, 10);
        }

        // Update utilizator
        if (Object.keys(updatePayload).length > 0) {
            const { error: utilError } = await supabase
                .from('utilizatori')
                .update(updatePayload)
                .eq('id_utilizator', id);

            if (utilError) throw utilError;
        }

        // Update angajat if provided
        if (angajat) {
            const { error: angError } = await supabase
                .from('angajati')
                .update(angajat)
                .eq('id_utilizator', id);

            if (angError) throw angError;
        }

        res.json({ 
            success: true,
            message: 'Profile updated successfully' 
        });

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ 
            error: 'Error updating profile', 
            details: err.message 
        });
    }
});

module.exports = router;