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
// ⭐️ react-native 기본 SafeAreaView 제거
import React, { useState, useEffect } from 'react'; // useRef 제거
// ⭐️ 새 SafeAreaView import 추가
import { SafeAreaView } from 'react-native-safe-area-context'; 

import KakaoMapView from '../components/KakaoMapView';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const MainScreen = () => {
  const navigation = useNavigation();

  // ⭐️ 1. 지도 초기 위치 상태 (위도, 경도)
  const [userLocation, setUserLocation] = useState(null); 
  
  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');

  // const mapViewRef = useRef(null); // ⭐️ Ref는 KakaoMapView 내부에서만 사용하도록 제거

  // 현재 위치 가져오기 (실제 GPS)
  const getMyCoordinates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      // ⭐️ 위치 권한이 거부된 경우, 지도를 서울 중심으로 띄우기 위해 null 반환
      return null; 
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords; // { latitude, longitude }
  };

  // ⭐️ 2. 컴포넌트 로드 시, 지도의 초기 위치를 가져오는 로직
  useEffect(() => {
    (async () => {
      const coords = await getMyCoordinates();
      if (coords) {
        // ⭐️ GPS 위치 가져오기 성공 로그 추가 (디버깅용)
        console.log('✅ GPS 위치 가져오기 성공:', coords.latitude, coords.longitude); 
        setUserLocation(coords); // { latitude, longitude } 형식 그대로 저장
      } else {
        console.log('❌ GPS 위치 가져오기 실패, 기본 위치 사용');
        // 권한 거부 등으로 위치를 못 가져오면, 임의의 기본값(서울 등) 설정
        setUserLocation({ latitude: 37.566826, longitude: 126.9786567 });
      }
    })();
  }, []);

  // 입력값 setter에 좌표 넣어주는 함수 (기존 코드 그대로 유지)
  const handleUseMyLocation = async (setter) => {
    const coords = await getMyCoordinates();
    if (!coords) {
        Alert.alert('알림', '위치 권한을 허용해주세요.');
        return;
    }
    
    console.log('내 좌표(lat, lng):', coords.latitude, coords.longitude);
    // ⭐️ 지도에 마커 표시 요청을 트리거하기 위해 userLocation 상태도 업데이트
    setUserLocation(coords); 
    setter(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
  };

  const handleSearch = async () => {
    if (!startStation || !endStation) {
      Alert.alert('알림', '출발지와 도착지를 모두 입력해주세요.');
      return;
    }

    Keyboard.dismiss();

    console.log(`검색 시작: ${startStation}에서 ${endStation}까지`);

    // TODO: 여기서 API 호출 후 응답 받아서 RouteResults로 넘기기
    navigation.navigate('RouteResults', {
      routeData: {
        start: startStation,
        end: endStation,
        customName: `${startStation} → ${endStation}`,
        etaMinutes: 27,
        segments: [],
        alternatives: [],
      },
    });
  };

  const swapLocations = () => {
    const temp = startStation;
    setStartStation(endStation);
    setEndStation(temp);
  };

  // ⭐️ 3. userLocation이 로드되기 전까지 로딩 화면 표시
  if (!userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#416cec" />
        <Text style={styles.loadingText}>위치 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // ⭐️ 4. userLocation이 로드된 후 메인 UI 렌더링
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {/* ⭐️ react-native-safe-area-context의 SafeAreaView 사용 */}
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar style="dark-content" />

          {/* === Search Container (기존 UI 유지) === */}
          <View style={styles.searchContainer}>
            {/* 출발지 입력 */}
            <View className="locationRow" style={styles.locationRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="출발지 (예: 강남)"
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
                placeholder="도착지 (예: 사당)"
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
              <Text style={styles.buttonText}>검색</Text>
            </TouchableOpacity>
          </View>

          {/* === Map Container (KakaoMapView에 userLocation 전달) === */}
          <View style={styles.mapContainer}>
            <KakaoMapView 
                // ref={mapViewRef} // ⭐️ KakaoMapView 내부에서 처리하므로 제거
                style={styles.mapView} 
                initialLocation={userLocation} // ⭐️ 여기로 위치 정보를 전달!
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

  // 출발지 / 도착지 한 줄 박스
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