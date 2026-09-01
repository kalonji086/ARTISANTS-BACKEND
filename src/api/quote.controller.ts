import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { sendPushNotification } from '../services/notification.service';

type AuthenticatedRequest = Request & { user?: { id: string } };

export const createQuoteRequest = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;
  const { artisan_id, service_id, description } = req.body;

  if (!user?.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  if (!artisan_id || !service_id || !String(description || '').trim()) {
    return res.status(400).json({ error: 'artisan_id, service_id et description sont requis' });
  }

  try {
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        client_id: user.id,
        artisan_id,
        service_id,
        description: String(description).trim(),
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la création du devis';
    res.status(500).json({ error: message });
  }
};

export const updateQuoteStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, price } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status requis' });
  }

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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue lors de la mise à jour du devis';
    res.status(500).json({ error: message });
  }
};
