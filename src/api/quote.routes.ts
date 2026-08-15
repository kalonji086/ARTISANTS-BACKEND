import { Router } from 'express';
import { createQuoteRequest, updateQuoteStatus } from './quote.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createQuoteRequest);
router.patch('/:id', authenticate, updateQuoteStatus);

export default router;
