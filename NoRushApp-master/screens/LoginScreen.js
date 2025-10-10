import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log('로그인 시도:', email, password);
const LOGIN_API_URL = 'https://165.229.125.173:8080/api/auth/signin'; // 실제 URL로 변경해야 합니다.

    try {
        const response = await fetch(LOGIN_API_URL, {
            method: 'POST', // 데이터 전송은 POST 메서드를 사용합니다.
            headers: {
                // 서버에 JSON 데이터를 보낸다고 알려줍니다.
                'Content-Type': 'application/json', 
            },
            // 2. 백엔드 DTO 규격에 맞춰 데이터를 JSON 문자열로 변환하여 보냅니다.
            // DTO에서 필드 이름이 'email'과 'password'였으므로, 여기서도 그대로 사용합니다.
            body: JSON.stringify({ 
                email: email, 
                password: password,
            }),
        });

        // 3. 서버 응답 처리
        if (response.ok) {
            // HTTP 상태 코드가 200번대인 경우 (성공)
            const data = await response.json();
            console.log('로그인 성공:', data);
            
            // 성공 시 메인 화면으로 이동
            navigation.replace('Main');
        } else {
            // HTTP 상태 코드가 400, 500번대인 경우 (실패)
            const errorData = await response.json();
            console.error('로그인 실패:', errorData);

            // 실패 메시지를 사용자에게 보여주는 로직 추가 (예: Alert.alert)
            alert(errorData.message || '로그인에 실패했습니다.'); 
        }
    } catch (error) {
        // 네트워크 연결 등 예상치 못한 오류 발생
        console.error('네트워크 오류:', error);
        alert('서버와 통신하는 중 문제가 발생했습니다.');
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