import { View } from 'react-native';
import { AppText, Button } from '../../../components';
import { colors } from '../../../theme';
import { CameraPermission } from '../../../services/permissions';
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

  return (
    <View style={styles.container}>
      <AppText color={colors.warning}>
        {blocked
          ? 'Camera access is turned off for this app. You can still choose photos from your gallery.'
          : 'Allow camera access to take photos. You can still choose photos from your gallery.'}
      </AppText>
      <Button
        variant="secondary"
        label={blocked ? 'Open Settings' : 'Allow camera'}
        onPress={blocked ? onOpenSettings : onAllow}
      />
    </View>
  );
}
