// src/app/services/firestore-usage.service.ts
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FirestoreUsageService {
  private currentUserHash: string | null = null;
  private readonly USAGE_LIMIT = 5; // 🔢 Max Rezepte pro Tag (UI-kompatibel!)
  private readonly COLLECTION = 'usage';

  constructor(private firestore: Firestore) {}

  /** 🔹 Registrierung oder Update des Users beim Seitenaufruf (Home) */
  async registerUserByIp(clientIp: string): Promise<void> {
    this.currentUserHash = clientIp;

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
      console.log(`🆕 Neuer Nutzer in Firestore registriert: ${clientIp}`);
    } else {
      const data = snap.data();
      const resetDate = data?.['resetDate'];

      // 📅 Reset falls neuer Tag
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

  /** Gibt den aktuellen User-Hash zurück */
  getUserHash(): string {
    return this.currentUserHash || 'anonymous';
  }

  /** 🔸 Prüft, ob Nutzer noch generieren darf + inkrementiert den Counter */
  async canGenerateRecipe(): Promise<boolean> {
    if (!this.currentUserHash) return false;

    const usageRef = doc(this.firestore, this.COLLECTION, this.currentUserHash);
    const snap = await getDoc(usageRef);

    if (!snap.exists()) return false;

    const data = snap.data();
    const count = data?.['usageCount'] ?? 0;
    const resetDate = data?.['resetDate'];
    const today = new Date().toISOString().split('T')[0];

    // 📅 Falls Reset nötig
    if (resetDate !== today) {
      await updateDoc(usageRef, {
        usageCount: 1,
        resetDate: today,
        lastAccess: new Date(),
      });
      console.log(`♻️ Neuer Tag → Zähler für ${this.currentUserHash} zurückgesetzt.`);
      return true;
    }

    if (count >= this.USAGE_LIMIT) {
      console.warn(`🚫 Limit erreicht für ${this.currentUserHash}.`);
      return false;
    }

    await updateDoc(usageRef, {
      usageCount: count + 1,
      lastAccess: new Date(),
    });

    console.log(`✅ Rezept #${count + 1} für ${this.currentUserHash}`);
    return true;
  }

  /** 🔹 Gibt den aktuellen Nutzungszähler zurück */
  async getCurrentUsageCount(): Promise<number> {
    if (!this.currentUserHash) return 0;
    const usageRef = doc(this.firestore, this.COLLECTION, this.currentUserHash);
    const snap = await getDoc(usageRef);
    if (!snap.exists()) return 0;
    const data = snap.data();
    return data?.['usageCount'] ?? 0;
  }

  /** 🔹 Gibt das Limit zurück (z. B. für Step2-Anzeige) */
  getLimit(): number {
    return this.USAGE_LIMIT;
  }
}
