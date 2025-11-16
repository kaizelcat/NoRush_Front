import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FavoritesScreen from '../screens/FavoritesScreen';
import MyPageScreen from '../screens/MyPageScreen';
import MainStackNavigator from './MainStackNavigator';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Main') {
            iconName = 'home';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'bookmark' : 'bookmark-border';
          } else if (route.name === 'MyPage') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#416cec', 
        tabBarInactiveTintColor: '#9ca3af',  
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Main" component={MainStackNavigator} options={{ title: '홈' }} /> 
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: '즐겨찾기' }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ title: '마이페이지' }} />
    </Tab.Navigator>
  );
};

export default MainTabs;