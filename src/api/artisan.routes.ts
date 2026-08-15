import { Router } from 'express';
import { getArtisans, updateArtisanProfile } from './artisan.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getArtisans);
router.put('/profile', authenticate, updateArtisanProfile);

export default router;
