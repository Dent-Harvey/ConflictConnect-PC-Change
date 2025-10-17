export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ConflictStatus = 'active' | 'resolved' | 'escalating' | 'monitoring' | 'ongoing';

export type SourceType = 'news' | 'twitter' | 'telegram' | 'official' | 'witness' | 'social_media' | 'livestream';

export interface ConflictSource {
  type: SourceType;
  url: string;
  credibility: number; // 0-10 scale
  title?: string;
  publishedAt?: string;
}

export interface RelatedCharity {
  name: string;
  description: string;
  trustworthinessRating: number; // 0-10 rating
  websiteUrl?: string;
  donationUrl?: string;
  focusAreas?: string[];
  verifiedStatus?: boolean;
  registrationNumber?: string;
}

export type CitationType = 'news' | 'social_media' | 'official_report' | 'witness_testimony' | 'academic_source' | 'ngo_report' | 'other';

export interface Citation {
  type: CitationType;
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  accessedDate?: string;
  credibilityRating: number; // 0-10 rating
  description?: string;
  isVerified?: boolean;
}

export type MediaType = 'image' | 'video' | 'audio' | 'document';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'disputed';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
}

export interface GeolocatedMedia {
  type: MediaType;
  url: string;
  filename?: string;
  description: string;
  capturedAt: string;
  geoLocation?: GeoLocation;
  verificationStatus?: VerificationStatus;
  metadata?: any;
}

export type NeedCategory = 'medical' | 'food' | 'shelter' | 'water' | 'clothing' | 'transportation' | 'communication' | 'security' | 'education' | 'psychological_support' | 'other';
export type NeedUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface AssociatedNeed {
  category: NeedCategory;
  description: string;
  urgency: NeedUrgency;
  quantity?: string;
  estimatedAffected?: number;
  specificRequirements?: string;
}

export interface SubmittedBy {
  name?: string;
  email?: string;
  organization?: string;
  role?: string;
  isWitness?: boolean;
}

export type SubmissionStatus = 'submitted' | 'under_review' | 'verified' | 'published' | 'rejected';
export type ModerationAction = 'approve' | 'reject' | 'request_changes' | 'verify';

export interface ModerationNote {
  note: string;
  moderator?: string;
  timestamp: string;
  action?: ModerationAction;
}

export interface ConflictZone {
  id?: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  severity?: ConflictSeverity;
  status: ConflictStatus;
  dateReported: string;
  sources?: ConflictSource[];
  casualties?: number;
  involvedParties?: string[];
  location?: string;
  country?: string;
  region?: string;
  tags?: string[];
  conflictType?: 'military' | 'protest' | 'civil-unrest' | 'humanitarian' | 'environmental' | 'labor-dispute' | 'ethnic-conflict' | 'political' | 'war' | 'famine' | 'other';
  verified?: boolean;
  realTimeUpdates?: boolean; // Indicates if this conflict has real-time monitoring
  protestType?: 'peaceful' | 'violent' | 'mixed' | 'civil-disobedience'; // For protest-specific conflicts
  confidence?: number; // 0-100 confidence level
  lastUpdated?: string;
  relatedCharities?: RelatedCharity[];
  // New fields for user submissions
  submittedBy?: SubmittedBy;
  citations?: Citation[];
  geolocatedMedia?: GeolocatedMedia[];
  associatedNeeds?: AssociatedNeed[];
  submissionStatus?: SubmissionStatus;
  moderationNotes?: ModerationNote[];
  created_at?: string;
  updated_at?: string;
  project_id?: string;
  entity?: string;
}

export interface ConflictMapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// For API responses
export interface ConflictZoneResponse {
  success: boolean;
  records?: ConflictZone[];
  total?: number;
  page?: number;
  per_page?: number;
}

export interface ConflictFilters {
  severity?: ConflictSeverity[];
  status?: ConflictStatus[];
  country?: string[];
  verified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  conflictType?: ('military' | 'protest' | 'civil-unrest' | 'humanitarian' | 'environmental' | 'labor-dispute' | 'ethnic-conflict' | 'political' | 'war' | 'famine' | 'other')[];
  realTimeOnly?: boolean;
  includePastOngoing?: boolean; // Include ongoing conflicts older than 3 months
}