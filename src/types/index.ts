export type Theme = 'light' | 'dark';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecoveryPath = 'DONATE' | 'PROCESS' | 'DISCOUNT_RETAIL' | 'ANIMAL_FEED' | 'COMPOST';

export type FoodCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Bakery'
  | 'Dairy'
  | 'Grains'
  | 'Prepared Food'
  | 'Other';

export type ListingStatus =
  | 'AVAILABLE'
  | 'CLAIMED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'RECOVERED'
  | 'PROCESSED'
  | 'UNAVAILABLE';

export type StorageCondition =
  | 'Ambient Room Temp'
  | 'Refrigerated (2-4°C)'
  | 'Cold Cellar (10-12°C)'
  | 'Unchilled Crate'
  | 'Freezer (-18°C)';

export interface ScenarioStep {
  timeLabel: string;
  hours: number;
  freshness: number;
  risk: RiskLevel;
  recommendation: string;
  viableForHuman: boolean;
}

export interface AIAnalysisResult {
  food: string;
  observations: string;
  freshness: number;
  risk: RiskLevel;
  urgency: UrgencyLevel;
  confidence: number;
  recommendedAction: string;
  recoveryPath: RecoveryPath;
  reasoning: string;
  safetyNote: string;
  scenarios: ScenarioStep[];
}

export interface JourneyStep {
  id: string;
  status: 'LISTED' | 'ANALYZED' | 'MATCHED' | 'CLAIMED' | 'IN_TRANSIT' | 'RECEIVED' | 'RECOVERED';
  timestamp: string;
  actor: string;
  quantity: string;
  notes: string;
}

export interface FoodListing {
  id: string;
  foodName: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  sourceType: 'farmer' | 'retailer';
  sourceName: string;
  location: string;
  dateAdded: string;
  expiryDate: string;
  estimatedFreshness: number;
  risk: RiskLevel;
  urgency: UrgencyLevel;
  storageCondition: StorageCondition;
  status: ListingStatus;
  recommendedAction: string;
  recoveryPath: RecoveryPath;
  imageUrl?: string;
  sensoryNotes?: string;
  journey: JourneyStep[];
  aiAnalysis?: AIAnalysisResult;
  claimedBy?: string;
  claimedAt?: string;
}

export interface NGONeed {
  id: string;
  ngoName: string;
  contactPerson: string;
  foodNeeded: string;
  category: FoodCategory;
  quantity: number;
  unit: string;
  requiredBy: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  status: 'ACTIVE' | 'FULFILLED' | 'CANCELLED';
  createdAt: string;
}

export interface SmartMatchResult {
  id: string;
  listingId: string;
  listing: FoodListing;
  needId: string;
  need: NGONeed;
  matchScore: number; // e.g. 96
  reasons: string[];
  urgencyScore: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'risk' | 'claim' | 'match' | 'recovery' | 'expiry' | 'system';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  organization: string;
  role: 'retailer' | 'farmer' | 'ngo' | 'admin';
  phone: string;
  notificationsEnabled: boolean;
  voiceEnabled: boolean;
  autoAnalyze: boolean;
}
