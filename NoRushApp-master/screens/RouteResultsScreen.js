import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../contexts/FavoritesContext';

import AsyncStorage from '@react-native-async-storage/async-storage';

const getAccessToken = async () => {
  return await AsyncStorage.getItem("ACCESS_TOKEN_KEY");
};


const HERO_MAX_HEIGHT = 180;
const COLLAPSE_DISTANCE = 110;
const STICKY_SHOW_AT = COLLAPSE_DISTANCE * 0.9;
const MIN_EXTRA_SCROLL = 320;

const getCongestionStyle = (level) => {
  switch (level) {
    case '매우 혼잡': return { bg: '#FDECEC', fg: '#B81E1E', bd: '#F8CACA' };
    case '혼잡':      return { bg: '#EEF5FF', fg: '#1E5BB8', bd: '#D9E7FF' };
    case '보통':      return { bg: '#FFF7E6', fg: '#8A5A00', bd: '#FFE3B3' };
    case '여유':      return { bg: '#E6F9EF', fg: '#127C50', bd: '#BFEEDB' };
    default:          return { bg: '#EEE', fg: '#333', bd: '#DDD' };
  }
};

export default function RouteResultScreen({ route, navigation }) {
  const routeData = route?.params?.routeData || null;
  console.log("RouteResultScreen routeData:", routeData);

  if (!routeData) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>경로 데이터가 없습니다.</Text>  
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1E5BB8',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 999,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>뒤로가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //  즐겨찾기 Context 연결 및 데이터 추출
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const [routeId] = useState(
    routeData.id ??
      `${routeData.start ?? ''}-${routeData.end ?? ''}-${Date.now()}`
  );

  const etaMinutes = routeData?.etaMinutes ?? '-';
  //  수정된 부분: 대안 경로의 존재 여부를 확인합니다.
  const hasAlternatives = Array.isArray(routeData.alternatives) && routeData.alternatives.length > 0;

  // 스크롤 애니메이션 (유지)
  const scrollY = useRef(new Animated.Value(0)).current;

  const heroHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [HERO_MAX_HEIGHT, 0],
    extrapolate: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.6, COLLAPSE_DISTANCE],
    outputRange: [1, 0.2, 0],
    extrapolate: 'clamp',
  });
  const etaScale = scrollY.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const stickyOpacity = scrollY.interpolate({
    inputRange: [STICKY_SHOW_AT - 10, STICKY_SHOW_AT, STICKY_SHOW_AT + 40],
    outputRange: [0, 0.01, 1],
    extrapolate: 'clamp',
  });
  const stickyTranslateY = scrollY.interpolate({
    inputRange: [STICKY_SHOW_AT, STICKY_SHOW_AT + 40],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });

  const statusBarTop =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  //  하트 버튼 토글 핸들러
  const handleToggleFavorite = () => {
    if (!routeData) return;

    if (isFavorite(routeId)) {
      removeFromFavorites(routeId);
      Alert.alert('즐겨찾기 해제', '해당 경로가 즐겨찾기에서 제거되었습니다.');
    } else {
      addToFavorites({ ...routeData, id: routeId });
      Alert.alert('즐겨찾기 추가', '해당 경로가 즐겨찾기에 저장되었습니다.');
    }
  };

  const currentlyFavorited = isFavorite(routeId);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* ── 큰 히어로 (접힘) ── */}
      <Animated.View
        style={[
          styles.heroShell,
          { height: heroHeight, opacity: heroOpacity, overflow: 'hidden' },
        ]}
      >
        <LinearGradient
          colors={['#1E5BB8', '#2A6DE0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroTopRow}>
            {/* 작은 뒤로가기 버튼 */}
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backInlineButton}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={18} color="#1E5BB8" />
              <Text style={styles.backInlineText}>뒤로가기</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {/* 즐겨찾기 하트 버튼 */}
              <TouchableOpacity
                style={styles.iconButtonGhost}
                onPress={handleToggleFavorite}
              >
                <Ionicons
                  name={currentlyFavorited ? 'heart' : 'heart-outline'}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButtonGhost}
                onPress={() => Alert.alert('공유', '이 경로를 공유합니다.')}
              >
                <Ionicons
                  name="share-social-outline"
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 타이틀 + 출발→도착 + ETA 칩 */}
          <View style={{ marginTop: 8 }}>
            <Text style={styles.heroTitle}>
              {routeData?.customName ?? '경로 상세'}
            </Text>
            <View style={styles.heroSubRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.heroSubText}>
                {routeData?.start ?? '-'}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.heroSubText}>{routeData?.end ?? '-'}</Text>

              {/* ETA 칩 */}
              <View style={styles.etaChip}>
                <Ionicons name="time-outline" size={12} color="#1E5BB8" />
                <Text style={styles.etaChipText}>{etaMinutes}분</Text>
              </View>
            </View>
          </View>

          {/* 큰 ETA */}
          <Animated.View
            style={[styles.heroEtaBox, { transform: [{ scale: etaScale }] }]}
          >
            <Text style={styles.heroEta}>{etaMinutes}분</Text>
            <Text style={styles.heroEtaSub}>예상 소요시간</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* ── 스티키 헤더 (접히면 등장: 출발→도착 + ETA) ── */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.stickyHeader,
          {
            paddingTop: statusBarTop + 4,
            opacity: stickyOpacity,
            transform: [{ translateY: stickyTranslateY }],
          },
        ]}
      >
        <View style={styles.stickyBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.stickyBackBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={22} color="#1E5BB8" />
          </TouchableOpacity>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.stickyTitle} numberOfLines={1}>
              {(routeData?.start ?? '-')} → {(routeData?.end ?? '-')}
            </Text>
            <Text style={styles.stickyEta}>{etaMinutes}분</Text>
          </View>

          <View style={{ width: 32 }} />
        </View>
      </Animated.View>

      {/* ── 본문 ── */}
      <Animated.ScrollView
        contentContainerStyle={{
          paddingBottom: 24,
          minHeight: HERO_MAX_HEIGHT + MIN_EXTRA_SCROLL,
        }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* 타임라인 + 구간/칸 */}
        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <View style={styles.card}>
            {/* 💡 경로 세그먼트가 여기서 렌더링됩니다. */}
            {routeData?.segments?.map((segment, idx) => (
              <View
                key={`${segment.line}-${idx}`}
                style={{
                  marginBottom:
                    idx < routeData.segments.length - 1 ? 18 : 6,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.timelineCol}>
                    <View style={styles.timelineDot} />
                    {idx < routeData.segments.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={{ flex: 1, paddingBottom: 8 }}>
                    {/* 교통수단 뱃지 */}
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: '#F2F7FF',
                          borderColor: '#D9E7FF',
                          alignSelf: 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: '#1E5BB8' },
                        ]}
                      >
                        {segment.line}
                      </Text>
                    </View>
                    <Text style={styles.segmentText}>
                      {segment.from} → {segment.to}
                    </Text>

                    {/* 혼잡도 정보 */}
                    {Array.isArray(segment.cars) &&
                      segment.cars.length > 0 && (
                        <View style={{ marginTop: 10 }}>
                          <Text style={styles.sectionLabel}>
                            칸 선택 (혼잡도 확인)
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              flexWrap: 'wrap',
                            }}
                          >
                            {segment.cars.map((car, carIdx) => {
                              const c = getCongestionStyle(car.level);
                              const active = false;
                              return (
                                <TouchableOpacity
                                  key={`car-${car.car}-${carIdx}`}
                                  activeOpacity={0.9}
                                  style={[
                                    styles.carBox,
                                    {
                                      borderColor: active
                                        ? '#1E5BB8'
                                        : '#E6E6E6',
                                      transform: [
                                        { scale: active ? 1.03 : 1 },
                                      ],
                                    },
                                  ]}
                                >
                                  <Text style={styles.carLabel}>
                                    {car.car}호
                                  </Text>
                                  <View
                                    style={[
                                      styles.badge,
                                      {
                                        backgroundColor: c.bg,
                                        borderColor: c.bd,
                                      },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.badgeText,
                                        { color: c.fg },
                                      ]}
                                    >
                                      {car.level}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )}
                  </View>
                </View>
              </View>
            ))}

            {/* 도착점 (스타일 개선 반영) */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <View style={styles.timelineCol}>
                {/* 핀 모양 아이콘 사용 및 스타일 개선 */}
                <Ionicons
                  name="location-sharp"
                  size={14}
                  color="#1E5BB8"
                  style={styles.endDotIcon}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 16,
                    color: '#111',
                  }}
                >
                  {routeData?.end ?? '-'}
                </Text>
                <Text
                  style={{ fontSize: 13, color: '#666', marginTop: 2 }}
                >
                  도착 (총 {etaMinutes}분 소요)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── 다른 시간 (hasAlternatives 검사 추가) ── */}
        {hasAlternatives && (
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Ionicons name="time-outline" size={18} color="#111" />
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: '#111',
                  }}
                >
                  다른 시간
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                gap: 10,
              }}
            >
              {routeData.alternatives.map((alt, idx) => {
                const c = getCongestionStyle(alt.avgCongestion);
                return (
                  <TouchableOpacity
                    key={`alt-${idx}`}
                    activeOpacity={0.9}
                    style={styles.altCard}
                    onPress={() =>
                      Alert.alert(
                        '대체 시간',
                        `${alt.time} / 예상 ${alt.etaMinutes}분`
                      )
                    }
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: '#111',
                        marginBottom: 4,
                      }}
                    >
                      {alt.time}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#666',
                        marginBottom: 8,
                      }}
                    >
                      {alt.etaMinutes}분
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: c.bg,
                          borderColor: c.bd,
                          alignSelf: 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: c.fg },
                        ]}
                      >
                        {alt.avgCongestion}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroShell: { width: '100%' },
  heroContent: {
    paddingTop: 54,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  backInlineText: { color: '#1E5BB8', fontWeight: '700', marginLeft: 4 },

  iconButtonGhost: {
    height: 40,
    width: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 8 },

  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  heroSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },

  etaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 6,
  },
  etaChipText: { color: '#1E5BB8', fontSize: 12, fontWeight: '800', marginLeft: 3 },

  heroEtaBox: { paddingVertical: 18, alignItems: 'center' },
  heroEta: { color: '#fff', fontSize: 44, fontWeight: '900' },
  heroEtaSub: { color: 'rgba(255,255,255,0.85)', marginTop: 4 },

  stickyHeader: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  stickyBar: {
    height: 48,
    backgroundColor: '#FFFFFFEE',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stickyBackBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  stickyTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  stickyEta: { fontSize: 12, color: '#1E5BB8', marginTop: 2, fontWeight: '800' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECECEC',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  timelineCol: { width: 20, alignItems: 'center', marginRight: 8 },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#1E5BB8',
    borderWidth: 3,
    borderColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E1E5EC',
    marginTop: 4,
  },

  //  도착점 아이콘을 위한 스타일 추가
  endDotIcon: {
    padding: 3,
    borderRadius: 999,
    backgroundColor: '#fff',
  },

  segmentText: { marginTop: 6, color: '#666', fontSize: 13 },
  sectionLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
    marginBottom: 6,
  },

  carBox: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 90,
  },
  carLabel: { fontSize: 12, color: '#666', marginBottom: 6, fontWeight: '600' },

  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },

  altCard: {
    width: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#fff',
    padding: 12,
  },
});