import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBanner, ToastHost } from './src/components';
import { RootNavigator } from './src/navigation';
import { startDelivery } from './src/services/delivery';

function App() {
  useEffect(() => {
    const stopped = startDelivery();
    return () => {
      stopped.then(stop => stop());
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBanner />
      <ToastHost />
    </SafeAreaProvider>
  );
}

export default App;
