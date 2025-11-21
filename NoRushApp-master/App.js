import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context Provider
import { FavoritesProvider } from './contexts/FavoritesContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RouteResultScreen from'./screens/RouteResultsScreen';

// Navigation
import MainTabs from './navigation/MainTabs';

// 회원수정
import EditProfile from './screens/EditProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RouteResult"
            component={RouteResultScreen}
            options={{title: '경로 결과'}}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfile}
            options={{ title: '회원정보 수정' }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}