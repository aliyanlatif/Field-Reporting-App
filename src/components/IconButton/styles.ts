import { StyleSheet } from 'react-native';
import { radius, touchTarget } from '../../theme';

export const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
