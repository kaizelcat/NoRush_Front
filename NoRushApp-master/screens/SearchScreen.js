import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchScreen() {
    const [startPoint, setStartPoint] = useState("");
    const [endPoint, setEndPoint] = useState("");
    const navigation = useNavigation();

    const handleSearch = () => {
        if (!startPoint || !endPoint) return;

        navigation.navigate("RouteResults", { 
            startPoint, 
            endPoint 
        });
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
                        <Text style={styles.timeText}>출발 시간</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.searchBtn, (!startPoint || !endPoint) && styles.disabledBtn]}
                        onPress={handleSearch}
                        disabled={!startPoint || !endPoint}
                    >
                        <Ionicons name="search" size={18} color="white" style={{ marginRight: 6 }} />
                        <Text style={styles.searchBtnText}>검색</Text>
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