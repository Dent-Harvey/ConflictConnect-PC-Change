import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { UserRole } from '@/types/auth';

export interface Permissions {
  canViewConflicts: boolean;
  canViewResources: boolean;
  canRequestResources: boolean;
  canAddResources: boolean;
  canSubmitConflicts: boolean;
  canViewNeeds: boolean;
  canAddNeeds: boolean;
  canConnectWithUsers: boolean;
  requiresLocationVerification: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useFirebaseAuth();

  if (!user) {
    // No permissions when not authenticated
    return {
      canViewConflicts: false,
      canViewResources: false,
      canRequestResources: false,
      canAddResources: false,
      canSubmitConflicts: false,
      canViewNeeds: false,
      canAddNeeds: false,
      canConnectWithUsers: false,
      requiresLocationVerification: false,
    };
  }

  switch (user.role) {
    case 'scanner':
      return {
        canViewConflicts: true,
        canViewResources: false, // Scanner cannot see resource availability or allocation
        canRequestResources: false,
        canAddResources: false,
        canSubmitConflicts: false,
        canViewNeeds: false, // Scanner cannot see resource needs/allocation
        canAddNeeds: false,
        canConnectWithUsers: false,
        requiresLocationVerification: false,
      };

    case 'otg':
      return {
        canViewConflicts: true,
        canViewResources: true,
        canRequestResources: true,
        canAddResources: false,
        canSubmitConflicts: true,
        canViewNeeds: true,
        canAddNeeds: true,
        canConnectWithUsers: true,
        requiresLocationVerification: true,
      };

    case 'hand':
      return {
        canViewConflicts: true,
        canViewResources: true,
        canRequestResources: false,
        canAddResources: true,
        canSubmitConflicts: true,
        canViewNeeds: true,
        canAddNeeds: false,
        canConnectWithUsers: true,
        requiresLocationVerification: true,
      };

    case 'conflict_controller':
      return {
        canViewConflicts: true,
        canViewResources: true,
        canRequestResources: true,
        canAddResources: true,
        canSubmitConflicts: true,
        canViewNeeds: true,
        canAddNeeds: true,
        canConnectWithUsers: true,
        requiresLocationVerification: false, // Full access without location verification
      };

    default:
      return {
        canViewConflicts: false,
        canViewResources: false,
        canRequestResources: false,
        canAddResources: false,
        canSubmitConflicts: false,
        canViewNeeds: false,
        canAddNeeds: false,
        canConnectWithUsers: false,
        requiresLocationVerification: false,
      };
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'scanner':
      return 'Scanner (Guest)';
    case 'otg':
      return 'On The Ground (OTG)';
    case 'hand':
      return 'Hand (Provider)';
    case 'conflict_controller':
      return 'Conflict Controller (Admin)';
    default:
      return 'Unknown Role';
  }
};

export const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case 'scanner':
      return 'View all conflict information and stay informed';
    case 'otg':
      return 'Request resources and share real-time updates from conflict zones';
    case 'hand':
      return 'Provide resources and connect with those in need';
    case 'conflict_controller':
      return 'Full administrative access to all systems and features';
    default:
      return 'No role assigned';
  }
};