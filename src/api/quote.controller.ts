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

    // Récupérer le token push de l'artisan
    const { data: artisan } = await supabase
      .from('profiles')
      .select('full_name, expo_push_token')
      .eq('id', artisan_id)
      .single();

    if (artisan?.expo_push_token) {
      await sendPushNotification(
        artisan.expo_push_token,
        'Nouveau devis !',
        `Vous avez reçu une nouvelle demande de devis de la part d'un client.`,
        { quoteId: quote.id }
      );
    }

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
    const { data: client } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', data.client_id)
      .single();

    if (client?.expo_push_token) {
      await sendPushNotification(
        client.expo_push_token,
        'Mise à jour de votre devis',
        `Votre demande de devis est maintenant : ${status}${price ? ` (Prix: ${price}€)` : ''}`,
        { quoteId: id }
      );
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
