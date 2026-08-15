import { Router } from 'express';
import { handleSupabaseWebhook } from './webhook.controller';

const router = Router();

// Cette route doit être protégée par une clé secrète dans un cas réel
router.post('/supabase', handleSupabaseWebhook);

export default router;
