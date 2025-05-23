const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Ensure you are using the SERVICE_ROLE_KEY for admin operations like deleting users
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use SERVICE_ROLE_KEY
);

// DELETE /api/delete-user/:id_utilizator
router.delete('/:id_utilizator', async (req, res) => {
    const { id_utilizator } = req.params; // This is the PK from your public.utilizatori table

    if (!id_utilizator) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        console.log(`Attempting to delete user with id_utilizator: ${id_utilizator}`);

        // 0. Get the auth_id from the utilizatori table
        const { data: userData, error: fetchError } = await supabase
            .from('utilizatori')
            .select('auth_id')
            .eq('id_utilizator', id_utilizator)
            .single();

        if (fetchError) {
            console.error('Error fetching user auth_id:', fetchError);
            // If user not found in utilizatori, they might have been partially deleted or ID is wrong
            if (fetchError.code === 'PGRST116') { // PGRST116: "The result contains 0 rows"
                 return res.status(404).json({ error: 'User not found in utilizatori table.' });
            }
            throw fetchError;
        }
        if (!userData || !userData.auth_id) {
            // This case should ideally be caught by PGRST116, but as a safeguard:
            return res.status(404).json({ error: 'User found in utilizatori, but auth_id is missing.' });
        }
        const auth_id_to_delete = userData.auth_id;
        console.log(`Found auth_id: ${auth_id_to_delete} for id_utilizator: ${id_utilizator}`);


        // 1. Delete from loguri_prezenta (if it has a direct FK to utilizatori.id_utilizator)
        let { error } = await supabase
            .from('loguri_prezenta')
            .delete()
            .eq('id_utilizator', id_utilizator);
        if (error) {
            console.error('Error deleting from loguri_prezenta:', error);
            throw error;
        }
        console.log(`Deleted from loguri_prezenta for id_utilizator: ${id_utilizator}`);

        // 2. Delete from interval_acces_angajati
        ({ error } = await supabase
            .from('interval_acces_angajati')
            .delete()
            .eq('id_utilizator', id_utilizator));
        if (error) {
            console.error('Error deleting from interval_acces_angajati:', error);
            throw error;
        }
        console.log(`Deleted from interval_acces_angajati for id_utilizator: ${id_utilizator}`);

        // 3. Delete from angajati
        ({ error } = await supabase
            .from('angajati')
            .delete()
            .eq('id_utilizator', id_utilizator));
        if (error) {
            console.error('Error deleting from angajati:', error);
            throw error;
        }
        console.log(`Deleted from angajati for id_utilizator: ${id_utilizator}`);

        // 4. Delete from utilizatori_divizii
        ({ error } = await supabase
            .from('utilizatori_divizii')
            .delete()
            .eq('id_utilizator', id_utilizator));
        if (error) {
            console.error('Error deleting from utilizatori_divizii:', error);
            throw error;
        }
        console.log(`Deleted from utilizatori_divizii for id_utilizator: ${id_utilizator}`);

        // 5. Delete from utilizatori (your public profile table)
        ({ error } = await supabase
            .from('utilizatori')
            .delete()
            .eq('id_utilizator', id_utilizator));
        if (error) {
            console.error('Error deleting from utilizatori:', error);
            // If this fails, we might not want to delete the auth user yet,
            // or handle it based on policy. For now, we throw.
            throw error;
        }
        console.log(`Deleted from utilizatori for id_utilizator: ${id_utilizator}`);

        // 6. Finally, delete the user from Supabase Auth
        console.log(`Attempting to delete auth user with auth_id: ${auth_id_to_delete}`);
        const { data: authDeleteData, error: authDeleteError } = await supabase.auth.admin.deleteUser(
            auth_id_to_delete
        );

        if (authDeleteError) {
            console.error('Error deleting user from Supabase Auth:', authDeleteError);
            // This is a critical error. The public profile data might be deleted,
            // but the auth user still exists. This might require manual cleanup.
            // You could choose to return a specific error message indicating partial success/failure.
            return res.status(500).json({
                error: 'Failed to delete user from authentication system. Public data may have been removed.',
                details: authDeleteError.message
            });
        }
        console.log('Successfully deleted user from Supabase Auth:', authDeleteData);

        res.status(200).json({ message: 'User and all associated data deleted successfully' });

    } catch (error) {
        console.error('Overall error in delete user route:', error);
        res.status(500).json({
            error: 'Failed to delete user due to an internal error.',
            details: error.message,
            code: error.code
        });
    }
});

module.exports = router;
