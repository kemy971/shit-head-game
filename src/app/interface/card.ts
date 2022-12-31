export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

export enum Suit {
  HEARTS = 'H',
  SPADES = 'S',
  DIAMONDS = 'D',
  CLUBS = 'C',
}

export enum Other {
  JOKER = 'JOKER',
}

export interface ICard {
  position?: number;
  name: string;
  rank: Rank | Other;
  rotate?: number;
}
