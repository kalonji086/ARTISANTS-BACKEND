import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getArtisans = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, category } = req.query;

    let query = supabase
      .from('profiles')
      .select('*, portfolio_items(*)')
      .eq('role', 'artisan')
      .eq('is_available', true);

    if (category) {
      // Logique simplifiée pour l'exemple, nécessite une jointure ou filtrage sur artisan_services
      console.log('Filtrage par catégorie:', category);
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
