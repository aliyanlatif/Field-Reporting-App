import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';

export const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg - designPx(4),
    paddingBottom: designPx(22),
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: colors.background,
  },
  grabArea: {
    alignItems: 'center',
    paddingTop: designPx(10),
    paddingBottom: designPx(14),
  },
  grab: {
    width: designPx(40),
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.grabber,
  },
});
