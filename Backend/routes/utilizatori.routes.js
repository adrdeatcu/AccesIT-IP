const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/utilizatori', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('utilizatori')
            .select('id_utilizator, nume_utilizator, rol, data_creare');

        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

router.delete('/utilizatori/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Delete from interval_acces_angajati table
        const { error: intervalError } = await supabase
            .from('interval_acces_angajati')
            .delete()
            .eq('id_utilizator', id);

        if (intervalError) {
            console.error('Error deleting from interval_acces_angajati:', intervalError);
            return res.status(500).json({ 
                error: 'Eroare la ștergerea intervalelor de acces'
            });
        }

        // 2. Delete from loguri_prezenta table
        const { error: loguriError } = await supabase
            .from('loguri_prezenta')
            .delete()
            .eq('id_utilizator', id);

        if (loguriError) {
            console.error('Error deleting from loguri_prezenta:', loguriError);
            return res.status(500).json({ 
                error: 'Eroare la ștergerea logurilor de prezență'
            });
        }

        // 3. Delete from utilizatori_divizii table
        const { error: diviziiError } = await supabase
            .from('utilizatori_divizii')
            .delete()
            .eq('id_utilizator', id);

        if (diviziiError) {
            console.error('Error deleting from utilizatori_divizii:', diviziiError);
            return res.status(500).json({ 
                error: 'Eroare la ștergerea asocierilor cu divizii'
            });
        }

        // 4. Delete from angajati table
        const { error: angajatiError } = await supabase
            .from('angajati')
            .delete()
            .eq('id_utilizator', id);

        if (angajatiError) {
            console.error('Error deleting from angajati:', angajatiError);
            return res.status(500).json({ 
                error: 'Eroare la ștergerea angajatului'
            });
        }

        // 5. Finally delete from utilizatori table
        const { error: utilizatoriError } = await supabase
            .from('utilizatori')
            .delete()
            .eq('id_utilizator', id);

        if (utilizatoriError) {
            console.error('Error deleting from utilizatori:', utilizatoriError);
            return res.status(500).json({ 
                error: 'Eroare la ștergerea utilizatorului'
            });
        }
        
        res.json({ message: 'Utilizator șters cu succes' });
    } catch (error) {
        console.error('Error in delete cascade:', error);
        res.status(500).json({ 
            error: 'Eroare la ștergerea utilizatorului și a datelor asociate'
        });
    }
});

module.exports = router;