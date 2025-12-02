import 'react-native-get-random-values'; // Importation nécessaire pour le polyfill
import { v4 as uuidv4 } from 'uuid'; // Pour générer un ID unique

/**
 * Calcule la durée en minutes entre deux dates.
 */
export const calculateDuration = (entryTime, exitTime) => {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const durationMs = exit - entry; // Différence en millisecondes
  return Math.floor(durationMs / 60000); // Conversion en minutes
};

/**
 * Calcule le montant à payer.
 * La règle métier est : "toute heure commencée est due".
 */
export const calculatePrice = (entryTime, exitTime, pricePerHour) => {
  const durationMinutes = calculateDuration(entryTime, exitTime);
  // Math.ceil arrondit à l'entier supérieur.
  // Ex: 1 minute -> 1 heure, 61 minutes -> 2 heures.
  const hours = Math.ceil(durationMinutes / 60);
  return hours * pricePerHour;
};

/**
 * Formate une date en heure lisible (ex: "14h20").
 * padStart(2, '0') assure qu'on a toujours deux chiffres (ex: 09:05).
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}h${minutes}`;
};

/**
 * Formate une durée en minutes en une chaîne lisible (ex: "2h 30min").
 */
export const formatDuration = (minutes) => {
  if (minutes < 0) return '0min';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (mins > 0 || hours === 0) {
    parts.push(`${mins}min`);
  }
  return parts.join(' ');
};

/**
 * Récupère la date et l'heure actuelle au format ISO String pour le stockage.
 */
export const getCurrentDateTime = () => {
  return new Date().toISOString();
};