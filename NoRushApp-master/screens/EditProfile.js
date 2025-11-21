import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL } from '../setting';

export default function EditProfile({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);

  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadUserInfoFromServer();
  }, []);

  const loadUserInfoFromServer = async () => {
    try {
      const token = await AsyncStorage.getItem("ACCESS_TOKEN");

      const response = await fetch(`http://${BASE_URL}:8080/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const result = await response.json();

      if (response.ok) {
        setProfileImage(result.profileImage);
        setName(result.name);
        setPhoneNumber(result.phoneNumber);
      }

    } catch (e) {
      console.log("내 정보 조회 오류:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 선택
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // 서버 업로드 후 URL 받아서 profileImage에 set
    }
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem("ACCESS_TOKEN");
    console.log("토큰:", token);

    const body = {};

    if (name) body.name = name;
    if (phoneNumber) body.phoneNumber = phoneNumber;
    if (profileImage) body.profileImage = profileImage;
    console.log("보내는 body:", body);

    try {
      const response = await fetch(`http://${BASE_URL}:8080/api/v1/auth/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });

    
      const result = await response.json();

      if (response.ok) {
        Alert.alert("저장 완료", "프로필이 수정되었습니다.");
        navigation.goBack();
      }

    } catch (e) {
      console.log("수정 오류:", e);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#416cec" />
        <Text style={{ marginTop: 10 }}>불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* 프로필 섹션 */}
      <View style={styles.profileSection}>
        <Image
          source={profileImage ? { uri: profileImage } : { uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />

        <TouchableOpacity style={styles.editImageBtn} onPress={pickProfileImage}>
          <Text style={styles.editImageText}>프로필 사진 수정</Text>
        </TouchableOpacity>
      </View>

      {/* 입력 필드 */}
      <View style={styles.form}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="이름 입력"
        />

        <Text style={styles.label}>전화번호</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="전화번호 입력"
        />
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>저장하기</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e0e0e0'
  },
  editImageBtn: {
    marginTop: 10
  },
  editImageText: {
    color: '#416cec',
    fontSize: 15
  },
  form: {
    marginTop: 20
  },
  label: {
    marginTop: 20,
    fontSize: 15,
    color: '#555'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8
  },
  saveBtn: {
    marginTop: 40,
    backgroundColor: '#416cec',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center'
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold'
  }
});
