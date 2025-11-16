// MainScreen.js (충돌 해결 완료)

import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import React, { useState, useEffect } from 'react';
import KakaoMapView from '../components/KakaoMapView';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

// ⭐️ 서버 IP 주소와 포트 적용
const SERVER_URL = 'http://54.180.137.9:8080'; 
const API_ENDPOINT = '/api/v1/route/predict/station'; 


const MainScreen = () => {
  const navigation = useNavigation();
  const [userLocation, setUserLocation] = useState(null); 
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');

  // 현재 위치 가져오기 (실제 GPS)
  const getMyCoordinates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null; 
    }
    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  };

  // 컴포넌트 로드 시, 지도의 초기 위치를 가져오는 로직
  useEffect(() => {
    (async () => {
      const coords = await getMyCoordinates();
      if (coords) {
        console.log('✅ GPS 위치 가져오기 성공:', coords.latitude, coords.longitude); 
        setUserLocation(coords); 
      } else {
        console.log('❌ GPS 위치 가져오기 실패, 기본 위치 사용');
        setUserLocation({ latitude: 37.566826, longitude: 126.9786567 });
      }
    })();
  }, []);

  // '내 위치' 버튼 클릭 시 호출
  const handleUseMyLocation = async (setter) => {
    const coords = await getMyCoordinates();
    if (!coords) {
        Alert.alert('알림', '위치 권한을 허용해주세요.');
        return;
    }
    
    console.log('내 좌표(lat, lng):', coords.latitude, coords.longitude);
    setUserLocation(coords); 
    // 서버는 장소 이름을 요구하므로, 임시로 좌표를 넣지만, 사용자에게 변경 안내
    setter(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`); 
    Alert.alert('안내', '경로 검색을 위해 입력창의 좌표를 장소 이름(예: 서울역)으로 변경해주세요.');
  };

  // ⭐️ [충돌 해결 완료] API 연동 로직 채택
  const handleSearch = async () => {
    if (!startStation || !endStation) {
      Alert.alert('알림', '출발지와 도착지를 모두 입력해주세요.');
      return;
    }

    // 1. 팀원 코드를 반영하여 키보드 닫기
    Keyboard.dismiss(); 

    // 2. 좌표 입력 방지 유효성 검사 (사용자 코드 채택)
    if (startStation.includes(',') || endStation.includes(',')) {
        Alert.alert('입력 오류', '출발지와 도착지는 "서울역"과 같은 장소 이름으로 입력해야 합니다.');
        return;
    }

    // 3. 서버가 요구하는 datetime 형식 생성 (사용자 코드 채택)
    const now = new Date();
    const datetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    try {
        console.log(`📡 경로 검색 요청: ${startStation} -> ${endStation} at ${datetime}`);

        // 4. API 호출
        const response = await fetch(`${SERVER_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: startStation, // ⭐️ 장소 이름
                to: endStation,     // ⭐️ 장소 이름
                datetime: datetime, 
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`서버 응답 오류: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        
        if (responseData && responseData.result) {
            console.log('✅ API 응답 성공, RouteResults로 이동');
            
            navigation.navigate('RouteResults', {
                routeData: responseData.result,
                customName: `${startStation} → ${endStation}`, 
            });
        } else {
             throw new Error("경로 데이터가 응답 결과(result 필드)에 포함되지 않았습니다.");
        }

    } catch (error) {
        console.error("경로 검색 중 오류 발생:", error);
        Alert.alert('검색 실패', `경로 추천 서버 통신 오류: ${error.message}`);
    }
  };
  
  const swapLocations = () => {
    const temp = startStation;
    setStartStation(endStation);
    setEndStation(temp);
  };

  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#416cec" />
        <Text style={styles.loadingText}>위치 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar style="dark-content" />

          {/* === Search Container UI === */}
          <View style={styles.searchContainer}>
            {/* 출발지 입력 */}
            <View className="locationRow" style={styles.locationRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="출발지 (예: 서울역)" // ⭐️ 사용자 코드로 최종 채택
                placeholderTextColor="#888"
                value={startStation}
                onChangeText={setStartStation}
              />
              <TouchableOpacity
                style={styles.locationIconWrapper}
                onPress={() => handleUseMyLocation(setStartStation)}
              >
                <MaterialIcons name="my-location" size={20} color="#777" />
              </TouchableOpacity>
            </View>

            {/* Swap 버튼 */}
            <View style={styles.centered}>
              <TouchableOpacity style={styles.swapBtn} onPress={swapLocations}>
                <MaterialIcons name="swap-vert" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* 도착지 입력 */}
            <View style={[styles.locationRow, { marginTop: 10 }]}>
              <TextInput
                style={styles.searchInput}
                placeholder="도착지 (예: 홍대입구역)" // ⭐️ 사용자 코드로 최종 채택
                placeholderTextColor="#888"
                value={endStation}
                onChangeText={setEndStation}
              />
              <TouchableOpacity
                style={styles.locationIconWrapper}
                onPress={() => handleUseMyLocation(setEndStation)}
              >
                <MaterialIcons name="my-location" size={20} color="#777" />
              </TouchableOpacity>
            </View>

            {/* 검색 버튼 */}
            <TouchableOpacity style={styles.findPathButton} onPress={handleSearch}>
              <Text style={styles.buttonText}>경로 검색</Text>
            </TouchableOpacity>
          </View>

          {/* === Map Container === */}
          <View style={styles.mapContainer}>
            <KakaoMapView 
                style={styles.mapView} 
                initialLocation={userLocation}
            />
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4b5563',
  },
  searchContainer: {
    marginTop: 30,
    paddingVertical: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  locationIconWrapper: {
    width: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  centered: {
    alignItems: 'center',
    marginVertical: 6,
  },
  swapBtn: {
    backgroundColor: 'white',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  findPathButton: {
    marginTop: 10,
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#416cec',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapView: {
    flex: 1,
  },
});

export default MainScreen;