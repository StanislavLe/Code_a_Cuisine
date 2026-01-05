// src/app/services/firestore-usage.service.ts
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FirestoreUsageService {
  private currentUserHash: string | null = null;

  constructor(private firestore: Firestore) {}

  async registerUserByIp(clientIp: string): Promise<void> {
    this.currentUserHash = clientIp; // 👈 Hash speichern
    
    const usageRef = doc(this.firestore, 'usage', clientIp);
    const snap = await getDoc(usageRef);
    const today = new Date().toISOString().split('T')[0];

    if (!snap.exists()) {
      // 🆕 Neuer User (neue IP)
      await setDoc(usageRef, {
        ip: clientIp,
        usageCount: 0,
        resetDate: today,
        lastAccess: new Date(),
      });
      console.log(`🆕 Neuer Nutzer in Firestore registriert: ${clientIp}`);
    } else {
      // ♻️ Bestehender User → nur lastAccess aktualisieren
      await updateDoc(usageRef, {
        lastAccess: new Date(),
      });
      console.log(`🔄 Nutzer ${clientIp} bereits vorhanden → lastAccess aktualisiert`);
    }
  }

  /** Gibt den aktuellen User-Hash zurück */
  getUserHash(): string {
    return this.currentUserHash || 'anonymous';
  }
}