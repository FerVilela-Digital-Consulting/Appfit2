import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabaseClient';

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    weight: number | null;
    height: number | null;
    goal_type: string | null;
    is_premium: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    onboardingCompleted: boolean | null;
    profile: Profile | null;
    isGuest: boolean;
    continueAsGuest: () => void;
    exitGuest: () => void;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<{ requiresEmailConfirmation: boolean }>;
    signOut: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateAvatar: (file: File) => Promise<string>;
    updateProfile: (data: Partial<Omit<Profile, 'id' | 'created_at'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const GUEST_STORAGE_KEY = 'appfit_is_guest';

const createGuestProfile = (): Profile => ({
    id: 'guest',
    full_name: 'Guest',
    avatar_url: null,
    weight: null,
    height: null,
    goal_type: null,
    is_premium: false,
    created_at: new Date().toISOString()
});

const deriveOnboardingCompleted = (resolvedProfile: Profile | null) => {
    if (!resolvedProfile) return false;

    return Boolean(
        resolvedProfile.full_name ||
        resolvedProfile.weight !== null ||
        resolvedProfile.height !== null ||
        resolvedProfile.goal_type
    );
};

const ensureProfile = async (userId: string): Promise<Profile> => {
    const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (fetchError) {
        throw fetchError;
    }

    if (existingProfile) {
        return existingProfile as Profile;
    }

    const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select('*')
        .single();

    if (insertError) {
        throw insertError;
    }

    return insertedProfile as Profile;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
    const [authedProfile, setAuthedProfile] = useState<Profile | null>(null);
    const [guestProfile, setGuestProfile] = useState<Profile>(() => createGuestProfile());
    const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_STORAGE_KEY) === 'true');
    const profile = isGuest ? guestProfile : authedProfile;

    const logFlow = (message: string) => {
        if (import.meta.env.DEV) {
            console.log(`[AuthFlow] ${message}`);
        }
    };

    const syncAuthenticatedUser = async (authUser: User) => {
        logFlow("Syncing authenticated user: " + authUser.id);
        setUser(authUser);
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);

        try {
            const resolvedProfile = await ensureProfile(authUser.id);
            setAuthedProfile(resolvedProfile);
            setOnboardingCompleted(deriveOnboardingCompleted(resolvedProfile));
        } catch (error) {
            console.error('Error ensuring profile:', error);
            setAuthedProfile(null);
            setOnboardingCompleted(false);
        }
    };

    const refreshProfile = async () => {
        if (!user || isGuest) return;
        const resolvedProfile = await ensureProfile(user.id);
        setAuthedProfile(resolvedProfile);
    };

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            logFlow("Initializing Auth...");
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMounted) return;

                if (session?.user) {
                    logFlow("Initial session detected: " + session.user.id);
                    await syncAuthenticatedUser(session.user);
                } else {
                    logFlow("No initial session detected.");
                    setUser(null);
                    setAuthedProfile(null);
                    setGuestProfile(createGuestProfile());
                    setOnboardingCompleted(isGuest ? true : false);
                }
            } catch (error) {
                console.error('Error during initial session check:', error);
                if (isMounted) {
                    setUser(null);
                    setAuthedProfile(null);
                    setGuestProfile(createGuestProfile());
                    setOnboardingCompleted(isGuest ? true : false);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    logFlow("Initial Auth check complete.");
                }
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            logFlow(`Auth state change: ${event}`);
            if (!isMounted) return;

            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                setLoading(true);

                if (session?.user) {
                    await syncAuthenticatedUser(session.user);
                } else if (localStorage.getItem(GUEST_STORAGE_KEY) !== 'true') {
                    setUser(null);
                    setAuthedProfile(null);
                    setOnboardingCompleted(false);
                }

                setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setAuthedProfile(null);
                setGuestProfile(createGuestProfile());
                setOnboardingCompleted(false);
                setIsGuest(false);
                localStorage.removeItem(GUEST_STORAGE_KEY);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        logFlow("Signing in with password...");
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
    };

    const signUp = async (email: string, password: string) => {
        logFlow("Signing up...");
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);

        const requiresEmailConfirmation = !data.session;
        return { requiresEmailConfirmation };
    };

    const signOut = async () => {
        logFlow("Signing out...");
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setUser(null);
        setAuthedProfile(null);
        setGuestProfile(createGuestProfile());
        setOnboardingCompleted(false);

        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const continueAsGuest = () => {
        logFlow("Switching to Guest Mode");
        setIsGuest(true);
        localStorage.setItem(GUEST_STORAGE_KEY, 'true');
        setUser(null);
        setAuthedProfile(null);
        setOnboardingCompleted(true);
        setGuestProfile(createGuestProfile());
    };

    const exitGuest = () => {
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
        setGuestProfile(createGuestProfile());
        setOnboardingCompleted(false);
    };

    const completeOnboarding = async () => {
        if (!user || isGuest) return;
        logFlow("Completing onboarding...");
        // Assuming for now it's just state-based until table is updated.
        setOnboardingCompleted(true);
    };

    const updateAvatar = async (file: File) => {
        if (!file) {
            throw new Error('No file selected.');
        }

        if (!file.type.startsWith('image/')) {
            throw new Error('Please select an image file.');
        }

        if (isGuest || !user) {
            throw new Error("Guest mode: avatar upload is disabled.");
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) {
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);

        return publicUrlData.publicUrl;
    };

    const updateProfile = async (data: Partial<Omit<Profile, 'id' | 'created_at'>>) => {
        logFlow("Updating profile...");

        if (isGuest) {
            logFlow("Guest mode: performing local update.");
            setGuestProfile(prev => ({ ...prev, ...data }));
            return;
        }

        if (!user) return;

        // Optimistic update
        const oldProfile = authedProfile;
        setAuthedProfile(prev => prev ? { ...prev, ...data } : prev);

        const { error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', user.id);

        if (error) {
            setAuthedProfile(oldProfile);
            console.error('Error updating profile:', error);
            throw error;
        }

        logFlow("Profile updated successfully.");
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            onboardingCompleted,
            profile,
            isGuest,
            continueAsGuest,
            exitGuest,
            signIn,
            signUp,
            signOut,
            completeOnboarding,
            refreshProfile,
            updateAvatar,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
