import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
// ⭐️ 토큰 저장을 위해 AsyncStorage 반드시 필요
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// 🚨 BASE_URL은 setting.js에서 import 해야 하나, 현재 충돌 상황이므로
// 안전을 위해 외부 서버 IP를 직접 사용하며, setting.js의 BASE_URL 값을 참고합니다.
const SERVER_HOST = 'http://54.180.137.9:8080'; 
const LOGIN_ENDPOINT = '/api/v1/auth/signin';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('로그인 오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

  const LOGIN_API_URL = `http://${BASE_URL}:8080/api/v1/auth/signin`; 

      try {
          const response = await fetch(LOGIN_API_URL, {
              method: 'POST', 
              headers: {
                  'Content-Type': 'application/json', 
              },
              // 2. 백엔드 DTO 규격에 맞춰 데이터를 JSON 문자열로 변환.
              // DTO에서 필드 이름이 'email'과 'password'였으므로, 여기서도 그대로 사용.
              body: JSON.stringify({ 
                  email: email, 
                  password: password,
              }),
          });

        // 3. 서버 응답 처리
        if (response.ok) {
            // HTTP 상태 코드가 200번대인 경우 (성공)
            
            // 1. 응답 본문을 파싱하여 'data' 변수에 저장합니다.
            const data = await response.json(); 
            const accessToken = data.data.accessToken;
            const refreshToken = data.data.refreshToken;
            
            // 토큰 저장
            await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
            await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);

            console.log('로그인 성공 응답 전체:', data);
            
            // 2.  수정: 'response.data.userInfo' 대신 'data.data.userInfo' 사용
            const userInfo = data.data.userInfo; 
            
            // 3. 안전하게 userInfo가 존재하는지 확인 후 저장 로직 실행
            if (userInfo) {
                await AsyncStorage.setItem('USER_INFO', JSON.stringify(userInfo));
                console.log('사용자 정보 저장 완료');
                
                //const responseData = await response.json(); 
                //console.log('로그인 성공 응답 전체:', data);

                // 실제 사용자 정보가 'data' 필드 안에 들어있다고 가정
                // mainscreen.js에서 저장해둠
                const userData = data.data;

                // if (userData) {
                //     // AsyncStorage에 사용자 정보(토큰 포함) 저장
                //     await AsyncStorage.setItem('USER_INFO', JSON.stringify(userData));
                //     console.log('사용자 정보 저장 완료');
                    
                //     // 로그인 성공 -> 메인 화면으로 이동! 
                navigation.replace('Main');
                } else {
                // 로그인 실패 처리 (서버에서 받은 메시지 사용)
                Alert.alert('로그인 실패', responseData.msg || '아이디 또는 비밀번호가 올바르지 않습니다.');
                console.error('로그인 실패 응답:', responseData);
            }
        } catch (error) {
            console.error('네트워크 오류:', error);
            Alert.alert('오류', '네트워크 연결 또는 서버 주소를 확인해주세요.');
        }
    };
    
    // ⭐️ 소셜 로그인 처리 함수
    const handleSocialLogin = (provider) => {
        let url;
        
        switch (provider) {
            case '네이버':
                url = `${SERVER_HOST}/oauth2/authorization/naver`;
                break;
            case '카카오':
                url = `${SERVER_HOST}/oauth2/authorization/kakao`;
                break;
            case '구글':
                url = `${SERVER_HOST}/oauth2/authorization/google`;
                break;
            case '애플':
                console.log("애플 로그인은 현재 미지원");
                return; 
            default:
                return;
        }

        Linking.openURL(url).catch(err => console.error('소셜 로그인 링크 열기 실패:', err));
        console.log(`[${provider}] 로그인 시도 URL: ${url}`);
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
                keyboardType="email-address"
                autoCapitalize="none"
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