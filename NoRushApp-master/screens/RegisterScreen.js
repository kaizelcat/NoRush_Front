// RegisterScreen.js (충돌 해결 및 기능 통합 완료)

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

// ⭐️ 서버 정보 설정 (사용자님의 HEAD 코드로 확정)
const SERVER_HOST = 'http://54.180.137.9:8080'; 
const REGISTER_ENDPOINT = '/api/v1/auth/signup'; 
// BASE_URL은 setting.js에서 import 해야 하나, 충돌 시 안전을 위해 직접 URL 사용

export default function RegisterScreen({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        // ⭐️ 필드 이름: 팀원 코드(upstream)의 'phoneNumber'로 통일
        phoneNumber: '', 
        password: ''
    });
    // ⭐️ 로딩 상태와 필드별 에러 상태 모두 사용 (두 코드의 장점 통합)
    const [isLoading, setIsLoading] = useState(false); 
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

        // 요청할 때마다 이전 에러 초기화
        setFieldErrors({});
        setIsLoading(true);

        // ⭐️ 전화번호에서 하이픈(-)을 제거하고 순수 숫자만 추출 (사용자 코드 채택)
        const cleanPhone = form.phoneNumber.replace(/-/g, '');
        
        // ⭐️ 서버에 전송할 최종 데이터 (cleanPhone 사용)
        const dataToSend = {
            name: form.name,
            email: form.email,
            phoneNumber: cleanPhone, // 클렌징된 전화번호 사용
            password: form.password,
        };

        try {
            console.log('회원가입 시도 데이터:', dataToSend);
            
            const response = await fetch(`${SERVER_HOST}${REGISTER_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend), 
            });

            // 2. 서버 응답 처리 (팀원 코드의 견고한 파싱 로직 채택)
            const responseText = await response.text(); 
            let data = null;
            
            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('JSON 파싱 오류:', jsonError);
            }

            if (response.ok) { 
                console.log('회원가입 성공:', data);
                Alert.alert('성공', '회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
                navigation.navigate('Login'); 
            } else { 
                console.log("회원가입 실패 (응답:", data);
                
                // 3. 필드별 오류 메시지 처리 (팀원 코드 채택)
                if(data && Array.isArray(data.errors)) {
                    const mappedErrors = {};
                    data.errors.forEach((err) => {
                        mappedErrors[err.field] = err.reason; // 첫 번째 에러 메시지만 사용
                    });
                    setFieldErrors(mappedErrors); // 인풋 밑에 표시
                    Alert.alert('입력 오류', '입력된 정보를 확인해주세요.');
                    return;
                }

                // errors 배열이 없을 때 일반적인 메시지 표시
                const msg =
                    (data && (data.resultMsg || data.message)) ||
                    '서버에서 오류가 발생했습니다. 다시 시도해 주세요.';
                Alert.alert('회원가입 실패', msg);
            }
        } catch (error) { 
            console.error('네트워크 또는 요청 오류:', error);
            Alert.alert('오류', '네트워크 연결 상태를 확인하거나 서버 관리자에게 문의하세요.');
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
            {fieldErrors.name && (<Text style={styles.errorText}>{fieldErrors.name}</Text>)}
            

            <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor="#666666"
                value={form.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {fieldErrors.email && (<Text style={styles.errorText}>{fieldErrors.email}</Text>)}
            

            <TextInput
                style={styles.input}
                placeholder="전화번호 (하이픈 없이)"
                placeholderTextColor="#666666"
                // ⭐️ form.phoneNumber로 변경
                value={form.phoneNumber} 
                onChangeText={(value) => handleChange('phoneNumber', value)}
                keyboardType="phone-pad"
            />
            {fieldErrors.phoneNumber && (<Text style={styles.errorText}>{fieldErrors.phoneNumber}</Text>)}
            

            <TextInput
                style={styles.input}
                placeholder="비밀번호"
                placeholderTextColor="#666666"
                secureTextEntry
                value={form.password}
                onChangeText={(value) => handleChange('password', value)}
            />
            {fieldErrors.password && (<Text style={styles.errorText}>{fieldErrors.password}</Text>)}
            

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
    // ⭐️ 에러 텍스트 스타일 (팀원 코드 채택)
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