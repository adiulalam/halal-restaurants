import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useBrandTheme } from '../theme';

export type ViewMode = 'list' | 'map';

export interface ViewModeTabsProps {
  activeTab: ViewMode;
  onTabChange: (tab: ViewMode) => void;
  listCount?: number;
}

export const ViewModeTabs: React.FC<ViewModeTabsProps> = React.memo(
  function ViewModeTabs({
    activeTab,
    onTabChange,
    listCount
  }: ViewModeTabsProps): React.JSX.Element {
    const theme = useBrandTheme();

    return (
      <View
        style={[
          styles.tabsContainer,
          {
            backgroundColor: theme.surfaceBackground,
            borderBottomColor: theme.borderColor
          }
        ]}
        accessibilityRole="tablist"
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabChange('list')}
          accessibilityRole="tab"
          accessibilityLabel={`List View${listCount !== undefined ? `, ${listCount} restaurants` : ''}`}
          accessibilityState={{ selected: activeTab === 'list' }}
          style={[
            styles.tabButton,
            activeTab === 'list' && [styles.activeTabButton, { borderBottomColor: theme.primaryColor }],
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'list' ? theme.primaryColor : theme.mutedTextColor },
              activeTab === 'list' && styles.activeTabText
            ]}
          >
            📋 List View {listCount !== undefined ? `(${listCount})` : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabChange('map')}
          accessibilityRole="tab"
          accessibilityLabel="Map View"
          accessibilityState={{ selected: activeTab === 'map' }}
          style={[
            styles.tabButton,
            activeTab === 'map' && [styles.activeTabButton, { borderBottomColor: theme.primaryColor }],
            Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'map' ? theme.primaryColor : theme.mutedTextColor },
              activeTab === 'map' && styles.activeTabText
            ]}
          >
            🗺️ Map View
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1
  },
  tabButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent'
  },
  activeTabButton: {
    borderBottomWidth: 3
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600'
  },
  activeTabText: {
    fontWeight: '800'
  }
});

