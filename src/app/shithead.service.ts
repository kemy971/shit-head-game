import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { IGame, ICard } from './interface';
import { Player } from './player';

@Injectable({
  providedIn: 'root'
})
export class ShitheadService {

  constructor(
    private fireDatabase: AngularFireDatabase,
    private fireFunctions: AngularFireFunctions,
  ) {}

  createGame(username: string): Observable<any> {
    const callable$ = this.fireFunctions.httpsCallable('createGame');
    return callable$({username});
  }

  addGamePlayer(gameId: string, username: string): Observable<any> {
    const callable$ = this.fireFunctions.httpsCallable('addGamePlayer');
    return callable$({gameId, username});
  }

  getGame(gameId: string): Observable<IGame> {
    return this.fireDatabase.object(`game/${gameId}`).valueChanges() as Observable<IGame>;
  }

  getGameOnce(gameId: string): Observable<IGame> {
    return new Observable((observer) => {
      this.fireDatabase.object(`game/${gameId}`).query.once('value').then((gameSnapshot) => {
        observer.next(gameSnapshot.val());
      });
    });
  }

  getDeck(gameId: string): Observable<ICard[]> {
    return new Observable((observer) => {
      this.fireDatabase.object(`game/${gameId}`).query.ref.child('deck').on('value', (deckSnapshot) => {
        observer.next(deckSnapshot.val());
      });
    });
  }

  getPile(gameId: string): Observable<ICard[]> {
    return new Observable((observer) => {
      this.fireDatabase.object(`game/${gameId}`).query.ref.child('pile').on('value', (pileSnapshot) => {
        observer.next(pileSnapshot.val());
      });
    });
  }

  getPileRank(gameId: string): Observable<ICard> {
    return new Observable((observer) => {
      this.fireDatabase.object(`game/${gameId}`).query.ref.child('pileRank').on('value', (pileRankSnapshot) => {
        observer.next(pileRankSnapshot.val());
      });
    });
  }

  getPlayers(gameId: string): Observable<any> {
    return new Observable((observer) => {
      this.fireDatabase.object(`game/${gameId}`).query.ref.child('players').on('value', (playersSnapshot) => {
        observer.next(playersSnapshot.val());
      });
    });
  }

  getCurrentPlayer(gameId: string): Observable<string> {
    return new Observable((observer) => {
      this.fireDatabase.object(`game/${gameId}`).query.ref.child('currentPlayer').on('value', (currentPlayersSnapshot) => {
        observer.next(currentPlayersSnapshot.val());
      });
    });
  }

  startGame(gameId: string): Observable<any> {
    const callable$ = this.fireFunctions.httpsCallable('startGame');
    return callable$({gameId});
  }

  dealCardsFromHand(gameId: string, playerDeck: Partial<Player>, cards: ICard[]): Observable<any> {
    const callable$ = this.fireFunctions.httpsCallable('dealCardsFromHand');
    return callable$({gameId, playerDeck, cards});
  }

  dealCardsFromFaceUp(gameId: string, playerDeck: Partial<Player>, cards: ICard[]): Observable<any> {
    console.log(cards);
    const callable$ = this.fireFunctions.httpsCallable('dealCardsFromFaceUp');
    return callable$({gameId, playerDeck, cards});
  }

  takePile(gameId: string, playerId: string): Observable<any> {
    const callable$ = this.fireFunctions.httpsCallable('takePile');
    return callable$({gameId, playerId});
  }

}
