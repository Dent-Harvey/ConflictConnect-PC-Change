import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '@/hooks/useTheme';
import { ConflictZone, ConflictMapRegion } from '@/types/conflict';
import { ConflictMarker } from './ConflictMarker';
import { ConflictCallout } from './ConflictCallout';
import { ConflictPreviewModal } from './ConflictPreviewModal';
import { NeedMarker } from './NeedMarker';
import { errorHandler } from '@/utils/errorHandler';
import { useUserNeeds } from '@/hooks/useUserNeeds';
import { UserNeed } from '@/services/userNeedsService';

interface ConflictMapProps {
  conflicts: ConflictZone[];
  onConflictPress?: (conflict: ConflictZone) => void;
  onViewFullIntel?: (conflict: ConflictZone) => void;
  onNeedPress?: (need: UserNeed) => void;
  showNeeds?: boolean;
  loading?: boolean;
}

export const ConflictMap: React.FC<ConflictMapProps> = ({
  conflicts,
  onConflictPress,
  onViewFullIntel,
  onNeedPress,
  showNeeds = false,
  loading = false,
}) => {
  const theme = useTheme();
  const [region, setRegion] = useState<ConflictMapRegion>({
    latitude: 50.4501, // Default to Europe center
    longitude: 30.5234,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [previewConflict, setPreviewConflict] = useState<ConflictZone | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Get all needs for visible conflict zones - fetch all needs and filter by conflict zones
  const { data: allNeeds = [] } = useUserNeeds();

  // Memoized filtered needs with valid coordinates
  const validNeeds = useMemo(() => {
    if (!showNeeds) return [];
    return allNeeds.filter(need => 
      need.location?.latitude != null && 
      need.location?.longitude != null && 
      typeof need.location.latitude === 'number' && 
      typeof need.location.longitude === 'number' &&
      !isNaN(need.location.latitude) &&
      !isNaN(need.location.longitude)
    );
  }, [allNeeds, showNeeds]);

  // Request location permissions and get user location
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocationPermission(false);
        Alert.alert(
          'Location Permission',
          'Location permission is needed to show your position on the map.',
          [{ text: 'OK' }]
        );
        return;
      }

      setLocationPermission(true);
      
      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setUserLocation(location);
      
      // Update region to user location if no conflicts nearby
      if (conflicts.length === 0) {
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      errorHandler({
        filePath: '/components/ConflictMap.tsx',
        functionName: 'requestLocationPermission',
        error: error as Error,
      });
      setLocationPermission(false);
    }
  };

  // Memoized function to add small random offset to coordinates to prevent exact overlap
  const processedConflicts = useMemo(() => {
    const coordinateMap = new Map<string, ConflictZone[]>();
    
    // Filter out conflicts with invalid coordinates and group conflicts by coordinates
    const validConflicts = conflicts.filter(conflict => 
      conflict.latitude != null && 
      conflict.longitude != null && 
      typeof conflict.latitude === 'number' && 
      typeof conflict.longitude === 'number' &&
      !isNaN(conflict.latitude) &&
      !isNaN(conflict.longitude)
    );

    validConflicts.forEach(conflict => {
      const key = `${conflict.latitude.toFixed(6)}_${conflict.longitude.toFixed(6)}`;
      if (!coordinateMap.has(key)) {
        coordinateMap.set(key, []);
      }
      coordinateMap.get(key)!.push(conflict);
    });
    
    // Apply jittering to overlapping conflicts
    const jitteredConflicts: ConflictZone[] = [];
    
    coordinateMap.forEach((conflictsAtLocation, key) => {
      if (conflictsAtLocation.length === 1) {
        // No overlap, keep original coordinates
        jitteredConflicts.push(conflictsAtLocation[0]);
      } else {
        // Multiple conflicts at same location - apply circular jittering
        conflictsAtLocation.forEach((conflict, index) => {
          const jitterRadius = 0.002; // ~200m offset
          const angle = (index * (360 / conflictsAtLocation.length)) * (Math.PI / 180);
          const latOffset = Math.sin(angle) * jitterRadius;
          const lngOffset = Math.cos(angle) * jitterRadius;
          
          jitteredConflicts.push({
            ...conflict,
            latitude: conflict.latitude + latOffset,
            longitude: conflict.longitude + lngOffset,
            // Mark as jittered for visual indication
            _originalLat: conflict.latitude,
            _originalLng: conflict.longitude,
            _jittered: true,
            _groupSize: conflictsAtLocation.length,
            _groupIndex: index
          } as ConflictZone & { _originalLat: number; _originalLng: number; _jittered: boolean; _groupSize: number; _groupIndex: number });
        });
      }
    });
    
    return jitteredConflicts;
  }, [conflicts]);

  // Memoized map region calculation based on conflicts
  const calculatedRegion = useMemo(() => {
    if (processedConflicts.length > 0) {
      // Filter out conflicts with invalid coordinates for map calculations
      const validConflictsForMap = processedConflicts.filter(c => 
        c.latitude != null && 
        c.longitude != null && 
        typeof c.latitude === 'number' && 
        typeof c.longitude === 'number' &&
        !isNaN(c.latitude) &&
        !isNaN(c.longitude)
      );

      if (validConflictsForMap.length > 0) {
        const lats = validConflictsForMap.map(c => c.latitude);
        const lngs = validConflictsForMap.map(c => c.longitude);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const latDelta = (maxLat - minLat) * 1.3; // Add padding
        const lngDelta = (maxLng - minLng) * 1.3;
        
        return {
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lngDelta, 0.01),
        };
      }
    }
    return null;
  }, [processedConflicts]);

  // Update region when calculated region changes
  useEffect(() => {
    if (calculatedRegion) {
      setRegion(calculatedRegion);
    }
  }, [calculatedRegion]);

  const handleMarkerPress = useCallback((conflict: ConflictZone) => {
    console.log('Conflict marker pressed:', conflict.title);
    setPreviewConflict(conflict);
    setShowPreviewModal(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setShowPreviewModal(false);
    setPreviewConflict(null);
  }, []);

  const handleViewFullIntel = useCallback((conflict: ConflictZone) => {
    handleClosePreview();
    onViewFullIntel?.(conflict);
    onConflictPress?.(conflict);
  }, [onViewFullIntel, onConflictPress, handleClosePreview]);

  const handleNeedPress = useCallback((need: UserNeed) => {
    console.log('Need marker pressed:', need.title);
    onNeedPress?.(need);
  }, [onNeedPress]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading conflict data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={locationPermission}
        showsMyLocationButton={locationPermission}
        followsUserLocation={false}
        showsCompass={true}
        showsScale={true}
        pitchEnabled={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
      >
        {/* Conflict markers - using processed conflicts to handle overlapping */}
        {processedConflicts.map((conflict, index) => (
          <Marker
            key={conflict.id || `${conflict.latitude}-${conflict.longitude}-${index}`}
            coordinate={{
              latitude: conflict.latitude,
              longitude: conflict.longitude,
            }}
            onPress={() => handleMarkerPress(conflict)}
          >
            <ConflictMarker 
              conflict={conflict} 
              isJittered={(conflict as any)._jittered}
              groupSize={(conflict as any)._groupSize}
              groupIndex={(conflict as any)._groupIndex}
            />
          </Marker>
        ))}
        
        {/* Need markers */}
        {validNeeds.map((need) => (
          <Marker
            key={`need-${need.id}`}
            coordinate={{
              latitude: need.location.latitude,
              longitude: need.location.longitude,
            }}
            onPress={() => handleNeedPress(need)}
          >
            <NeedMarker need={need} />
            <Callout tooltip>
              <View style={styles.needCallout}>
                <Text style={[styles.needTitle, { color: theme.colors.text }]}>
                  {need.title}
                </Text>
                <Text style={[styles.needCategory, { color: theme.colors.textSecondary }]}>
                  {need.category} • {need.priority}
                </Text>
                <Text style={[styles.needDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {need.description}
                </Text>
                <Text style={[styles.needQuantity, { color: theme.colors.primary }]}>
                  {need.quantity} {need.unit || 'units'}
                </Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Conflict Preview Modal */}
      <ConflictPreviewModal
        conflict={previewConflict}
        visible={showPreviewModal}
        onClose={handleClosePreview}
        onViewFullIntel={handleViewFullIntel}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  needCallout: {
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  needTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  needCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  needDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 6,
  },
  needQuantity: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
});