import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import connectDB from './config/db';

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Prathik Automated Trading Backend API is Running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
