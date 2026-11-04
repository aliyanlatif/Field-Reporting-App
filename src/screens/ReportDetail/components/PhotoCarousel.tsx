import { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import {
  AppText,
  Icon,
  PhotoViewer,
  PressableScale,
  StatusBadge,
} from '../../../components';
import {
  describePhoto,
  ReportListItem,
  ReportPhoto,
} from '../../../features/reports';
import { usePhotoProgress } from '../../../hooks';
import { colors } from '../../../theme';
import { toMegabytes } from '../../../utils/formatBytes';
import {
  carouselStyles as styles,
  TILE_WIDTH,
  TILE_GAP,
} from './carouselStyles';

interface PhotoTileProps {
  photo: ReportPhoto;
  index: number;
  onOpen: (index: number) => void;
}

function PhotoTile({ photo, index, onOpen }: PhotoTileProps) {
  const fraction = usePhotoProgress(photo.id);
  const badge = describePhoto(photo, fraction);
  const size = photo.sizeBytes ? ` · ${toMegabytes(photo.sizeBytes)} MB` : '';

  return (
    <PressableScale
      accessibilityRole="imagebutton"
      accessibilityLabel={`Photo ${index + 1}. ${badge.label}`}
      accessibilityHint="Opens the photo full screen"
      onPress={() => onOpen(index)}
      scaleTo={0.98}
      style={styles.tile}
    >
      <Image
        source={{ uri: photo.uri }}
        resizeMode="cover"
        style={styles.image}
      />
      <View style={styles.badge}>
        <StatusBadge badge={badge} compact />
      </View>
      <View style={styles.size}>
        <AppText variant="captionStrong" color={colors.white}>
          Photo {index + 1}
          {size}
        </AppText>
      </View>
      {photo.status === 'uploading' && (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${fraction * 100}%` }]} />
        </View>
      )}
    </PressableScale>
  );
}

/** Swipe through the report's photos, each with its own upload state. */
export function PhotoCarousel({ item }: { item: ReportListItem }) {
  const [viewing, setViewing] = useState<number | null>(null);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={TILE_WIDTH + TILE_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
      >
        {item.photos.length > 0 ? (
          item.photos.map((photo, index) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              index={index}
              onOpen={setViewing}
            />
          ))
        ) : (
          <View style={[styles.tile, styles.placeholder]}>
            <Icon name="gallery" size={34} color={colors.textSecondary} />
            <AppText variant="bodyStrong" color={colors.textSecondary}>
              {item.imageCount === 1 ? 'Photo is' : 'Photos are'} on the server
            </AppText>
          </View>
        )}
      </ScrollView>
      <PhotoViewer
        visible={viewing !== null}
        photos={item.photos.map(photo => ({ id: photo.id, uri: photo.uri }))}
        initialIndex={viewing ?? 0}
        onClose={() => setViewing(null)}
      />
    </>
  );
}
