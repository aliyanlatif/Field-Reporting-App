import { useEffect } from 'react';
import { View } from 'react-native';
import { AppText, BottomSheet, HoldButton } from '../../../components';
import { ResetScope } from '../../../features/delivery';
import { colors } from '../../../theme';
import { useResetFlow } from '../hooks/useResetFlow';
import { RadioOption } from './RadioOption';
import { startOverStyles as styles } from './startOverStyles';

interface StartOverSheetProps {
  visible: boolean;
  onClose: () => void;
}

const plural = (count: number) => `${count} report${count === 1 ? '' : 's'}`;

export function StartOverSheet({ visible, onClose }: StartOverSheetProps) {
  const { scope, setScope, busy, unsentCount, run, reset } =
    useResetFlow(onClose);

  useEffect(() => {
    if (visible) {
      reset();
    }
  }, [reset, visible]);

  const options: Array<{
    key: ResetScope;
    title: string;
    description: string;
  }> = [
    {
      key: 'unsent',
      title: 'Clear unsent reports',
      description: unsentCount
        ? `Deletes ${plural(
            unsentCount,
          )} still on this phone. Reports already on the server stay there.`
        : 'Nothing is waiting to send right now. Reports on the server stay there.',
    },
    {
      key: 'everything',
      title: 'Clear everything',
      description:
        'Deletes every report from this phone and from the server, including sent ones. Needs a connection. It cannot be undone.',
    },
  ];

  return (
    <BottomSheet visible={visible} onClose={onClose} label="Start over">
      <AppText variant="title" style={styles.title}>
        Start over
      </AppText>
      <AppText color={colors.textTertiary} style={styles.subtitle}>
        Pick how much to clear. Hold the button to confirm.
      </AppText>
      <View style={styles.options}>
        {options.map(option => (
          <RadioOption
            key={option.key}
            title={option.title}
            description={option.description}
            selected={scope === option.key}
            onPress={() => setScope(option.key)}
          />
        ))}
      </View>
      <HoldButton
        label={busy ? 'Clearing…' : 'Hold to clear'}
        holdingLabel="Keep holding…"
        icon="trash"
        disabled={busy}
        onComplete={run}
      />
      <AppText
        variant="caption"
        color={colors.textSecondary}
        style={styles.note}
      >
        Hold for a second so it can never happen by accident.
      </AppText>
    </BottomSheet>
  );
}
