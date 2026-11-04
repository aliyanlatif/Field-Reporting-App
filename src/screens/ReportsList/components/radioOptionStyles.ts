import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../../theme';
import { designPx } from '../../../utils/responsiveUtils';

const RADIO = designPx(22);

export const radioStyles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    gap: designPx(14),
    padding: designPx(14),
    borderRadius: radius.md + 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.ink },
  radio: {
    width: RADIO,
    height: RADIO,
    marginTop: 1,
    borderRadius: RADIO / 2,
    borderWidth: 2,
    borderColor: '#98A5A1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.ink },
  dot: {
    width: RADIO - 10,
    height: RADIO - 10,
    borderRadius: (RADIO - 10) / 2,
    backgroundColor: colors.ink,
  },
  text: { flex: 1, gap: spacing.xs - 1 },
});
