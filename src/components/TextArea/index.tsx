import { useState } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { colors } from '../../theme';
import { styles } from './styles';

/** A fixed-height multi-line field that scrolls its own text and lights up with a soft blue ring while it has focus. */
export function TextArea({ style, onFocus, onBlur, ...rest }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...rest}
      multiline
      scrollEnabled
      textAlignVertical="top"
      placeholderTextColor={colors.textSecondary}
      selectionColor={colors.primary}
      onFocus={event => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={event => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[styles.field, focused && styles.focused, style]}
    />
  );
}
