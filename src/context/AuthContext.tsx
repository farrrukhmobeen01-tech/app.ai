import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  signInAnonymously
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { getUserProfile, saveUserProfile } from '../lib/firestoreService';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  registerUser: (data: {
    email: string;
    pass: string;
    fullName: string;
    university: string;
    degree: string;
    semester: string;
  }) => Promise<void>;
  loginUser: (email: string, pass: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  demoSignIn: () => Promise<void>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo user memory state if offline or quick demo chosen
  const [isDemo, setIsDemo] = useState(false);

  const loadProfile = async (uid: string, emailStr?: string) => {
    let profile = await getUserProfile(uid);
    if (!profile) {
      // Create initial profile if missing
      profile = {
        uid,
        fullName: emailStr ? emailStr.split('@')[0] : 'University Student',
        email: emailStr || 'student@university.edu',
        university: 'Bahria University',
        degree: 'B.S. Computer Science',
        semester: '',
        createdAt: new Date().toISOString()
      };
      await saveUserProfile(profile);
    } else if (!profile.university || profile.university.toLowerCase().includes('stanford')) {
      profile.university = 'Bahria University';
      try {
        await saveUserProfile(profile);
      } catch (err) {
        console.warn('Could not auto-update profile university in Firestore:', err);
      }
    }
    setUserProfile(profile);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !isDemo) {
        setCurrentUser(user);
        await loadProfile(user.uid, user.email || undefined);
      } else if (!isDemo) {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const registerUser = async (data: {
    email: string;
    pass: string;
    fullName: string;
    university: string;
    degree: string;
    semester: string;
  }) => {
    setLoading(true);
    setIsDemo(false);
    const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
    const profile: UserProfile = {
      uid: cred.user.uid,
      fullName: data.fullName,
      email: data.email,
      university: data.university,
      degree: data.degree,
      semester: data.semester,
      createdAt: new Date().toISOString()
    };
    await saveUserProfile(profile);
    setCurrentUser(cred.user);
    setUserProfile(profile);
    setLoading(false);
  };

  const loginUser = async (email: string, pass: string) => {
    setLoading(true);
    setIsDemo(false);
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    setCurrentUser(cred.user);
    await loadProfile(cred.user.uid, cred.user.email || undefined);
    setLoading(false);
  };

  const googleSignIn = async () => {
    setLoading(true);
    setIsDemo(false);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setCurrentUser(cred.user);
      await loadProfile(cred.user.uid, cred.user.email || undefined);
    } finally {
      setLoading(false);
    }
  };

  const demoSignIn = async () => {
    setLoading(true);
    let uid = 'demo-student-12345';
    let userObj: User | null = null;
    try {
      const cred = await signInAnonymously(auth);
      if (cred.user) {
        uid = cred.user.uid;
        userObj = cred.user;
      }
    } catch (e) {
      console.warn('Anonymous sign-in not enabled or offline, using demo fallback UID:', e);
    }

    setIsDemo(true);
    const mockUser = userObj || ({
      uid,
      email: 'alex.student@campusflow.edu',
      displayName: 'Alex Rivers',
    } as User);

    const mockProfile: UserProfile = {
      uid,
      fullName: 'Alex Rivers',
      email: 'alex.student@campusflow.edu',
      university: 'Bahria University',
      degree: 'B.S. Software Engineering',
      semester: 'Semester 5',
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockUser);
    setUserProfile(mockProfile);
    try {
      await saveUserProfile(mockProfile);
    } catch (err) {
      console.warn('Could not save demo profile to Firestore:', err);
    }
    setLoading(false);
  };

  const logoutUser = async () => {
    setIsDemo(false);
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await loadProfile(currentUser.uid, currentUser.email || undefined);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        registerUser,
        loginUser,
        googleSignIn,
        demoSignIn,
        logoutUser,
        resetPassword,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
