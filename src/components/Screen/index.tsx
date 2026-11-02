import { ReactNode } from 'react';
import { View } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
}

export function Screen({ children, edges = ['bottom', 'left', 'right'] }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}
