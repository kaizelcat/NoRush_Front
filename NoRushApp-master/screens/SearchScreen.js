// 해당 페이지 삭제 후 RouteResultsScreen.js와 통합

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../setting';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

const API_URL = `http://${BASE_URL}:8080/api/v1/route/predict/station`;

// 혼잡도 예측값 (0~100)을 레벨로 변환
const getCongestionLevel = (value) => {
  if (value >= 80) return '매우 혼잡';
  if (value >= 60) return '혼잡';
  if (value >= 30) return '보통';
  return '여유';
};

// 현재 시간을 'YYYY-MM-DDTHH:mm:ss' 형식으로 반환
const getCurrentDatetime = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export default function SearchScreen() {
  const navigation = useNavigation();
  Alert.alert("검색 실패", "내용확인중");
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!startPoint || !endPoint || isLoading) {
      Alert.alert("필수 입력", "출발지와 도착지를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      // 토큰 가져오기
      const accessToken = await AsyncStorage.getItem("ACCESS_TOKEN");
      if (!accessToken) {
        Alert.alert("인증 오류", "로그인 정보가 없습니다.");
        return;
      }
      console.log("사용할 토큰:", accessToken);

      // const userInfo = JSON.parse(userInfoString);
      // const token = userInfo?.data?.accessToken;
      // console.log("사용할 토큰:", token);

      if (!accessToken) {
        Alert.alert("인증 오류", "Access Token이 없습니다.");
        setIsLoading(false);
        return;
      }

      // console.log("token 가져옴", accessToken);

      const currentDatetime = getCurrentDatetime();
      const requestBody = {
        from: startPoint,
        to: endPoint,
        datetime: currentDatetime,
      };

      console.log("현재 requestBody",requestBody);
      console.log("API 요청 시작:", requestBody);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, 
        },
        body: JSON.stringify(requestBody),
      });

      console.log("응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
      }

      const apiResponse = await response.json();
      console.log("API 응답:", apiResponse);

      const mainRoute = apiResponse?.result?.route?.[0];
      if (!mainRoute) {
        Alert.alert("검색 결과 없음", "해당 경로에 대한 정보를 찾을 수 없습니다.");
        return;
      }

      const info = mainRoute.info;

      // 모든 section을 변환
      const transformedSegments = Array.isArray(mainRoute.section)
  ? mainRoute.section.map(segment => {
      const isSubway = segment.trafficType === 1;
      const isWalk = segment.trafficType === 3;

      let line = segment.trafficName || (isSubway ? '지하철' : isWalk ? '도보' : '기타');
      let cars = [];

      if (isSubway && segment.passStopList?.stations?.length > 0) {
        // 모든 역을 돌면서 혼잡도 데이터 반영
        cars = segment.passStopList.stations.flatMap(station =>
          (station.predictedCongestionCar || []).map((value, index) => ({
            car: `${index + 1}`,
            level: getCongestionLevel(value),
            value,
            station: station.stationName,
          }))
        );
      }

      return {
        line,
        from: segment.startName || mainRoute.info.firstStartStation,
        to: segment.endName || mainRoute.info.lastEndStation,
        cars,
        summary: segment.sectionSummary || null,
      };
    })
  : [];


      const routeData = {
        id: info.mapObj,
        start: info.firstStartStation,
        end: info.lastEndStation,
        etaMinutes: info.totalTime,
        customName: `${info.firstStartStation} → ${info.lastEndStation}`,
        segments: transformedSegments,
        alternatives: [
          { time: '07:30', etaMinutes: info.totalTime - 10, avgCongestion: '여유' },
          { time: '08:45', etaMinutes: info.totalTime + 5, avgCongestion: '보통' },
          { time: '18:00', etaMinutes: info.totalTime + 15, avgCongestion: '매우 혼잡' },
        ]
      };

      console.log("전달할 routeData:", routeData);

      navigation.navigate("RouteResults", { routeData });

    } catch (error) {
      console.error(" 경로 검색 중 오류 발생:", error);
      Alert.alert("검색 실패", "경로를 찾지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const swapLocations = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  };

  const quickActions = [
    { icon: "home", label: "집", color: "#e0f2fe" },
    { icon: "briefcase", label: "직장", color: "#dcfce7" },
    { icon: "star", label: "즐겨찾기", color: "#f3e8ff" },
  ];

  const recentSearches = [
    { from: "Central Park", to: "Times Square", time: "2 hours ago" },
    { from: "Brooklyn Bridge", to: "SoHo", time: "Yesterday" },
  ];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.dotGreen} />
            <TextInput
              style={styles.input}
              placeholder="출발지"
              value={startPoint} 
              onChangeText={setStartPoint}
            />
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setStartPoint("현재 위치")}
            >
              <MaterialIcons name="my-location" size={20} color="gray" />
            </TouchableOpacity>
          </View>

          <View style={styles.centered}>
            <TouchableOpacity style={styles.swapBtn} onPress={swapLocations}>
              <MaterialIcons name="swap-vert" size={24} color="#4b5563" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.dotRed} />
            <TextInput
              style={styles.input}
              placeholder="도착지"
              value={endPoint} 
              onChangeText={setEndPoint}
            />
            <View style={styles.iconBtn} />
          </View>

          
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color="#2563eb" />
            <Text style={styles.timeText}>출발 시간 (현재 시각으로 검색)</Text>
          </View>

         
          <TouchableOpacity
            style={[styles.searchBtn, (!startPoint || !endPoint || isLoading) && styles.disabledBtn]}
            onPress={handleSearch}
            disabled={!startPoint || !endPoint || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="search" size={18} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.searchBtnText}>경로 검색</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

       
        <Text style={styles.sectionTitle}>퀵 메뉴</Text>
        <View style={styles.quickGrid}>
                    {quickActions.map((action, idx) => (
                        <TouchableOpacity key={idx} style={styles.quickItem}>
                            <View style={[styles.quickIconWrapper, { backgroundColor: action.color }]}>
                                <FontAwesome5 name={action.icon} size={16} />
                            </View>
                            <Text style={styles.quickLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>최근 검색 경로</Text>
                {recentSearches.map((search, idx) => (
                    <View key={idx} style={styles.recentCard}>
                        <Ionicons name="time-outline" size={16} color="#9ca3af" />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.recentText}>
                                {search.from} → {search.to}
                            </Text>
                            <Text style={styles.recentTime}>{search.time}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0f8ff" },
    section: { padding: 16 },
    card: { backgroundColor: "white", padding: 20, borderRadius: 16, marginBottom: 24, },
    inputRow: { backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 12, flexDirection: "row", alignItems: "center", },
    dotGreen: { width: 8, height: 8, backgroundColor: "#22c55e", borderRadius: 4, marginRight: 12 },
    dotRed: { width: 8, height: 8, backgroundColor: "#ef4444", borderRadius: 4, marginRight: 12 },
    input: { flex: 1, fontSize: 16, paddingVertical: 14 },
    iconBtn: { marginLeft: 8, padding: 6 },
    centered: { alignItems: "center", marginVertical: -14, zIndex: 1 },
    swapBtn: { backgroundColor: "white", borderRadius: 999, padding: 6, borderWidth: 1, borderColor: "#e5e7eb" },
    timeRow: { backgroundColor: "#e0f2fe", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 12 },
    timeText: { fontSize: 14, fontWeight: "500", color: "#0c4a6e", marginLeft: 8, flex: 1 },
    searchBtn: { backgroundColor: "#3b82f6", paddingVertical: 16, borderRadius: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" },
    disabledBtn: { backgroundColor: "#9ca3af" },
    searchBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
    sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 12, marginTop: 16, color: '#4b5563' },
    quickGrid: { flexDirection: "row", justifyContent: "space-around" },
    quickItem: { flex: 1, alignItems: "center", padding: 8 },
    quickIconWrapper: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
    quickLabel: { fontSize: 14, color: "#374151" },
    recentCard: { flexDirection: "row", backgroundColor: "white", padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6' },
    recentText: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
    recentTime: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});
