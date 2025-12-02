import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatTime, formatDuration, calculateDuration } from '../utils/calculePrice';

/**
 * Composant de présentation pour un ticket.
 * @param {object} ticket - L'objet ticket à afficher.
 * @param {function} onPress - La fonction à appeler au clic.
 * @param {boolean} isHistory - Un booléen pour adapter l'affichage (ex: cacher le badge "En cours").
 */
const TicketItem = ({ ticket, onPress, isHistory = false }) => {
  // Calcul de la durée en temps réel pour les tickets actifs
  let durationText = '';
  
  if (!isHistory) {
    const now = new Date().toISOString();
    const durationMinutes = calculateDuration(ticket.entryTime, now);
    durationText = formatDuration(durationMinutes);
  } else {
    // Pour l'historique, on calcule la durée finale
    const durationMinutes = calculateDuration(ticket.entryTime, ticket.exitTime);
    durationText = formatDuration(durationMinutes);
  }

  return (
    // TouchableOpacity est une View qui réagit au toucher avec un effet d'opacité.
    <TouchableOpacity 
      style={[
        styles.container,
        isHistory && styles.historyContainer // Applique un style conditionnel
      ]} 
      onPress={onPress}
      disabled={isHistory} // On ne peut pas cliquer sur un ticket de l'historique
    >
      <View style={styles.header}>
        <Text style={styles.parkingName}>{ticket.parkingName}</Text>
        {isHistory && (
          <Text style={styles.amount}>{ticket.totalAmount} FCFA</Text>
        )}
      </View>
      
      <View style={styles.body}>
        <Text style={styles.entryTime}>Entrée : {formatTime(ticket.entryTime)}</Text>
        <Text style={styles.duration}>{durationText}</Text>
      </View>

      {/* Affiche le badge "En cours" seulement pour les tickets actifs */}
      {!isHistory && (
        <View style={styles.footer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>En cours</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
 
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    marginHorizontal: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#007A5E',
    shadowColor: '#CE1126',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  historyContainer: {
    backgroundColor: '#F0F8F7',
    borderLeftColor: '#FCD116',
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  parkingName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#CE1126',
  },
  amount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#007A5E',
    backgroundColor: '#FCD116',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryTime: {
    fontSize: 13,
    color: '#555',
  },
  duration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007A5E',
  },
  footer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#FCD116',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusText: {
    color: '#CE1126',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
 
export default TicketItem;