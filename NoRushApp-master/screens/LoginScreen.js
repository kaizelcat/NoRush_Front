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

        console.log(`[일반 로그인] 시도: ${email}, ${password}`);
        
        try {
            const response = await fetch(`${SERVER_HOST}${LOGIN_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            // 1. 응답 본문 파싱 (성공/실패 무관하게 JSON 파싱 시도)
            const responseData = await response.json(); 

            // 2. HTTP 상태 코드와 서버 응답 상태 동시 확인
            if (response.ok && responseData.status === '201') { 
                const { accessToken, refreshToken, userInfo } = responseData.data;

                // 3. 토큰과 사용자 정보 저장 (AsyncStorage)
                await AsyncStorage.setItem('ACCESS_TOKEN', accessToken);
                await AsyncStorage.setItem('REFRESH_TOKEN', refreshToken);
                if (userInfo) {
                    await AsyncStorage.setItem('USER_INFO', JSON.stringify(userInfo));
                }

                console.log('로그인 성공! Access Token 저장 완료');
                
                // 4. 메인 화면으로 이동
                Alert.alert('로그인 성공', `환영합니다! ${userInfo.email || email}`);
                // replace를 사용하면 뒤로가기 버튼으로 로그인 화면으로 돌아가지 못하게 합니다.
                navigation.replace('Main'); 
            } else {
                // 로그인 실패 처리 (서버에서 받은 메시지 사용)
                Alert.log('로그인 실패', responseData.msg || '아이디 또는 비밀번호가 올바르지 않습니다.');
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