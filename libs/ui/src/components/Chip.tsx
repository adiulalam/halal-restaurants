import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useBrandTheme } from '../theme';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  count?: number;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = React.memo(function Chip({
  label,
  active = false,
  onPress,
  count,
  accessibilityLabel,
  style,
  textStyle
}) {
  const theme = useBrandTheme();

  const displayText = count !== undefined ? `${label} (${count})` : label;
  const computedLabel =
    accessibilityLabel ||
    `${active ? 'Remove filter' : 'Filter by'} ${displayText}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={computedLabel}
      accessibilityState={{ selected: active }}
      style={[
        styles.chipBase,
        {
          backgroundColor: active ? theme.chipActiveBackground : theme.chipBackground,
          borderColor: active ? theme.chipActiveBackground : theme.chipBorderColor
        },
        Platform.OS === 'web' && ({ cursor: onPress ? 'pointer' : 'default' } as any),
        style
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? theme.chipActiveTextColor : theme.chipTextColor },
          active && styles.activeChipText,
          textStyle
        ]}
      >
        {displayText}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chipBase: {
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
    marginVertical: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500'
  },
  activeChipText: {
    fontWeight: '700'
  }
});

