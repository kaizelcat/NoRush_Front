import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { useFavorites } from "../contexts/FavoritesContext"

export default function FavoritesScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("")
  const { favorites, removeFromFavorites, updateCustomName } = useFavorites()

  // ✅ 즐겨찾기 삭제
  const handleDelete = (id) => {
    removeFromFavorites(id)
  }

  // ✅ 즐겨찾기 이름 변경
  const handleRename = (id, currentName) => {
    Alert.prompt(
      "경로명 수정",
      "새로운 경로 이름을 입력하세요.",
      (newName) => {
        if (newName && newName.trim().length > 0) {
          updateCustomName(id, newName.trim())
        }
      },
      "plain-text",
      currentName || ""
    )
  }

  // ✅ 옵션 창
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

  // ✅ 검색 필터 (route/customName/start/end 다 묶어서 검색)
  const filteredFavorites = favorites.filter((item) => {
    const text = [
      item.route,
      item.customName,
      item.start,
      item.end,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return text.includes(searchQuery.toLowerCase())
  })

  // ✅ RouteResultsScreen으로 이동 (스크린 이름 정확히 "RouteResults")
  const handleOpenRoute = (item) => {
    navigation.navigate("RouteResults", { routeData: item })
  }

  const getCongestionBadgeStyle = (level) => {
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
  }

  return (
    <View style={styles.container}>
      {/* 상단 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>즐겨찾기</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
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

      {/* Favorites List */}
      {filteredFavorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>즐겨찾기한 경로가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const congestion = item.congestion || item.avgCongestion || "정보 없음"
            const typeLabel = item.type || "경로"

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => handleOpenRoute(item)}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <View style={[styles.badge, { backgroundColor: "#495057" }]}>
                        <Text style={styles.badgeText}>{typeLabel}</Text>
                      </View>
                      <View style={[styles.badge, getCongestionBadgeStyle(congestion)]}>
                        <Text style={styles.badgeText}>{congestion}</Text>
                      </View>
                    </View>
                    <Text style={styles.customName}>{item.customName || "이름 없는 경로"}</Text>
                    <Text style={styles.routeText}>
                      {item.route || `${item.start ?? "출발지"} → ${item.end ?? "도착지"}`}
                    </Text>
                  </View>

                  {/* More options */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
