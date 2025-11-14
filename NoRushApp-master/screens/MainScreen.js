// MainScreen.js (MainScreen 파일명은 가정)

import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Alert } from 'react-native';
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
      Alert.alert("위치 권한이 필요합니다.");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords; // { latitude, longitude }
  };

  // setter에 좌표 넣어주는 함수
  const handleUseMyLocation = async (setter) => {
    const coords = await getMyCoordinates();
    if (!coords) return;
    console.log("내 좌표(lat, lng):", coords.latitude, coords.longitude);
    // 입력칸에 좌표 넣기
    setter(`${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`);
  };

  const handleSearch = async () => {
    if (!startStation || !endStation) {
      Alert.alert('알림', '출발지와 도착지를 모두 입력해주세요.');
      return;
    }

    Keyboard.dismiss();

    console.log(`검색 시작: ${startStation}에서 ${endStation}까지`);

    // [여기에 POST API 호출 코드가 들어갈 자리]
    // const postData = {
    //   start_station: startStation,
    //   end_station: endStation,
    //   line_name: "2호선", // (참고) 호선 정보는 어떻게 받을지 백엔드와 협의 필요
    //   hour_of_day: new Date().getHours() 
    // };
    // try {
    //   const response = await fetch('https://.../api/v1/predict/train_congestion', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(postData)
    //   });
    //   const data = await response.json();
    //   console.log('API 응답:', data);

    //   // [여기에 지도에 마커 그리는 코드가 들어갈 자리]
    //   // (KakaoMapView.js의 Ref를 이용해 WebView로 데이터를 쏴야 함)
    //   if (mapViewRef.current) {
    //     // mapViewRef.current.drawMarkers(data.station_congestion_details);
    //   }

    // } catch (error) {
    //   console.error("API 호출 에러:", error);
    //   Alert.alert("오류", "경로를 검색하는 중 문제가 발생했습니다.");
    // }
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
          <StatusBar style='dark-content' />

          <View style={styles.searchContainer}>
            {/*출발지 입력*/}
            <View style={styles.locationRow}>
              
            <TextInput
                style={styles.searchInput}
                placeholder="출발지 (예: 강남)"
                placeholderTextColor="#888"
                value={startStation} 
                onChangeText={setStartStation} 
              />
              {/*현재 위치 버튼*/}
              <TouchableOpacity
                style={styles.locationIconWrapper}
                onPress={() => handleUseMyLocation(setStartStation)}
              >
                <MaterialIcons name="my-location" size={20} color="#777" />
              </TouchableOpacity>
            </View>

            {/*Swap*/}
            <View style={styles.centered}>
              <TouchableOpacity style={styles.swapBtn} onPress={swapLocations}>
                <MaterialIcons name="swap-vert" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            {/*도착지 입력*/}
            <View style={[styles.locationRow, {marginTop: 10}]}>
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
            {/*검색 버튼*/}
            <TouchableOpacity 
              style={styles.findPathButton} 
              onPress={handleSearch} 
            >
              <Text style={styles.buttonText}>혼잡도 경로 검색</Text>
            </TouchableOpacity>
          </View>
          {/*카카오 맵*/}
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

  // 한 줄 전체 박스 (출발지/도착지 공통)
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
});

export default MainScreen;