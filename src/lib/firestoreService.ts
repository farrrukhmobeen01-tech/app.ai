import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
  UserProfile,
  Course,
  Assignment,
  Assessment,
  StudySession,
  GroupProject,
  ProjectTask,
  AvailabilityPreferences,
  ScheduleSession,
  AcademicRisk,
  CareerRoadmap,
  PortfolioProfile,
  NotificationPreference,
  InAppNotification
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Utility to recursively strip undefined values before passing payloads to Firestore SDK
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        result[key] = cleanFirestoreData(value);
      } else if (Array.isArray(value)) {
        result[key] = value
          .map((item) => (item !== null && typeof item === 'object' && !(item instanceof Date) ? cleanFirestoreData(item) : item))
          .filter((item) => item !== undefined);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const docRef = doc(db, 'users', profile.uid);
  await setDoc(docRef, cleanFirestoreData(profile), { merge: true });
}

// Courses
export function subscribeCourses(userId: string, callback: (courses: Course[]) => void) {
  const colRef = collection(db, 'users', userId, 'courses');
  return onSnapshot(colRef, (snapshot) => {
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
    callback(courses);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/courses`);
    callback([]);
  });
}

export async function addCourse(userId: string, course: Omit<Course, 'id'>): Promise<string> {
  if (!userId) throw new Error('User ID is required to add course');
  try {
    const colRef = collection(db, 'users', userId, 'courses');
    const docRef = await addDoc(colRef, cleanFirestoreData({
      ...course,
      createdAt: new Date().toISOString()
    }));
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/courses`);
    throw error;
  }
}

export async function updateCourse(userId: string, courseId: string, updates: Partial<Course>): Promise<void> {
  if (!userId) throw new Error('User ID is required to update course');
  try {
    const docRef = doc(db, 'users', userId, 'courses', courseId);
    await updateDoc(docRef, cleanFirestoreData(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/courses/${courseId}`);
    throw error;
  }
}

export async function deleteCourse(userId: string, courseId: string): Promise<void> {
  if (!userId) throw new Error('User ID is required to delete course');
  try {
    const docRef = doc(db, 'users', userId, 'courses', courseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/courses/${courseId}`);
    throw error;
  }
}

// Assignments
export function subscribeAssignments(userId: string, callback: (assignments: Assignment[]) => void) {
  const colRef = collection(db, 'users', userId, 'assignments');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assignment[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/assignments`);
    callback([]);
  });
}

export async function addAssignment(userId: string, assignment: Omit<Assignment, 'id'>): Promise<string> {
  if (!userId) throw new Error('User ID is required to add assignment');
  try {
    const colRef = collection(db, 'users', userId, 'assignments');
    const docRef = await addDoc(colRef, cleanFirestoreData({
      ...assignment,
      status: assignment.status || 'Not Started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}/assignments`);
    throw error;
  }
}

export async function updateAssignment(userId: string, assignmentId: string, updates: Partial<Assignment>): Promise<void> {
  if (!userId) throw new Error('User ID is required to update assignment');
  try {
    const docRef = doc(db, 'users', userId, 'assignments', assignmentId);
    await updateDoc(docRef, cleanFirestoreData({
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/assignments/${assignmentId}`);
    throw error;
  }
}

export async function deleteAssignment(userId: string, assignmentId: string): Promise<void> {
  if (!userId) throw new Error('User ID is required to delete assignment');
  try {
    const docRef = doc(db, 'users', userId, 'assignments', assignmentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/assignments/${assignmentId}`);
    throw error;
  }
}

// Assessments
export function subscribeAssessments(userId: string, callback: (assessments: Assessment[]) => void) {
  const colRef = collection(db, 'users', userId, 'assessments');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Assessment[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/assessments`);
    callback([]);
  });
}

export async function addAssessment(userId: string, assessment: Omit<Assessment, 'id'>): Promise<string> {
  const colRef = collection(db, 'users', userId, 'assessments');
  const docRef = await addDoc(colRef, {
    ...assessment,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function deleteAssessment(userId: string, assessmentId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'assessments', assessmentId);
  await deleteDoc(docRef);
}

// Study Sessions
export function subscribeStudySessions(userId: string, callback: (sessions: StudySession[]) => void) {
  const colRef = collection(db, 'users', userId, 'studySessions');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StudySession[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/studySessions`);
    callback([]);
  });
}

export async function saveStudySessions(userId: string, sessions: Omit<StudySession, 'id'>[]): Promise<void> {
  const colRef = collection(db, 'users', userId, 'studySessions');
  for (const session of sessions) {
    await addDoc(colRef, session);
  }
}

export async function toggleStudySession(userId: string, sessionId: string, completed: boolean): Promise<void> {
  const docRef = doc(db, 'users', userId, 'studySessions', sessionId);
  await updateDoc(docRef, { completed });
}

// Group Projects
export function subscribeProjects(userId: string, userEmail: string, callback: (projects: GroupProject[]) => void) {
  const colRef = collection(db, 'projects');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GroupProject[];
    const userProjects = items.filter(
      p => p.ownerId === userId || (p.memberIds && p.memberIds.includes(userId)) || (p.memberEmails && p.memberEmails.includes(userEmail))
    );
    callback(userProjects);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'projects');
    callback([]);
  });
}

export async function addProject(project: Omit<GroupProject, 'id'>): Promise<string> {
  const colRef = collection(db, 'projects');
  const docRef = await addDoc(colRef, {
    ...project,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function deleteProject(projectId: string): Promise<void> {
  const docRef = doc(db, 'projects', projectId);
  await deleteDoc(docRef);
}

// Project Tasks
export function subscribeProjectTasks(projectId: string, callback: (tasks: ProjectTask[]) => void) {
  const colRef = collection(db, 'projects', projectId, 'tasks');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectTask[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/tasks`);
    callback([]);
  });
}

export async function addProjectTask(projectId: string, task: Omit<ProjectTask, 'id'>): Promise<string> {
  const colRef = collection(db, 'projects', projectId, 'tasks');
  const docRef = await addDoc(colRef, {
    ...task,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateProjectTask(projectId: string, taskId: string, updates: Partial<ProjectTask>): Promise<void> {
  const docRef = doc(db, 'projects', projectId, 'tasks', taskId);
  await updateDoc(docRef, updates);
}

export async function deleteProjectTask(projectId: string, taskId: string): Promise<void> {
  const docRef = doc(db, 'projects', projectId, 'tasks', taskId);
  await deleteDoc(docRef);
}

// ==========================================
// Phase 2: AI Auto-Scheduler & Availability
// ==========================================

export async function getAvailability(userId: string): Promise<AvailabilityPreferences | null> {
  try {
    const docRef = doc(db, 'users', userId, 'availability', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AvailabilityPreferences;
    }
  } catch (e) {
    console.warn('Get availability warning:', e);
  }
  return null;
}

export async function saveAvailability(userId: string, prefs: AvailabilityPreferences): Promise<void> {
  const docRef = doc(db, 'users', userId, 'availability', 'default');
  await setDoc(docRef, prefs, { merge: true });
}

export function subscribeScheduleSessions(userId: string, callback: (sessions: ScheduleSession[]) => void) {
  const colRef = collection(db, 'users', userId, 'scheduleSessions');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScheduleSession[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/scheduleSessions`);
    callback([]);
  });
}

export async function addScheduleSession(userId: string, session: Omit<ScheduleSession, 'id'>): Promise<string> {
  const colRef = collection(db, 'users', userId, 'scheduleSessions');
  const docRef = await addDoc(colRef, { ...session, createdAt: new Date().toISOString() });
  return docRef.id;
}

export async function updateScheduleSession(userId: string, sessionId: string, updates: Partial<ScheduleSession>): Promise<void> {
  const docRef = doc(db, 'users', userId, 'scheduleSessions', sessionId);
  await updateDoc(docRef, updates);
}

export async function deleteScheduleSession(userId: string, sessionId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'scheduleSessions', sessionId);
  await deleteDoc(docRef);
}

export async function bulkSaveScheduleSessions(userId: string, sessions: Omit<ScheduleSession, 'id'>[]): Promise<void> {
  const colRef = collection(db, 'users', userId, 'scheduleSessions');
  for (const s of sessions) {
    await addDoc(colRef, { ...s, createdAt: new Date().toISOString() });
  }
}

// ==========================================
// Phase 2: Academic Risk Radar
// ==========================================

export function subscribeAcademicRisks(userId: string, callback: (risks: AcademicRisk[]) => void) {
  const colRef = collection(db, 'users', userId, 'academicRisks');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AcademicRisk[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/academicRisks`);
    callback([]);
  });
}

export async function saveAcademicRisk(userId: string, risk: AcademicRisk): Promise<void> {
  const docRef = doc(db, 'users', userId, 'academicRisks', risk.id);
  await setDoc(docRef, risk, { merge: true });
}

export async function bulkSaveAcademicRisks(userId: string, risks: AcademicRisk[]): Promise<void> {
  for (const r of risks) {
    const docRef = doc(db, 'users', userId, 'academicRisks', r.id);
    await setDoc(docRef, r, { merge: true });
  }
}

export async function updateAcademicRiskStatus(userId: string, riskId: string, status: 'Current' | 'Resolved'): Promise<void> {
  const docRef = doc(db, 'users', userId, 'academicRisks', riskId);
  await updateDoc(docRef, { status });
}

// ==========================================
// Phase 2: Career Roadmap
// ==========================================

export function subscribeCareerRoadmaps(userId: string, callback: (roadmaps: CareerRoadmap[]) => void) {
  const colRef = collection(db, 'users', userId, 'careerRoadmaps');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CareerRoadmap[];
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/careerRoadmaps`);
    callback([]);
  });
}

export async function saveCareerRoadmap(userId: string, roadmap: CareerRoadmap): Promise<void> {
  const docRef = doc(db, 'users', userId, 'careerRoadmaps', roadmap.id);
  await setDoc(docRef, { ...roadmap, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function deleteCareerRoadmap(userId: string, roadmapId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'careerRoadmaps', roadmapId);
  await deleteDoc(docRef);
}

// ==========================================
// Phase 2: Resume-to-Portfolio Builder
// ==========================================

export function subscribePortfolioProfile(userId: string, callback: (portfolio: PortfolioProfile | null) => void) {
  const docRef = doc(db, 'users', userId, 'portfolioProfiles', 'default');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as PortfolioProfile);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `users/${userId}/portfolioProfiles/default`);
    callback(null);
  });
}

export async function savePortfolioProfile(userId: string, portfolio: PortfolioProfile): Promise<void> {
  const userDocRef = doc(db, 'users', userId, 'portfolioProfiles', 'default');
  await setDoc(userDocRef, { ...portfolio, updatedAt: new Date().toISOString() }, { merge: true });

  if (portfolio.isPublished && portfolio.publicSlug) {
    const publicDocRef = doc(db, 'publicPortfolios', portfolio.publicSlug);
    await setDoc(publicDocRef, { ...portfolio, updatedAt: new Date().toISOString() }, { merge: true });
  } else if (!portfolio.isPublished && portfolio.publicSlug) {
    try {
      const publicDocRef = doc(db, 'publicPortfolios', portfolio.publicSlug);
      await deleteDoc(publicDocRef);
    } catch (e) {
      // ignore
    }
  }
}

export async function getPublicPortfolio(slug: string): Promise<PortfolioProfile | null> {
  try {
    const publicDocRef = doc(db, 'publicPortfolios', slug);
    const snap = await getDoc(publicDocRef);
    if (snap.exists()) {
      return snap.data() as PortfolioProfile;
    }
  } catch (e) {
    console.warn('Error fetching public portfolio:', e);
  }
  return null;
}

// ==========================================
// Phase 2: Notifications & Reminders
// ==========================================

export async function getNotificationPreferences(userId: string): Promise<NotificationPreference | null> {
  try {
    const docRef = doc(db, 'users', userId, 'notificationPreferences', 'default');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as NotificationPreference;
    }
  } catch (e) {
    console.warn('Get notification preferences error:', e);
  }
  return null;
}

export async function saveNotificationPreferences(userId: string, prefs: NotificationPreference): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notificationPreferences', 'default');
  await setDoc(docRef, prefs, { merge: true });
}

export function subscribeNotifications(userId: string, callback: (notifications: InAppNotification[]) => void) {
  const colRef = collection(db, 'users', userId, 'notifications');
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InAppNotification[];
    // Sort descending by date
    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/notifications`);
    callback([]);
  });
}

export async function addInAppNotification(userId: string, notif: Omit<InAppNotification, 'id'>): Promise<string> {
  const colRef = collection(db, 'users', userId, 'notifications');
  const docRef = await addDoc(colRef, { ...notif, read: false, date: notif.date || new Date().toISOString() });
  return docRef.id;
}

export async function markNotificationRead(userId: string, notifId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notifications', notifId);
  await updateDoc(docRef, { read: true });
}

export async function markAllNotificationsRead(userId: string, notifs: InAppNotification[]): Promise<void> {
  for (const n of notifs) {
    if (!n.read) {
      const docRef = doc(db, 'users', userId, 'notifications', n.id);
      await updateDoc(docRef, { read: true });
    }
  }
}

export async function deleteInAppNotification(userId: string, notifId: string): Promise<void> {
  const docRef = doc(db, 'users', userId, 'notifications', notifId);
  await deleteDoc(docRef);
}

