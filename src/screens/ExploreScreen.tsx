import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const [places, setPlaces] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const navigation = useNavigation();

  useEffect(() => {
    setPlaces(placesData as Place[]);
    loadFavorites();
  }, []);

  async function loadFavorites() {
    const favs = await AsyncStorage.getItem('favorites');
    setFavorites(favs ? JSON.parse(favs) : []);
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
    return filtered;
  }

  function renderCard({ item }: { item: Place }) {
    return (
      <View style={styles.card}>
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
            <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
              <MaterialCommunityIcons
                name={favorites.includes(item.id) ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color="#2a4d69"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de pesquisa */}
      <TextInput
        style={styles.search}
        placeholder="Buscar ponto turístico..."
        value={search}
        onChangeText={setSearch}
      />
      {/* Filtros */}
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
  },
  moreBtn: {
    backgroundColor: '#2a4d69',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  moreBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});