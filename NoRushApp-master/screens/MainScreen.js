// MainScreen.js (MainScreen 파일명은 가정)

import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from 'react-native';
import React, { useState, useRef } from 'react';
import KakaoMapView from '../components/KakaoMapView';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const MainScreen = () => {
  const navigation = useNavigation();

  const [startStation, setStartStation] = useState('');
  const [endStation, setEndStation] = useState('');

  const mapViewRef = useRef(null);

  // 현재 위치 가져오기 (실제 GPS)
  const getMyCoordinates = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('위치 권한이 필요합니다.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords; // { latitude, longitude }
  };

  // 입력값 setter에 좌표 넣어주는 함수
  const handleUseMyLocation = async (setter) => {
    const coords = await getMyCoordinates();
    if (!coords) return;
    console.log('내 좌표(lat, lng):', coords.latitude, coords.longitude);
    setter(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
  };
const handleSearch = async () => {
  if (!startStation || !endStation) {
    Alert.alert('알림', '출발지와 도착지를 모두 입력해주세요.');
    return;
  }

  Keyboard.dismiss();

  console.log(`검색 시작: ${startStation}에서 ${endStation}까지`);

  // 여기서 API 호출은 하지 않고, 입력값을 RouteResults로 넘김
  navigation.navigate('RouteResults', {
    from: startStation,       // 출발역
    to: endStation,           // 도착역
    datetime: getCurrentDatetime(), 
  });
};

const getCurrentDatetime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // 현재 시, 분, 초를 가져와 포맷에 맞게 추가
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    // YYYY-MM-DDTHH:MM:SS 형식으로 반환
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


  const swapLocations = () => {
    const temp = startStation;
    setStartStation(endStation);
    setEndStation(temp);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar style="dark-content" />

          <View style={styles.searchContainer}>
            {/* 출발지 입력 */}
            <View className="locationRow" style={styles.locationRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="출발지 (예: 강남역)"
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
                placeholder="도착지 (예: 사당역)"
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

          <View style={styles.mapContainer}>
            <KakaoMapView ref={mapViewRef} style={styles.mapView} /> 

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
    // 지도 영역을 확보하기 위한 높이 설정
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
