require('dotenv').config(); // Ensure this is at the top
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const registerRoutes = require('./routes/register.routes');
const loginRoutes = require('./routes/login.routes');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


// Add after app initialization, before routes
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'"
  );
  next();
});

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Example route to test database connection
app.post('/test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('utilizatori').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ensure this route is defined before creating the HTTP server
app.post('/receive-data', async (req, res) => {
  try {
    // Check if the request has the expected string data
    if (!req.body.data) {
      return res.status(400).json({ error: 'No data field in request body' });
    }

    // Log the received string data
    console.log("Received string from ESP:", req.body.data);

    res.status(200).json({ 
      message: "Data received successfully",
      received: req.body.data
    });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move routes before WebSocket setup
app.use('/api', registerRoutes);
app.use('/api', loginRoutes);
const utilizatoriRouter = require('./routes/utilizatori.routes');
app.use('/api', utilizatoriRouter);
const loguriRoutes = require('./routes/loguri.routes');
app.use('/api', loguriRoutes);
const normalLoguriRoutes = require('./routes/normal-loguri.routes');
app.use('/api', normalLoguriRoutes);

// Create HTTP server after all routes are defined
const server = http.createServer(app);


// Replace your existing server start with this:
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
});