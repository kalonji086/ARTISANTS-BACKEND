import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Session invalide' });
    }

    (req as any).user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de l\'authentification' });
  }
};
