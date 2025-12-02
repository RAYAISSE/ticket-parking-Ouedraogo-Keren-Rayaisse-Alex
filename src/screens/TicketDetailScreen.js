import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native'; //
import { getTicketById, closeTicket } from '../storage/ticketStorage'; //
import { calculateDuration, calculatePrice, formatTime, formatDuration, getCurrentDateTime } from '../utils/calculePrice'; //
 
// Le prix horaire est fixé à 100 FCFA par défaut selon les exemples de l'analyse
const DEFAULT_PRICE_PER_HOUR = 100; //
 
const TicketDetailScreen = ({ route, navigation }) => { //
  // On récupère l'ID du ticket passé par l'écran précédent (HomeScreen)
  const { ticketId } = route.params; //
  
  // --- ÉTATS ---
  const [ticket, setTicket] = useState(null); // Le ticket chargé
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime()); // L'heure actuelle mise à jour chaque seconde
  const [loading, setLoading] = useState(true); //

  // --- EFFETS ---
  // 1. Chargement initial du ticket et écoute des changements
  useEffect(() => { //
    loadTicket();
    // Recharger le ticket si l'écran est à nouveau focus (au cas où il a été modifié ailleurs, mais ici c'est surtout pour la résilience)
    const unsubscribe = navigation.addListener('focus', loadTicket);
    return unsubscribe;
  }, [navigation, ticketId]); //

  // 2. Minuteur pour la mise à jour en temps réel (le "moteur" de l'écran)
  useEffect(() => { //
    const interval = setInterval(() => {
      setCurrentTime(getCurrentDateTime()); // Met à jour l'heure actuelle chaque seconde
    }, 1000); // 1000ms = 1 seconde
    
    // Nettoyage : s'assure que le minuteur est arrêté lorsque l'écran est démonté
    return () => clearInterval(interval); //
  }, []); //

  // --- FONCTIONS ---
  const loadTicket = async () => { //
    const fetchedTicket = await getTicketById(ticketId); //
    setTicket(fetchedTicket); //
    setLoading(false); //
    // Si le ticket n'est pas trouvé (erreur ou a déjà été clôturé), on revient en arrière
    if (!fetchedTicket) { //
      Alert.alert('Erreur', 'Ticket non trouvé.');
      navigation.goBack();
    }
  };

  const handleCloseTicket = () => { //
    if (!ticket) return; // Sécurité

    Alert.alert(
      'Clôturer le Ticket',
      `Le montant final est de ${currentAmount} FCFA. Confirmez-vous la clôture ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: async () => {
            const finalExitTime = getCurrentDateTime(); // Heure de clôture définitive
            const finalAmount = calculatePrice(ticket.entryTime, finalExitTime, ticket.pricePerHour || DEFAULT_PRICE_PER_HOUR); //
            
            setLoading(true); //
            const success = await closeTicket(ticketId, finalExitTime, finalAmount); //

            if (success) { //
              Alert.alert('Succès', 'Ticket clôturé et enregistré dans l’historique.');
              navigation.navigate('Home'); // Retour à l'écran d'accueil
            } else {
              Alert.alert('Erreur', 'Impossible de clôturer le ticket.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };
 
  // --- RENDU et CALCULS EN TEMPS RÉEL ---
  if (loading || !ticket) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement du ticket...</Text>
      </View>
    );
  }

  // Ces variables sont recalculées à chaque seconde grâce à la mise à jour de currentTime
  const durationMinutes = calculateDuration(ticket.entryTime, currentTime); //
  const durationText = formatDuration(durationMinutes); //
  const currentAmount = calculatePrice(ticket.entryTime, currentTime, ticket.pricePerHour || DEFAULT_PRICE_PER_HOUR); //
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Détail du Ticket</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nom du Parking :</Text>
        <Text style={styles.value}>{ticket.parkingName}</Text>
        
        <Text style={styles.label}>Prix par Heure :</Text>
        <Text style={styles.value}>{ticket.pricePerHour} FCFA</Text>

        <View style={styles.separator} />
        
        <Text style={styles.label}>Heure d'Entrée :</Text>
        <Text style={styles.value}>{formatTime(ticket.entryTime)}</Text>

        <Text style={styles.label}>Heure Actuelle :</Text>
        {/* Affiche l'heure actuelle mise à jour en temps réel */}
        <Text style={[styles.value, styles.time]}>{formatTime(currentTime)}</Text>
      </View>
      
      {/* Zone de Résumé Clé */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Durée Totale :</Text>
        {/* Durée calculée en temps réel */}
        <Text style={styles.summaryValue}>{durationText}</Text>
        
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Montant Actuel Dû :</Text>
          {/* Montant calculé en temps réel */}
          <Text style={styles.amountValue}>{currentAmount} FCFA</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleCloseTicket}
        disabled={loading}
      >
        <Text style={styles.closeButtonText}>
          {loading ? 'Clôture en cours...' : 'Clôturer le Stationnement'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({ //
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    backgroundColor: '#CE1126',
    borderBottomWidth: 3,
    borderBottomColor: '#FCD116',
  },
  backButton: {
    paddingRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#FCD116',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 18,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#007A5E',
    elevation: 4,
    shadowColor: '#CE1126',
    shadowOpacity: 0.15,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007A5E',
    marginBottom: 8,
  },
  time: {
    fontWeight: 'bold',
    color: '#CE1126',
  },
  separator: {
    height: 2,
    backgroundColor: '#FCD116',
    marginVertical: 12,
  },
  summaryCard: {
    backgroundColor: '#FCD116',
    borderRadius: 10,
    marginHorizontal: 18,
    padding: 18,
    borderWidth: 2,
    borderColor: '#CE1126',
    elevation: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#CE1126',
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007A5E',
  },
  amountBox: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#CE1126',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#CE1126',
    marginBottom: 6,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007A5E',
  },
  closeButton: {
    backgroundColor: '#CE1126',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    margin: 18,
    marginTop: 30,
    borderWidth: 2,
    borderColor: '#FCD116',
    elevation: 5,
  },
  closeButtonText: {
    color: '#FCD116',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TicketDetailScreen;