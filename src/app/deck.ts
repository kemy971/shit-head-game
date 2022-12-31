import { shuffle } from 'underscore';
import { ICard, Other, Rank, Suit } from './interface';
import { Player } from './player';

export class Deck {

  private deckCards: ICard[] = [];
  private readonly MAX_PLAYERS_BY_DECK = 4;

  constructor(cards?: ICard[]) {
    if (cards) {
      this.deckCards = cards;
    }
  }

  get cards(): ICard[] {
    return this.deckCards;
  }

  private createDeck(nbPack= 1): void {
    const cards = [];
    for (let index = 0; index < nbPack; index++) {
      Object.keys(Suit).forEach((suitKey) => {
        Object.keys(Rank).forEach((rankKey) => {
          cards.push({
            name: Rank[rankKey as keyof typeof Rank] + Suit[suitKey as keyof typeof Suit],
            rank: Rank[rankKey as keyof typeof Rank],
          });
        });
      });

      cards.push(
        {name: Other.JOKER, rank: Other.JOKER},
        {name: Other.JOKER, rank: Other.JOKER},
      );
    }

    this.deckCards =  shuffle(cards);
  }

  public distributePlayersCards(players: Player[]): void {
    this.createDeck(Math.ceil(players.length / this.MAX_PLAYERS_BY_DECK));
    const usersCards: Record<string, Array<any>> = {};

    for (let index = 0; index < Player.INITIAL_NB_CARDS; index++) {
      players.forEach((player) => {
        if (!usersCards[player.id]) {
          usersCards[player.id] = [];
        }
        usersCards[player.id].push(...this.takeCards());
      });
    }

    Object.keys(usersCards).forEach((key) => {
      const player = players.find((p) => p.id === key);
      if (player) {
        player.initDeck(usersCards[key]);
      }
    });
  }

  public takeCards(nbCards = 1): ICard[] {
    if (this.isEmpty()) {
      return [];
    }
    return this.deckCards.splice(0, nbCards);
  }

  public getSize(): number {
    return this.deckCards.length;
  }

  public isEmpty(): boolean {
    return !this.deckCards.length;
  }

}
