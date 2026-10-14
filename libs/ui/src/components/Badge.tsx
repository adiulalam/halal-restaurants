import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useBrandTheme } from '../theme';

export type BadgeVariant = 'default' | 'success' | 'secondary' | 'outline';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = React.memo(function Badge({
  label,
  variant = 'default',
  accessibilityLabel,
  style,
  textStyle
}) {
  const theme = useBrandTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'success':
        return {
          container: { backgroundColor: theme.halalBadgeColor },
          text: { color: theme.halalBadgeTextColor }
        };
      case 'secondary':
        return {
          container: { backgroundColor: theme.nonHalalBadgeColor },
          text: { color: theme.nonHalalBadgeTextColor }
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.borderColor
          },
          text: { color: theme.textColor }
        };
      case 'default':
      default:
        return {
          container: { backgroundColor: theme.statusBadgeBackground },
          text: { color: theme.statusBadgeTextColor }
        };
    }
  };

  const { container: variantContainer, text: variantText } = getVariantStyles();

  return (
    <View
      style={[styles.badge, variantContainer, style]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text style={[styles.text, variantText, textStyle]}>
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4
  }
});

