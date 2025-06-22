import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PlaceDetailScreen from '../screens/PlaceDetailScreen';

import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MapScreen from '../screens/MapScreen';
import UserScreen from '../screens/UserScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();
const ExploreStack = createNativeStackNavigator();

function ExploreStackScreen() {
  const { theme, darkMode } = useTheme();
  return (
    <ExploreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTitleStyle: { color: theme.text },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <ExploreStack.Screen name="ExploreMain" component={ExploreScreen} options={{ headerShown: false }} />
      <ExploreStack.Screen
        name="PlaceDetail"
        component={PlaceDetailScreen}
        options={{ title: 'Detalhes' }}
      />
    </ExploreStack.Navigator>
  );
}

export default function BottomTabNavigator() {
  const { theme, darkMode } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.btn,
        tabBarInactiveTintColor: darkMode ? '#aaa' : '#888',
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.cardAlt,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          title: 'Início',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStackScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={size} />
          ),
          title: 'Explorar',
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.navigate('Explore', {
              screen: 'ExploreMain',
            });
          },
        })}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
          ),
          title: 'Mapa',
        }}
      />
      <Tab.Screen
        name="User"
        component={UserScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
          title: 'Usuário',
        }}
      />
    </Tab.Navigator>
  );
}