import { DocumentReference } from '@angular/fire/firestore';

export interface IRoom {
  owner: string;
  players: DocumentReference[];
}
