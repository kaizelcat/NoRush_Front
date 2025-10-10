import { useNavigation } from '@react-navigation/native';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MyPage = () => {
  const navigation = useNavigation();

  const renderMenuItem = (title, onPress, isLast = false) => (
    <TouchableOpacity style={[styles.menuItem, isLast && styles.lastMenuItem]} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <Text style={styles.menuArrow}>{'>'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>마이페이지</Text>
        </View>

        <View style={styles.profileSection}>
          <Image
            style={styles.profileImage}
            source={{ uri: 'https://via.placeholder.com/100' }} 
          />
          <Text style={styles.profileName}>홍길동님</Text>
          <Text style={styles.profileEmail}>honggildong@example.com</Text>
        </View>

        <View style={styles.menuSection}>
          {renderMenuItem('회원정보 수정', () => navigation.navigate('EditProfile'))}
          {renderMenuItem('즐겨찾는 경로', () => navigation.navigate('Favorites'))}
          {renderMenuItem('공지사항', () => navigation.navigate('Announcements'))}
          {renderMenuItem('고객센터', () => navigation.navigate('Support'))}
          {renderMenuItem('로그아웃', () => { /* 로그아웃 로직 구현 */ }, true)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5', 
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#888',
  },
  menuSection: {
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5', 
  },
  lastMenuItem: {
    borderBottomWidth: 0, 
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuArrow: {
    fontSize: 16,
    color: '#ccc',
  }
});

export default MyPage;