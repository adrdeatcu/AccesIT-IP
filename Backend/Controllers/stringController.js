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
        
        // Get id_utilizator from ESP32's payload
        const receivedString = req.body?.string;
        
        if (!receivedString) {
            console.log('⚠️ Warning: No ID received');
            return res.status(400).json({ 
                success: false,
                access: false,
                message: 'No ID provided' 
            });
        }

        // Check user access in database
        const { data: angajat, error } = await supabase
            .from('angajati')
            .select('*')
            .eq('id_utilizator', receivedString)
            .single();

        if (error) {
            console.error('❌ Database error:', error);
            return res.status(500).json({ 
                success: false,
                access: false,
                message: 'Database error' 
            });
        }

        if (!angajat) {
            console.log('⚠️ User not found:', receivedString);
            return res.status(403).json({ 
                success: true,
                access: false,
                message: 'Access denied - User not found' 
            });
        }

        // Check if user has active access
        if (!angajat.acces_activ) {
            console.log('⚠️ Access inactive for user:', receivedString);
            return res.status(403).json({ 
                success: true,
                access: false,
                message: 'Access denied - Access inactive' 
            });
        }

        // Log successful access
        const timestamp = new Date().toISOString();
        await supabase
            .from('loguri')
            .insert([{
                id_utilizator: receivedString,
                timestamp: timestamp,
                tip_log: 'ESP32_ACCESS',
                status: 'SUCCESS'
            }]);

        console.log('\n✅ Access Granted:');
        console.log('📅 Time:', timestamp);
        console.log('👤 User ID:', receivedString);
        console.log('-------------------');

        res.status(200).json({ 
            success: true,
            access: true,
            message: 'Access granted',
            timestamp
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            success: false,
            access: false,
            message: error.message 
        });
    }
};

module.exports = {
    handleSendString
};