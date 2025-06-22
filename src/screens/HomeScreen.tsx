import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
    const navigation = useNavigation();

    return (
        <>
            <View style={styles.container}>
                {/* Logo e nome */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.logo}
                    />
                </View>

                {/* Mensagem de boas-vindas */}
                <Text style={styles.welcome}>Bem-vindo(a) ao GoLocal!</Text>
                <Text style={styles.subtitle}>Descubra o melhor de Peruíbe-SP</Text>

                {/* Botões de navegação */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.button}
                        // @ts-ignore
                        onPress={() => navigation.navigate('Explore')}
                    >
                        <MaterialCommunityIcons name="magnify" size={28} color="#fff" />
                        <Text style={styles.buttonText}>Explorar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        // @ts-ignore
                        onPress={() => navigation.navigate('Map')}
                    >
                        <MaterialCommunityIcons name="map" size={28} color="#fff" />
                        <Text style={styles.buttonText}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        // @ts-ignore
                        onPress={() => navigation.navigate('User')}
                    >
                        <MaterialCommunityIcons name="account" size={28} color="#fff" />
                        <Text style={styles.buttonText}>Usuário</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Desenvolvido por Otavio Emanoel
                </Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f6fa',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    logo: {
        width: 350,
        height: 350,
        marginBottom: 8,
        borderRadius: 100,
        borderWidth: .1,
        borderColor: '#2a4d69',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2a4d69',
    },
    cityImage: {
        width: '100%',
        height: 160,
        borderRadius: 16,
        marginVertical: 16,
    },
    welcome: {
        fontSize: 22,
        fontWeight: '600',
        color: '#2a4d69',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#4f6d7a',
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 12,
    },
    button: {
        flex: 1,
        backgroundColor: '#2a4d69',
        marginHorizontal: 6,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'column',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        marginTop: 4,
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    footerText: {
        color: '#4f6d7a',
        fontSize: 14,
        textAlign: 'center',
    },
});