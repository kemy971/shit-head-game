import {ICard, Other, Rank} from './interface/card';

export class ShitheadRules {
  public static LAY_ON_ANYTHING_RANKS = [Rank.TWO, Rank.THREE, Rank.TEN, Other.JOKER];
  public static NORMAL_RANKS = [
    Rank.FOUR, Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE,
  ];

  public static isSpecial(card: ICard): boolean {
    return this.LAY_ON_ANYTHING_RANKS.includes(card.rank);
  }

  public static canLay(card: ICard, currentCard: ICard): boolean {
    if (!currentCard) {
      return true;
    } else if (this.isSpecial(card)) {
      return true;
    } else if (currentCard.rank === Rank.SEVEN) {
      return this.NORMAL_RANKS.indexOf(card.rank as Rank) <= 3;
    } else {
      const currentCardIndex = this.NORMAL_RANKS.indexOf(currentCard.rank as Rank);
      return this.NORMAL_RANKS.indexOf(card.rank as Rank) >= currentCardIndex;
    }
  }
}
