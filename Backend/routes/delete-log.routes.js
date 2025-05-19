const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate id
        if (!id || id === 'undefined') {
            return res.status(400).json({ 
                error: 'Invalid log ID provided' 
            });
        }

        // Delete the log entry using 'id' instead of 'id_log'
        const { error } = await supabase
            .from('loguri_prezenta')
            .delete()
            .eq('id_log', id);  // Changed from 'id_log' to 'id'

        if (error) {
            throw error;
        }

        res.status(200).json({ 
            message: 'Log deleted successfully',
            deletedId: id 
        });
    } catch (error) {
        console.error('Error deleting log:', error);
        res.status(500).json({ 
            error: 'Failed to delete log',
            details: error.message 
        });
    }
});

module.exports = router;