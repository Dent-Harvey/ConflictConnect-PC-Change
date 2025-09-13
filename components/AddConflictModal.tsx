import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
  Switch,
  Keyboard,
  Image,
} from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { PressableScale } from '@/components/ui/PressableScale';
import { 
  ConflictZone, 
  ConflictSeverity, 
  ConflictStatus, 
  Citation, 
  CitationType,
  GeolocatedMedia, 
  MediaType,
  AssociatedNeed,
  NeedCategory,
  NeedUrgency 
} from '@/types/conflict';
import { errorHandler } from '@/utils/errorHandler';

// Validation schema
const conflictFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  status: z.enum(['active', 'resolved', 'escalating', 'monitoring']),
  location: z.string().min(1, 'Location is required'),
  country: z.string().min(1, 'Country is required'),
  region: z.string().optional(),
  involvedParties: z.array(z.string()).optional(),
  casualties: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  
  // Submitter information
  submitterName: z.string().min(1, 'Your name is required'),
  submitterEmail: z.string().email('Valid email required'),
  submitterOrganization: z.string().optional(),
  submitterRole: z.string().optional(),
  isWitness: z.boolean().optional(),
  
  // Citations
  citations: z.array(z.object({
    type: z.enum(['news', 'social_media', 'official_report', 'witness_testimony', 'academic_source', 'ngo_report', 'other']),
    title: z.string().min(1, 'Citation title required'),
    url: z.string().url('Valid URL required'),
    author: z.string().optional(),
    credibilityRating: z.number().min(0).max(10),
    description: z.string().optional(),
  })),
  
  // Associated needs
  associatedNeeds: z.array(z.object({
    category: z.enum(['medical', 'food', 'shelter', 'water', 'clothing', 'transportation', 'communication', 'security', 'education', 'psychological_support', 'other']),
    description: z.string().min(1, 'Need description required'),
    urgency: z.enum(['low', 'medium', 'high', 'critical']),
    quantity: z.string().optional(),
    estimatedAffected: z.number().min(0).optional(),
    specificRequirements: z.string().optional(),
  })),
});

type ConflictFormData = z.infer<typeof conflictFormSchema>;

interface AddConflictModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (conflictData: Partial<ConflictZone>) => Promise<void>;
}

export const AddConflictModal: React.FC<AddConflictModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<GeolocatedMedia[]>([]);
  const [activeSection, setActiveSection] = useState<'basic' | 'submitter' | 'citations' | 'media' | 'needs'>('basic');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ConflictFormData>({
    resolver: zodResolver(conflictFormSchema),
    defaultValues: {
      status: 'monitoring',
      severity: 'medium',
      citations: [],
      associatedNeeds: [],
      isWitness: false,
    },
  });

  const { fields: citationFields, append: addCitation, remove: removeCitation } = useFieldArray({
    control,
    name: 'citations',
  });

  const { fields: needFields, append: addNeed, remove: removeNeed } = useFieldArray({
    control,
    name: 'associatedNeeds',
  });

  // Get current location on modal open
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location permission is required to help with conflict mapping');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      
      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync(location.coords);
      if (reverseGeocode[0]) {
        const { country, region, city, district } = reverseGeocode[0];
        setValue('country', country || '');
        setValue('region', region || '');
        setValue('location', [city, district].filter(Boolean).join(', ') || '');
      }
    } catch (error) {
      errorHandler({
        filePath: 'components/AddConflictModal.tsx',
        functionName: 'getCurrentLocation',
        error: error as Error,
      });
    }
  };

  const handleMediaUpload = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'video/*', 'audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        
        // For demo purposes, we'll create a mock media object
        // In production, you'd upload this to cloud storage
        const mediaItem: GeolocatedMedia = {
          type: file.mimeType?.startsWith('video/') ? 'video' : 
                file.mimeType?.startsWith('audio/') ? 'audio' : 'image',
          url: file.uri,
          filename: file.name,
          description: '',
          capturedAt: new Date().toISOString(),
          geoLocation: currentLocation ? {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            accuracy: currentLocation.coords.accuracy || undefined,
            altitude: currentLocation.coords.altitude || undefined,
          } : undefined,
          verificationStatus: 'unverified',
        };

        setUploadedMedia(prev => [...prev, mediaItem]);
        Alert.alert('Media Added', 'Media file has been attached with location data');
      }
    } catch (error) {
      errorHandler({
        filePath: 'components/AddConflictModal.tsx',
        functionName: 'handleMediaUpload',
        error: error as Error,
      });
      Alert.alert('Upload Error', 'Failed to upload media file');
    }
  };

  const onFormSubmit = async (data: ConflictFormData) => {
    try {
      setLoading(true);
      Keyboard.dismiss();

      if (!currentLocation) {
        Alert.alert('Location Required', 'Please allow location access to submit a conflict report');
        return;
      }

      const conflictData: Partial<ConflictZone> = {
        title: data.title,
        description: data.description,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        severity: data.severity,
        status: data.status,
        dateReported: new Date().toISOString(),
        location: data.location,
        country: data.country,
        region: data.region,
        casualties: data.casualties,
        involvedParties: data.involvedParties?.filter(Boolean),
        tags: data.tags?.filter(Boolean),
        verified: false,
        submissionStatus: 'submitted',
        submittedBy: {
          name: data.submitterName,
          email: data.submitterEmail,
          organization: data.submitterOrganization,
          role: data.submitterRole,
          isWitness: data.isWitness,
        },
        citations: data.citations,
        geolocatedMedia: uploadedMedia,
        associatedNeeds: data.associatedNeeds,
      };

      await onSubmit(conflictData);
      
      // Reset form and close modal
      reset();
      setUploadedMedia([]);
      setCurrentLocation(null);
      setActiveSection('basic');
      onClose();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Submitted', 'Your conflict report has been submitted for review');
      
    } catch (error) {
      errorHandler({
        filePath: 'components/AddConflictModal.tsx',
        functionName: 'onFormSubmit',
        error: error as Error,
      });
      Alert.alert('Submission Failed', 'Failed to submit conflict report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSectionHeader = (title: string, section: string, icon: string) => (
    <PressableScale onPress={() => setActiveSection(section as any)}>
      <View style={[
        styles.sectionHeader, 
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        activeSection === section && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
      ]}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={[
          styles.sectionTitle, 
          { color: theme.colors.text },
          activeSection === section && { color: theme.colors.onPrimary }
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.chevron,
          { color: theme.colors.textSecondary },
          activeSection === section && { color: theme.colors.onPrimary }
        ]}>
          {activeSection === section ? '▼' : '▶'}
        </Text>
      </View>
    </PressableScale>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Controller
        control={control}
        name="title"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Conflict Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Brief title describing the conflict"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.title && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.title.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Detailed description of the conflict situation"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={4}
            />
            {errors.description && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.description.message}</Text>}
          </View>
        )}
      />

      <View style={styles.row}>
        <Controller
          control={control}
          name="severity"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Severity</Text>
              <View style={styles.pickerContainer}>
                {(['low', 'medium', 'high', 'critical'] as ConflictSeverity[]).map((level) => (
                  <PressableScale key={level} onPress={() => onChange(level)}>
                    <View style={[
                      styles.pickerOption,
                      { borderColor: theme.colors.border },
                      value === level && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    ]}>
                      <Text style={[
                        styles.pickerText,
                        { color: theme.colors.text },
                        value === level && { color: theme.colors.onPrimary }
                      ]}>
                        {level.toUpperCase()}
                      </Text>
                    </View>
                  </PressableScale>
                ))}
              </View>
            </View>
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Status</Text>
              <View style={styles.pickerContainer}>
                {(['monitoring', 'active', 'escalating', 'resolved'] as ConflictStatus[]).map((status) => (
                  <PressableScale key={status} onPress={() => onChange(status)}>
                    <View style={[
                      styles.pickerOption,
                      { borderColor: theme.colors.border },
                      value === status && { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
                    ]}>
                      <Text style={[
                        styles.pickerText,
                        { color: theme.colors.text },
                        value === status && { color: theme.colors.onSecondary }
                      ]}>
                        {status.toUpperCase()}
                      </Text>
                    </View>
                  </PressableScale>
                ))}
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.row}>
        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Location *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="City, District"
                placeholderTextColor={theme.colors.textSecondary}
              />
              {errors.location && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.location.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, onBlur, value } }) => (
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Country *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholder="Country name"
                placeholderTextColor={theme.colors.textSecondary}
              />
              {errors.country && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.country.message}</Text>}
            </View>
          )}
        />
      </View>

      <Controller
        control={control}
        name="casualties"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Estimated Casualties (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              onBlur={onBlur}
              onChangeText={(text) => onChange(text ? parseInt(text) : undefined)}
              value={value?.toString() || ''}
              placeholder="Number of casualties"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        )}
      />
    </View>
  );

  const renderSubmitterInfo = () => (
    <View style={styles.section}>
      <Controller
        control={control}
        name="submitterName"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Your Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Full name"
              placeholderTextColor={theme.colors.textSecondary}
            />
            {errors.submitterName && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.submitterName.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="submitterEmail"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="your.email@domain.com"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.submitterEmail && <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.submitterEmail.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="submitterOrganization"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Organization (Optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="NGO, News outlet, etc."
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        )}
      />

      <Controller
        control={control}
        name="isWitness"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.switchRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Direct Witness</Text>
              <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                I witnessed this conflict firsthand
              </Text>
            </View>
            <Switch
              value={value}
              onValueChange={onChange}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        )}
      />
    </View>
  );

  const renderCitations = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Sources & Citations</Text>
        <PressableScale onPress={() => addCitation({
          type: 'news',
          title: '',
          url: '',
          credibilityRating: 5,
        })}>
          <View style={[styles.addButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }]}>+ Add Source</Text>
          </View>
        </PressableScale>
      </View>

      {citationFields.map((field, index) => (
        <View key={field.id} style={[styles.citationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Source {index + 1}</Text>
            <PressableScale onPress={() => removeCitation(index)}>
              <Text style={[styles.deleteButton, { color: theme.colors.error }]}>✕</Text>
            </PressableScale>
          </View>

          <Controller
            control={control}
            name={`citations.${index}.title`}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Title *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Title of the source"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name={`citations.${index}.url`}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>URL *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="https://"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="none"
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name={`citations.${index}.credibilityRating`}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Credibility Rating (0-10)</Text>
                <View style={styles.ratingContainer}>
                  {[...Array(11)].map((_, rating) => (
                    <PressableScale key={rating} onPress={() => onChange(rating)}>
                      <View style={[
                        styles.ratingButton,
                        { borderColor: theme.colors.border },
                        value === rating && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                      ]}>
                        <Text style={[
                          styles.ratingText,
                          { color: theme.colors.text },
                          value === rating && { color: theme.colors.onPrimary }
                        ]}>
                          {rating}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}
          />
        </View>
      ))}
    </View>
  );

  const renderMediaUpload = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Geolocated Media</Text>
        <PressableScale onPress={handleMediaUpload}>
          <View style={[styles.addButton, { backgroundColor: theme.colors.secondary }]}>
            <Text style={[styles.addButtonText, { color: theme.colors.onSecondary }]}>📎 Add Media</Text>
          </View>
        </PressableScale>
      </View>

      {uploadedMedia.map((media, index) => (
        <View key={index} style={[styles.mediaCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.mediaInfo}>
            <Text style={[styles.mediaType, { color: theme.colors.text }]}>
              {media.type === 'image' ? '🖼️' : media.type === 'video' ? '🎥' : '🎵'} {media.type.toUpperCase()}
            </Text>
            <Text style={[styles.mediaName, { color: theme.colors.textSecondary }]}>
              {media.filename}
            </Text>
            {media.geoLocation && (
              <Text style={[styles.geoInfo, { color: theme.colors.success }]}>
                📍 Location: {media.geoLocation.latitude.toFixed(6)}, {media.geoLocation.longitude.toFixed(6)}
              </Text>
            )}
          </View>
          <PressableScale onPress={() => setUploadedMedia(prev => prev.filter((_, i) => i !== index))}>
            <Text style={[styles.deleteButton, { color: theme.colors.error }]}>✕</Text>
          </PressableScale>
        </View>
      ))}

      <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
        Media files will be automatically tagged with your current location for verification purposes.
      </Text>
    </View>
  );

  const renderAssociatedNeeds = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Associated Needs</Text>
        <PressableScale onPress={() => addNeed({
          category: 'medical',
          description: '',
          urgency: 'medium',
        })}>
          <View style={[styles.addButton, { backgroundColor: theme.colors.warning }]}>
            <Text style={[styles.addButtonText, { color: '#FFFFFF' }]}>+ Add Need</Text>
          </View>
        </PressableScale>
      </View>

      {needFields.map((field, index) => (
        <View key={field.id} style={[styles.needCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Need {index + 1}</Text>
            <PressableScale onPress={() => removeNeed(index)}>
              <Text style={[styles.deleteButton, { color: theme.colors.error }]}>✕</Text>
            </PressableScale>
          </View>

          <Controller
            control={control}
            name={`associatedNeeds.${index}.category`}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Category *</Text>
                <View style={styles.categoryGrid}>
                  {(['medical', 'food', 'shelter', 'water', 'clothing', 'transportation'] as NeedCategory[]).map((category) => (
                    <PressableScale key={category} onPress={() => onChange(category)}>
                      <View style={[
                        styles.categoryOption,
                        { borderColor: theme.colors.border },
                        value === category && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                      ]}>
                        <Text style={[
                          styles.categoryText,
                          { color: theme.colors.text },
                          value === category && { color: theme.colors.onPrimary }
                        ]}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name={`associatedNeeds.${index}.urgency`}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Urgency *</Text>
                <View style={styles.urgencyRow}>
                  {(['low', 'medium', 'high', 'critical'] as NeedUrgency[]).map((urgency) => (
                    <PressableScale key={urgency} onPress={() => onChange(urgency)}>
                      <View style={[
                        styles.urgencyOption,
                        { borderColor: theme.colors.border },
                        value === urgency && { backgroundColor: theme.colors.error, borderColor: theme.colors.error }
                      ]}>
                        <Text style={[
                          styles.urgencyText,
                          { color: theme.colors.text },
                          value === urgency && { color: '#FFFFFF' }
                        ]}>
                          {urgency.toUpperCase()}
                        </Text>
                      </View>
                    </PressableScale>
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name={`associatedNeeds.${index}.description`}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Description *</Text>
                <TextInput
                  style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Describe the specific need"
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
          />
        </View>
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
          <PressableScale onPress={onClose}>
            <Text style={[styles.cancelButton, { color: theme.colors.error }]}>Cancel</Text>
          </PressableScale>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Report Conflict</Text>
          <PressableScale onPress={handleSubmit(onFormSubmit)} disabled={loading || !isValid}>
            <Text style={[
              styles.submitButton, 
              { color: theme.colors.primary },
              (!isValid || loading) && { opacity: 0.5 }
            ]}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </PressableScale>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Navigation */}
          <View style={styles.navigation}>
            {renderSectionHeader('Basic Info', 'basic', '📝')}
            {renderSectionHeader('Submitter Info', 'submitter', '👤')}
            {renderSectionHeader('Citations', 'citations', '📚')}
            {renderSectionHeader('Media Evidence', 'media', '📎')}
            {renderSectionHeader('Associated Needs', 'needs', '🆘')}
          </View>

          {/* Content Sections */}
          {activeSection === 'basic' && renderBasicInfo()}
          {activeSection === 'submitter' && renderSubmitterInfo()}
          {activeSection === 'citations' && renderCitations()}
          {activeSection === 'media' && renderMediaUpload()}
          {activeSection === 'needs' && renderAssociatedNeeds()}

          {/* Bottom Padding */}
          <View style={{ height: insets.bottom + 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancelButton: {
    fontSize: 17,
    fontFamily: 'Inter-Medium',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  submitButton: {
    fontSize: 17,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  navigation: {
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  chevron: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  section: {
    padding: 16,
    gap: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  textArea: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pickerText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  switchDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  citationCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  needCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  deleteButton: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ratingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  mediaInfo: {
    flex: 1,
  },
  mediaType: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  mediaName: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  geoInfo: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  urgencyOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
});