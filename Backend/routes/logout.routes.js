const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { authenticate } = require('../middleware/auth.middleware'); // To ensure only authenticated users can logout


if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("logout.routes.js: Supabase URL or Anon Key is missing. Check .env file.");
    // Optionally, throw an error or handle it to prevent the app from running misconfigured
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // ANON_KEY is typically used for user-specific auth operations
);

// POST /api/auth/logout
router.post('/', authenticate, async (req, res) => {
    try {
        // The `authenticate` middleware should have verified the token.
        // Supabase client, when initialized with a user's JWT (implicitly via `authenticate`
        // setting up the context or if the client library picks it up from headers),
        // will sign out the correct user.
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Supabase signOut error:', error);
            // Even if Supabase has an error, the client should still clear its token.
            // We can still return a 500 to indicate a server-side issue.
            return res.status(500).json({ message: 'Error signing out from Supabase.', details: error.message });
        }

        res.status(200).json({ message: 'Logged out successfully from server.' });
    } catch (err) {
        console.error('Logout route error:', err);
        res.status(500).json({ message: 'Server error during logout.', details: err.message });
    }
});

module.exports = router;