import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Spring Security 서버 주소 (배포 환경)
const SERVER_HOST = 'https://norush2025-i8pt.onrender.com';
// const SERVER_HOST = 'http://localhost:8080'; // 로컬 테스트용
const REDIRECT_SCHEME = 'norushapp://login-success';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url && url.startsWith(REDIRECT_SCHEME)) {

        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const token = urlParams.get('token');
        const userId = urlParams.get('userId');

        if (token && userId) {
          console.log("로그인 성공! 토큰:", token);
          
          // 메인 화면으로 이동 -> 삭제??
          navigation.replace('Main');
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => subscription.remove();
  }, [navigation]);


  const handleLogin = () => {
    console.log('로그인 시도:', email, password);
    navigation.replace('Main');
  };

  const handleSocialLogin = async (provider) => {
    let authUrl;
    
    switch (provider) {
        case '네이버':
            authUrl = `${SERVER_HOST}/oauth2/authorization/naver`;
            break;
        case '카카오':
            authUrl = `${SERVER_HOST}/oauth2/authorization/kakao`;
            break;
        case '구글':
            authUrl = `${SERVER_HOST}/oauth2/authorization/google`;
            break;
        case '애플':
            console.log("애플 로그인은 현재 미지원");
            return; 
        default:
            return;
    }

    try {
        const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_SCHEME);
            
    } catch (error) {
        console.error('소셜 로그인 실패:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>로그인</Text>

      <TextInput
        style={styles.input}
        placeholder="아이디(이메일)"
        placeholderTextColor="#666666"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#666666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.infoContainer}>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoText}>정보찾기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>또는</Text>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#03C75A' }]} onPress={() => handleSocialLogin('네이버')}>
        <Text style={styles.socialButtonText}>네이버 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FEE500' }]} onPress={() => handleSocialLogin('카카오')}>
        <Text style={[styles.socialButtonText, { color: '#000' }]}>카카오 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#ccc' }]} onPress={() => handleSocialLogin('구글')}>
        <Text style={[styles.socialButtonText, { color: '#000' }]}>구글 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: '#000000' }]} onPress={() => handleSocialLogin('애플')}>
        <Text style={styles.socialButtonText}>애플 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.bottomText}>
          NoRush가 처음이신가요? <Text style={styles.linkText}>회원가입</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#ffffff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  infoContainer: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', marginBottom: 16 },
  infoButton: {},
  infoText: { color: '#f44336', fontSize: 14 },
  loginButton: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  orText: { marginVertical: 8, color: '#888' },
  socialButton: { paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  socialButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  bottomText: { marginTop: 16, fontSize: 14, color: '#333' },
  linkText: { color: '#2196F3', fontWeight: 'bold' }
});
