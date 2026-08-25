import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getArtisans = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, category } = req.query;

    if (lat && lng) {
      const { data, error } = await supabase.rpc('get_nearby_artisans', {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radius_meters: parseInt(radius as string) || 50000, // 50km par défaut
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
      // Pour une recherche simple sans lat/lng, on peut filtrer par catégorie via une jointure si nécessaire
      // Ici on suppose que profiles a une vue ou une relation simplifiée
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateArtisanProfile = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
