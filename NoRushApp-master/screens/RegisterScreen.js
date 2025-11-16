import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

// ⭐️ 서버 정보 설정
const SERVER_HOST = 'http://54.180.137.9:8080'; 
const REGISTER_ENDPOINT = '/api/v1/auth/signup'; // 일반적인 FastAPI 회원가입 엔드포인트 가정

export default function RegisterScreen({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
    };

    // ⭐️ 회원가입 API 호출 로직 추가
// RegisterScreen.js 파일 내부의 handleSubmit 함수

    const handleSubmit = async () => {
        if (isLoading) return;

        // 1. 유효성 검사 (간단 버전)
        if (!form.name || !form.email || !form.phone || !form.password) {
            Alert.alert('오류', '모든 정보를 입력해주세요.');
            return;
        }

        // ⭐️ 전화번호에서 하이픈(-)을 제거하고 순수 숫자만 추출
        const cleanPhone = form.phone.replace(/-/g, '');

        console.log('회원가입 시도:', { ...form, phone: cleanPhone });
        setIsLoading(true);

        try {
            const response = await fetch(`${SERVER_HOST}${REGISTER_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // ⭐️ 수정된 cleanPhone 값을 전송
                body: JSON.stringify({ ...form, phone: cleanPhone }), 
            });

            const responseData = await response.json();
            
            if (response.ok && responseData.status === '201') { 
                Alert.alert('회원가입 성공', '회원가입이 완료되었습니다. 로그인 해주세요.');
                navigation.navigate('Login'); 
            } else {
                Alert.alert('회원가입 실패', responseData.msg || '이미 존재하는 사용자이거나 서버 오류입니다.');
            }
        } catch (error) {
            console.error('회원가입 중 네트워크 오류 발생:', error);
            Alert.alert('오류', '서버와 통신할 수 없습니다. IP 주소 및 네트워크 상태를 확인하세요.');
        } finally {
            setIsLoading(false);
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
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="전화번호"
                placeholderTextColor="#666666"
                value={form.phone}
                onChangeText={(value) => handleChange('phone', value)}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#666666"
                secureTextEntry
                value={form.password}
                onChangeText={(value) => handleChange('password', value)}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>회원가입 하기</Text>
                )}
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