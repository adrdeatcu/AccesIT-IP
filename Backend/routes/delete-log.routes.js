const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.delete('/delete-log/:id_log', async (req, res) => {
    try {
        const { id_log } = req.params;

        // Delete the log entry
        const { error } = await supabase
            .from('loguri_prezenta')
            .delete()
            .eq('id_log', id_log);

        if (error) {
            throw error;
        }

        res.status(200).json({ message: 'Log deleted successfully' });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ error: 'Failed to delete log' });
    }
});

module.exports = router;