const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// DELETE /api/delete-user/:id
router.delete('/:id', async (req, res) => {
    try {
      const id_utilizator = req.params.id;  // correctly extract id param
  
      // 1. Delete from loguri_prezenta
      let { error } = await supabase
        .from('loguri_prezenta')
        .delete()
        .eq('id_utilizator', id_utilizator);
      if (error) throw error;
  
      // 2. Delete from interval_acces_angajati
      ({ error } = await supabase
        .from('interval_acces_angajati')
        .delete()
        .eq('id_utilizator', id_utilizator));
      if (error) throw error;
  
      // 3. Delete from angajati
      ({ error } = await supabase
        .from('angajati')
        .delete()
        .eq('id_utilizator', id_utilizator));
      if (error) throw error;
  
      // 4. Delete from utilizatori_divizii
      ({ error } = await supabase
        .from('utilizatori_divizii')
        .delete()
        .eq('id_utilizator', id_utilizator));
      if (error) throw error;
  
      // 5. Finally delete from utilizatori
      ({ error } = await supabase
        .from('utilizatori')
        .delete()
        .eq('id_utilizator', id_utilizator));
      if (error) throw error;
  
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
