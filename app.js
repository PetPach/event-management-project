require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const app = express();

const port = process.env.APP_PORT || 5000;

// Middleware
app.use(express.json({ extended: false }));


app.get('/', (req, res) => {
    res.send('Hello world');
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', protectedRoutes);

app.listen(port, () => {
    console.log(`App running in http://localhost:${port}`);
});

connectDB()