import { useNavigation } from '@react-navigation/native';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. AsyncStorage 임포트

// 기본 이미지 URL 
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/100';
const LOGOUT_API_URL = 'http://172.24.16.1:8080/api/v1/auth/logout';

const MyPage = () => {
    const navigation = useNavigation();
    
    // 초기 상태를 null로 설정하여 로딩 상태를 구분
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);

    // 사용자 정보 로딩 함수
    const loadUserInfo = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('USER_INFO');
            if (jsonValue !== null) {
                const userInfo = JSON.parse(jsonValue);
                setUser(userInfo); // 로드된 실제 사용자 정보 저장, 추후 마이페이지에서 이용
            } else {
                // 로그인 정보가 없는 경우 기본값 또는 로그인 유도 처리
                setUser({ 
                    name: '비회원', 
                    email: '로그인이 필요합니다.',
                    profileImage: null, // 기본 이미지 사용
                });
            }
        } catch (e) {
            console.error('AsyncStorage 로드 중 오류 발생:', e);
            setUser({ name: '오류', email: '데이터 로드 실패', profileImage: null });
        } finally {
            setIsLoading(false); // 로딩 완료
        }
    };

    useEffect(() => {
        // 컴포넌트가 마운트될 때마다 정보를 불러오기
        loadUserInfo(); 
    }, [navigation]);

    const handleLogout = async () => {
        console.log('Mypage 로그아웃 버튼')
        // 1) 진짜로 로그아웃할지 확인
        // 필요 없으면 이 Alert 부분은 빼도 됨
        // import { Alert } from 'react-native'; 필요
        Alert.alert(
            '로그아웃',
            '정말 로그아웃하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // 2) 저장된 accessToken 꺼내오기
                            const accessToken = await AsyncStorage.getItem('accessToken');

                            // 3) 백엔드에 로그아웃 요청
                            await fetch(LOGOUT_API_URL, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: accessToken ? `Bearer ${accessToken}` : '',
                                },
                            });
                        } catch (e) {
                            console.error('로그아웃 요청 중 오류:', e);
                        } finally {
                            // 4) 로컬에 저장된 토큰/유저 정보 삭제
                            await AsyncStorage.removeItem('accessToken');
                            await AsyncStorage.removeItem('refreshToken');
                            await AsyncStorage.removeItem('USER_INFO');

                            // 5) 네비게이션 스택 초기화 후 로그인 화면으로 이동
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }], // 네가 사용 중인 로그인 스크린 이름
                            });
                        }
                    },
                },
            ],
        );
    };



    const renderMenuItem = (title, onPress, isLast = false) => (
        <TouchableOpacity style={[styles.menuItem, isLast && styles.lastMenuItem]} onPress={onPress}>
            <Text style={styles.menuText}>{title}</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
        </TouchableOpacity>
    );

    // 3. 로딩 중일 때 로딩 인디케이터를 표시합니다 (로딩중).
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#416cec" />
                    <Text style={{ marginTop: 10 }}>사용자 정보 로딩 중...</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    // 로딩이 완료되면 user 객체가 존재
    const profileImageUrl = user?.profileImage ? { uri: user.profileImage } : { uri: DEFAULT_PROFILE_IMAGE };
    const displayName = user?.name ? `${user.name}님` : '사용자님';
    const displayEmail = user?.email || '이메일 정보 없음';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>마이페이지</Text>
                </View>

                <View style={styles.profileSection}>
                    <Image
                        style={styles.profileImage}
                        source={profileImageUrl} // ⬅️ 저장된 프로필 이미지 사용
                    />
                    {/* 저장된 사용자 이름 사용 */}
                    <Text style={styles.profileName}>{displayName}</Text> 
                    {/* 저장된 이메일 사용 */}
                    <Text style={styles.profileEmail}>{displayEmail}</Text> 
                </View>

                <View style={styles.menuSection}>
                    {renderMenuItem('회원정보 수정', () => navigation.navigate('EditProfile'))}
                    {renderMenuItem('즐겨찾는 경로', () => navigation.navigate('Favorites'))}
                    {renderMenuItem('공지사항', () => navigation.navigate('Announcements'))}
                    {renderMenuItem('고객센터', () => navigation.navigate('Support'))}
                    {renderMenuItem('로그아웃', handleLogout, true)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f0f2f5', 
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    profileSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 30,
        marginBottom: 10,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 15,
        backgroundColor: '#e0e0e0', 
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    profileEmail: {
        fontSize: 16,
        color: '#888',
    },
    menuSection: {
        backgroundColor: '#fff',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f2f5', 
    },
    lastMenuItem: {
        borderBottomWidth: 0, 
    },
    menuText: {
        fontSize: 16,
        color: '#333',
    },
    menuArrow: {
        fontSize: 16,
        color: '#ccc',
    }
});


export default MyPage;