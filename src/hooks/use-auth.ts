import { useEffect, useState } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const ensureCurrentUserProfile = useMutation(api.users.ensureCurrentUserProfile);
  const { signIn, signOut } = useAuthActions();
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthenticated) {
      setIsSyncingProfile(false);
      return;
    }

    if (
      !isAuthLoading &&
      user &&
      !user.isAnonymous &&
      (!user.role || !user.slug || !user.name)
    ) {
      setIsSyncingProfile(true);
      ensureCurrentUserProfile()
        .catch((error) => {
          console.error("Failed to ensure current user profile:", error);
        })
        .finally(() => {
          if (!cancelled) {
            setIsSyncingProfile(false);
          }
        });
      return () => {
        cancelled = true;
      };
    }

    setIsSyncingProfile(false);
  }, [ensureCurrentUserProfile, isAuthLoading, isAuthenticated, user]);

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined || isSyncingProfile;

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
