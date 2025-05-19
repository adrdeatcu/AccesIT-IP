require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
const apiRoutes = require('./routes/api.routes');
const adminProfileRoutes = require('./routes/admin-profile.routes');

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
(async function testConnection() {
  try {
    const { data, error } = await supabase.from('utilizatori').select('count').single();
    if (error) throw error;
    console.log('🚀 Conectare reușită la baza de date Supabase!');
  } catch (error) {
    console.error('❌ Eroare la conectarea cu baza de date:', error.message);
    process.exit(1);
  }
})();

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

// Mount each router under its own path
console.log('✅ Mounting register at /api/register');
app.use('/api/register', routes.register);

console.log('✅ Mounting login at /api/login');
app.use('/api/login', routes.login);

console.log('✅ Mounting utilizatori at /api/utilizatori');
app.use('/api/utilizatori', routes.utilizatori);

console.log('✅ Mounting loguri at /api/loguri');
app.use('/api/loguri', routes.loguri);

console.log('✅ Mounting normal-loguri at /api/normal-loguri');
app.use('/api/normal-loguri', routes.normalLoguri);

console.log('✅ Mounting divizii at /api/divizii');
app.use('/api/divizii', routes.divizii);

console.log('✅ Mounting angajati at /api/angajati');
app.use('/api/angajati', routes.angajati);

console.log('✅ Mounting log-manual at /api/log-manual');
app.use('/api/log-manual', routes.logManual);

console.log('✅ Mounting delete-log at /api/delete-log');
app.use('/api/delete-log', routes.deleteLog);

console.log('✅ Mounting adaugare-vizitator at /api/adaugare-vizitator');
app.use('/api/adaugare-vizitator', routes.addVisitor);

console.log('✅ Mounting prenume at /api/prenume');
app.use('/api/prenume', routes.prenume);

console.log('✅ Mounting vizitatori at /api/vizitatori');
app.use('/api/vizitatori', routes.vizitatori);

console.log('✅ Mounting normal-profile at /api/normal-profile');
app.use('/api/normal-profile', routes.normalProfile);

console.log('✅ Mounting delete-user at /api/delete-user');
app.use('/api/delete-user', routes.deleteUser);

// Mount all other API routes under /api
console.log('✅ Mounting additional API routes at /api');
app.use('/api', routes.api);

// Mount admin-profile routes
console.log('✅ Mounting admin-profile at /api/admin-profile');
app.use('/api/admin-profile', adminProfileRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
