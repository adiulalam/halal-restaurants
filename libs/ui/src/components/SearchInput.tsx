import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ViewStyle
} from 'react-native';
import { useBrandTheme } from '../theme';

export interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

export const SearchInput: React.FC<SearchInputProps> = React.memo(function SearchInput({
  value,
  onChangeText,
  placeholder = 'Search town, postcode or branch...',
  onClear,
  accessibilityLabel = 'Search restaurants by town, postcode or branch',
  style
}) {
  const theme = useBrandTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceBackground,
          borderBottomColor: theme.borderColor
        },
        style
      ]}
    >
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorderColor
          }
        ]}
      >
        <Text style={[styles.searchIcon, { color: theme.mutedTextColor }]}>🔍</Text>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={theme.mutedTextColor}
          style={[
            styles.input,
            { color: theme.textColor }
          ]}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onClear || (() => onChangeText(''))}
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
            style={[
              styles.clearButton,
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any)
            ]}
          >
            <Text style={[styles.clearIcon, { color: theme.mutedTextColor }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6
  },
  input: {
    flex: 1,
    height: 34,
    fontSize: 13,
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none'
      } as any
    })
  },
  clearButton: {
    padding: 4
  },
  clearIcon: {
    fontSize: 13,
    fontWeight: '700'
  }
});

