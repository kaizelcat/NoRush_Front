import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = () => {
    console.log('회원가입 시도:', form);
    navigation.navigate('Login');
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
        onChangeText={(value) => handleChange('phone', value)}
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
