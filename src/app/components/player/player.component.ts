import { Component, OnInit, Input } from '@angular/core';

import { Player } from '../../player';
import { ICard } from '../../interface';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  @Input() player: Player;
  @Input() isCurrentPlayer: boolean;

  constructor() { }

  ngOnInit(): void {
  }

  get hand(): ICard[] {
    return this.player.hand;
  }

  get faceUp(): ICard[] {
    return this.player.faceUp;
  }

}
