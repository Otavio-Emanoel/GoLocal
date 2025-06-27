import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Modal, TextInput } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import placesData from '../data/places.json';
import { useTheme } from '../context/ThemeContext';
import Markdown from 'react-native-markdown-display';

// Gemini API
const GEMINI_API_KEY = 'SUA_CHAVE_DA_API'; // Troque pela sua chave Gemini

async function askGemini(question: string, context: string) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;
  const body = {
    contents: [
      { parts: [{ text: context }] }
    ]
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Não foi possível obter resposta.';
}

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
  "parque-turistico.png": require('../assets/places/parque-turistico.png'),
};

type RootStackParamList = {
  PlaceDetail: { id: string };
};

type Place = {
  id: string;
  nome: string;
  imagens?: string[];
  imagem?: string;
  descricao: string;
  tipo: string;
  gratuito: boolean;
  horario?: string;
  taxa?: string;
  dificuldade?: string;
  dicas?: string;
  curiosidades?: string;
  keywords?: string;
  localizacao?: { latitude: number; longitude: number };
};

export default function PlaceDetailScreen() {
  const { theme, darkMode } = useTheme();
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceDetail'>>();
  const { id } = route.params;
  const place = (placesData as Place[]).find(p => p.id === id);

  const [saved, setSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState(false);

  // Gemini modal
  const [geminiModal, setGeminiModal] = useState(false);
  const [geminiQuestion, setGeminiQuestion] = useState('');
  const [geminiAnswer, setGeminiAnswer] = useState('');
  const [geminiLoading, setGeminiLoading] = useState(false);

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
    } catch (e) { }
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text }}>Ponto não encontrado.</Text>
      </View>
    );
  }

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

  async function handleAskGemini() {
    if (!geminiQuestion.trim() || !place) return;
    setGeminiLoading(true);
    setGeminiAnswer('');
    try {
      const context = `
        Você é um guia turístico virtual especializado em Peruíbe-SP.
        Abaixo estão informações sobre um ponto turístico da cidade.
        Responda à pergunta do usuário usando essas informações.
        Se não encontrar a resposta exata, utilize seu conhecimento geral sobre turismo, história e cultura local para ajudar o usuário.

        Caso queira, voce pode consultar também o site de Peruíbe https://www.peruibe.sp.gov.br/

        --- Dados do ponto turístico ---
        Nome: ${place.nome}
        Tipo: ${place.tipo}
        Descrição: ${place.descricao}
        ${place.horario ? `Horário de funcionamento: ${place.horario}` : ''}
        ${place.taxa ? `Taxa de entrada: ${place.taxa}` : ''}
        ${place.dificuldade ? `Dificuldade: ${place.dificuldade}` : ''}
        ${place.dicas ? `Dicas: ${place.dicas}` : ''}
        ${place.keywords ? `Palavras chave: ${place.keywords}` : ''}
        ${place.curiosidades ? `Curiosidades: ${place.curiosidades}` : ''}
        Cidade: Peruíbe-SP
        -------------------------------

        Pergunta do usuário: ${geminiQuestion}
        `.trim();
      const answer = await askGemini(geminiQuestion, context);
      setGeminiAnswer(answer);
    } catch (e) {
      setGeminiAnswer('Erro ao conectar com a IA.');
    }
    setGeminiLoading(false);
  }

  const openDirections = () => {
    if (place.localizacao) {
      const { latitude, longitude } = place.localizacao;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;
      Linking.openURL(url);
    } else {
      setModalMsg('Localização não disponível');
      setModalError(true);
      setModalVisible(true);
    }
  };

  // Remove *** e outros artefatos do Gemini e deixa Markdown mais limpo
  function formatGeminiAnswer(answer: string) {
    let clean = answer.replace(/\*{3,}/g, '');
    // Outras limpezas podem ser feitas aqui se necessário
    return clean.trim();
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.background, flex: 1 }}
      contentContainerStyle={styles.container}
    >
      {/* Modal de feedback */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[
          styles.modalOverlay,
          darkMode && { backgroundColor: 'rgba(0,0,0,0.7)' }
        ]}>
          <View style={[
            styles.modalBox,
            modalError && styles.modalBoxError,
            { backgroundColor: theme.card }
          ]}>
            <MaterialCommunityIcons
              name={modalError ? "alert-circle-outline" : "check-circle-outline"}
              size={40}
              color={modalError ? "#d32f2f" : "#2e7d32"}
              style={{ marginBottom: 8 }}
            />
            <Text style={[
              styles.modalMsg,
              modalError && styles.modalMsgError,
              { color: modalError ? "#d32f2f" : theme.text }
            ]}>
              {modalMsg}
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.btn }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: theme.btnText }]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Gemini */}
      <Modal
        visible={geminiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setGeminiModal(false)}
      >
        <View style={[
          styles.modalOverlay,
          darkMode && { backgroundColor: 'rgba(0,0,0,0.7)' }
        ]}>
          <View style={[
            styles.geminiModalBox,
            { backgroundColor: theme.card }
          ]}>
            <TouchableOpacity style={styles.closeBtnGemini} onPress={() => setGeminiModal(false)}>
              <MaterialCommunityIcons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 14 }]}>Pergunte algo sobre este local</Text>
            <TextInput
              style={[
                styles.geminiInput,
                {
                  color: theme.text,
                  backgroundColor: theme.cardAlt,
                  borderColor: theme.border,
                }
              ]}
              placeholder="Digite sua pergunta..."
              placeholderTextColor={theme.textAlt}
              value={geminiQuestion}
              onChangeText={setGeminiQuestion}
              editable={!geminiLoading}
              onSubmitEditing={handleAskGemini}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.geminiBtn, { backgroundColor: theme.btn, marginBottom: 10 }]}
              onPress={handleAskGemini}
              disabled={geminiLoading}
            >
              {geminiLoading ? (
                <ActivityIndicator color={theme.btnText} />
              ) : (
                <MaterialCommunityIcons name="robot" size={22} color={theme.btnText} />
              )}
              <Text style={[styles.geminiBtnText, { color: theme.btnText }]}>Perguntar</Text>
            </TouchableOpacity>
            <ScrollView style={{ maxHeight: 220, width: '100%' }}>
              {geminiAnswer ? (
                <View style={[
                  styles.geminiAnswerBox,
                  { backgroundColor: theme.cardAlt }
                ]}>
                  <Markdown
                    style={{
                      body: { color: theme.text, fontSize: 15, backgroundColor: theme.cardAlt },
                      paragraph: { color: theme.text },
                      strong: { color: theme.text },
                      em: { color: theme.text },
                      code_inline: { color: theme.text, backgroundColor: darkMode ? '#23262f' : '#e0e7ef' },
                      code_block: { color: theme.text, backgroundColor: darkMode ? '#23262f' : '#e0e7ef' },
                    }}
                  >
                    {formatGeminiAnswer(geminiAnswer)}
                  </Markdown>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={styles.carouselContainer}>
        <Swiper
          style={styles.swiper}
          height={220}
          showsPagination={imagens.length > 1}
          dotColor={theme.cardAlt}
          activeDotColor={theme.btn}
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
      <Text style={[styles.title, { color: theme.text }]}>{place.nome}</Text>
      <Text style={[styles.type, { color: theme.textAlt }]}>
        {place.tipo.charAt(0).toUpperCase() + place.tipo.slice(1)}
        {' • '}
        {place.gratuito ? 'Gratuito' : place.taxa ? `Pago (${place.taxa})` : 'Pago'}
      </Text>
      <Text style={[styles.desc, { color: theme.textAlt }]}>{place.descricao}</Text>

      {/* Informações gerais */}
      <View style={[styles.infoBox, { backgroundColor: theme.cardAlt }]}>
        {place.horario && (
          <Text style={[styles.infoLine, { color: theme.text }]}>
            <MaterialCommunityIcons name="clock-outline" size={18} color={theme.btn} />{' '}
            <Text style={[styles.infoLabel, { color: theme.text }]}>Horário:</Text> {place.horario}
          </Text>
        )}
        {place.taxa && (
          <Text style={[styles.infoLine, { color: theme.text }]}>
            <MaterialCommunityIcons name="cash" size={18} color={theme.btn} />{' '}
            <Text style={[styles.infoLabel, { color: theme.text }]}>Taxa de entrada:</Text> {place.taxa}
          </Text>
        )}
        {place.dificuldade && (
          <Text style={[styles.infoLine, { color: theme.text }]}>
            <MaterialCommunityIcons name="walk" size={18} color={theme.btn} />{' '}
            <Text style={[styles.infoLabel, { color: theme.text }]}>Dificuldade de acesso:</Text> {place.dificuldade}
          </Text>
        )}
        {place.dicas && (
          <Text style={[styles.infoLine, { color: theme.text }]}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={theme.btn} />{' '}
            <Text style={[styles.infoLabel, { color: theme.text }]}>Dica:</Text> {place.dicas}
          </Text>
        )}
      </View>

      {/* Botões de ação */}
      <View style={styles.actionsGrid}>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.btn }]} onPress={openMaps}>
            <MaterialCommunityIcons name="map-marker" size={22} color={theme.btnText} />
            <Text style={[styles.actionBtnText, { color: theme.btnText }]}>Ver no Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card, borderWidth: 2, borderColor: theme.btn }]}
            onPress={() => setGeminiModal(true)}
          >
            <MaterialCommunityIcons name="robot" size={22} color={theme.btn} />
            <Text style={[styles.actionBtnText, { color: theme.btn }]}>Saber mais</Text>
          </TouchableOpacity>
        </View>
        {/* Botão Como chegar */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.card, borderWidth: 2, borderColor: theme.btn }]}
            onPress={openDirections}
          >
            <MaterialCommunityIcons name="car" size={22} color={theme.btn} />
            <Text style={[styles.actionBtnText, { color: theme.btn }]}>Como chegar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              saved
                ? { backgroundColor: '#f9a825' }
                : { backgroundColor: theme.cardAlt, borderWidth: 2, borderColor: '#f9a825' },
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
              saved ? { color: "#fff" } : { color: "#f9a825" }
            ]}>
              {saved ? "Salvo! (remover)" : "Ver mais tarde"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Curiosidades */}
      {place.curiosidades && (
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Curiosidades</Text>
          <Text style={[styles.sectionText, { color: theme.textAlt }]}>{place.curiosidades}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    alignItems: 'center',
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
    marginBottom: 6,
    textAlign: 'center',
  },
  type: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  infoLine: {
    fontSize: 15,
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
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
  actionBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  section: {
    width: '100%',
    marginBottom: 18,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 15,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
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
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  modalMsgError: {
    color: '#d32f2f',
  },
  modalBtn: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginTop: 4,
  },
  modalBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  // Gemini modal
  geminiModalBox: {
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    width: '92%',
    maxWidth: 380,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: '#2a4d6922',
    position: 'relative',
  },
  geminiInput: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1.5,
    marginBottom: 12,
    marginTop: 8,
    alignSelf: 'center',
  },
  closeBtnGemini: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 2,
  },
  geminiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
  },
  geminiBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  geminiAnswerBox: {
    width: '100%',
    marginTop: 8,
    borderRadius: 8,
    padding: 10,
  },
  geminiAnswer: {
    fontSize: 15,
  },
});