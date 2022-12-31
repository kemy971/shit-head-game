import { ICard } from '.';
import { Player } from '../player';

export enum GameDirection {
  Right = 1,
  Left = -1,
}

export interface IGame {
  deck: ICard[];
  pile: ICard[];
  players: Player[];
  direction: GameDirection;
  owner: string;
  pileRank: ICard;
  started: boolean;
}
