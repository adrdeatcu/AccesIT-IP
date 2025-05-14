require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const apiRoutes = require('./routes/api.routes');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase client
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Test database connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('utilizatori').select('count').single();
        if (error) throw error;
        console.log('🚀 Conectare reușită la baza de date Supabase!');
        console.log('📊 Status: Activ și gata pentru operații');
    } catch (error) {
        console.error('❌ Eroare la conectarea cu baza de date:', error.message);
        process.exit(1);
    }
};

// Run the connection test
testConnection();

// Helper function to validate router
function validateRouter(router, name) {
    if (!router || typeof router.handle !== 'function') {
        console.error(`❌ Invalid router: ${name}`);
        process.exit(1);
    }
    return router;
}

// Import and validate all routes
const routes = {
    register: validateRouter(require('./routes/register.routes'), 'register'),
    login: validateRouter(require('./routes/login.routes'), 'login'),
    utilizatori: validateRouter(require('./routes/utilizatori.routes'), 'utilizatori'),
    loguri: validateRouter(require('./routes/loguri.routes'), 'loguri'),
    normalLoguri: validateRouter(require('./routes/normal-loguri.routes'), 'normalLoguri'),
    divizii: validateRouter(require('./routes/divizii.routes'), 'divizii'),
    angajati: validateRouter(require('./routes/angajati.routes'), 'angajati'),
    logManual: validateRouter(require('./routes/log-manual.routes'), 'logManual'),
    deleteLog: validateRouter(require('./routes/delete-log.routes'), 'deleteLog'),
    addVisitor: validateRouter(require('./routes/adaugare-vizitator.routes'), 'addVisitor'),
    prenume: validateRouter(require('./routes/prenume.routes'), 'prenume'),
    vizitatori: validateRouter(require('./routes/vizitatori.routes'), 'vizitatori'),
    normalProfile: validateRouter(require('./routes/normal-profile.routes'), 'normalProfile'),
    deleteUser: validateRouter(require('./routes/delete-user.routes'), 'deleteUser'),
    api: validateRouter(apiRoutes, 'api')
};

// Register routes
Object.entries(routes).forEach(([name, router]) => {
    console.log(`✅ Registering route: ${name}`);
    app.use('/api', router);
});

// Start the server
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`ESP32 test endpoint: http://localhost:${PORT}/api/test`);
});