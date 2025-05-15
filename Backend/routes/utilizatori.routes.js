const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const authMiddleware = require('../middleware/auth.middleware');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.get('/utilizatori', async (req, res) => {
    try {
        const { 
            sortBy = 'id_utilizator', 
            sortOrder = 'asc',
            filterDate 
        } = req.query;
        
        // Debug logs
        console.log('Query params:', { sortBy, sortOrder, filterDate });
        
        const allowedSortColumns = ['id_utilizator', 'email', 'rol', 'data_creare'];
        const validSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'id_utilizator';
        
        // Build query
        let query = supabase
            .from('utilizatori')
            .select('*'); // Select all fields for now to debug

        // Add date filter if provided
        if (filterDate) {
            query = query.gte('data_creare', `${filterDate}T00:00:00`)
                        .lte('data_creare', `${filterDate}T23:59:59`);
        }

        // Add sorting
        query = query.order(validSortBy, { ascending: sortOrder === 'asc' });

        // Execute query and log results
        const { data, error } = await query;
        
        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        console.log(`Found ${data?.length || 0} users`);
        res.json(data || []);

    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ 
            error: 'Error fetching users',
            details: error.message
        });
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

router.get('/utilizatori/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id_utilizator;

        const { data, error } = await supabase
            .from('utilizatori')
            .select(`
                id_utilizator,
                email,
                rol,
                created_at,
                updated_at,
                angajati (
                    prenume,
                    nume,
                    cnp,
                    poza,
                    nr_legitimatie,
                    id_divizie,
                    cod_bluetooth,
                    identificator_smartphone,
                    nr_masina,
                    acces_activ,
                    cnp_acordat_de,
                    badge_acordat_de,
                    data_acordarii,
                    data_modificare
                )
            `)
            .eq('id_utilizator', userId)
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Error in GET /utilizatori/me:', err);
        res.status(500).json({ error: 'Eroare la încărcarea profilului' });
    }
});

module.exports = router;