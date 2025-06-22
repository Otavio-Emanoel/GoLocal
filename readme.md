# GoLocal

Aplicativo em React Native (TypeScript) para apresentar os pontos turísticos da cidade de Peruíbe-SP de forma moderna, interativa e acessível. Ideal para moradores e visitantes explorarem praias, trilhas, patrimônios históricos e muito mais!

---

## ✨ Descrição

**GoLocal** é um app mobile que reúne informações detalhadas dos principais atrativos da cidade, com fotos, localização, dicas e recursos para facilitar sua visita. O usuário pode navegar, pesquisar, salvar favoritos e planejar passeios — tudo de maneira simples e offline.

---

## 🖼️ Telas e Funcionalidades

### 🏠 Tela Inicial (Home)
- Logo + nome do app
- Mensagem de boas-vindas e imagem da cidade
- Botões: Explorar | Mapa | Usuário

### 🔎 Tela de Explorar
- Lista de pontos turísticos em cards (nome, foto, descrição)
- Botão “Saiba mais” e ícone de salvar (favoritos/offline)
- Filtros (praia, trilha, histórico, gratuito/pago, etc.)
- Barra de pesquisa (nome, local, descrição)
- Ordenação por distância (usa localização do usuário)
- Salvamento local com AsyncStorage

### 🗺️ Tela de Mapa
- Integração com Google Maps (react-native-maps + expo-location)
- Markers personalizados para cada ponto turístico
- Modal ao clicar no marker (imagem, resumo, “Ver mais”)
- Abrir local no Google Maps real

### 👤 Tela do Usuário
- Nome e foto de perfil (com edição via expo-image-picker)
- Configurações: modo claro/escuro, favoritos salvos, doação via Pix, contato (expo-mail-composer)
- Visualizar pontos salvos para “ver mais tarde”

### 🏛️ Tela do Ponto Turístico
- Imagens em carrossel
- Informações gerais (horário, taxa, dicas, etc.)
- Botões para mapa, como chegar, salvar, avaliações/curiosidades

### 📌 Navegação
- Navbar com React Navigation (createBottomTabNavigator) e ícones do @expo/vector-icons

---

## ⚒️ Tecnologias Utilizadas

- **React Native** (com TypeScript)
- **Expo** (expo-router)
- **expo-location, react-native-maps**
- **AsyncStorage**
- **expo-image-picker**
- **expo-mail-composer**
- **@expo/vector-icons**
- **react-native-paper** ou **native-base**

---

## 🚀 Sugestões Futuras

- Splash screen customizada
- Notificações locais
- Widget de sugestão do dia
- Modo offline completo
- Animações com Framer Motion ou Reanimated

---

## 🗺️ Como Contribuir

Em breve!

---

## 📱 Demonstração

*Serão disponibilizados quando o projeto estiver completo.*

---

## 👤 Autor

Feito por [Otavio Emanoel](https://github.com/Otavio-Emanoel)

---

## 📃 Licença

Projeto de caráter educativo e comunitário, feito para promover o turismo local de Peruíbe-SP.