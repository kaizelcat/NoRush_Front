// routeResults.js
// import { Feather } from '@expo/vector-icons';
// import { useLocalSearchParams } from 'expo-router';
// import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const tabs = ['빠른 경로', '버스', '지하철', '도보'];

const routes = [
  {
    id: 'bus-transit',
    name: '버스 이용 경로',
    type: '버스',
    icon: 'activity',
    duration: 38,
    distance: '9.1 km',
    congestionPercentage: 35,
    cost: '₩1,250',
    costType: '요금',
    recommended: false,
    estimatedArrival: '오후 3:38',
    trafficStatus: '보통',
  },
  {
    id: 'subway-fast',
    name: '지하철 급행',
    type: '지하철',
    icon: 'train',
    duration: 30,
    distance: '10.5 km',
    congestionPercentage: 45,
    cost: '₩1,350',
    costType: '요금',
    recommended: false,
    estimatedArrival: '오후 3:35',
    trafficStatus: '약간 혼잡',
  },
  {
    id: 'bike-route',
    name: '자전거 도로',
    type: '도보',
    icon: 'activity',
    duration: 52,
    distance: '11.2 km',
    congestionPercentage: 0,
    cost: '₩0',
    costType: '무료',
    recommended: false,
    estimatedArrival: '오후 3:52',
    trafficStatus: '매우 원활',
  },
];

export default function RouteResultsScreen() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedTab, setSelectedTab] = useState('빠른 경로');
  const [favorites, setFavorites] = useState({});
  // const { startPoint, endPoint } = useLocalSearchParams();
  const navigation = useNavigation();
  const route = useRoute();
  const { startPoint, endPoint } = route.params;

  const handleSelect = (id) => {
    setSelectedRoute(id);
    setTimeout(() => {}, 300);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRoutes =
    selectedTab === '빠른 경로'
      ? routes
      : routes.filter((route) => route.type === selectedTab);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>검색 결과</Text>
        <Text>
          {startPoint} → {endPoint}
        </Text>
      </View>

      <View style={styles.statsBox}>
        <StatBox label="경로 수" value={filteredRoutes.length.toString()} color="#3B82F6" />
        <StatBox label="소요 시간" value="28–52" color="#10B981" />
      </View>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.activeTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredRoutes.map((route) => (
        <TouchableOpacity
          key={route.id}
          style={[styles.routeCard, route.recommended && styles.routeCardRecommended]} // selected 스타일은 일단 제거
          // onPress를 navigation으로 변경합니다.
          onPress={() => navigation.navigate('SubwayCongestion', {
            routeId: route.id,
            routeName: route.name,
          })}
        >
          <View style={styles.routeHeader}>
            <Feather name={route.icon} size={24} color="#1F2937" />
            <View style={styles.routeNameRow}>
              <Text style={styles.routeName}>{route.name}</Text>
              <TouchableOpacity onPress={() => toggleFavorite(route.id)}>
                <Feather
                  name={favorites[route.id] ? 'star' : 'star'}
                  size={20}
                  color={favorites[route.id] ? '#FBBF24' : '#D1D5DB'}
                  style={styles.favoriteIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.rightAlign}>
              {selectedRoute === route.id ? (
                <ActivityIndicator color="#3B82F6" size="small" />
              ) : (
                <>
                  <Text style={styles.duration}>{route.duration}분</Text>
                  <Text style={styles.distance}>{route.distance}</Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.metricsBox}>
            <Text style={styles.metricLabel}>혼잡도: {getCongestionLabel(route.congestionPercentage)}</Text>
            <Text style={styles.metricLabel}>비용: {route.cost} ({route.costType})</Text>
            <Text style={styles.metricLabel}>도착 예정: {route.estimatedArrival}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function StatBox({ label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', color }}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function getCongestionLabel(percent) {
  if (percent <= 30) return '원활';
  if (percent <= 60) return '보통';
  if (percent <= 80) return '혼잡';
  return '매우 혼잡';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EFF6FF' },
  headerBox: { padding: 16, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  subText: { fontSize: 14, color: '#6B7280' },
  statsBox: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeTab: { backgroundColor: '#3B82F6' },
  tabText: { fontSize: 14, color: '#374151' },
  activeTabText: { color: '#FFFFFF', fontWeight: 'bold' },
  statBox: { alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6B7280' },
  routeCard: {
    margin: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  routeCardSelected: { borderColor: '#3B82F6', backgroundColor: '#DBEAFE' },
  routeCardRecommended: { borderColor: '#10B981', backgroundColor: '#D1FAE5' },
  routeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeNameRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  routeName: { fontSize: 16, fontWeight: 'bold', textAlign: 'left', color: '#1F2937' },
  favoriteIcon: { marginLeft: 8 },
  rightAlign: { alignItems: 'flex-end', minWidth: 64 },
  duration: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  distance: { fontSize: 12, color: '#6B7280' },
  metricsBox: { marginTop: 12 },
  metricLabel: { fontSize: 12, color: '#4B5563', marginBottom: 2 },
});
