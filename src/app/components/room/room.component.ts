import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShitheadService } from '../../shithead.service';
import { IGame } from '../../interface';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {

  isLoading = true;
  isJoining = false;
  isStarting = false;
  players: any[] = [];
  roomId: string;
  room: IGame;
  username = '';
  isInRoom = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shitheadSercive: ShitheadService,
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      this.roomId = paramMap.get('roomId');
      this.shitheadSercive.getGame(this.roomId).subscribe((game) => {
        if (game) {
          if (game.started) {
            this.router.navigate(['game', this.roomId]);
          } else {
            this.room = game;
            this.players = Object.keys(game.players).map((key) => ({id: key, ...game.players[key]}));
            this.isLoading = false;
            setTimeout(() => {
              this.isInRoom = this.checkIsInRoom();
            });
          }
        } else {
          this.router.navigate(['']);
        }
      });
    });
  }

  ngOnInit(): void {
  }

  get isOwner(): boolean {
    const playerId = localStorage.getItem('player-id');
    return this.room && this.room.owner === playerId;
  }

  checkIsInRoom(): boolean {
    const playerId = localStorage.getItem('player-id');
    if (!playerId) {
      return false;
    }
    return !!(this.players.length && this.players.find(playerRef => playerRef.id === playerId));
  }

  joinParty(): void {
    this.isJoining = true;
    this.shitheadSercive.addGamePlayer(this.roomId, this.username).subscribe(({player}) => {
      localStorage.setItem('player-id', player);
      this.isInRoom = this.checkIsInRoom();
    }, () => {
      this.isJoining = false;
    });
  }

  startGame(): void {
    this.isStarting =  true;
    this.shitheadSercive.startGame(this.roomId).subscribe(() => {}, () => {
      this.isStarting = false;
    });
  }

}
