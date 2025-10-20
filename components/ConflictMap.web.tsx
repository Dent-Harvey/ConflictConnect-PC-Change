import { useTheme } from '@/hooks/useTheme';
import { UserNeed } from '@/services/userNeedsService';
import { ConflictZone } from '@/types/conflict';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConflictMapProps {
  conflicts: ConflictZone[];
  onConflictPress?: (conflict: ConflictZone) => void;
  onViewFullIntel?: (conflict: ConflictZone) => void;
  onNeedPress?: (need: UserNeed) => void;
  showNeeds?: boolean;
  loading?: boolean;
}

export const ConflictMap: React.FC<ConflictMapProps> = () => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Map unavailable on web</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        The interactive map uses native modules. Open this project on Android or iOS to view the map.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    minHeight: 240,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ConflictMap;


