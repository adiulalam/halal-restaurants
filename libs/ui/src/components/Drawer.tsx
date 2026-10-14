import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ViewStyle
} from 'react-native';
import { useBrandTheme } from '../theme';
import { ThemeToggleButton } from './ThemeToggleButton';
import { ViewModeTabs, type ViewMode } from './ViewModeTabs';
import { SearchInput } from './SearchInput';

export interface DrawerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  listCount?: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  onClearSearch?: () => void;
  style?: ViewStyle;
}

export const Drawer: React.FC<DrawerProps> = React.memo(function Drawer({
  title,
  subtitle,
  badge,
  isOpen,
  onOpen,
  onClose,
  viewMode,
  onViewModeChange,
  listCount,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search town, postcode or branch...',
  onClearSearch,
  style
}: DrawerProps): React.JSX.Element {
  const theme = useBrandTheme();

  return (
    <View style={[styles.container, style]}>
      {/* Compact Mobile Top Bar (Header) with Drawer Trigger */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: theme.headerBackground,
            borderBottomColor: theme.isDark ? theme.borderColor : 'transparent'
          }
        ]}
        accessibilityRole="header"
      >
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpen}
            accessibilityRole="button"
            accessibilityLabel="Open navigation drawer"
            style={[
              styles.drawerTriggerButton,
              {
                backgroundColor: theme.isDark ? '#334155' : 'rgba(255, 255, 255, 0.2)',
                borderColor: theme.isDark ? '#475569' : 'rgba(255, 255, 255, 0.4)'
              },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
            ]}
          >
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>

          <Text style={[styles.brandTitle, { color: theme.headerTextColor }]}>
            {title}
          </Text>

          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>

        {searchQuery ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClearSearch || (() => onSearchChange(''))}
            accessibilityRole="button"
            accessibilityLabel={`Clear search query ${searchQuery}`}
            style={styles.searchPill}
          >
            <Text style={styles.searchPillText}>
              🔍 {searchQuery.length > 10 ? `${searchQuery.slice(0, 10)}…` : searchQuery} ✕
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Slide-out Drawer & Dimmed Backdrop */}
      {isOpen && (
        <View style={styles.drawerOverlayContainer}>
          {/* Backdrop (Tapping closes drawer) */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Dismiss drawer backdrop"
            style={styles.backdrop}
          />

          {/* Drawer Sidebar */}
          <View
            style={[
              styles.drawerSidebar,
              {
                backgroundColor: theme.surfaceBackground,
                borderRightColor: theme.borderColor
              }
            ]}
            accessibilityLabel="Navigation drawer"
          >
            {/* Drawer Header with Title, Badge, Description & Close Button */}
            <View
              style={[
                styles.drawerHeader,
                {
                  backgroundColor: theme.headerBackground,
                  borderBottomColor: theme.borderColor
                }
              ]}
            >
              <View style={styles.drawerHeaderTop}>
                <View style={styles.drawerBrandRow}>
                  <Text style={[styles.drawerTitle, { color: theme.headerTextColor }]}>
                    {title}
                  </Text>
                  {badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close navigation drawer"
                  style={[
                    styles.closeButton,
                    {
                      backgroundColor: theme.isDark ? '#334155' : 'rgba(255, 255, 255, 0.2)',
                      borderColor: theme.isDark ? '#475569' : 'rgba(255, 255, 255, 0.4)'
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
                  ]}
                >
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              {subtitle && (
                <Text style={[styles.drawerSubtitle, { color: theme.headerSubtitleColor }]}>
                  {subtitle}
                </Text>
              )}

              <View style={styles.themeToggleContainer}>
                <ThemeToggleButton />
              </View>
            </View>

            {/* Drawer Body Scroll */}
            <ScrollView
              style={styles.drawerBody}
              contentContainerStyle={styles.drawerBodyContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Section: View Mode */}
              <Text style={[styles.sectionLabel, { color: theme.mutedTextColor }]}>
                VIEW MODE
              </Text>
              <View style={styles.sectionBlock}>
                <ViewModeTabs
                  activeTab={viewMode}
                  onTabChange={onViewModeChange}
                  listCount={listCount}
                />
              </View>

              {/* Section: Search */}
              <Text style={[styles.sectionLabel, { color: theme.mutedTextColor }]}>
                SEARCH RESTAURANTS
              </Text>
              <View style={styles.sectionBlock}>
                <SearchInput
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  placeholder={searchPlaceholder}
                  onClear={onClearSearch}
                />
              </View>
            </ScrollView>

            {/* Drawer Footer Button */}
            <View style={[styles.drawerFooter, { borderTopColor: theme.borderColor }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={`Done, view ${listCount !== undefined ? `${listCount} ` : ''}restaurants`}
                style={[
                  styles.viewResultsButton,
                  { backgroundColor: theme.primaryColor },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
                ]}
              >
                <Text
                  style={[
                    styles.viewResultsButtonText,
                    { color: theme.isDark ? '#0F172A' : '#FFFFFF' }
                  ]}
                >
                  ✓ Done • View {listCount !== undefined ? `${listCount} ` : ''}Restaurants
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 8 : 8,
    paddingBottom: 8,
    borderBottomWidth: 1
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1
  },
  drawerTriggerButton: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  hamburgerIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
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
  searchPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  searchPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
  },
  drawerOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)'
  },
  drawerSidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '85%',
    maxWidth: 340,
    borderRightWidth: 1,
    flexDirection: 'column',
    ...Platform.select({
      web: {
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)'
      } as any,
      default: {
        elevation: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10
      }
    })
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 14 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  drawerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5
  },
  closeButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800'
  },
  drawerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 10
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  drawerBody: {
    flex: 1
  },
  drawerBodyContent: {
    paddingVertical: 12
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 6
  },
  sectionBlock: {
    marginBottom: 10
  },
  drawerFooter: {
    padding: 12,
    borderTopWidth: 1
  },
  viewResultsButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  viewResultsButtonText: {
    fontSize: 13,
    fontWeight: '700'
  }
});
