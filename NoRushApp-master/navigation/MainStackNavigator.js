import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainScreen from '../screens/MainScreen';
import RouteResultsScreen from '../screens/RouteResultsScreen';
import SearchScreen from '../screens/SearchScreen';
import SubwayCongestionScreen from '../screens/SubwayCongestionScreen';

const Stack = createNativeStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MainHome">
      <Stack.Screen
        name="MainHome"
        component={MainScreen}
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: '경로 검색' }} 
      />
      <Stack.Screen
        name="RouteResults"
        component={RouteResultsScreen}
        options={{ title: '경로 결과' }}
      />
      <Stack.Screen
        name="SubwayCongestion"
        component={SubwayCongestionScreen}
        options={{ title: '혼잡도 상세 정보' }}
      />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;