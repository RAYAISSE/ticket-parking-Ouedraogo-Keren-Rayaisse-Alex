import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native'; //
import { getActiveTickets, getHistoryTickets, deleteHistoryTicket } from '../storage/ticketStorage'; //
import TicketItem from '../components/TicketItem'; //

const HomeScreen = ({ navigation }) => { //
  // --- ÉTATS ---
  const [activeTickets, setActiveTickets] = useState([]); //
  const [historyTickets, setHistoryTickets] = useState([]); //
  const [loading, setLoading] = useState(true); //
  const [refreshing, setRefreshing] = useState(false); // Pour le "pull-to-refresh"

  // --- EFFETS ---
  // Se déclenche une seule fois au montage
  useEffect(() => { //
    loadData(); //
  }, []); //

  // Se déclenche à chaque fois que l'écran revient au premier plan
  useEffect(() => { //
    const unsubscribe = navigation.addListener('focus', () => { //
      loadData(); //
    });
    return unsubscribe;
  }, [navigation]); //

  // --- FONCTIONS ---
  const loadData = async () => { //
    setLoading(true); //
    try {
      // Promise.all permet de lancer les deux requêtes de stockage en parallèle, c'est plus rapide.
      const [active, history] = await Promise.all([ //
        getActiveTickets(), //
        getHistoryTickets() //
      ]);
      setActiveTickets(active); //
      // On trie l'historique pour afficher les plus récents en premier
      setHistoryTickets(history.sort((a, b) => new Date(b.exitTime) - new Date(a.exitTime))); //
    } catch (error) {
      console.error('Erreur de chargement des données:', error);
    }
    setLoading(false); //
  };

  // Fonction pour le rafraîchissement manuel
  const onRefresh = async () => { //
    setRefreshing(true); //
    await loadData(); //
    setRefreshing(false); //
  };

  // Fonction pour gérer la suppression d'un ticket d'historique (appui long)
  const handleDeleteHistoryTicket = (ticketId, parkingName) => { //
    Alert.alert(
      'Supprimer de l\'historique',
      `Voulez-vous vraiment supprimer le ticket de ${parkingName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteHistoryTicket(ticketId); //
            if (success) loadData(); // On recharge la liste après suppression
          },
        },
      ]
    );
  };

  // --- RENDU ---
  if (loading) {
    return <View style={styles.loadingContainer}><Text>Chargement...</Text></View>; // Affiche un indicateur de chargement
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau de Bord</Text>

      {/* On utilise une FlatList pour pouvoir utiliser le RefreshControl (pull-to-refresh) */}
      <FlatList
        data={[{ type: 'content' }]} // Astuce pour n'avoir qu'un seul item de rendu
        keyExtractor={(item) => item.type}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> //
        }
        renderItem={() => ( //
          <View>
            {/* Section Tickets Actifs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tickets en cours ({activeTickets.length})</Text>

              {activeTickets.length === 0 ? (
                <Text style={styles.emptyText}>Aucun ticket actif</Text>
              ) : (
                activeTickets.map((ticket) => (
                  <TicketItem
                    key={ticket.id}
                    ticket={ticket}
                    onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.id })}
                  />
                ))
              )}
            </View>

            {/* Section Historique */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historique (5 derniers)</Text>
              
              {historyTickets.length === 0 ? (
                <Text style={styles.emptyText}>Historique vide</Text>
              ) : (
                historyTickets.slice(0, 5).map((ticket) => (
                  <TouchableOpacity
                    key={ticket.id}
                    onLongPress={() => handleDeleteHistoryTicket(ticket.id, ticket.parkingName)}
                  >
                    <TicketItem ticket={ticket} isHistory={true} />
                  </TouchableOpacity>
                ))
              )}

              {historyTickets.length > 5 && (
                <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.fullHistoryButton}>
                  <Text style={styles.fullHistoryText}>Voir tout l'historique ({historyTickets.length})</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={{ height: 100 }} />
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('NewTicket')}
      >
        <Text style={styles.addButtonText}>+ Nouveau Ticket</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
    paddingBottom: 15,
    backgroundColor: '#CE1126',
    borderBottomWidth: 3,
    borderBottomColor: '#FCD116',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#007A5E',
    borderLeftWidth: 4,
    borderLeftColor: '#FCD116',
    paddingLeft: 10,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
    fontSize: 14,
  },
  fullHistoryButton: {
    marginTop: 15,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007A5E',
  },
  fullHistoryText: {
    color: '#007A5E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FCD116',
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 28,
    elevation: 8,
    shadowColor: '#CE1126',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  addButtonText: {
    color: '#CE1126',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;