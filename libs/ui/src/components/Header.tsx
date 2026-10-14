import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useBrandTheme } from '../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = React.memo(function Header({
  title,
  subtitle,
  badge,
  rightAction
}) {
  const theme = useBrandTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.headerBackground,
          borderBottomColor: theme.isDark ? theme.borderColor : 'transparent'
        }
      ]}
      accessibilityRole="header"
    >
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={[styles.title, { color: theme.headerTextColor }]}>
            {title}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.headerSubtitleColor }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 10,
    paddingBottom: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  badge: {
    backgroundColor: '#15803D',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500'
  },
  rightAction: {
    marginLeft: 8
  }
});

