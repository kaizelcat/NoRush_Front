// 회원가입 페이지
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'; // Alert 추가
import { BASE_URL } from '../setting';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => { // async 함수
    const API_URL = `http://${BASE_URL}/api/v1/auth/signup`;

    if (!form.name || !form.email || !form.password) {
      Alert.alert('필수 정보 누락', '이름, 이메일, 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      console.log('회원가입 시도 데이터:', form);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
        }),
      });

       const responseText = await response.text(); 
      console.log('HTTP 상태 코드:', response.status);
      console.log('서버 응답 본문 (TEXT):', responseText); 
      
      let data = null;
      if (response.ok) { 
        try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                // JSON 파싱 실패 시 처리
                console.error('JSON 파싱 오류:', jsonError);
                Alert.alert('응답 오류', '서버 응답이 JSON 형식이 아닙니다.');
                return;
            }
        console.log('회원가입 성공:', data);
        Alert.alert('성공', '회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
        navigation.navigate('Login'); 
      } else { 
        console.error('회원가입 실패 응답:', data);
        // 서버에서 제공하는 오류 메시지가 있다면 표시
        Alert.alert('회원가입 실패', data.message || '서버에서 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    } catch (error) { 
      console.error('네트워크 또는 요청 오류:', error);
      Alert.alert('오류', '네트워크 연결 상태를 확인하거나 서버 관리자에게 문의하세요.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>회원가입</Text>

      <TextInput
        style={styles.input}
        placeholder="이름"
        placeholderTextColor="#666666"
        value={form.name}
        onChangeText={(value) => handleChange('name', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="이메일"
        placeholderTextColor="#666666"
        value={form.email}
        onChangeText={(value) => handleChange('email', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="전화번호"
        placeholderTextColor="#666666"
        value={form.phone}
        onChangeText={(value) => handleChange('phoneNumber', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#666666"
        secureTextEntry
        value={form.password}
        onChangeText={(value) => handleChange('password', value)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>회원가입 하기</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.bottomText}>
          이미 계정이 있으신가요? <Text style={styles.linkText}>로그인</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#ffffff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomText: { marginTop: 16, fontSize: 14, color: '#333' },
  linkText: { color: '#2196F3', fontWeight: 'bold' }
});
