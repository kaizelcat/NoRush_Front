import { useNavigation } from '@react-navigation/native';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 1. AsyncStorage 임포트

// 기본 이미지 URL 
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/100';

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


    const renderMenuItem = (title, onPress, isLast = false) => (
        <TouchableOpacity style={[styles.menuItem, isLast && styles.lastMenuItem]} onPress={onPress}>
            <Text style={styles.menuText}>{title}</Text>
            <Text style={styles.menuArrow}>{'>'}</Text>
        </TouchableOpacity>
    );

    // 로딩 중일 때 로딩 인디케이터를 표시 (로딩중)
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
    
    // 로딩이 완료되면 user 객체가 존재 -> 마이페이지에 띄우기
    const profileImageUrl = user?.profileImage ? { uri: user.profileImage } : { uri: DEFAULT_PROFILE_IMAGE };
    const displayName = user?.userInfo?.name ? `${user.userInfo.name}님` : '사용자님';
    const displayEmail = user?.userInfo?.email || '이메일 정보 없음';

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>마이페이지</Text>
                </View>

                <View style={styles.profileSection}>
                    <Image
                        style={styles.profileImage}
                        source={profileImageUrl} // 저장된 프로필 이미지 사용
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
                    {renderMenuItem('로그아웃', () => { /* 로그아웃 로직 구현 */ }, true)}
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