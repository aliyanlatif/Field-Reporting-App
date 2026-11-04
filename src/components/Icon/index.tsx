import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme';
import { designPx } from '../../utils/responsiveUtils';
import { IconName, icons } from './icons';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/** Decorative by default: put the accessibility label on the control that holds the icon. */
export function Icon({ name, size = 22, color = colors.ink }: IconProps) {
  const dimension = designPx(size);

  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {icons[name].map((shape, index) => {
        switch (shape.type) {
          case 'path':
            return <Path key={index} d={shape.d} />;
          case 'circle':
            return (
              <Circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />
            );
          case 'rect':
            return (
              <Rect
                key={index}
                x={shape.x}
                y={shape.y}
                width={shape.width}
                height={shape.height}
                rx={shape.rx}
              />
            );
        }
      })}
    </Svg>
  );
}

export type { IconName } from './icons';
