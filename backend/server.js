const express = require('express');
const cors = require('cors'); // Keep this one
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

// Middleware
// (I removed the duplicate 'const cors' line from here)

app.use(cors({
  origin: [
    'http://localhost:5173',           // local development
    'https://hrmanagementsystem.netlify.app'  // netlify url (Note: removed trailing slash for better matching)
  ],
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ HR Management API is running' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applicants', require('./routes/applicantRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});