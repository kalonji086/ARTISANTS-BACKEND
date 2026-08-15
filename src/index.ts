import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';

import artisanRoutes from './api/artisan.routes';
import quoteRoutes from './api/quote.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/artisans', artisanRoutes);
app.use('/api/quotes', quoteRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API ARTISANTS 🚀', status: 'OK' });
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
