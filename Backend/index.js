// Import required modules
require('dotenv').config(); // Ensure this is at the top
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const registerRoutes = require('./routes/register.routes');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

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
app.get('/test', async (req, res) => {
  try {
    const { data, error } = await supabase.from('utilizatori').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', registerRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});