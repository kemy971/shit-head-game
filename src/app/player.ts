import { ICard } from './interface';

export class Player {

  public static INITIAL_NB_CARDS = 9;
  private MIN_HAND_CARDS = 3;

  public id: string;
  public username: string;
  public hand: ICard[];
  public faceUp: ICard[];
  public faceDown: ICard[];

  constructor(
    userId: string,
    username: string,
    hand: ICard[] = [],
    faceUp: ICard[] = [],
    faceDown: ICard[] = [],
  ) {
    this.id = userId;
    this.username = username;
    this.hand = hand;
    this.faceUp = faceUp;
    this.faceDown = faceDown;
  }

  public initDeck(cards: ICard[]): void {
    this.faceDown = cards.splice(0, 3);
    this.faceUp = cards.splice(0, 3);
    this.hand = cards;
  }

  public takeCards(cards: ICard[]): void {
    this.hand.push(...cards);
  }

  public removeFromHand(index: number): ICard[] {
    return this.hand.splice(index, 1);
  }

  public nbCardsNeeded(): number {
    return this.hand.length < this.MIN_HAND_CARDS ? this.MIN_HAND_CARDS - this.hand.length : 0;
  }

  public handEmpty(): boolean {
    return !this.hand.length;
  }

  public faceUpEmpty(): boolean {
    return !this.faceUp.length;
  }

  public faceDownEmpty(): boolean {
    return !this.faceDown.length;
  }

  public canLayFaceUp(): boolean {
    return this.handEmpty();
  }

  public canLayFaceDown(): boolean {
    return this.handEmpty() && this.faceUpEmpty();
  }

  public getJson(): Partial<Player> {
    return {
      faceDown: this.faceDown,
      faceUp: this.faceUp,
      hand: this.hand,
      id: this.id,
      username: this.username,
    };
  }
}
