import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Deck } from '../../deck';
import { Player } from '../../player';
import { ShitheadService } from '../../shithead.service';
import { ICard, GameDirection } from '../../interface';
import { ActivatedRoute } from '@angular/router';
import { DataSnapshot } from '@angular/fire/database/interfaces';

const users = [
  {id: '0', username: 'Lekem'},
  {id: '1', username: 'Alexis'},
  {id: '2', username: 'Anouk'},
  {id: '3', username: 'Marion'}
];

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  gameId: string;
  deck: Deck;
  pile: ICard[] = [];
  burnt: ICard[] = [];
  players: Player[] = [];
  direction = GameDirection.Left;
  pileRank: ICard = null;
  currentPlayer: string = null;
  playerId: string;

  constructor(
    private route: ActivatedRoute,
    private shitheadService: ShitheadService,
    private cdr: ChangeDetectorRef
  ) {
    this.playerId = localStorage.getItem('player-id');
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      this.gameId = paramMap.get('gameId');
      this.initSubscriptions();
    });
  }

  initSubscriptions(): void {
    this.shitheadService.getDeck(this.gameId).subscribe((deck) => {
      this.deck = new Deck(deck);
      this.cdr.detectChanges();
    });

    this.shitheadService.getPlayers(this.gameId).subscribe((playersMap) => {
      this.updatePlayers(playersMap);
      this.cdr.detectChanges();
    });

    this.shitheadService.getPile(this.gameId).subscribe((pile) => {
      this.pile = pile;
      this.cdr.detectChanges();
    });

    this.shitheadService.getPileRank(this.gameId).subscribe((pileRank) => {
      this.pileRank = pileRank;
      this.cdr.detectChanges();
    });

    this.shitheadService.getCurrentPlayer(this.gameId).subscribe((currentPlayer) => {
      this.currentPlayer = currentPlayer;
      this.cdr.detectChanges();
    });
  }

  updatePlayers(playersMap: Record<string, Partial<Player>>): void {
    const players: Player[] = [];
    Object.keys(playersMap).forEach((key) => {
      const {username, hand, faceUp, faceDown} = playersMap[key];
      const player = new Player(key, username, hand, faceUp, faceDown);
      players.push(player);
    });
    const playerIndex = players.findIndex(player => player.id === this.playerId);
    if (playerIndex !== 0) {
      const playersToMove = players.splice(0, playerIndex);
      this.players = [...players, ...playersToMove];
    } else {
      this.players = players;
    }
  }

  getDeckOrder(): ICard[] {
    return this.deck.cards.reverse();
  }

  nextPlayer(): void {
    const currentUserIndex = this.players.findIndex((p) => p.id === this.currentPlayer);
    const nextIndex = currentUserIndex + this.direction;
    let player: Player;
    if (this.direction === GameDirection.Left) {
      player = nextIndex >= 0 ? this.players[nextIndex] : this.players[this.players.length - 1];
    } else {
      player = nextIndex <= this.players.length - 1 ? this.players[nextIndex] : this.players[0];
    }
    this.currentPlayer = player.id;
  }

  takePile(player: Player): void {
    player.takeCards(this.pile);
    this.pile.length = 0;
    this.pileRank = null;
    this.nextPlayer();
  }

  getNotCurrentPlayers(): Player[] {
    return this.players.filter((player) => player.id !== this.playerId);
  }

  getPlayer(): Player {
    return this.players.find(player => player.id === this.playerId);
  }
}
