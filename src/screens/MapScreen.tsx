import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity, Image, Linking, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import placesData from '../data/places.json';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

type Place = {
  id: string;
  nome: string;
  imagem: string;
  descricao: string;
  tipo: string;
  gratuito: boolean;
  localizacao?: { latitude: number; longitude: number };
};

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

function getInitialRegion() {
  const points = (placesData as Place[]).filter(
    p => p.localizacao && typeof p.localizacao.latitude === 'number' && typeof p.localizacao.longitude === 'number'
  );
  if (points.length === 0) {
    return {
      latitude: -24.32,
      longitude: -47.00,
      latitudeDelta: 0.8,
      longitudeDelta: 0.8,
    };
  }
  const lats = points.map(p => p.localizacao!.latitude);
  const lngs = points.map(p => p.localizacao!.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.08, (maxLat - minLat) * 1.5),
    longitudeDelta: Math.max(0.08, (maxLng - minLng) * 1.5),
  };
}

export default function MapScreen({ navigation }: any) {
  const { theme, darkMode } = useTheme();
  const [region, setRegion] = useState<Region>(getInitialRegion());
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [pinSize, setPinSize] = useState(28);

  useEffect(() => {
    getUserLocation();
    setRegion(getInitialRegion());
  }, []);

  async function getUserLocation() {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.18,
        longitudeDelta: 0.18,
      });
    } catch {
      // ignora erro
    }
    setLoadingLocation(false);
  }

  function openGoogleMaps(place: Place) {
    if (!place.localizacao) return;
    const { latitude, longitude } = place.localizacao;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?ll=${latitude},${longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url);
  }

  function handleMarkerPress(place: Place) {
    setSelectedPlace(place);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setSelectedPlace(null);
  }

  function handleSeeMore() {
    setModalVisible(false);
    // @ts-ignore
    navigation.navigate('Explore', {
      screen: 'PlaceDetail',
      params: { id: selectedPlace?.id }
    });
  }

  function handleRegionChangeComplete(region: Region) {
    setRegion(region);
    // Ajuste os valores conforme necessário para seu mapa
    // Quanto menor o delta, maior o zoom, então aumente o tamanho do pin
    let size = 28;
    if (region.latitudeDelta < 0.1) size = 48;
    else if (region.latitudeDelta < 0.2) size = 40;
    else if (region.latitudeDelta < 0.4) size = 32;
    else size = 24;
    setPinSize(size);
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Mapa dos Pontos Turísticos</Text>
      <View style={[styles.mapWrapper, { backgroundColor: theme.cardAlt }]}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType='satellite'
          region={region}
          showsUserLocation={!!userLocation}
          showsMyLocationButton
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {(placesData as Place[])
            .filter(
              place =>
                !!place.localizacao &&
                typeof place.localizacao.latitude === 'number' &&
                typeof place.localizacao.longitude === 'number'
            )
            .map((place) => (
              <Marker
                key={place.id}
                coordinate={place.localizacao!}
                onPress={() => handleMarkerPress(place)}
                tracksViewChanges={false}
                image={require('../assets/pin.png')}
              />
            ))}
        </MapView>
        {/* Botão para centralizar no usuário */}
        <TouchableOpacity style={[styles.locateBtn, { backgroundColor: theme.card }]} onPress={getUserLocation}>
          {loadingLocation ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <MaterialCommunityIcons name="crosshairs-gps" size={26} color={theme.text} />
          )}
        </TouchableOpacity>
      </View>

      {/* Título e instruções */}
      <View style={styles.infoBlock}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>Pontos turísticos</Text>
        <View style={[styles.infoInstructionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.infoInstruction, { color: theme.text }]}>
            Clique em um pin para ver mais detalhes
          </Text>
        </View>
      </View>

      {/* Notas do dev */}
      <View style={[styles.devNoteBlock, { backgroundColor: theme.cardAlt }]}>
        <Text style={[styles.devNoteText, { color: theme.text }]}>
          Nota do desenvolvedor: A localização exata dos pontos turísticos pode não ser precisa. O aplicativo está em fase de teste.
        </Text>
      </View>

      {/* Modal do ponto */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            {selectedPlace && (
              <>
                <Image
                  source={images[selectedPlace.imagem]}
                  style={styles.modalImage}
                />
                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedPlace.nome}</Text>
                <Text style={[styles.modalDesc, { color: theme.textAlt }]} numberOfLines={3}>
                  {selectedPlace.descricao}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: theme.btn }]}
                    onPress={handleSeeMore}
                  >
                    <MaterialCommunityIcons name="information-outline" size={20} color={theme.btnText} />
                    <Text style={[styles.modalBtnText, { color: theme.btnText }]}>Ver mais</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnMap, { backgroundColor: '#f9a825' }]}
                    onPress={() => openGoogleMaps(selectedPlace)}
                  >
                    <MaterialCommunityIcons name="map-marker" size={20} color="#fff" />
                    <Text style={styles.modalBtnText}>Ver no Maps</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]} onPress={handleCloseModal}>
                  <MaterialCommunityIcons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 18, marginTop: 18 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  mapWrapper: {
    width: width - 24,
    height: height * 0.45,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    maxWidth: 120,
  },
  labelText: {
    color: '#2a4d69',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  locateBtn: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    borderRadius: 30,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    width: width * 0.85,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 15,
    marginBottom: 14,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    gap: 6,
  },
  modalBtnMap: {
    backgroundColor: '#f9a825',
  },
  modalBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 16,
    padding: 2,
  },
  infoBlock: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  infoInstructionContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    marginTop: 2,
    marginBottom: 2,
    alignSelf: 'center',
  },
  infoInstruction: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Para o bloco de nota do desenvolvedor
  devNoteBlock: {
    padding: 12,
    marginTop: 12,
    backgroundColor: '#e0e7ef', // Troque por theme.cardAlt no componente
    borderRadius: 12,
    alignItems: 'center',
  },
  devNoteText: {
    fontSize: 13,
    color: '#2a4d69', // Troque por theme.text no componente
    textAlign: 'center',
    fontStyle: 'italic',
  },
});