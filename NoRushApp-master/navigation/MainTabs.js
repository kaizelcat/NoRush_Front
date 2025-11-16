import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 
import FavoritesScreen from '../screens/FavoritesScreen';
import MyPageScreen from '../screens/MyPageScreen';
import MainStackNavigator from './MainStackNavigator';
import CalendarScreen from '../screens/CalendarScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Main') {
            iconName = focused ? 'map' : 'map-outline';
          } 
          else if (route.name === 'Favorites') {
            iconName = focused ? 'star' : 'star-outline';
          } 
          else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }
          else if (route.name === 'MyPage') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#416cec',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Main" 
        component={MainStackNavigator} 
        options={{ title: '홈' }} 
      />

      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: '즐겨찾기' }} 
      />

      {/* ⭐ 캘린더 탭 추가 */}
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: '캘린더' }}
      />

      <Tab.Screen 
        name="MyPage" 
        component={MyPageScreen} 
        options={{ title: '마이페이지' }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
