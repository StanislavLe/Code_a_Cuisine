// src/app/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FirestoreUsageService } from '../services/firestore-usage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private firestoreUsage: FirestoreUsageService) {}

  async ngOnInit() {
    const clientHash = await this.getClientHash();
    await this.firestoreUsage.registerUserByIp(clientHash);
  }

  /** Öffentliche IP-Adresse holen und DSGVO-konform in Hash umwandeln */
  private async getClientHash(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      const ip = data.ip;
      const encoder = new TextEncoder();
      const msgUint8 = encoder.encode(ip);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      console.log('🌍 Nutzer-Hash erkannt:', hashHex);
      return hashHex;
    } catch (err) {
      console.warn('⚠️ IP konnte nicht gehasht werden, fallback auf anonym', err);
      return 'anonymous';
    }
  }
}
