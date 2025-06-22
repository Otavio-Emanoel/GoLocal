import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Modal } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import placesData from '../data/places.json';

// Mapeamento estático das imagens (adicione todas que usar no JSON)
const images: Record<string, any> = {
  "ruinas-abarebebe.jpeg": require('../assets/places/ruinas-abarebebe.jpeg'),
  "barra-do-una.jpeg": require('../assets/places/barra-do-una.jpeg'),
  "cachoeira-do-paraiso.jpeg": require('../assets/places/cachoeira-do-paraiso.jpeg'),
  "cachoeira-rio-do-ouro.jpeg": require('../assets/places/cachoeira-rio-do-ouro.jpeg'),
  "castelinho.jpeg": require('../assets/places/castelinho.jpeg'),
  "estacao-ecologica-jureia.jpeg": require('../assets/places/estacao-ecologica-jureia.jpeg'),
  "ilha-guarau.jpeg": require('../assets/places/ilha-guarau.jpeg'),
  "mirante-da-torre.jpeg": require('../assets/places/mirante-da-torre.jpeg'),
  "praia-costao.jpeg": require('../assets/places/praia-costao.jpeg'),
  "praia-desertinha.jpeg": require('../assets/places/praia-desertinha.jpeg'),
  "praia-do-cambore.jpeg": require('../assets/places/praia-do-cambore.jpeg'),
  "praia-do-centro.jpeg": require('../assets/places/praia-do-centro.jpeg'),
  "prainha.jpeg": require('../assets/places/prainha.jpeg'),
};

type RootStackParamList = {
  PlaceDetail: { id: string };
};

type Place = {
  id: string;
  nome: string;
  imagens?: string[]; // array de nomes de imagens
  imagem?: string;
  descricao: string;
  tipo: string;
  gratuito: boolean;
  horario?: string;
  taxa?: string;
  dificuldade?: string;
  dicas?: string;
  curiosidades?: string;
  localizacao?: { latitude: number; longitude: number };
};

export default function PlaceDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetail'>>();
  const { id } = route.params;
  const place = (placesData as Place[]).find(p => p.id === id);

  // Estado para "ver mais tarde"
  const [saved, setSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(true);

  // Estado do modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, []);

  async function checkIfSaved() {
    try {
      const savedList = await AsyncStorage.getItem('seeLater');
      if (savedList) {
        const arr = JSON.parse(savedList) as string[];
        setSaved(arr.includes(id));
      }
    } catch (e) {
      // erro silencioso
    }
    setLoadingSave(false);
  }

  async function handleToggleSave() {
    setLoadingSave(true);
    try {
      const savedList = await AsyncStorage.getItem('seeLater');
      let arr: string[] = savedList ? JSON.parse(savedList) : [];
      if (saved) {
        arr = arr.filter(pid => pid !== id);
        setSaved(false);
        setModalMsg('Removido de "Ver mais tarde"');
        setModalError(false);
        setModalVisible(true);
      } else {
        arr.push(id);
        setSaved(true);
        setModalMsg('Salvo em "Ver mais tarde"!');
        setModalError(false);
        setModalVisible(true);
      }
      await AsyncStorage.setItem('seeLater', JSON.stringify(arr));
    } catch (e) {
      setModalMsg('Erro ao salvar');
      setModalError(true);
      setModalVisible(true);
    }
    setLoadingSave(false);
  }

  if (!place) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Ponto não encontrado.</Text>
      </View>
    );
  }

  // Para compatibilidade com JSON antigo
  const imagens = place.imagens && place.imagens.length > 0
    ? place.imagens
    : place.imagem
      ? [place.imagem]
      : [];

  const openMaps = () => {
    if (place.localizacao) {
      const { latitude, longitude } = place.localizacao;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      setModalMsg('Localização não disponível');
      setModalError(true);
      setModalVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Modal de feedback */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, modalError && styles.modalBoxError]}>
            <MaterialCommunityIcons
              name={modalError ? "alert-circle-outline" : "check-circle-outline"}
              size={40}
              color={modalError ? "#d32f2f" : "#2e7d32"}
              style={{ marginBottom: 8 }}
            />
            <Text style={[styles.modalMsg, modalError && styles.modalMsgError]}>
              {modalMsg}
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.carouselContainer}>
        <Swiper
          style={styles.swiper}
          height={220}
          showsPagination={imagens.length > 1}
          dotColor="#e0e7ef"
          activeDotColor="#2a4d69"
        >
          {imagens.map((img, idx) => (
            <Image
              key={idx}
              source={images[img]}
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </Swiper>
      </View>
      <Text style={styles.title}>{place.nome}</Text>
      <Text style={styles.type}>
        {place.tipo.charAt(0).toUpperCase() + place.tipo.slice(1)}
        {' • '}
        {place.gratuito ? 'Gratuito' : place.taxa ? `Pago (${place.taxa})` : 'Pago'}
      </Text>
      <Text style={styles.desc}>{place.descricao}</Text>

      {/* Informações gerais */}
      <View style={styles.infoBox}>
        {place.horario && (
          <Text style={styles.infoLine}>
            <MaterialCommunityIcons name="clock-outline" size={18} color="#2a4d69" />{' '}
            <Text style={styles.infoLabel}>Horário:</Text> {place.horario}
          </Text>
        )}
        {place.taxa && (
          <Text style={styles.infoLine}>
            <MaterialCommunityIcons name="cash" size={18} color="#2a4d69" />{' '}
            <Text style={styles.infoLabel}>Taxa de entrada:</Text> {place.taxa}
          </Text>
        )}
        {place.dificuldade && (
          <Text style={styles.infoLine}>
            <MaterialCommunityIcons name="walk" size={18} color="#2a4d69" />{' '}
            <Text style={styles.infoLabel}>Dificuldade:</Text> {place.dificuldade}
          </Text>
        )}
        {place.dicas && (
          <Text style={styles.infoLine}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color="#2a4d69" />{' '}
            <Text style={styles.infoLabel}>Dica:</Text> {place.dicas}
          </Text>
        )}
      </View>

      {/* Botões de ação */}
      <View style={styles.actionsGrid}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={openMaps}>
            <MaterialCommunityIcons name="map-marker" size={22} color="#fff" />
            <Text style={styles.actionBtnText}>Ver no Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => {
              setModalMsg('Como chegar será implementado em breve!');
              setModalError(false);
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="navigation" size={22} color="#2a4d69" />
            <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>Como chegar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              saved ? styles.actionBtnSaved : styles.actionBtnTertiary,
              { flex: 1, opacity: loadingSave ? 0.6 : 1 }
            ]}
            onPress={handleToggleSave}
            disabled={loadingSave}
          >
            {loadingSave ? (
              <ActivityIndicator color={saved ? "#fff" : "#f9a825"} size={20} />
            ) : (
              <MaterialCommunityIcons
                name={saved ? "bookmark-check" : "bookmark-plus-outline"}
                size={22}
                color={saved ? "#fff" : "#f9a825"}
              />
            )}
            <Text style={[
              styles.actionBtnText,
              saved ? {} : styles.actionBtnTextTertiary
            ]}>
              {saved ? "Salvo! (remover)" : "Ver mais tarde"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Curiosidades */}
      {place.curiosidades && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Curiosidades</Text>
          <Text style={styles.sectionText}>{place.curiosidades}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  carouselContainer: {
    width: '100%',
    height: 220,
    marginBottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  swiper: {
    borderRadius: 16,
  },
  image: {
    width: '100%',
    height: 220,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 6,
    textAlign: 'center',
  },
  type: {
    fontSize: 16,
    color: '#4f6d7a',
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: '#22343c',
    textAlign: 'justify',
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#e0e7ef',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  infoLine: {
    fontSize: 15,
    color: '#2a4d69',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#2a4d69',
  },
  actionsGrid: {
    width: '100%',
    marginBottom: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnPrimary: {
    backgroundColor: '#2a4d69',
  },
  actionBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2a4d69',
  },
  actionBtnTertiary: {
    backgroundColor: '#fffbe6',
    borderWidth: 2,
    borderColor: '#f9a825',
  },
  actionBtnSaved: {
    backgroundColor: '#f9a825',
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.5,
  },
  actionBtnTextSecondary: {
    color: '#2a4d69',
  },
  actionBtnTextTertiary: {
    color: '#f9a825',
  },
  section: {
    width: '100%',
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 15,
    color: '#22343c',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    minWidth: 220,
    maxWidth: 320,
    elevation: 4,
  },
  modalBoxError: {
    borderColor: '#d32f2f',
    borderWidth: 2,
  },
  modalMsg: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  modalMsgError: {
    color: '#d32f2f',
  },
  modalBtn: {
    backgroundColor: '#2a4d69',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginTop: 4,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});