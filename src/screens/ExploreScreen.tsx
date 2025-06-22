import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import placesData from '../data/places.json';

type Place = {
  id: string;
  nome: string;
  imagem: string;
  descricao: string;
  tipo: string;
  gratuito: boolean;
};

const FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Praia', value: 'praia' },
  { label: 'Histórico', value: 'histórico' },
  { label: 'Gratuito', value: 'gratuito' },
  { label: 'Pago', value: 'pago' },
];

const ORDER_OPTIONS = [
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' },
];

// Mapeamento estático das imagens conforme o JSON
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

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [order, setOrder] = useState<'az' | 'za'>('az');
  const [places, setPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [seeLater, setSeeLater] = useState<string[]>([]);
  const [loadingSeeLater, setLoadingSeeLater] = useState<string | null>(null);

  // Modal para feedback
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    setPlaces(placesData as Place[]);
    loadFavorites();
    loadSeeLater();
  }, []);

  // Atualiza favoritos e ver mais tarde ao voltar para a tela
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
      loadSeeLater();
    }, [])
  );

  async function loadFavorites() {
    const favs = await AsyncStorage.getItem('favorites');
    setFavorites(favs ? JSON.parse(favs) : []);
  }

  async function loadSeeLater() {
    const saved = await AsyncStorage.getItem('seeLater');
    setSeeLater(saved ? JSON.parse(saved) : []);
  }

  async function toggleFavorite(id: string) {
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(fav => fav !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  }

  async function toggleSeeLater(id: string) {
    setLoadingSeeLater(id);
    try {
      let arr = [...seeLater];
      if (arr.includes(id)) {
        arr = arr.filter(pid => pid !== id);
        setModalMsg('Removido de "Ver mais tarde"');
        setModalError(false);
      } else {
        arr.push(id);
        setModalMsg('Salvo em "Ver mais tarde"!');
        setModalError(false);
      }
      setSeeLater(arr);
      await AsyncStorage.setItem('seeLater', JSON.stringify(arr));
      setModalVisible(true);
    } catch (e) {
      setModalMsg('Erro ao salvar');
      setModalError(true);
      setModalVisible(true);
    }
    setLoadingSeeLater(null);
  }

  function filterPlaces() {
    let filtered = places;
    if (filter === 'gratuito') filtered = filtered.filter(p => p.gratuito);
    else if (filter === 'pago') filtered = filtered.filter(p => !p.gratuito);
    else if (filter) filtered = filtered.filter(p => p.tipo === filter);

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(
        p =>
          p.nome.toLowerCase().includes(s) ||
          p.descricao.toLowerCase().includes(s) ||
          p.tipo.toLowerCase().includes(s)
      );
    }

    // Ordenação alfabética
    filtered = filtered.slice().sort((a, b) => {
      if (order === 'az') return a.nome.localeCompare(b.nome);
      else return b.nome.localeCompare(a.nome);
    });

    return filtered;
  }

  function renderCard({ item }: { item: Place }) {
    const isSeeLater = seeLater.includes(item.id);
    return (
      <View style={[styles.card, isSeeLater && styles.cardSeeLater]}>
        <Image
          source={images[item.imagem]}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.nome}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.moreBtn}
              // @ts-ignore
              onPress={() => navigation.navigate('PlaceDetail', { id: item.id })}
            >
              <Text style={styles.moreBtnText}>Saiba mais</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.seeLaterBtn,
                isSeeLater && styles.seeLaterBtnActive
              ]}
              onPress={() => toggleSeeLater(item.id)}
              disabled={loadingSeeLater === item.id}
            >
              {loadingSeeLater === item.id ? (
                <ActivityIndicator size={20} color={isSeeLater ? "#f9a825" : "#2a4d69"} />
              ) : (
                <MaterialCommunityIcons
                  name={isSeeLater ? 'bookmark-check' : 'bookmark-plus-outline'}
                  size={26}
                  color={isSeeLater ? "#f9a825" : "#2a4d69"}
                />
              )}
            </TouchableOpacity>
          </View>
          {isSeeLater && (
            <View style={styles.seeLaterTag}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#f9a825" />
              <Text style={styles.seeLaterTagText}>Ver mais tarde</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      {/* Barra de pesquisa */}
      <TextInput
        style={styles.search}
        placeholder="Buscar ponto turístico..."
        value={search}
        onChangeText={setSearch}
      />
      {/* Filtros e ordem */}
      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterBtn, filter === f.value && styles.filterBtnActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Filtro de ordem alfabética */}
        <View style={styles.orderContainer}>
          {ORDER_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.orderBtn,
                order === opt.value && styles.orderBtnActive
              ]}
              onPress={() => setOrder(opt.value as 'az' | 'za')}
            >
              <MaterialCommunityIcons
                name={opt.value === 'az' ? 'sort-alphabetical-ascending' : 'sort-alphabetical-descending'}
                size={18}
                color={order === opt.value ? '#fff' : '#2a4d69'}
              />
              <Text style={[
                styles.orderBtnText,
                order === opt.value && styles.orderBtnTextActive
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Lista */}
      <FlatList
        data={filterPlaces()}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 12 },
  search: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 30,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e7ef',
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  filterBtn: {
    backgroundColor: '#e0e7ef',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  filterBtnActive: {
    backgroundColor: '#2a4d69',
  },
  filterText: {
    color: '#2a4d69',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  orderContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    gap: 4,
  },
  orderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ef',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 4,
    marginBottom: 6,
    gap: 4,
  },
  orderBtnActive: {
    backgroundColor: '#2a4d69',
  },
  orderBtnText: {
    color: '#2a4d69',
    fontWeight: '600',
    marginLeft: 2,
  },
  orderBtnTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSeeLater: {
    borderColor: '#f9a825',
    backgroundColor: '#fffde7',
  },
  cardImage: {
    width: 110,
    height: 110,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2a4d69',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#4f6d7a',
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  moreBtn: {
    backgroundColor: '#2a4d69',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 6,
  },
  moreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  seeLaterBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderColor: '#f9a825',
    marginRight: 6,
  },
  seeLaterBtnActive: {
    backgroundColor: '#fffbe6',
  },
  seeLaterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fffbe6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
    gap: 4,
  },
  seeLaterTagText: {
    color: '#f9a825',
    fontWeight: 'bold',
    fontSize: 12,
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