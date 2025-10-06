require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const jobsRoutes = require('./routes/jobs');
const invoicesRoutes = require('./routes/invoices');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/invoices', invoicesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));