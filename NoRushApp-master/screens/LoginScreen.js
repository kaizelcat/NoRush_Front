import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../setting';

export default function LoginScreen({ navigation }) {
    // 입력 상태 관리 (이메일, 비밀번호)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('로그인 시도:', email, password);

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
                // } else {
                //     alert('로그인 처리 중 사용자 정보를 찾을 수 없습니다. (서버 응답 구조 확인 필요)');
                //     console.error('응답 구조 오류: data 필드가 없습니다.', data);
                // }


            } else {
                // 로그인 실패 (4xx, 5xx)
                const errorData = await response.json();
                // 서버에서 보낸 메시지나 기본 상태 메시지 보여줌
                alert(`로그인 실패: ${errorData.msg || response.statusText}`); 
                console.error('로그인 실패 응답:', errorData);
            }
          }
      } catch (error) {
          // 네트워크 연결 자체의 오류 (타임아웃, 서버 연결 불가 등)
          console.error('네트워크 오류:', error);
          alert('네트워크 연결에 문제가 발생했습니다. 확인 후 다시 시도해 주세요.');
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