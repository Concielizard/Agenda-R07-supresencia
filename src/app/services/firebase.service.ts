import { Injectable, signal, computed } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
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
import { UserProfile, R07Week, CommunityPrayer } from '../models/r07.models';

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

  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.db = getFirestore(this.app, firebaseConfig.firestoreDatabaseId);
    this.auth = getAuth(this.app);

    this.initAuthListener();
    this.testConnection();
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
        throw new Error('El dominio actual no está en la lista de dominios autorizados de Firebase. Usa correo y contraseña o agrega el dominio en Firebase Console.');
      } else if (error?.code === 'auth/popup-blocked') {
        throw new Error('La ventana emergente fue bloqueada por el navegador. Habilita los popups o inicia sesión con correo y contraseña.');
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
}
