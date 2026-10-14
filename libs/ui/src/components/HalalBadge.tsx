import React from 'react';
import { Badge } from './Badge';

export interface HalalBadgeProps {
  label?: string;
  isHalal: boolean;
}

export const HalalBadge: React.FC<HalalBadgeProps> = React.memo(function HalalBadge({
  label = '100% HALAL CERTIFIED',
  isHalal
}) {
  if (!isHalal) {
    return (
      <Badge
        label="STANDARD"
        variant="secondary"
        accessibilityLabel="Standard Restaurant, not certified Halal"
      />
    );
  }

  return (
    <Badge
      label={`✓ ${label}`}
      variant="success"
      accessibilityLabel={`Verified: ${label}`}
    />
  );
});

