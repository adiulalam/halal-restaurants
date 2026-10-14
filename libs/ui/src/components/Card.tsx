import React from 'react';
import { View, StyleSheet, Platform, ViewProps, ViewStyle } from 'react-native';
import { useBrandTheme } from '../theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = React.memo(function Card({
  children,
  elevated = true,
  style,
  ...rest
}) {
  const theme = useBrandTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderColor
        },
        elevated && styles.elevated,
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1
  },
  elevated: {
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3
      }
    })
  }
});

