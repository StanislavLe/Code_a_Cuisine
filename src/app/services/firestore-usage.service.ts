// src/app/services/firestore-usage.service.ts
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FirestoreUsageService {
  private currentUserHash: string | null = null;
  private readonly USAGE_LIMIT = 5;
  private readonly COLLECTION = 'usage';
  private readonly STORAGE_KEY = 'userHash';
  private isBrowser: boolean;

  constructor(private firestore: Firestore, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const savedHash = localStorage.getItem(this.STORAGE_KEY);
      if (savedHash) {
        this.currentUserHash = savedHash;
        console.log('💾 UserHash aus localStorage geladen:', savedHash);
      }
    } else {
      console.log('🧠 Server-Kontext erkannt — localStorage deaktiviert');
    }
  }

  /** Registrierung oder Update des Users */
  async registerUserByIp(clientIp: string): Promise<void> {
    this.currentUserHash = clientIp;

    if (this.isBrowser) {
      localStorage.setItem(this.STORAGE_KEY, clientIp);
    }

    const usageRef = doc(this.firestore, this.COLLECTION, clientIp);
    const snap = await getDoc(usageRef);
    const today = new Date().toISOString().split('T')[0];

    if (!snap.exists()) {
      await setDoc(usageRef, {
        ip: clientIp,
        usageCount: 0,
        resetDate: today,
        lastAccess: new Date(),
      });
      console.log(`🆕 Neuer Nutzer registriert: ${clientIp}`);
    } else {
      const data = snap.data();
      const resetDate = data?.['resetDate'];
      if (resetDate !== today) {
        await updateDoc(usageRef, {
          usageCount: 0,
          resetDate: today,
          lastAccess: new Date(),
        });
        console.log(`♻️ Tageslimit für ${clientIp} zurückgesetzt.`);
      } else {
        await updateDoc(usageRef, { lastAccess: new Date() });
      }
    }
  }

  getUserHash(): string {
    if (!this.currentUserHash && this.isBrowser) {
      this.currentUserHash = localStorage.getItem(this.STORAGE_KEY);
    }
    return this.currentUserHash || 'anonymous';
  }

  async getCurrentUsageCount(): Promise<number> {
    const hash = this.getUserHash();
    if (!hash || hash === 'anonymous') return 0;

    const usageRef = doc(this.firestore, this.COLLECTION, hash);
    const snap = await getDoc(usageRef);
    if (!snap.exists()) return 0;

    const data = snap.data();
    return data?.['usageCount'] ?? 0;
  }

  /** ✅ NEUE VERSION: Prüft nur das Limit, erhöht aber NICHT den Counter */
  async canGenerateRecipe(): Promise<boolean> {
    const hash = this.getUserHash();
    if (!hash || hash === 'anonymous') return false;

    const usageRef = doc(this.firestore, this.COLLECTION, hash);
    const snap = await getDoc(usageRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const count = data?.['usageCount'] ?? 0;
    const resetDate = data?.['resetDate'];
    const today = new Date().toISOString().split('T')[0];

    // Falls neuer Tag: Zähler zurücksetzen
    if (resetDate !== today) {
      await updateDoc(usageRef, {
        usageCount: 0,
        resetDate: today,
        lastAccess: new Date(),
      });
      return true; // ✅ Neuer Tag = erlaubt
    }

    // Prüfe Limit
    return count < this.USAGE_LIMIT;
  }

  /** ✅ NEU: Counter erhöhen (wird erst nach Zutatsprüfung aufgerufen) */
  async incrementUsageCount(): Promise<void> {
    const hash = this.getUserHash();
    if (!hash || hash === 'anonymous') return;

    const usageRef = doc(this.firestore, this.COLLECTION, hash);
    const snap = await getDoc(usageRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const count = data?.['usageCount'] ?? 0;

    await updateDoc(usageRef, {
      usageCount: count + 1,
      lastAccess: new Date(),
    });

    console.log(`✅ UsageCount erhöht: ${count} → ${count + 1}`);
  }

  getLimit(): number {
    return this.USAGE_LIMIT;
  }
}