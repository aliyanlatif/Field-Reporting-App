import { colors } from '../../theme';
import { AppText } from '../AppText';
import { BottomSheet } from '../BottomSheet';
import { Icon, IconName } from '../Icon';
import { PressableScale } from '../PressableScale';
import { styles } from './styles';

interface AddPhotoSheetProps {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

const rows: Array<{
  key: 'camera' | 'gallery';
  icon: IconName;
  label: string;
}> = [
  { key: 'camera', icon: 'camera', label: 'Take photo' },
  { key: 'gallery', icon: 'gallery', label: 'Choose from gallery' },
];

/** Where the next photo comes from. Closes itself before handing over to the camera or gallery. */
export function AddPhotoSheet({
  visible,
  onClose,
  onCamera,
  onGallery,
}: AddPhotoSheetProps) {
  const choose = (key: 'camera' | 'gallery') => {
    onClose();
    if (key === 'camera') {
      onCamera();
    } else {
      onGallery();
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} label="Add a photo">
      <AppText
        variant="label"
        color={colors.textSecondary}
        style={styles.title}
      >
        Add a photo
      </AppText>
      {rows.map(row => (
        <PressableScale
          key={row.key}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          onPress={() => choose(row.key)}
          scaleTo={0.985}
          style={styles.row}
        >
          <Icon name={row.icon} />
          <AppText variant="bodyStrong" style={styles.rowLabel}>
            {row.label}
          </AppText>
        </PressableScale>
      ))}
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Cancel"
        onPress={onClose}
        style={styles.cancel}
      >
        <AppText variant="bodyStrong" color={colors.textSecondary}>
          Cancel
        </AppText>
      </PressableScale>
    </BottomSheet>
  );
}
