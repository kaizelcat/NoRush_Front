import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    Animated,
    Platform,
    StatusBar,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../setting';

const API_URL = `http://${BASE_URL}:8080/api/v1/route/predict/station`;

// 현재 시간(시/분/초)을 포함하여 동적으로 설정
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

const HEADER_HEIGHT = 56; // 고정된 헤더 높이
const MIN_EXTRA_SCROLL = 200; 

// 혼잡도 레벨을 퍼센트(%) 기반으로 판단하는 함수
const getCongestionLevelFromPercent = (percent) => {
    if (percent === null || percent === undefined) return '정보 없음';
    if (percent > 80) return '매우 혼잡';
    if (percent > 50) return '혼잡';
    if (percent > 20) return '보통';
    return '여유';
};

// 혼잡도에 따른 스타일 반환 함수
const getCongestionStyle = (percent) => {
    const level = getCongestionLevelFromPercent(percent);
    switch (level) {
        case '여유':
            return { bg: '#E6F7E8', bd: '#A3D9A5', fg: '#1C7C3C' }; // 녹색 계열
        case '보통':
            return { bg: '#FFF7E6', bd: '#FFD79E', fg: '#E08C00' }; // 주황색 계열
        case '혼잡':
        case '매우 혼잡':
            return { bg: '#FEEEEE', bd: '#F5C9C9', fg: '#E03C3C' }; // 빨간색 계열
        default:
            return { bg: '#F2F7FF', bd: '#D9E7FF', fg: '#1E5BB8' }; // 기본/파란색 계열
    }
};

// 교통 유형에 따른 아이콘/이름 반환 함수
const getTrafficInfo = (type) => {
    switch (type) {
        case 1: // 지하철
            return { name: '지하철', icon: 'subway-outline', color: '#1E5BB8' };
        case 2: // 버스
            return { name: '버스', icon: 'bus-outline', color: '#4CAF50' };
        case 3: // 도보
            return { name: '도보', icon: 'walk-outline', color: '#666' };
        default:
            return { name: '이동', icon: 'information-circle-outline', color: '#666' };
    }
};

// **경로 요약 카드 컴포넌트**
const RouteSummaryCard = ({ route, index, isSelected, onSelect }) => {
    const { totalTime, payment, busTransitCount, subwayTransitCount } = route.info;

    // 경로 타입에 따른 메인 아이콘 결정
    const mainIcon = (subwayTransitCount > 0)
        ? { icon: 'subway-outline', color: '#1E5BB8' }
        : (busTransitCount > 0)
            ? { icon: 'bus-outline', color: '#4CAF50' }
            : { icon: 'walk-outline', color: '#666' };

    return (
        <TouchableOpacity
            style={[
                styles.summaryCard,
                isSelected && styles.summaryCardSelected,
            ]}
            onPress={() => onSelect(index)}
            activeOpacity={0.8}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={mainIcon.icon} size={20} color={mainIcon.color} style={{ marginRight: 8 }} />
                <Text style={styles.summaryCardTime}>
                    {totalTime}분
                </Text>
            </View>
            <View style={{ marginTop: 4 }}>
                <Text style={styles.summaryCardDetail}>
                    환승 {subwayTransitCount + busTransitCount}회
                </Text>
                <Text style={styles.summaryCardDetail}>
                    요금 {payment.toLocaleString()}원
                </Text>
            </View>
        </TouchableOpacity>
    );
};


export default function RouteResultScreen({ route, navigation }) {
    const { from, to } = route?.params || {};

    const [allRoutes, setAllRoutes] = useState([]);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0); 
    const [loading, setLoading] = useState(true);
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
    const [routeId, setRouteId] = useState(null);
    const scrollY = useRef(new Animated.Value(0)).current;

    const statusBarTop =
        Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    const routeData = allRoutes[selectedRouteIndex];

    const etaMinutes = routeData?.info?.totalTime ?? '-';
    const firstStartStation = routeData?.info?.firstStartStation ?? from ?? '-';
    const lastEndStation = routeData?.info?.lastEndStation ?? to ?? '-';
    const currentlyFavorited = isFavorite(routeId);
    
    const hasAlternatives = allRoutes.length > 1;

    useEffect(() => {
        const fetchRoute = async () => {

          const datetime = getCurrentDatetime(); // YYYY-MM-DDTHH:MM:SS 형식
            
            // T를 기준으로 시간 부분(HH:MM:SS)만 추출
            const timePart = datetime.split('T')[1]; 
            // HH 부분만 추출하여 숫자로 변환
            const currentHour = parseInt(timePart.substring(0, 2), 10); 

            // 새벽 12시부터 오전 5시까지 운행 제외
            if (currentHour >= 0 && currentHour < 5) {
                Alert.alert(
                    '지하철 및 버스 운행 시간이 아닙니다.'
                );
                setLoading(false); // 로딩 상태 종료
                return; // API 요청 없이 함수 종료
            }
          


            try {
                //액세스 토큰 스토리지에서 꺼내기
                const accessToken = await AsyncStorage.getItem("ACCESS_TOKEN");

                if (!accessToken) {
                    Alert.alert("인증 오류", "로그인이 필요합니다.");
                    setLoading(false);
                    return;
                }

                console.log("사용할 Access Token:", accessToken);


                const datetime = getCurrentDatetime();
                const requestBody = { from, to, datetime };
                console.log('API 요청:', requestBody);

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API 호출 실패: ${response.status} - ${errorText}`);
                }

                const apiResponse = await response.json();
                console.log('API 응답:', apiResponse);

                if (!apiResponse?.result?.route?.length) {
                    Alert.alert('검색 결과 없음', '해당 경로에 대한 정보를 찾을 수 없습니다.');
                    return;
                }

                setAllRoutes(apiResponse.result.route);
                setSelectedRouteIndex(0); 

                const firstRoute = apiResponse.result.route[0];
                setRouteId(
                    firstRoute.info?.mapObj ??
                    `${firstRoute.info?.firstStartStation ?? ''}-${
                        firstRoute.info?.lastEndStation ?? ''
                    }-${Date.now()}`
                );
            } catch (err) {
                console.error('경로 검색 오류:', err);
                Alert.alert('검색 실패', '경로를 찾지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [from, to]);

    useEffect(() => {
        if (routeData) {
            setRouteId(
                routeData.info?.mapObj ??
                `${routeData.info?.firstStartStation ?? ''}-${
                    routeData.info?.lastEndStation ?? ''
                }-${Date.now()}`
            );
        }
    }, [selectedRouteIndex, allRoutes]);


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1E5BB8" />
                <Text>경로를 불러오는 중...</Text>
            </View>
        );
    }

    if (allRoutes.length === 0 || !routeData) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Text style={{ marginBottom: 20, fontSize: 16 }}>경로 데이터가 없습니다.</Text>
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

    const handleToggleFavorite = () => {
        if (!routeData) return;
        const favRoute = {
            ...routeData,
            id: routeId,
            start: firstStartStation, 
            end: lastEndStation,      
        };
        if (isFavorite(routeId)) {
            removeFromFavorites(routeId);
            Alert.alert('즐겨찾기 해제', '해당 경로가 즐겨찾기에서 제거되었습니다.');
        } else {
            addToFavorites(favRoute);
            Alert.alert('즐겨찾기 추가', '해당 경로가 즐겨찾기에 저장되었습니다.');
        }
    };


    // ────────── 경로 단계 렌더링 함수 (선택된 경로 기반) ──────────
    const renderRouteSteps = () => {
        if (!routeData?.section) return null;

        return routeData.section.map((step, idx) => {
            const isSubway = step.trafficType === 1; 
            const isWalk = step.trafficType === 3; 	 
            const trafficInfo = getTrafficInfo(step.trafficType);
            const totalSteps = routeData.section.length;
            const isLastStep = idx === totalSteps - 1;

            let mainText = '';
            let subText = `${step.sectionTime}분 소요`;
            let congestionInfo = null;
            let dotColor = trafficInfo.color;

            if (isWalk) {
                mainText = isLastStep ? `도착지까지 도보 (${step.distance}m)` : `도보 이동 (${step.distance}m)`;
                dotColor = '#666'; 
            } else if (isSubway) {
                const wayText = step.way ? `(${step.way} 방면)` : '';
                mainText = `${step.startName} 승차 ${wayText}`;
                subText = `${step.stationCount}개 역, ${step.sectionTime}분 소요`;
                dotColor = '#1E5BB8'; 

                if (step.sectionSummary) {
                    const carInfo = step.passStopList?.stations?.[0]?.predictedCongestionCar;
                    if (carInfo && Array.isArray(carInfo)) {
                        congestionInfo = carInfo.map((percent, carIndex) => ({
                            car: carIndex + 1,
                            percent: percent,
                            level: getCongestionLevelFromPercent(percent)
                        }));
                    }
                }
            } else {
                mainText = `${step.startName} 승차 (교통유형: ${trafficInfo.name})`;
                subText = `${step.stationCount}개 정류장, ${step.sectionTime}분 소요`;
            }

            return (
                <View
                    key={`step-${idx}`}
                    style={{
                        marginBottom: isLastStep ? 6 : 18,
                    }}
                >
                    <View style={{ flexDirection: 'row' }}>
                        <View style={styles.timelineCol}>
                            <View style={[styles.timelineDot, { backgroundColor: dotColor, borderColor: isWalk ? '#fff' : '#ECECEC' }]} />
                            {!isLastStep && (
                                <View style={[styles.timelineLine, { backgroundColor: isWalk ? '#D1D5DB' : '#A3C6FF' }]} /> 
                            )}
                        </View>

                        <View style={{ flex: 1, paddingBottom: 8 }}>
                            {/* 교통수단 뱃지 */}
                            <View
                                style={[
                                    styles.badge,
                                    {
                                        backgroundColor: trafficInfo.color + '1A', 
                                        borderColor: trafficInfo.color + '4D', 
                                        alignSelf: 'flex-start',
                                        marginBottom: 4, 
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: trafficInfo.color },
                                    ]}
                                >
                                    <Ionicons name={trafficInfo.icon} size={11} color={trafficInfo.color} />
                                    {' ' + trafficInfo.name}
                                </Text>
                            </View>
                            
                            {/* 메인 텍스트 (출발/이동) */}
                            <Text style={styles.stepMainText}>{mainText}</Text>
                            <Text style={styles.stepSubText}>{subText}</Text>

                            {/* 혼잡도 정보 (지하철일 경우) */}
                            {isSubway && congestionInfo && (
                                <View style={styles.congestionBox}>
                                    <Text style={styles.congestionTitle}> 예측 혼잡도 (칸별)</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                                        {congestionInfo.map((car, carIdx) => {
                                            const congestionStyle = getCongestionStyle(car.percent);
                                            return (
                                                <View key={`car-${carIdx}`} style={[styles.carBadge, { backgroundColor: congestionStyle.bg, borderColor: congestionStyle.bd }]}>
                                                    <Text style={[styles.carText, { color: congestionStyle.fg }]}>{car.car}호차: {car.level} ({Math.round(car.percent)}%)</Text>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    </View>
                    
                    {/* 종점 표시 (마지막 단계가 아닐 경우 환승역 표시) */}
                    {!isLastStep && isSubway && step.endName && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -6, marginBottom: 10 }}>
                            <View style={[styles.timelineCol, { height: 'auto', justifyContent: 'center' }]}>
                                <Ionicons name="swap-horizontal-outline" size={18} color="#999" style={{ position: 'absolute', top: 0, left: 3 }} />
                                <View style={[styles.timelineLine, { height: 16, backgroundColor: '#D1D5DB' }]} />
                            </View>
                            <View style={{ flex: 1, paddingLeft: 8 }}>
                                <Text style={styles.transferText}>환승: {step.endName} 하차</Text>
                            </View>
                        </View>
                    )}
                </View>
            );
        });
    };
    // ────────── 경로 단계 렌더링 함수 끝 ──────────


    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="#fff" />
            <View style={[styles.fixedHeaderContainer, { paddingTop: statusBarTop }]}>
                <View style={styles.fixedHeaderContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.fixedTitleBox}>
                        <Text style={styles.fixedTitleText} numberOfLines={1}>
                            {firstStartStation} → {lastEndStation}
                        </Text>
                        <Text style={styles.fixedSubtitleText}>
                            약 {etaMinutes}분 소요
                        </Text>
                    </View>
                    <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
                        <Ionicons
                            name={currentlyFavorited ? 'star' : 'star-outline'}
                            size={24}
                            color={currentlyFavorited ? '#FFD700' : '#333'}
                        />
                    </TouchableOpacity>
                </View>
            </View>


            {/* 스크롤 가능한 내용 영역 */}
            <Animated.ScrollView
                style={{ flex: 1 }}
                scrollEventThrottle={16}
                // Fixed Header 높이만큼 Content Padding Top 설정
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT + statusBarTop + 10, paddingBottom: MIN_EXTRA_SCROLL }} 
            >
                <View style={styles.contentContainer}>
                    {/* 경로 요약 섹션 */}
                    <View style={styles.routeHeader}>
                        <Text style={styles.routeTitle}>{firstStartStation} → {lastEndStation}</Text>
                        <Text style={styles.routeTimeText}>
                            총 소요 시간: <Text style={{fontWeight: '900', color: '#1E5BB8'}}>{etaMinutes}분</Text>
                        </Text>
                        <Text style={styles.routeSubtitle}>
                            총 거리: {(routeData?.info?.totalDistance / 1000).toFixed(1)}km, 요금: {routeData?.info?.payment?.toLocaleString() ?? 0}원
                        </Text>
                    </View>
                    
                    {/* 경로 목록 (Alternatives) */}
                    {hasAlternatives && (
                        <View style={styles.alternativesContainer}>
                            <Text style={styles.alternativesTitle}>다른 경로 ({allRoutes.length}개)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}>
                                {allRoutes.map((route, index) => (
                                    <RouteSummaryCard
                                        key={index}
                                        route={route}
                                        index={index}
                                        isSelected={index === selectedRouteIndex}
                                        onSelect={setSelectedRouteIndex}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* 경로 상세 단계 */}
                    <View style={styles.stepsContainer}>
                        {/* 출발지점 */}
                        <View style={{ flexDirection: 'row', marginBottom: 18, marginTop: 10 }}>
                            <View style={styles.timelineCol}>
                                <View style={[styles.timelineDot, { backgroundColor: '#1E5BB8' }]} />
                                <View style={[styles.timelineLine, { backgroundColor: '#A3C6FF' }]} />
                            </View>
                            <View style={{ flex: 1, paddingBottom: 8 }}>
                                <Text style={styles.stepMainText}>출발지: {firstStartStation}</Text>
                            </View>
                        </View>

                        {/* 경로 중간 단계 */}
                        {renderRouteSteps()}

                        {/* 도착지점 */}
                        <View style={{ flexDirection: 'row' }}>
                            <View style={styles.timelineCol}>
                                <View style={[styles.timelineDot, { backgroundColor: '#FF8C00', borderColor: '#fff' }]} />
                            </View>
                            <View style={{ flex: 1, paddingBottom: 8 }}>
                                <Text style={styles.stepMainText}>도착지: {lastEndStation}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
    },

    // MARK: - Fixed Header Styles
    fixedHeaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
    },
    fixedHeaderContent: {
        height: HEADER_HEIGHT, // 56px
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    fixedTitleBox: {
        flex: 1,
        marginLeft: 8,
    },
    fixedTitleText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
    },
    fixedSubtitleText: {
        fontSize: 12,
        color: '#1E5BB8',
        marginTop: 2,
        fontWeight: '800',
    },
    backButton: {
        padding: 8,
    },
    favoriteButton: {
        padding: 8,
    },

    // MARK: - Content Sections
    contentContainer: {
        backgroundColor: '#fff',
    },
    routeHeader: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    routeTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    routeTimeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    routeSubtitle: {
        fontSize: 13,
        color: '#666',
    },

    // MARK: - Alternatives (경로 목록)
    alternativesContainer: {
        backgroundColor: '#F9F9F9',
        paddingVertical: 10,
    },
    alternativesTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#ECECEC',
        width: 150,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },
    summaryCardSelected: {
        borderColor: '#1E5BB8', 
        borderWidth: 2,
    },
    summaryCardTime: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    summaryCardDetail: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },

    // MARK: - Steps (경로 상세)
    stepsContainer: {
        padding: 16,
    },
    timelineCol: {
        width: 24,
        alignItems: 'center',
        marginRight: 8,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 999,
        backgroundColor: '#1E5BB8',
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 5,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#E1E5EC',
        marginTop: 4,
    },
    stepMainText: {
        color: '#111',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    stepSubText: {
        color: '#666',
        fontSize: 13,
    },
    transferText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
        marginBottom: 4,
        marginLeft: 4,
    },

    // MARK: - Congestion (혼잡도)
    congestionBox: {
        marginTop: 8,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#ECECEC',
    },
    congestionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    carBadge: {
        borderRadius: 8,
        borderWidth: 1,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginRight: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    carText: {
        fontSize: 11,
        fontWeight: '600',
    },
});