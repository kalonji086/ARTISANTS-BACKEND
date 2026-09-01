import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

type AuthenticatedRequest = Request & { user?: { id: string } };

export const getArtisans = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, category } = req.query;

    if (lat && lng) {
      const { data, error } = await supabase.rpc('get_nearby_artisans', {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radius_meters: parseInt(radius as string) || 50000,
        category_name: category || null
      });

      if (error) throw error;
      return res.json(data);
    }

    let query = supabase
      .from('profiles')
      .select('*, portfolio_items(*)')
      .eq('role', 'artisan')
      .eq('is_available', true);

    if (category) {
      // À compléter selon la structure réelle de données
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la récupération des artisans';
    res.status(500).json({ error: message });
  }
};

export const updateArtisanProfile = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const updates = req.body;

  if (!user?.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la mise à jour du profil';
    res.status(500).json({ error: message });
  }
};
