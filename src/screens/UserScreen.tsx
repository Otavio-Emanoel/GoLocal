import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, FlatList, Alert, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import placesData from '../data/places.json';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const PIX_KEY = '22546acc-5080-45a2-9c34-67f61bdea85f';

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

export default function UserScreen() {
  const { darkMode, setDarkMode, theme } = useTheme();

  const [name, setName] = useState<string>('Usuário');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [seeLater, setSeeLater] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSeeLater();
    }, [])
  );

  async function loadProfile() {
    const savedName = await AsyncStorage.getItem('userName');
    const savedPhoto = await AsyncStorage.getItem('userPhoto');
    if (savedName) {
      setName(savedName);
      setNameInput(savedName);
    }
    if (savedPhoto) setPhoto(savedPhoto);
  }

  async function saveName(newName: string) {
    setName(newName || 'Usuário');
    setEditingName(false);
    await AsyncStorage.setItem('userName', newName || 'Usuário');
  }

  async function loadSeeLater() {
    const saved = await AsyncStorage.getItem('seeLater');
    setSeeLater(saved ? JSON.parse(saved) : []);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
      await AsyncStorage.setItem('userPhoto', result.assets[0].uri);
    }
  }

  function handleCopyPix() {
    Clipboard.setStringAsync(PIX_KEY);
    Alert.alert('Pix copiado!', 'Chave Pix copiada para a área de transferência.');
  }

  function handleSendMail() {
    MailComposer.composeAsync({
      recipients: ['otabrue6@gmail.com'],
      subject: 'Contato via GoLocal',
      body: 'Olá Otavio, gostaria de...',
    });
  }

  function renderSeeLaterItem({ item }: { item: string }) {
    const place = (placesData as any[]).find(p => p.id === item);
    if (!place) return null;
    return (
      <View style={[styles.seeLaterItem, { backgroundColor: theme.seeLaterBg }]}>
        <Image source={images[place.imagem]} style={styles.seeLaterImg} />
        <Text style={[styles.seeLaterName, { color: theme.text }]}>{place.nome}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: darkMode ? '#000' : '#000' }]}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
            <Image
              source={photo ? { uri: photo } : require('../assets/icon.png')}
              style={[styles.avatar, { borderColor: theme.border, backgroundColor: theme.cardAlt }]}
            />
            <View style={[styles.editIcon, { backgroundColor: theme.btn, borderColor: theme.card }]}>
              <MaterialCommunityIcons name="pencil" size={20} color={theme.btnText} />
            </View>
          </TouchableOpacity>

          {/* Nome editável */}
          {editingName ? (
            <View style={styles.editNameRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={[
                  styles.nameInput,
                  {
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.inputBg,
                  },
                ]}
                placeholder="Digite seu nome"
                placeholderTextColor={theme.placeholder}
                autoFocus
                maxLength={24}
                onSubmitEditing={() => saveName(nameInput)}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={() => saveName(nameInput)} style={styles.iconBtn}>
                <MaterialCommunityIcons name="check" size={24} color={theme.btn} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingName(false)} style={styles.iconBtn}>
                <MaterialCommunityIcons name="close" size={24} color={theme.btn} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)} activeOpacity={0.7}>
              <Text style={[styles.name, { color: theme.text }]}>{name || 'Usuário'}</Text>
            </TouchableOpacity>
          )}

          {/* Modo escuro */}
          <View style={[styles.switchRow, { backgroundColor: theme.inputBg }]}>
            <MaterialCommunityIcons name="theme-light-dark" size={22} color={theme.btn} />
            <Text style={[styles.switchLabel, { color: theme.text }]}>Modo escuro</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
        </View>

        {/* Ver mais tarde */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>Ver mais tarde</Text>
          {seeLater.length === 0 ? (
            <Text style={{ color: theme.textAlt, textAlign: 'center', marginTop: 8 }}>Nenhum ponto salvo.</Text>
          ) : (
            <FlatList
              data={seeLater}
              keyExtractor={item => item}
              renderItem={renderSeeLaterItem}
              contentContainerStyle={{ paddingVertical: 8 }}
              scrollEnabled={false}
            />
          )}
        </View>

        {/* Doação */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>Doar ao desenvolvedor</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.btn }]} onPress={handleCopyPix} activeOpacity={0.85}>
            <MaterialCommunityIcons name="cash" size={22} color={theme.btnText} />
            <Text style={[styles.actionBtnText, { color: theme.btnText }]}>Copiar chave Pix</Text>
          </TouchableOpacity>
          <Text selectable style={[styles.pixKey, { color: theme.text, backgroundColor: theme.inputBg }]}>{PIX_KEY}</Text>
        </View>

        {/* Contato */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>Contato</Text>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.btn }]} onPress={handleSendMail} activeOpacity={0.85}>
            <MaterialCommunityIcons name="email" size={22} color={theme.btnText} />
            <Text style={[styles.actionBtnText, { color: theme.btnText }]}>Enviar e-mail</Text>
          </TouchableOpacity>
          <Text style={[styles.contactEmail, { color: theme.text }]}>otabrue6@gmail.com</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 32 },
  profileCard: {
    width: '92%',
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
    elevation: 4,
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarWrapper: {
    marginBottom: 10,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    marginBottom: 0,
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 14,
    padding: 4,
    zIndex: 2,
    borderWidth: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    marginTop: 2,
  },
  nameInput: {
    fontSize: 22,
    fontWeight: 'bold',
    borderBottomWidth: 1.5,
    minWidth: 120,
    maxWidth: 180,
    paddingVertical: 2,
    textAlign: 'center',
  },
  iconBtn: {
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  section: {
    width: '92%',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    alignSelf: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  seeLaterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
    borderRadius: 8,
    padding: 6,
    width: '100%',
  },
  seeLaterImg: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 8,
  },
  seeLaterName: {
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
    elevation: 2,
  },
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  pixKey: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    borderRadius: 6,
    padding: 6,
  },
  contactEmail: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});