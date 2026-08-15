import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { sendPushNotification } from '../services/notification.service';

export const createQuoteRequest = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { artisan_id, service_id, description } = req.body;

  try {
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        client_id: user.id,
        artisan_id,
        service_id,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Récupérer le token push de l'artisan (à stocker dans profiles)
    const { data: artisan } = await supabase
      .from('profiles')
      .select('full_name, avatar_url') // Imaginez qu'il y a un champ expo_push_token
      .eq('id', artisan_id)
      .single();

    // Simulation d'envoi de notification (si le token existait)
    console.log(`Notification envoyée à l'artisan ${artisan_id} pour un nouveau devis.`);

    res.status(201).json(quote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateQuoteStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, price } = req.body;

  try {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status, price })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notifier le client du changement de statut
    console.log(`Notification envoyée au client pour le devis ${id}: ${status}`);

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
