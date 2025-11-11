import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export default function FavoritesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")

  const [favorites, setFavorites] = useState([
    {
      id: "1",
      type: "지하철",
      route: "대구 1호선 - 반월당 → 대곡",
      customName: "출근길",
      congestion: "매우 혼잡",
      isFavorite: true,
    },
    {
      id: "2",
      type: "지하철",
      route: "대구 2호선 - 범어 → 설화명곡",
      customName: "퇴근길",
      congestion: "보통",
      isFavorite: true,
    },
    {
      id: "3",
      type: "버스",
      route: "급행 5번",
      customName: "학교 → 집",
      congestion: "여유",
      isFavorite: true,
    },
    {
      id: "4",
      type: "버스",
      route: "503번",
      customName: "단골 맛집 가는 길",
      congestion: "매우 혼잡",
      isFavorite: true,
    },
    {
      id: "5",
      type: "지하철",
      route: "대구 3호선 - 명덕 → 공단역",
      customName: "학원 가는 길",
      congestion: "보통",
      isFavorite: true,
    },
    {
      id: "6",
      type: "버스",
      route: "수성1번",
      customName: "백화점 가는 길",
      congestion: "혼잡",
      isFavorite: true,
    },
    {
      id: "7",
      type: "버스",
      route: "708번",
      customName: "데이트 코스",
      congestion: "보통",
      isFavorite: true,
    },
  ])

  // ✅ 즐겨찾기 삭제
  const handleDelete = (id) => {
    setFavorites((prevFavorites) =>
      prevFavorites.filter((item) => item.id !== id)
    )
  }

  // ✅ 즐겨찾기 이름 변경
  const handleRename = (id) => {
    Alert.prompt(
      "Rename Route",
      "Enter a new name for this route:",
      (newName) => {
        if (newName && newName.trim().length > 0) {
          setFavorites((prevFavorites) =>
            prevFavorites.map((item) =>
              item.id === id ? { ...item, customName: newName } : item
            )
          )
        }
      }
    )
  }

  // ✅ 옵션 창
  const showOptions = (item) => {
    Alert.alert(
      "Options",
      "",
      [
        { text: "경로명 수정", onPress: () => handleRename(item.id) },
        { text: "경로 삭제", onPress: () => handleDelete(item.id), style: "destructive" },
        { text: "취소", style: "cancel" },
      ],
      { cancelable: true }
    )
  }

  // ✅ 검색 필터
  const filteredFavorites = favorites.filter((item) =>
    item.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.customName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ✅ 추가된 부분: RouteResultScreen으로 이동 함수
  const handleOpenRoute = (item) => {
    navigation.navigate("RouteResult", { routeData: item })
  }

  return (
    <View style={styles.container}>
      {/* 상단 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#007BFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>즐겨찾기</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search routes..."
          placeholderTextColor="#555"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No favorites yet!</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            // ✅ 카드 전체를 TouchableOpacity로 변경 → 탭하면 이동
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handleOpenRoute(item)}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.type}</Text>
                    </View>
                    <View style={[styles.badge, styles.congestionBadge(item.congestion)]}>
                      <Text style={styles.badgeText}>{item.congestion}</Text>
                    </View>
                  </View>
                  <Text style={styles.customName}>{item.customName}</Text>
                  <Text style={styles.routeText}>{item.route}</Text>
                </View>

                {/* More options */}
                <TouchableOpacity onPress={() => showOptions(item)} style={{ paddingLeft: 12 }}>
                  <Ionicons name="ellipsis-vertical" size={20} color="#555" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    margin: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    height: 40,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 8,
    fontSize: 14,
  },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  badge: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  congestionBadge: (level) => {
    switch (level) {
      case "여유":
        return { backgroundColor: "#4CAF50" }
      case "보통":
        return { backgroundColor: "#FFC107" }
      case "혼잡":
        return { backgroundColor: "#FF5722" }
      case "매우 혼잡":
        return { backgroundColor: "#F44336" }
      default:
        return { backgroundColor: "#999" }
    }
  },
  customName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#212529",
  },
  routeText: {
    fontSize: 14,
    color: "#6c757d",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#aaa",
  },
})
