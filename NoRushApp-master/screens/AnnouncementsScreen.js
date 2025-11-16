import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const dummyData = [
  {
    id: "1",
    title: "서비스 점검 안내",
    content: "11월 20일 새벽 3~5시 점검 예정입니다.",
    date: "2025-11-18",
  },
  {
    id: "2",
    title: "신규 업데이트 출시",
    content: "즐겨찾기 추천 기능이 업데이트되었습니다.",
    date: "2025-11-11",
  },
];

export default function AnnounmentsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      

      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("AnnounmentsDetail", { notice: item })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.preview} numberOfLines={1}>
                {item.content}
              </Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#777" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  item: { flexDirection: "row", paddingVertical: 14, alignItems: "center" },
  sep: { height: 1, backgroundColor: "#eee" },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 3 },
  preview: { fontSize: 13, color: "#555" },
  date: { fontSize: 11, color: "#999", marginTop: 4 },
});
