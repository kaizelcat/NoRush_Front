import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

// ⭐️ AI 서버 IP 주소와 포트 적용
const SERVER_HOST = 'http://54.180.137.9:8080'; 
const LOGIN_ENDPOINT = '/api/v1/auth/signin';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ⭐️ 일반 로그인 처리 함수 (API 연동)
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
                body: JSON.stringify({ email, password }), // 서버 요구 형식 (email, password)
            });

            const responseData = await response.json();

            if (response.ok && responseData.status === '201') { // ⭐️ 성공 조건: HTTP 200/201 및 서버 상태 코드 201
                // 1. 액세스 토큰 저장 (추후 API 호출 시 필요)
                const accessToken = responseData.data.accessToken;
                console.log("로그인 성공! Access Token:", accessToken);
                
                // 2. 메인 화면으로 이동
                Alert.alert('로그인 성공', `환영합니다! ${responseData.data.userInfo.email}`);
                navigation.navigate('Main'); // ⭐️ 네비게이터에 정의된 메인 화면 경로로 이동
            } else {
                // 로그인 실패 처리
                Alert.alert('로그인 실패', responseData.msg || '아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (error) {
            console.error('로그인 중 네트워크 오류 발생:', error);
            Alert.alert('오류', '네트워크 연결 상태를 확인해주세요. 서버 주소/포트 확인 필요');
        }
    };
    
    // ⭐️ 소셜 로그인 처리 함수 (기존 코드 유지)
    const handleSocialLogin = (provider) => {
        let url;
        
        switch (provider) {
            // ⭐️ 소셜 로그인 URL도 서버 주소에 맞게 수정
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