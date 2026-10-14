import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle
} from 'react-native';
import { useBrandTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'chip-action';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = React.memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  accessibilityLabel,
  style,
  textStyle,
  icon,
  fullWidth = false
}) {
  const theme = useBrandTheme();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; loaderColor: string } => {
    switch (variant) {
      case 'outline':
        return {
          container: {
            backgroundColor: theme.surfaceBackground,
            borderWidth: 1,
            borderColor: theme.primaryColor
          },
          text: { color: theme.primaryColor },
          loaderColor: theme.primaryColor
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.chipBackground,
            borderWidth: 1,
            borderColor: theme.chipBorderColor
          },
          text: { color: theme.chipTextColor },
          loaderColor: theme.chipTextColor
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent'
          },
          text: { color: theme.primaryColor },
          loaderColor: theme.primaryColor
        };
      case 'chip-action':
        return {
          container: {
            backgroundColor: theme.chipBackground,
            borderRadius: 16
          },
          text: { color: theme.chipActionColor },
          loaderColor: theme.chipActionColor
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: theme.primaryColor
          },
          text: { color: theme.isDark ? '#0F172A' : '#FFFFFF' },
          loaderColor: theme.isDark ? '#0F172A' : '#FFFFFF'
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
          text: { fontSize: 12, fontWeight: '700' }
        };
      case 'lg':
        return {
          container: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10 },
          text: { fontSize: 16, fontWeight: '700' }
        };
      case 'md':
      default:
        return {
          container: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8 },
          text: { fontSize: 13, fontWeight: '700' }
        };
    }
  };

  const { container: variantContainer, text: variantText, loaderColor } = getVariantStyles();
  const { container: sizeContainer, text: sizeText } = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[
        styles.button,
        sizeContainer,
        variantContainer,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        Platform.OS === 'web' && ({ cursor: disabled ? 'not-allowed' : 'pointer' } as any),
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <Text style={[styles.text, sizeText, variantText, textStyle]}>
          {icon ? `${icon} ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.5
  },
  text: {
    textAlign: 'center'
  }
});

