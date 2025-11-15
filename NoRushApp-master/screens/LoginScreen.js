import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../setting';

export default function LoginScreen({ navigation }) {
    // 입력 상태 관리 (이메일, 비밀번호)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 로그인 버튼 누르면 실행되는 메인 함수
    // async/await을 써서 비동기 처리함
    const handleLogin = async () => { 
        console.log('로그인 시도:', email, password);
        // 우리 서버 API 주소
        const LOGIN_API_URL = `http://${BASE_URL}/api/v1/auth/signin`; 

        try {
            // 서버로 POST 요청 보내기
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json', 
                },
                // email, password으로 JSON 만들어서 보냄
                body: JSON.stringify({ 
                    email: email, 
                    password: password,
                }),
            });

            // 응답 상태 확인
            if (response.ok) {
                // 성공 (200 OK)
                
                const responseData = await response.json(); 
                console.log('로그인 성공 응답 전체:', responseData);

                // 실제 사용자 정보가 'data' 필드 안에 들어있다고 가정
                // mainscreen.js에서 저장해둠
                const userData = responseData.data;

                if (userData) {
                    // AsyncStorage에 사용자 정보(토큰 포함) 저장
                    await AsyncStorage.setItem('USER_INFO', JSON.stringify(userData));
                    console.log('사용자 정보 저장 완료');
                    
                    // 로그인 성공 -> 메인 화면으로 이동! 
                    navigation.replace('Main');
                } else {
                    alert('로그인 처리 중 사용자 정보를 찾을 수 없습니다. (서버 응답 구조 확인 필요)');
                    console.error('응답 구조 오류: data 필드가 없습니다.', responseData);
                }


            } else {
                // 로그인 실패 (4xx, 5xx)
                const errorData = await response.json();
                // 서버에서 보낸 메시지나 기본 상태 메시지 보여줌
                alert(`로그인 실패: ${errorData.msg || response.statusText}`); 
                console.error('로그인 실패 응답:', errorData);
            }
        } catch (error) {
            // 네트워크 자체 연결 오류 처리
            console.error('네트워크 오류:', error);
            alert('네트워크 연결에 문제가 발생했습니다. (서버 꺼졌거나 주소 문제일 수 있음)');
        }
    };

    // 소셜 로그인 버튼은 아직 기능 구현 안 함 (콘솔에만 찍음)
    const handleSocialLogin = (provider) => {
        console.log(`${provider} 로그인 시도`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>로그인</Text>

            {/* 이메일 입력창 */}
            <TextInput
                style={styles.input}
                placeholder="아이디(이메일)"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address" // 이메일 형식 키보드
            />

            {/* 비밀번호 입력창 */}
            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#666666"
                secureTextEntry // 비밀번호 * 표시
                value={password}
                onChangeText={setPassword}
            />

            {/* 정보 찾기 버튼 */}
            <View style={styles.infoContainer}>
                <TouchableOpacity style={styles.infoButton}>
                    <Text style={styles.infoText}>정보찾기</Text>
                </TouchableOpacity>
            </View>

            {/* 메인 로그인 버튼 */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>로그인</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>또는</Text>

            {/* 소셜 로그인 버튼들 */}
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

            {/* 회원가입으로 이동 */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.bottomText}>
                    NoRush가 처음이신가요? <Text style={styles.linkText}>회원가입</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// 스타일 시트
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