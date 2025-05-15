const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const router = express.Router();

const handleSendString = async (req, res) => {
    try {
        // Debug logs
        console.log('\n🔄 Request received:');
        console.log('📍 URL:', req.originalUrl);
        console.log('📦 Headers:', req.headers);
        console.log('📄 Body:', req.body);
        
        const receivedId = req.body?.id;
        const direction = req.body?.direction?.toUpperCase();
        
        if (!receivedId || !direction) {
            console.log('⚠️ Warning: Missing data');
            return res.json({ access: false });
        }

        if (direction !== 'IN' && direction !== 'OUT') {
            console.log('⚠️ Invalid direction:', direction);
            return res.json({ access: false });
        }

        // Check user access in database
        const { data: angajat, error } = await supabase
            .from('angajati')
            .select('*')
            .eq('id_utilizator', receivedId)
            .single();

        if (error || !angajat || !angajat.acces_activ) {
            console.log('⚠️ Access denied for ID:', receivedId);
            return res.json({ access: false });
        }

        // Log successful access with correct column names
        const { error: logError } = await supabase
            .from('loguri_prezenta')
            .insert([{
                id_utilizator: receivedId,
                tip_log: direction,
                data_log: new Date().toISOString() // Using data_log instead of timestamp
            }]);

        if (logError) {
            console.error('❌ Error logging presence:', logError);
            return res.json({ access: false });
        }

        // Use data_log in console output
        const currentTime = new Date().toISOString();
        console.log('\n✅ Access Granted:');
        console.log('📅 Time:', currentTime);
        console.log('👤 User ID:', receivedId);
        console.log('🚪 Direction:', direction);
        console.log('-------------------');

        return res.json({ access: true });

    } catch (error) {
        console.error('❌ Error:', error);
        return res.json({ access: false });
    }
};

module.exports = {
    handleSendString
};