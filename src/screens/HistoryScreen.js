import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native'; //
import { getHistoryTickets, deleteHistoryTicket } from '../storage/ticketStorage'; //
import TicketItem from '../components/TicketItem'; //

// Constante pour le prix par défaut (utile si un ticket n'a pas de prix)
const DEFAULT_PRICE_PER_HOUR = 100; //

const HistoryScreen = ({ navigation }) => { //
  // --- ÉTATS ---
  const [historyTickets, setHistoryTickets] = useState([]); //
  const [stats, setStats] = useState({ totalAmount: 0, totalTickets: 0 }); //
  const [loading, setLoading] = useState(true); //

  // --- EFFETS ---
  // Chargement initial et à chaque focus (si l'utilisateur revient sur l'écran)
  useEffect(() => { //
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]); //

  // --- FONCTIONS ---
  const getStats = (tickets) => { //
    // Utilise reduce pour agréger les données du tableau
    const totalAmount = tickets.reduce((sum, ticket) => sum + (ticket.totalAmount || 0), 0); //
    return {
      totalAmount,
      totalTickets: tickets.length,
    };
  };

  const loadHistory = async () => { //
    setLoading(true); //
    try {
      let tickets = await getHistoryTickets(); //
      // Trie par date de sortie décroissante (plus récent en premier)
      tickets.sort((a, b) => new Date(b.exitTime) - new Date(a.exitTime)); //
      setHistoryTickets(tickets); //
      setStats(getStats(tickets)); //
    } catch (error) {
      console.error('Erreur de chargement de l’historique:', error);
    }
    setLoading(false); //
  };

  const handleDelete = (ticketId, parkingName) => { //
    Alert.alert(
      'Supprimer',
      `Voulez-vous supprimer définitivement le ticket de ${parkingName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHistoryTicket(ticketId); //
            if (success) { //
              Alert.alert('Succès', 'Ticket supprimé !');
              loadHistory(); // Recharger les données et les stats
            } else {
              Alert.alert('Erreur', 'Impossible de supprimer le ticket.');
            }
          },
        },
      ]
    );
  };

  // --- RENDU ---
  if (loading) {
    return <View style={styles.loadingContainer}><Text>Chargement...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historique Complet</Text>
      </View>

      {/* Zone de statistiques agrégées */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Tickets Clôturés</Text>
          <Text style={styles.statValue}>{stats.totalTickets}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Montant Total</Text>
          <Text style={styles.statValue}>{stats.totalAmount} FCFA</Text>
        </View>
      </View>

      {historyTickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>L'historique des tickets est vide.</Text>
        </View>
      ) : (
        // FlatList est utilisé pour gérer efficacement de longues listes
        <FlatList
          data={historyTickets} //
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            // Appui long pour la suppression
            <TouchableOpacity onLongPress={() => handleDelete(item.id, item.parkingName)}>
              <TicketItem ticket={item} isHistory={true} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};
 
const styles = StyleSheet.create({ //
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#007A5E',
    padding: 16,
    borderBottomWidth: 3,
    borderBottomColor: '#FCD116',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#FCD116',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCD116',
    marginTop: 6,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});
 
export default HistoryScreen;