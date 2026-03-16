import type { AccountRole, Profile } from "@/context/auth/types";

const ONBOARDING_CACHE_KEY_PREFIX = "appfit_onboarding_completed_";
const PROFILE_CACHE_KEY_PREFIX = "appfit_profile_cache_";
const ACCOUNT_ROLE_CACHE_KEY_PREFIX = "appfit_account_role_";

const getOnboardingCacheKey = (userId: string) => `${ONBOARDING_CACHE_KEY_PREFIX}${userId}`;
const getProfileCacheKey = (userId: string) => `${PROFILE_CACHE_KEY_PREFIX}${userId}`;
const getAccountRoleCacheKey = (userId: string) => `${ACCOUNT_ROLE_CACHE_KEY_PREFIX}${userId}`;

export const getCachedOnboarding = (userId: string): boolean | null => {
  const raw = localStorage.getItem(getOnboardingCacheKey(userId));
  if (raw === null) return null;
  return raw === "true";
};

export const setCachedOnboarding = (userId: string, value: boolean) => {
  localStorage.setItem(getOnboardingCacheKey(userId), value ? "true" : "false");
};

export const getCachedProfile = (userId: string): Profile | null => {
  const raw = localStorage.getItem(getProfileCacheKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
};

export const setCachedProfile = (userId: string, profile: Profile) => {
  localStorage.setItem(getProfileCacheKey(userId), JSON.stringify(profile));
};

export const getCachedAccountRole = (userId: string): AccountRole | null => {
  const raw = localStorage.getItem(getAccountRoleCacheKey(userId));

  if (raw === "member" || raw === "admin_manager" || raw === "super_admin") {
    return raw;
  }

  return null;
};

export const setCachedAccountRole = (userId: string, value: AccountRole) => {
  localStorage.setItem(getAccountRoleCacheKey(userId), value);
};
