import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { theme } = useTheme();

    return (
        <>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Logo e nome */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icon.png')}
                        style={[styles.logo, { borderColor: theme.border }]}
                    />
                </View>

                {/* Mensagem de boas-vindas */}
                <Text style={[styles.welcome, { color: theme.text }]}>Bem-vindo(a) ao GoLocal!</Text>
                <Text style={[styles.subtitle, { color: theme.textAlt }]}>Descubra o melhor de Peruíbe-SP</Text>

                {/* Botões de navegação */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.btn }]}
                        // @ts-ignore
                        onPress={() => navigation.navigate('Explore')}
                    >
                        <MaterialCommunityIcons name="magnify" size={28} color={theme.btnText} />
                        <Text style={[styles.buttonText, { color: theme.btnText }]}>Explorar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.btn }]}
                        // @ts-ignore
                        onPress={() => navigation.navigate('Map')}
                    >
                        <MaterialCommunityIcons name="map" size={28} color={theme.btnText} />
                        <Text style={[styles.buttonText, { color: theme.btnText }]}>Mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.btn }]}
                        // @ts-ignore
                        onPress={() => navigation.navigate('User')}
                    >
                        <MaterialCommunityIcons name="account" size={28} color={theme.btnText} />
                        <Text style={[styles.buttonText, { color: theme.btnText }]}>Usuário</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textAlt }]}>
                    Desenvolvido por Otavio Emanoel
                </Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        resizeMode: 'contain',
    },
    welcome: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
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
        marginHorizontal: 6,
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'column',
    },
    buttonText: {
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
        fontSize: 14,
        textAlign: 'center',
    },
});