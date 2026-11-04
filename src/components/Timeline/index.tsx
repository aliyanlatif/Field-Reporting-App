import { Animated, View } from 'react-native';
import { StepState, TimelineStep } from '../../features/reports';
import { useLoop } from '../../hooks/useLoop';
import { colors } from '../../theme';
import { formatTimestamp } from '../../utils/formatDate';
import { AppText } from '../AppText';
import { styles } from './styles';

const nodeColors: Record<StepState, { border: string; fill: string }> = {
  done: { border: '#2F9160', fill: '#2F9160' },
  active: { border: colors.primary, fill: colors.surface },
  bad: { border: '#C4453D', fill: '#C4453D' },
  todo: { border: colors.borderDashed, fill: colors.surface },
};

function Node({ state }: { state: StepState }) {
  const pulse = useLoop(state === 'active', { duration: 1200 });
  const { border, fill } = nodeColors[state];

  return (
    <View style={styles.nodeBox}>
      <Animated.View
        style={[
          styles.halo,
          {
            backgroundColor: colors.primary,
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [state === 'active' ? 0.45 : 0, 0],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                }),
              },
            ],
          },
        ]}
      />
      <View
        style={[styles.node, { borderColor: border, backgroundColor: fill }]}
      />
    </View>
  );
}

/** Saved, Sending, On server: shows how far a report has come and where it stopped. */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View style={styles.card}>
      {steps.map((step, index) => (
        <View
          key={step.key}
          style={styles.step}
          accessible
          accessibilityLabel={`${step.label}. ${step.detail}`}
        >
          <View style={styles.rail}>
            <Node state={step.state} />
            {index < steps.length - 1 && (
              <View
                style={[styles.line, step.state === 'done' && styles.lineDone]}
              />
            )}
          </View>
          <View style={styles.text}>
            <AppText variant="bodyStrong" style={styles.label}>
              {step.label}
            </AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {step.detail}
            </AppText>
          </View>
          {step.at !== undefined && (
            <AppText
              variant="caption"
              color={colors.textSecondary}
              style={styles.time}
            >
              {formatTimestamp(step.at)}
            </AppText>
          )}
        </View>
      ))}
    </View>
  );
}
