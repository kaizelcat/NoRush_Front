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

  // 필드별 에러메시지 상태
  const [fieldErrors, setFieldErrors] = useState({});


  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => { // ① async 함수
    const API_URL = `http://${BASE_URL}:8080/api/v1/auth/signup`;

    // 요청할때마다 이전 에러 초기화
    setFieldErrors({});

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
      
       // 성공/실패 상관없이 먼저 JSON 파싱
      let data = null;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        // 파싱이 안 되면 data는 그냥 null로 둠
      }

      if (response.ok) { 
        console.log('회원가입 성공:', data);
        Alert.alert('성공', '회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
        navigation.navigate('Login'); 
      } else { 
        console.log("회원가입 실패 (응답만 출력함)");
        // 서버에서 제공하는 오류 메시지가 있다면 표시
       
        if(data&&Array.isArray(data.errors)) {
          const mappedErrors = {};

          data.errors.forEach((err) => {
            const field = err.field;   // "email", "phoneNumber", "name", "password"
            const reason = err.reason; // "이메일을 입력해주세요." 등

            if (mappedErrors[field]) {
              mappedErrors[field] += `\n${reason}`; // 같은 필드 여러 에러면 줄바꿈으로 이어붙이기
            } else {
              mappedErrors[field] = reason;
            }
          });

          // 인풋밑에 표시 
          setFieldErrors(mappedErrors);
          return;
        }

        //errors 배열이 없을때
        const msg =
          (data && (data.resultMsg || data.message)) ||
          '서버에서 오류가 발생했습니다. 다시 시도해 주세요.';
        Alert.alert('회원가입 실패', msg);
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
      {fieldErrors.name && (
        <Text style={styles.errorText}>{fieldErrors.name}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="이메일"
        placeholderTextColor="#666666"
        value={form.email}
        onChangeText={(value) => handleChange('email', value)}
      />
      {fieldErrors.email && (
        <Text style={styles.errorText}>{fieldErrors.email}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="전화번호"
        placeholderTextColor="#666666"
        value={form.phoneNumber}
        onChangeText={(value) => handleChange('phoneNumber', value)}
      />
      {fieldErrors.phoneNumber && (
        <Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#666666"
        secureTextEntry
        value={form.password}
        onChangeText={(value) => handleChange('password', value)}
      />
      {fieldErrors.password && (
        <Text style={styles.errorText}>{fieldErrors.password}</Text>
      )}

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
  errorText: {  
    width: '100%',
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  button: { backgroundColor: '#2196F3', paddingVertical: 14, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomText: { marginTop: 16, fontSize: 14, color: '#333' },
  linkText: { color: '#2196F3', fontWeight: 'bold' }
});
