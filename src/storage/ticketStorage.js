import AsyncStorage from '@react-native-async-storage/async-storage';

// On définit des clés uniques pour nos deux listes de données
const ACTIVE_TICKETS_KEY = '@ticket_parking:active_tickets';
const HISTORY_TICKETS_KEY = '@ticket_parking:history_tickets';

/**
 * Récupère les tickets actifs.
 * Toutes les fonctions ici sont async car le stockage est une opération asynchrone.
 */
export const getActiveTickets = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(ACTIVE_TICKETS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erreur de récupération (actifs):', e);
    return [];
  }
};

/**
 * Sauvegarde le tableau des tickets actifs.
 * JSON.stringify convertit notre tableau d'objets en une chaîne de caractères.
 */
export const saveActiveTickets = async (tickets) => {
  try {
    const jsonValue = JSON.stringify(tickets);
    await AsyncStorage.setItem(ACTIVE_TICKETS_KEY, jsonValue);
    return true;
  } catch (e) {
    console.error('Erreur de sauvegarde (actifs):', e);
    return false;
  }
};

// Les fonctions getHistoryTickets et saveHistoryTickets sont identiques, adaptées à la clé d'historique
export const getHistoryTickets = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(HISTORY_TICKETS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erreur de récupération (historique):', e);
    return [];
  }
};

export const saveHistoryTickets = async (tickets) => {
  try {
    const jsonValue = JSON.stringify(tickets);
    await AsyncStorage.setItem(HISTORY_TICKETS_KEY, jsonValue);
    return true;
  } catch (e) {
    console.error('Erreur de sauvegarde (historique):', e);
    return false;
  }
};

/**
 * Ajoute un nouveau ticket à la liste des actifs.
 */
export const addTicket = async (ticket) => {
  const tickets = await getActiveTickets();
  tickets.push(ticket);
  return await saveActiveTickets(tickets);
};

/**
 * Clôture un ticket : le retire des actifs et l'ajoute à l'historique.
 */
export const closeTicket = async (ticketId, exitTime, totalAmount) => {
  try {
    const activeTickets = await getActiveTickets();
    const ticketIndex = activeTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) return false;

    const closedTicket = {
      ...activeTickets[ticketIndex],
      exitTime,
      totalAmount,
      status: 'closed'
    };

    activeTickets.splice(ticketIndex, 1);
    await saveActiveTickets(activeTickets);

    const historyTickets = await getHistoryTickets();
    historyTickets.push(closedTicket);
    await saveHistoryTickets(historyTickets);

    return true;
  } catch (e) {
    console.error('Erreur de clôture:', e);
    return false;
  }
};

/**
 * Supprime un ticket de l'historique.
 */
export const deleteHistoryTicket = async (ticketId) => {
  const historyTickets = await getHistoryTickets();
  const filteredTickets = historyTickets.filter(t => t.id !== ticketId);
  return await saveHistoryTickets(filteredTickets);
};

/**
 * Récupère un seul ticket actif par son ID.
 */
export const getTicketById = async (ticketId) => {
  const tickets = await getActiveTickets();
  return tickets.find(t => t.id === ticketId) || null;
};