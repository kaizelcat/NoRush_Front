import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (response) => {
    console.log('로그인 시도:', email, password);
<<<<<<< HEAD

  const LOGIN_API_URL = 'http://10.0.2.2:8080/api/v1/auth/signin'; 
=======
  const LOGIN_API_URL = 'http://172.24.16.1:8080/api/v1/auth/signin'; 
>>>>>>> origin/feature/logout

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

<<<<<<< HEAD
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
                
                // 성공 시 메인 화면으로 이동
                navigation.replace('Main');
            } else {
                 // userInfo가 응답에 없는 경우 처리 (예: 데이터 구조 오류)
                alert('로그인 처리 중 사용자 정보를 찾을 수 없습니다.');
                console.error('응답 구조 오류: userInfo 필드가 없습니다.', data);
            }
=======
          // 3. 서버 응답 처리
          if (response.ok) {
              // HTTP 상태 코드가 200번대인 경우 (성공)
              
              // 1. 응답 본문을 파싱하여 'data' 변수에 저장합니다.
              const data = await response.json(); 
              
              console.log('로그인 성공 응답 전체:', data);
              
              // 2.  수정: 'response.data.userInfo' 대신 'data.data.userInfo' 사용
              const userInfo = data.data.userInfo; 
              
              // 3. 안전하게 userInfo가 존재하는지 확인 후 저장 로직 실행
              if (userInfo) {
                  await AsyncStorage.setItem('USER_INFO', JSON.stringify(userInfo));
                  console.log('사용자 정보 저장 완료');
                  
                  // 성공 시 메인 화면으로 이동
                  navigation.replace('Main');
              } else {
                  // userInfo가 응답에 없는 경우 처리 (예: 데이터 구조 오류)
                  alert('로그인 처리 중 사용자 정보를 찾을 수 없습니다.');
                  console.error('응답 구조 오류: userInfo 필드가 없습니다.', data);
              }
>>>>>>> origin/feature/logout

          } else {
              // HTTP 상태 코드가 4xx, 5xx 등 실패인 경우
              const errorData = await response.json();
              alert(`로그인 실패: ${errorData.msg || response.statusText}`);
              console.error('로그인 실패 응답:', errorData);
          }
      } catch (error) {
          // 네트워크 연결 자체의 오류 (타임아웃, 서버 연결 불가 등)
          console.error('네트워크 오류:', error);
          alert('네트워크 연결에 문제가 발생했습니다. 확인 후 다시 시도해 주세요.');
      }
  };

  const handleSocialLogin = (provider) => {
    console.log(`${provider} 로그인 시도`);
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