// RouteResultsScreen.js랑 통합했어요 참고


// subwayCongestion.js
// import { useState } from "react";
// import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const carData = [
  { carNumber: 1, occupancy: 45 },
  { carNumber: 2, occupancy: 72 },
  { carNumber: 3, occupancy: 89 },
  { carNumber: 4, occupancy: 38 },
  { carNumber: 5, occupancy: 95 },
  { carNumber: 6, occupancy: 82 },
  { carNumber: 7, occupancy: 56 },
  { carNumber: 8, occupancy: 41 },
  { carNumber: 9, occupancy: 67 },
  { carNumber: 10, occupancy: 33 },
];

export default function SubwayCongestionScreen() {
  const [selectedCar, setSelectedCar] = useState(null);

  const getLevel = (occupancy) => {
    if (occupancy < 50) return "여유";
    if (occupancy < 80) return "보통";
    if (occupancy < 90) return "혼잡";
    return "매우 혼잡";
  };

  const getColor = (occupancy) => {
    if (occupancy < 50) return "#4ade80";
    if (occupancy < 80) return "#facc15";
    if (occupancy < 90) return "#f87171";
    return "#ef4444";
  };

  const bestCars = carData
    .filter((car) => car.occupancy < 50)
    .sort((a, b) => a.occupancy - b.occupancy)
    .slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> 4호선 급행 - 다운타운 방향</Text>
      <Text style={styles.subtitle}>다음 열차: 2분 후 14번가 역 도착</Text>

      <View style={styles.recommendation}>
        <Text style={styles.sectionTitle}> 추천 칸</Text>
        <View style={styles.recommendRow}>
          {bestCars.map((car) => (
            <TouchableOpacity
              key={car.carNumber}
              onPress={() => setSelectedCar(car.carNumber)}
              style={styles.recommendCard}
            >
              <Text style={styles.carTitle}>{car.carNumber}번 칸</Text>
              <Text style={styles.carLevel}>{getLevel(car.occupancy)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.gridContainer}>
        <Text style={styles.sectionTitle}> 실시간 칸별 혼잡도</Text>
        <View style={styles.grid}>
          {carData.map((car) => (
            <TouchableOpacity
              key={car.carNumber}
              style={[
                styles.carBox,
                {
                  backgroundColor: getColor(car.occupancy),
                  borderWidth: selectedCar === car.carNumber ? 2 : 0,
                  borderColor: "#2563eb",
                },
              ]}
              onPress={() =>
                setSelectedCar(selectedCar === car.carNumber ? null : car.carNumber)
              }
            >
              <Text style={styles.carNum}>{car.carNumber}</Text>
              <View style={{ alignItems: "center", justifyContent: "center", height: 20 }}>
                <Text style={styles.levelText}>{getLevel(car.occupancy)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {selectedCar && (
        <View style={styles.selected}>
          <Text style={styles.sectionTitle}> {selectedCar}번 칸 정보</Text>
          <Text style={styles.detailText}>
            혼잡도 상태: {getLevel(carData[selectedCar - 1].occupancy)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f9ff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 16,
  },
  recommendation: {
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1c1917",
  },
  recommendRow: {
    flexDirection: "row",
    gap: 10,
  },
  recommendCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  carTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
  },
  carLevel: {
    fontSize: 13,
    color: "#4d7c0f",
  },
  gridContainer: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  carBox: {
    width: "18%",
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  carNum: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  levelText: {
    fontSize: 13,
    color: "#f9fafb",
  },
  selected: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    marginTop: 4,
  },
});
