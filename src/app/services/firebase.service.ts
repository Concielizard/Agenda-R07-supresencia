import { Injectable, signal, computed } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  deleteDoc,
  where,
  limit,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';
import { UserProfile, R07Week, CommunityPrayer, ConnectionGroup, GroupAnnouncement, GroupPrayer } from '../models/r07.models';

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

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  public db: Firestore;
  public auth: Auth;

  // Signals for state
  public currentUser = signal<User | null>(null);
  public isAuthInitialized = signal<boolean>(false);
  public isOnline = signal<boolean>(true);
  public connectionStatus = signal<'connected' | 'offline' | 'checking'>('checking');
  public syncState = signal<'synced' | 'syncing' | 'offline' | 'error'>('synced');

  public isSignedIn = computed(() => !!this.currentUser());
  public userDisplayName = computed(() => this.currentUser()?.displayName || 'Hermano/a en la Fe');
  public userEmail = computed(() => this.currentUser()?.email || null);
  public userPhotoUrl = computed(() => this.currentUser()?.photoURL || null);
  public userUid = computed(() => this.currentUser()?.uid || null);
  public userRole = signal<'member' | 'leader' | 'pastor'>('member');
  public isLeader = computed(() => this.userRole() === 'leader' || this.userRole() === 'pastor');
  public activeGroup = signal<ConnectionGroup | null>(null);
  public ultimoError = signal<string | null>(null);

  constructor() {
    this.app = initializeApp(firebaseConfig);
    
    // 🛡️ Firestore Offline-First Persistence (IndexedDB on iOS WebKit & local DB on Android)
    try {
      this.db = initializeFirestore(this.app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      }, firebaseConfig.firestoreDatabaseId);
    } catch {
      // Fallback if already initialized
      this.db = getFirestore(this.app, firebaseConfig.firestoreDatabaseId);
    }

    this.auth = getAuth(this.app);

    // Reactive network connectivity detection
    if (typeof window !== 'undefined') {
      this.isOnline.set(navigator.onLine);
      window.addEventListener('online', () => {
        this.isOnline.set(true);
        this.connectionStatus.set('connected');
        this.syncState.set('syncing');
        this.testConnection();
      });
      window.addEventListener('offline', () => {
        this.isOnline.set(false);
        this.connectionStatus.set('offline');
        this.syncState.set('offline');
      });
    }

    this.loadLocalRoleAndGroup();
    this.initAuthListener();
    this.testConnection();
  }

  private loadLocalRoleAndGroup(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedRole = localStorage.getItem('r07_user_role') as 'member' | 'leader' | 'pastor';
        if (savedRole && (savedRole === 'leader' || savedRole === 'pastor' || savedRole === 'member')) {
          this.userRole.set(savedRole);
        }
        const savedGroup = localStorage.getItem('r07_active_group');
        if (savedGroup) {
          this.activeGroup.set(JSON.parse(savedGroup));
        }
      } catch {}
    }
  }

  private initAuthListener(): void {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.isAuthInitialized.set(true);
    });
  }

  public async testConnection(): Promise<void> {
    try {
      this.connectionStatus.set('checking');
      await getDocFromServer(doc(this.db, 'test', 'connection'));
      this.connectionStatus.set('connected');
      this.isOnline.set(true);
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Firebase client is currently offline or unreachable.');
        this.connectionStatus.set('offline');
        this.isOnline.set(false);
      } else {
        // May fail permissions if unauthenticated, but server reached
        this.connectionStatus.set('connected');
      }
    }
  }

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const user = this.auth.currentUser;
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified,
        isAnonymous: user?.isAnonymous,
        tenantId: user?.tenantId,
        providerInfo: user?.providerData?.map(p => ({
          providerId: p.providerId,
          email: p.email
        })) || []
      }
    };
    console.error('Firestore Error:', JSON.stringify(errInfo));
    this.syncState.set('error');
    throw new Error(JSON.stringify(errInfo));
  }

  // Authentication methods
  public async loginWithGoogle(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(this.auth, provider);
      this.currentUser.set(result.user);
      return result.user;
    } catch (error: any) {
      console.error('Google Sign In failed:', error);
      if (error?.code === 'auth/unauthorized-domain') {
        throw new Error('El dominio actual no está en la lista de dominios autorizados de Firebase. Agrega r07.netlify.app en Firebase Console > Authentication > Ajustes > Dominios autorizados.');
      } else if (error?.code === 'auth/popup-blocked') {
        throw new Error('La ventana emergente fue bloqueada por el navegador. Habilita los popups o inicia sesión con correo y contraseña.');
      } else if (error?.code === 'auth/firebase-app-check-token-is-invalid') {
        throw new Error("Firebase App Check está en modo 'Aplicado' en tu consola de Firebase. Ve a Firebase Console > App Check > pestaña Servicios > Authentication y cámbialo a 'No aplicado' (Unenforce).");
      }
      throw error;
    }
  }

  public async loginWithEmail(email: string, pass: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email.trim(), pass);
      this.currentUser.set(result.user);
      return result.user;
    } catch (error: any) {
      console.error('Email sign in failed:', error);
      if (error?.code === 'auth/invalid-credential' || error?.code === 'auth/wrong-password' || error?.code === 'auth/user-not-found') {
        throw new Error('Correo o contraseña incorrectos.');
      } else if (error?.code === 'auth/invalid-email') {
        throw new Error('El formato de correo no es válido.');
      } else if (error?.code === 'auth/firebase-app-check-token-is-invalid') {
        throw new Error("Firebase App Check está bloqueando la autenticación. En tu Firebase Console > App Check > pestaña Servicios > Authentication, cámbialo a 'No aplicado' (Unenforce).");
      }
      throw error;
    }
  }

  public async registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email.trim(), pass);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      this.currentUser.set(result.user);
      return result.user;
    } catch (error: any) {
      console.error('Email registration failed:', error);
      if (error?.code === 'auth/email-already-in-use') {
        throw new Error('Ya existe una cuenta con este correo electrónico.');
      } else if (error?.code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      } else if (error?.code === 'auth/invalid-email') {
        throw new Error('El formato de correo no es válido.');
      } else if (error?.code === 'auth/firebase-app-check-token-is-invalid') {
        throw new Error("Firebase App Check está en modo 'Aplicado'. En tu Firebase Console > App Check > pestaña Servicios > Authentication, cámbialo a 'No aplicado' (Unenforce).");
      }
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Profile operations
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(this.db, 'users', userId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.GET, path);
    }
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    const path = `users/${profile.userId}`;
    try {
      this.syncState.set('syncing');
      const docRef = doc(this.db, 'users', profile.userId);
      await setDoc(docRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      this.syncState.set('synced');
    } catch (error) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Weeks collection operations
  public async getWeeksForUser(userId: string): Promise<R07Week[]> {
    const path = `users/${userId}/weeks`;
    try {
      const colRef = collection(this.db, 'users', userId, 'weeks');
      const q = query(colRef, orderBy('startDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const weeks: R07Week[] = [];
      querySnapshot.forEach((docSnap) => {
        weeks.push(docSnap.data() as R07Week);
      });
      return weeks;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async saveWeek(week: R07Week): Promise<void> {
    if (!week.userId) return;
    const path = `users/${week.userId}/weeks/${week.id}`;
    try {
      this.syncState.set('syncing');
      const docRef = doc(this.db, 'users', week.userId, 'weeks', week.id);
      await setDoc(docRef, {
        ...week,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      this.syncState.set('synced');
    } catch (error) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public async deleteWeek(userId: string, weekId: string): Promise<void> {
    const path = `users/${userId}/weeks/${weekId}`;
    try {
      this.syncState.set('syncing');
      const docRef = doc(this.db, 'users', userId, 'weeks', weekId);
      await deleteDoc(docRef);
      this.syncState.set('synced');
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // Community Prayers operations
  public listenToCommunityPrayers(callback: (prayers: CommunityPrayer[]) => void): Unsubscribe {
    const path = 'prayer_requests';
    const colRef = collection(this.db, 'prayer_requests');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const list: CommunityPrayer[] = [];
      snapshot.forEach(d => list.push(d.data() as CommunityPrayer));
      callback(list);
    }, (error) => {
      this.handleFirestoreError(error, OperationType.LIST, path);
    });
  }

  public async addCommunityPrayer(prayer: Omit<CommunityPrayer, 'id' | 'createdAt' | 'prayerCount' | 'answered'>): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión para compartir una petición');
    
    const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const path = `prayer_requests/${id}`;
    
    const fullPrayer: CommunityPrayer = {
      ...prayer,
      id,
      userId: user.uid,
      userName: prayer.userName || user.displayName || 'Hermano/a',
      prayerCount: 0,
      answered: false,
      createdAt: new Date().toISOString()
    };

    try {
      this.syncState.set('syncing');
      await setDoc(doc(this.db, 'prayer_requests', id), fullPrayer);
      this.syncState.set('synced');
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  public async incrementPrayerCounter(prayerId: string, currentCount: number): Promise<void> {
    const path = `prayer_requests/${prayerId}`;
    try {
      const docRef = doc(this.db, 'prayer_requests', prayerId);
      await updateDoc(docRef, {
        prayerCount: currentCount + 1,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public async markPrayerAnswered(prayerId: string, testimony: string): Promise<void> {
    const path = `prayer_requests/${prayerId}`;
    try {
      const docRef = doc(this.db, 'prayer_requests', prayerId);
      await updateDoc(docRef, {
        answered: true,
        testimony,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public async deleteCommunityPrayer(prayerId: string): Promise<void> {
    const path = `prayer_requests/${prayerId}`;
    try {
      this.syncState.set('syncing');
      await deleteDoc(doc(this.db, 'prayer_requests', prayerId));
      this.syncState.set('synced');
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // ==========================================
  // GRUPOS DE CONEXIÓN & ROLES DE COMUNIDAD
  // ==========================================

  public setUserRole(role: 'member' | 'leader' | 'pastor'): void {
    this.userRole.set(role);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_user_role', role);
      } catch {}
    }
  }

  public verifyLeaderCode(code: string): boolean {
    const clean = code.trim().toUpperCase();
    const validCodes = ['LIDER2026', 'SUPRESENCIA', 'R07LIDER', 'PASTOR', 'LIDER', 'CELULA'];
    if (validCodes.includes(clean)) {
      this.setUserRole('leader');
      return true;
    }
    return false;
  }

  public exitLeaderRole(): void {
    this.setUserRole('member');
  }

  public async createConnectionGroup(data: {
    name: string;
    meetingDay: string;
    meetingTime: string;
    location?: string;
    description?: string;
  }): Promise<ConnectionGroup> {
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `SP-${randDigits}`;
    const groupId = `group_${Date.now()}`;
    const newGroup: ConnectionGroup = {
      id: groupId,
      code,
      name: data.name,
      description: data.description || 'Grupo de Conexión y Crecimiento en la Palabra',
      leaderId: this.userUid() || 'local_leader',
      leaderName: this.userDisplayName(),
      meetingDay: data.meetingDay,
      meetingTime: data.meetingTime,
      location: data.location || 'Presencial / Enlace Virtual',
      membersCount: 1,
      announcements: [
        {
          id: `ann_${Date.now()}`,
          groupId,
          authorName: this.userDisplayName(),
          title: '¡Bienvenidos a nuestro Grupo de Conexión R07! 🕊️',
          content: `Nos alegra tenerte aquí. Recuerda que nos reunimos los ${data.meetingDay} a las ${data.meetingTime}. ¡Mantengamos el fuego de la oración y la lectura diaria!`,
          date: 'Hoy',
          isImportant: true
        }
      ],
      prayerRequests: [],
      createdAt: new Date().toISOString()
    };

    this.activeGroup.set(newGroup);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_active_group', JSON.stringify(newGroup));
        const allRaw = localStorage.getItem('r07_all_groups') || '[]';
        const all: ConnectionGroup[] = JSON.parse(allRaw);
        all.push(newGroup);
        localStorage.setItem('r07_all_groups', JSON.stringify(all));
      } catch {}
    }

    // Persist in Firestore (offline queue via persistentLocalCache)
    try {
      const docRef = doc(this.db, 'connection_groups', groupId);
      await setDoc(docRef, newGroup);
      this.ultimoError.set(null);
    } catch (err: any) {
      const errMsg = err?.message || 'Error al persistir el grupo en Firestore.';
      console.warn('Firestore group creation queued/failed:', err);
      this.ultimoError.set(errMsg);
    }

    return newGroup;
  }

  public async joinConnectionGroupByCode(code: string): Promise<ConnectionGroup | null> {
    const cleanCode = code.trim().toUpperCase();

    // 1. Buscar en grupos locales
    if (typeof localStorage !== 'undefined') {
      try {
        const allRaw = localStorage.getItem('r07_all_groups');
        if (allRaw) {
          const all: ConnectionGroup[] = JSON.parse(allRaw);
          const found = all.find(g => g.code.toUpperCase() === cleanCode);
          if (found) {
            found.membersCount = (found.membersCount || 1) + 1;
            this.activeGroup.set(found);
            localStorage.setItem('r07_active_group', JSON.stringify(found));
            this.ultimoError.set(null);
            return found;
          }
        }
      } catch {}
    }

    // 2. Buscar en Firestore (con soporte offline persistentLocalCache)
    try {
      const q = query(collection(this.db, 'connection_groups'), where('code', '==', cleanCode), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docData = snap.docs[0].data() as ConnectionGroup;
        docData.id = snap.docs[0].id;
        docData.membersCount = (docData.membersCount || 1) + 1;
        this.activeGroup.set(docData);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('r07_active_group', JSON.stringify(docData));
          } catch {}
        }
        // Persist member count back to Firestore
        try {
          await updateDoc(doc(this.db, 'connection_groups', docData.id), {
            membersCount: docData.membersCount
          });
        } catch {}
        this.ultimoError.set(null);
        return docData;
      }
      this.ultimoError.set(null);
    } catch (err: any) {
      const errMsg = err?.message || 'Error al buscar el grupo en Firestore.';
      console.warn('Firestore join query failed:', err);
      this.ultimoError.set(errMsg);
      return null;
    }

    return null;
  }

  public leaveConnectionGroup(): void {
    this.activeGroup.set(null);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('r07_active_group');
      } catch {}
    }
  }

  public async deleteConnectionGroup(groupId: string): Promise<boolean> {
    try {
      if (this.activeGroup()?.id === groupId) {
        this.leaveConnectionGroup();
      }
      if (typeof localStorage !== 'undefined') {
        try {
          const allRaw = localStorage.getItem('r07_all_groups') || '[]';
          const all: ConnectionGroup[] = JSON.parse(allRaw);
          const filtered = all.filter((g) => g.id !== groupId);
          localStorage.setItem('r07_all_groups', JSON.stringify(filtered));
        } catch {}
      }
      await deleteDoc(doc(this.db, 'connection_groups', groupId));
      this.ultimoError.set(null);
      return true;
    } catch (err: any) {
      console.warn('Could not delete group from Firestore:', err);
      this.ultimoError.set(err?.message || 'No se pudo eliminar el grupo.');
      return false;
    }
  }

  public async postGroupAnnouncement(announcement: { title: string; content: string; isImportant?: boolean }): Promise<void> {
    const grp = this.activeGroup();
    if (!grp) return;

    const newAnn: GroupAnnouncement = {
      id: `ann_${Date.now()}`,
      groupId: grp.id,
      authorName: this.userDisplayName(),
      title: announcement.title,
      content: announcement.content,
      date: 'Hoy',
      isImportant: !!announcement.isImportant
    };

    const updated = {
      ...grp,
      announcements: [newAnn, ...(grp.announcements || [])]
    };
    this.activeGroup.set(updated);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_active_group', JSON.stringify(updated));
      } catch {}
    }

    try {
      await updateDoc(doc(this.db, 'connection_groups', grp.id), {
        announcements: updated.announcements
      });
    } catch (err) {
      console.warn('Firestore announcement sync queued/failed:', err);
    }
  }

  public async postGroupPrayer(prayer: { title: string; content: string }): Promise<void> {
    const grp = this.activeGroup();
    if (!grp) return;

    const newPrayer: GroupPrayer = {
      id: `gp_${Date.now()}`,
      groupId: grp.id,
      userId: this.userUid() || 'local_user',
      userName: this.userDisplayName(),
      title: prayer.title,
      content: prayer.content,
      prayerCount: 1,
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...grp,
      prayerRequests: [newPrayer, ...(grp.prayerRequests || [])]
    };
    this.activeGroup.set(updated);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_active_group', JSON.stringify(updated));
      } catch {}
    }

    try {
      await updateDoc(doc(this.db, 'connection_groups', grp.id), {
        prayerRequests: updated.prayerRequests
      });
    } catch (err) {
      console.warn('Firestore group prayer sync queued/failed:', err);
    }
  }

  public async incrementGroupPrayerCounter(prayerId: string): Promise<void> {
    const grp = this.activeGroup();
    if (!grp || !grp.prayerRequests) return;

    const updatedPrayers = grp.prayerRequests.map(p =>
      p.id === prayerId ? { ...p, prayerCount: p.prayerCount + 1 } : p
    );

    const updated = { ...grp, prayerRequests: updatedPrayers };
    this.activeGroup.set(updated);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_active_group', JSON.stringify(updated));
      } catch {}
    }

    try {
      await updateDoc(doc(this.db, 'connection_groups', grp.id), {
        prayerRequests: updatedPrayers
      });
    } catch (err) {
      console.warn('Firestore prayer count update queued/failed:', err);
    }
  }

  public async deleteGroupPrayer(prayerId: string): Promise<void> {
    const grp = this.activeGroup();
    if (!grp || !grp.prayerRequests) return;

    const updatedPrayers = grp.prayerRequests.filter(p => p.id !== prayerId);
    const updated = { ...grp, prayerRequests: updatedPrayers };
    this.activeGroup.set(updated);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('r07_active_group', JSON.stringify(updated));
      } catch {}
    }

    try {
      await updateDoc(doc(this.db, 'connection_groups', grp.id), {
        prayerRequests: updatedPrayers
      });
    } catch (err) {
      console.warn('Firestore prayer delete queued/failed:', err);
    }
  }
}
