const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});
// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ HR Management API is running' });
});

// Routes (we will add these one by one)

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