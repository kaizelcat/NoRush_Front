import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Image, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const MainScreen = () => {
  const navigation = useNavigation();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar style='dark-content' /> 
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="출발지와 도착지를 입력하세요"
            placeholderTextColor="#888"
          />
        <TouchableOpacity style={styles.findPathButton} onPress={() => navigation.navigate('Search')}>
            <Text style={styles.buttonText}>길찾기</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/400x300.png?text=Map+Placeholder' }}
            style={styles.mapImage}
          />
        </View>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15, 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f0f2f5', 
    borderRadius: 12, 
    paddingHorizontal: 15,
    fontSize: 16,

  },
  findPathButton: {
    marginLeft: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#416cec', 
    borderRadius: 12, 
    paddingHorizontal: 15,

  },
  buttonText: {
    color: '#fff', 
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15, 
    overflow: 'hidden', 
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
});

export default MainScreen;