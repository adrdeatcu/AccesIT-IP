const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Verify the token and get user data
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            console.error('Auth error:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Add user data to request
        req.user = user;
        console.log('Authenticated user:', user); // Debug log

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

module.exports = { authenticate };