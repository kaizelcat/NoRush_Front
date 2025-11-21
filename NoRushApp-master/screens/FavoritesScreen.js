import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from "react-native"
import { useFavorites } from "../contexts/FavoritesContext"

export default function FavoritesScreen({ navigation }) {
    // 검색창 입력값 관리
    const [searchQuery, setSearchQuery] = useState("")
    // 즐겨찾기 목록과 기능들을 Context에서 가져옴
    const { favorites, removeFromFavorites, updateCustomName } = useFavorites()

    // 즐겨찾기 항목 삭제 함수
    const handleDelete = (id) => {
        removeFromFavorites(id)
    }

    // 경로 이름 바꾸는 함수
    const handleRename = (id, currentName) => {
        Alert.prompt(
            "경로명 수정", 
            "새로운 경로 이름을 입력하세요.", 
            (newName) => {
                // 입력값이 있고, 공백만 아니면 업데이트 처리
                if (newName && newName.trim().length > 0) {
                    updateCustomName(id, newName.trim())
                }
            },
            "plain-text",
            currentName || ""
        )
    }

    // 옵션 버튼(점 세 개) 눌렀을 때 나오는 알림창
    const showOptions = (item) => {
        Alert.alert(
            "옵션",
            "", 
            [
                { text: "경로명 수정", onPress: () => handleRename(item.id, item.customName) },
                { text: "경로 삭제", onPress: () => handleDelete(item.id), style: "destructive" },
                { text: "취소", style: "cancel" },
            ],
            { cancelable: true }
        )
    }

    // 검색창 입력에 따라 목록을 걸러주는 필터링
    const filteredFavorites = favorites.filter((item) => {
        // 경로, 이름, 출발역, 도착역 등 모든 텍스트를 하나로 합쳐서 검색함
        const text = [
            item.route,
            item.customName,
            item.start,
            item.end,
        ]
            .filter(Boolean) // null, undefined 값 제거
            .join(" ")
            .toLowerCase() 

        return text.includes(searchQuery.toLowerCase())
    })

    // 즐겨찾기 리스트 항목 클릭 시 경로 재검색 화면으로 이동 (중첩 네비게이션 처리)
    const handleOpenRoute = (item) => {
        navigation.navigate("Main", { // 1. 'Main' 탭으로 먼저 이동
            screen: "RouteResults", // 2. Main 스택 안의 'RouteResults' 스크린 호출
            params: {
                from: item.start,   // 출발역, 도착역 정보만 파라미터로 전달
                to: item.end,
            },
        });
    }

    // 뱃지 색깔 설정 
    const getCongestionBadgeStyle = () => {
        return { backgroundColor: "#999" }
    }

    return (
        <View style={styles.container}>
            {/* 상단 헤더 영역 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>즐겨찾기</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* 검색창 UI 영역 */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="경로 검색..."
                    placeholderTextColor="#555"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* 즐겨찾기 목록 표시 */}
            {filteredFavorites.length === 0 ? (
                // 목록이 비어있을 때
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>즐겨찾기한 경로가 없습니다.</Text>
                </View>
            ) : (
                // 목록이 있을 때 FlatList 사용
                <FlatList
                    data={filteredFavorites}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => {
                        // 요약 정보는 재검색할 것이므로 기본값만 사용
                        const typeLabel = item.type || "경로"

                        return (
                            <TouchableOpacity
                                style={styles.card}
                                activeOpacity={0.85}
                                onPress={() => handleOpenRoute(item)} // 터치 시 재검색 실행
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <View style={{ flex: 1 }}>
                                        {/* 뱃지 영역 */}
                                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                                            <View style={[styles.badge, { backgroundColor: "#1E5BB8" }]}>
                                                <Text style={styles.badgeText}>저장된 경로</Text>
                                            </View>
                                            <View style={[styles.badge, getCongestionBadgeStyle()]}>
                                                <Text style={styles.badgeText}>재검색 필요</Text>
                                            </View>
                                        </View>
                                        
                                        {/* 사용자 지정 이름 */}
                                        <Text style={styles.customName}>{item.customName || "이름 없는 경로"}</Text>
                                        
                                        {/* 출발지 -> 도착지 정보 */}
                                        <Text style={styles.routeText}>
                                            <Ionicons name="location-outline" size={14} color="#555" />
                                            {' '}
                                            {item.start ?? "출발지"} → {item.end ?? "도착지"}
                                        </Text>

                                        {/* 재검색 안내 문구 */}
                                        <View style={styles.summaryContainer}>
                                            <Text style={styles.searchPrompt}>
                                                <Ionicons name="refresh-circle-outline" size={14} color="#E08C00" />
                                                {' '}
                                                터치 시 현재 시간으로 경로 재검색
                                            </Text>
                                        </View>
                                        
                                    </View>

                                    {/* 옵션 버튼 (점 세 개 아이콘) */}
                                    <TouchableOpacity onPress={() => showOptions(item)} style={{ paddingLeft: 12 }}>
                                        <Ionicons name="ellipsis-vertical" size={20} color="#555" />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                />
            )}
        </View>
    )
}

// ------------------------------------------------------------------
// 스타일시트
// ------------------------------------------------------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingTop: 50, // 상태 표시줄 피하기 위한 여백
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 8,
        margin: 16,
        paddingVertical: Platform.OS === 'ios' ? 8 : 4,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        paddingHorizontal: 10,
        fontSize: 16,
        color: "#333",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: "#888",
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    badge: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#fff",
    },
    customName: {
        fontSize: 18,
        fontWeight: "800",
        color: "#111",
        marginBottom: 4,
    },
    routeText: {
        fontSize: 14,
        color: "#555",
        marginBottom: 8,
        alignItems: 'center',
    },
    summaryContainer: {
        marginTop: 4,
    },
    searchPrompt: {
        fontSize: 13,
        fontWeight: '600',
        color: "#E08C00",
        marginTop: 4,
    },
});