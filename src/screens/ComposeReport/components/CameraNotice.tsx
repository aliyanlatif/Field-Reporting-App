import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { AppText, Button, Icon } from '../../../components';
import { useReducedMotion } from '../../../hooks';
import { CameraPermission } from '../../../services/permissions';
import { colors, easeOutBack } from '../../../theme';
import { runTiming } from '../../../utils/motion';
import { cameraNoticeStyles as styles } from './cameraNoticeStyles';

interface CameraNoticeProps {
  status: CameraPermission;
  onAllow: () => void;
  onOpenSettings: () => void;
}

export function CameraNotice({
  status,
  onAllow,
  onOpenSettings,
}: CameraNoticeProps) {
  const blocked = status === 'blocked';
  const reduced = useReducedMotion();
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    runTiming(pop, 1, { duration: 350, easing: easeOutBack, reduced }).start();
  }, [pop, reduced]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          opacity: pop,
          transform: [
            {
              scale: pop.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.row}>
        <Icon name="camera" color={colors.warning} />
        <View style={styles.text}>
          <AppText variant="bodyStrong" color="#4A2704">
            Camera access is off
          </AppText>
          <AppText variant="caption" color="#5E3306">
            {blocked
              ? 'Allow it in Settings to take photos. You can still pick from the gallery.'
              : 'Allow camera access to take photos. You can still pick from the gallery.'}
          </AppText>
        </View>
      </View>
      <Button
        variant="warning"
        label={blocked ? 'Open Settings' : 'Allow camera'}
        onPress={blocked ? onOpenSettings : onAllow}
      />
    </Animated.View>
  );
}
