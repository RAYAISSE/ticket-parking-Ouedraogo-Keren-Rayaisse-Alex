import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'; //
import { addTicket } from '../storage/ticketStorage'; //
import { getCurrentDateTime } from '../utils/calculePrice'; //
import 'react-native-get-random-values'; // Importation nécessaire pour le polyfill
import { v4 as uuidv4 } from 'uuid'; // Pour générer un ID unique

const NewTicketScreen = ({ navigation }) => { //
  // --- ÉTATS ---
  const [parkingName, setParkingName] = useState(''); //
  // Le prix est stocké en chaîne de caractères pour le TextInput, puis converti en nombre
  const [pricePerHour, setPricePerHour] = useState(''); //
  const [loading, setLoading] = useState(false); //

  // --- FONCTIONS ---
  const handleSaveTicket = async () => { //
    // 1. Validation des données
    if (!parkingName.trim()) { //
      Alert.alert('Erreur', 'Veuillez entrer le nom du parking.');
      return;
    }

    const price = parseInt(pricePerHour.trim(), 10); // Conversion en entier
    if (isNaN(price) || price <= 0) { //
      Alert.alert('Erreur', 'Veuillez entrer un prix par heure valide (nombre > 0).');
      return;
    }

    setLoading(true); //

    // 2. Création de l'objet ticket
    const newTicket = { //
      id: uuidv4(), // ID unique (nécessaire pour la suppression et l'identification)
      parkingName: parkingName.trim(),
      pricePerHour: price,
      entryTime: getCurrentDateTime(), // Utilisation de la fonction utilitaire
      status: 'active', //
      // exitTime et totalAmount seront ajoutés lors de la clôture
    };

    // 3. Enregistrement dans le stockage
    const success = await addTicket(newTicket); //

    setLoading(false); //

    // 4. Feedback et navigation
    if (success) { //
      Alert.alert('Succès', 'Nouveau ticket enregistré !');
      // Revient à l'écran précédent (HomeScreen)
      navigation.goBack(); //
    } else {
      Alert.alert('Erreur', 'Impossible d’enregistrer le ticket.');
    }
  };

  // --- RENDU ---
  return (
    // KeyboardAvoidingView ajuste la vue pour que le clavier ne cache pas les inputs
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau Ticket</Text>
      </View>
      
      {/* ScrollView permet de faire défiler le contenu si l'écran est petit */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Nom du Parking :</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Parking du Centre Commercial"
          value={parkingName}
          onChangeText={setParkingName} //
          maxLength={50}
        />

        <Text style={styles.label}>Prix par Heure (FCFA) :</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 100"
          value={pricePerHour}
          onChangeText={setPricePerHour} //
          keyboardType="numeric" // Afficher le clavier numérique
        />
        
        <Text style={styles.infoText}>
          Le temps d'entrée sera enregistré à l'heure actuelle lors de la validation.
        </Text>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveTicket}
          disabled={loading} // Désactiver le bouton pendant le chargement
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Enregistrement...' : 'Démarrer le Stationnement'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
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
  scrollContent: {
    padding: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007A5E',
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007A5E',
    fontSize: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginTop: 25,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#FCD116',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 30,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#CE1126',
  },
  saveButtonText: {
    color: '#CE1126',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NewTicketScreen;