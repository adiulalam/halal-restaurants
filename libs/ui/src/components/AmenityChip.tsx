import React from 'react';
import { Chip } from './Chip';

export interface AmenityChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  count?: number;
}

export const AmenityChip: React.FC<AmenityChipProps> = React.memo(function AmenityChip({
  label,
  active = false,
  onPress,
  count
}) {
  return (
    <Chip
      label={label}
      active={active}
      onPress={onPress}
      count={count}
    />
  );
});

