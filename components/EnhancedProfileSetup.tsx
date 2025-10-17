import { useTheme } from '@/hooks/useTheme';
import { UserProfile } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { LanguageSelector } from './LanguageSelector';

interface EnhancedProfileSetupProps {
  onComplete: (profile: UserProfile) => void | Promise<void>;
  onSkip: () => void | Promise<void>;
  initialData?: Partial<UserProfile>;
}

const EXPERTISE_OPTIONS = [
  'Medical', 'Logistics', 'Communication', 'Security', 'Legal', 'Translation',
  'Counseling', 'Education', 'Technology', 'Engineering', 'Administration',
  'Fundraising', 'Media', 'Research', 'Other'
];

const AVAILABILITY_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'weekends', label: 'Weekends Only' },
  { value: 'emergency_only', label: 'Emergency Only' },
];

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
];

export const EnhancedProfileSetup: React.FC<EnhancedProfileSetupProps> = ({
  onComplete,
  onSkip,
  initialData = {}
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    languages: ['en'],
    preferredLanguage: 'en',
    showLocation: true,
    showContactInfo: false,
    allowMessaging: true,
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);

  const steps = [
    'Basic Information',
    'Contact & Location',
    'Professional Details',
    'Languages & Availability',
    'Additional Information',
    'Privacy Settings'
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Information
        if (!profile.firstName?.trim()) newErrors.firstName = 'First name is required';
        if (!profile.lastName?.trim()) newErrors.lastName = 'Last name is required';
        if (!profile.email?.trim()) newErrors.email = 'Email is required';
        break;
      case 1: // Contact & Location
        if (!profile.location?.address) newErrors.location = 'Location is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Ensure all required fields are present
      if (!profile.firstName || !profile.lastName || !profile.email || 
          !profile.location || !profile.location.address) {
        throw new Error('Missing required fields');
      }

      const completeProfile: UserProfile = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        location: profile.location,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        profilePicture: profile.profilePicture,
        organization: profile.organization,
        jobTitle: profile.jobTitle,
        bio: profile.bio,
        expertise: profile.expertise || [],
        skills: profile.skills,
        certifications: profile.certifications,
        availability: profile.availability,
        languages: profile.languages || ['en'],
        preferredLanguage: profile.preferredLanguage || 'en',
        emergencyContact: profile.emergencyContact,
        website: profile.website,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        interests: profile.interests,
        volunteerExperience: profile.volunteerExperience,
        education: profile.education,
        showLocation: profile.showLocation,
        showContactInfo: profile.showContactInfo,
        allowMessaging: profile.allowMessaging,
      };

      onComplete(completeProfile);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address[0]) {
        setProfile(prev => ({
          ...prev,
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: `${address[0].street || ''}, ${address[0].city || ''}, ${address[0].region || ''}`.trim(),
            city: address[0].city || '',
            country: address[0].country || '',
          }
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location. Please enter manually.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfile(prev => ({
          ...prev,
          profilePicture: result.assets[0].uri
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Basic Information</Text>
      
      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {profile.profilePicture ? (
          <Image source={{ uri: profile.profilePicture }} style={styles.profilePhoto} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.border }]}>
            <Ionicons name="camera" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
        <Text style={[styles.photoText, { color: theme.colors.textSecondary }]}>Add Photo</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="First Name *"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.firstName}
        onChangeText={(text) => setProfile(prev => ({ ...prev, firstName: text }))}
      />
      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Last Name *"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.lastName}
        onChangeText={(text) => setProfile(prev => ({ ...prev, lastName: text }))}
      />
      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Email *"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Phone Number"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.phoneNumber}
        keyboardType="phone-pad"
        onChangeText={(text) => setProfile(prev => ({ ...prev, phoneNumber: text }))}
      />

      <View style={styles.genderContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Gender</Text>
        <View style={styles.genderOptions}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.genderOption,
                { borderColor: theme.colors.border },
                profile.gender === option.value && { borderColor: theme.colors.primary }
              ]}
              onPress={() => setProfile(prev => ({ ...prev, gender: option.value as any }))}
            >
              <Text style={[styles.genderText, { color: theme.colors.text }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContactLocation = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Contact & Location</Text>
      
      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: theme.colors.primary }]}
        onPress={requestLocation}
      >
        <Ionicons name="location" size={20} color="white" />
        <Text style={styles.locationButtonText}>Use Current Location</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Location Address *"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.location?.address}
        onChangeText={(text) => setProfile(prev => ({
          ...prev,
          location: { ...prev.location!, address: text }
        }))}
      />
      {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Emergency Contact Name"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.emergencyContact?.name}
        onChangeText={(text) => setProfile(prev => ({
          ...prev,
          emergencyContact: { ...prev.emergencyContact!, name: text }
        }))}
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Emergency Contact Phone"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.emergencyContact?.phone}
        keyboardType="phone-pad"
        onChangeText={(text) => setProfile(prev => ({
          ...prev,
          emergencyContact: { ...prev.emergencyContact!, phone: text }
        }))}
      />
    </View>
  );

  const renderProfessionalDetails = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Professional Details</Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Organization"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.organization}
        onChangeText={(text) => setProfile(prev => ({ ...prev, organization: text }))}
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Job Title"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.jobTitle}
        onChangeText={(text) => setProfile(prev => ({ ...prev, jobTitle: text }))}
      />

      <TextInput
        style={[styles.textArea, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Bio"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.bio}
        multiline
        numberOfLines={4}
        onChangeText={(text) => setProfile(prev => ({ ...prev, bio: text }))}
      />

      <TouchableOpacity
        style={[styles.expertiseButton, { borderColor: theme.colors.border }]}
        onPress={() => setShowExpertiseModal(true)}
      >
        <Text style={[styles.expertiseButtonText, { color: theme.colors.text }]}>
          Select Expertise Areas ({profile.expertise?.length || 0})
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  const renderLanguagesAvailability = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Languages & Availability</Text>
      
      <TouchableOpacity
        style={[styles.languageButton, { borderColor: theme.colors.border }]}
        onPress={() => setShowLanguageModal(true)}
      >
        <Text style={[styles.languageButtonText, { color: theme.colors.text }]}>
          Select Languages ({profile.languages?.length || 0})
        </Text>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.availabilityContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Availability</Text>
        {AVAILABILITY_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.availabilityOption,
              { borderColor: theme.colors.border },
              profile.availability === option.value && { borderColor: theme.colors.primary }
            ]}
            onPress={() => setProfile(prev => ({ ...prev, availability: option.value as any }))}
          >
            <Text style={[styles.availabilityText, { color: theme.colors.text }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAdditionalInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Additional Information</Text>
      
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Website"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.website}
        keyboardType="url"
        onChangeText={(text) => setProfile(prev => ({ ...prev, website: text }))}
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="LinkedIn Profile"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.linkedin}
        onChangeText={(text) => setProfile(prev => ({ ...prev, linkedin: text }))}
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.background, 
          borderColor: theme.colors.border, 
          color: theme.colors.text 
        }]}
        placeholder="Twitter Handle"
        placeholderTextColor={theme.colors.textSecondary}
        value={profile.twitter}
        onChangeText={(text) => setProfile(prev => ({ ...prev, twitter: text }))}
      />
    </View>
  );

  const renderPrivacySettings = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Privacy Settings</Text>
      
      <View style={styles.privacyOption}>
        <Text style={[styles.privacyLabel, { color: theme.colors.text }]}>Show my location</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: profile.showLocation ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={() => setProfile(prev => ({ ...prev, showLocation: !prev.showLocation }))}
        >
          <View style={[
            styles.toggleThumb,
            { backgroundColor: 'white', transform: [{ translateX: profile.showLocation ? 20 : 0 }] }
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.privacyOption}>
        <Text style={[styles.privacyLabel, { color: theme.colors.text }]}>Show contact information</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: profile.showContactInfo ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={() => setProfile(prev => ({ ...prev, showContactInfo: !prev.showContactInfo }))}
        >
          <View style={[
            styles.toggleThumb,
            { backgroundColor: 'white', transform: [{ translateX: profile.showContactInfo ? 20 : 0 }] }
          ]} />
        </TouchableOpacity>
      </View>

      <View style={styles.privacyOption}>
        <Text style={[styles.privacyLabel, { color: theme.colors.text }]}>Allow messaging</Text>
        <TouchableOpacity
          style={[
            styles.toggle,
            { backgroundColor: profile.allowMessaging ? theme.colors.primary : theme.colors.border }
          ]}
          onPress={() => setProfile(prev => ({ ...prev, allowMessaging: !prev.allowMessaging }))}
        >
          <View style={[
            styles.toggleThumb,
            { backgroundColor: 'white', transform: [{ translateX: profile.allowMessaging ? 20 : 0 }] }
          ]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasicInfo();
      case 1: return renderContactLocation();
      case 2: return renderProfessionalDetails();
      case 3: return renderLanguagesAvailability();
      case 4: return renderAdditionalInfo();
      case 5: return renderPrivacySettings();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {steps[currentStep]}
        </Text>
        <Text style={[styles.progress, { color: theme.colors.textSecondary }]}>
          {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
        <View style={styles.progressBar}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                { backgroundColor: index <= currentStep ? theme.colors.primary : theme.colors.border }
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={handlePrevious}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep < steps.length - 1 ? (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleComplete}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Saving...' : 'Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>Skip for now</Text>
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={[styles.modalButton, { color: theme.colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Languages</Text>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={[styles.modalButton, { color: theme.colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <LanguageSelector
            onLanguageSelect={(languageCode) => {
              setProfile(prev => ({
                ...prev,
                languages: prev.languages?.includes(languageCode)
                  ? prev.languages.filter(l => l !== languageCode)
                  : [...(prev.languages || []), languageCode],
                preferredLanguage: languageCode
              }));
            }}
          />
        </View>
      </Modal>

      {/* Expertise Selection Modal */}
      <Modal
        visible={showExpertiseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setShowExpertiseModal(false)}>
              <Text style={[styles.modalButton, { color: theme.colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Expertise</Text>
            <TouchableOpacity onPress={() => setShowExpertiseModal(false)}>
              <Text style={[styles.modalButton, { color: theme.colors.primary }]}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={EXPERTISE_OPTIONS}
            numColumns={2}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.expertiseItem,
                  { borderColor: theme.colors.border },
                  profile.expertise?.includes(item) && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '20' }
                ]}
                onPress={() => {
                  setProfile(prev => ({
                    ...prev,
                    expertise: prev.expertise?.includes(item)
                      ? prev.expertise.filter(e => e !== item)
                      : [...(prev.expertise || []), item]
                  }));
                }}
              >
                <Text style={[styles.expertiseText, { color: theme.colors.text }]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.expertiseList}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progress: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -6,
  },
  genderContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  genderText: {
    fontSize: 14,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  expertiseButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expertiseButtonText: {
    fontSize: 16,
  },
  languageButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  languageButtonText: {
    fontSize: 16,
  },
  availabilityContainer: {
    marginBottom: 20,
  },
  availabilityOption: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 16,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  privacyLabel: {
    fontSize: 16,
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    padding: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
    // borderColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  expertiseList: {
    padding: 16,
  },
  expertiseItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 4,
    alignItems: 'center',
  },
  expertiseText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
