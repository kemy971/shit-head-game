import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { Player } from '../../player';
import { Deck } from '../../deck';
import { ShitheadRules } from '../../shithead-rules';
import { ShitheadService } from '../../shithead.service';
import { ICard } from '../../interface';

@Component({
  selector: 'app-player-deck',
  templateUrl: './player-deck.component.html',
  styleUrls: ['./player-deck.component.scss']
})
export class PlayerDeckComponent implements OnInit, OnChanges {

  @Input() gameId: string;
  @Input() player: Player;
  @Input() deck: Deck;
  @Input() currentRank: ICard;
  @Input() isCurrentPlayer: boolean;

  selectedCards: ICard[] = [];
  clickTimeout: any;
  canLay = true;
  isLoading = false;

  constructor(
    private shitheadService: ShitheadService,
    private cdr: ChangeDetectorRef
  ) { }

  get hand(): ICard[] {
    return this.player.hand;
  }

  get faceUp(): ICard[] {
    return this.player.faceUp;
  }

  get faceDown(): ICard[] {
    return this.player.faceDown;
  }

  ngOnInit(): void {
    console.log(this.currentRank);
    this.canLay = this.checkCanLay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.player && !changes.player.firstChange && changes.player.currentValue) {
      this.canLay = this.checkCanLay();
    }
  }

  dealCardFromHand(index: number): void {
    let cardsToLay: ICard[] = [];
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
      this.clickTimeout = null;
    }
    this.setIsLoading(true);
    if (this.selectedCards.length) {
      this.selectedCards.forEach((selectedCard) => {
        const cardIndex = this.hand.findIndex((c) => c.name === selectedCard.name);
        this.player.removeFromHand(cardIndex);
      });
      cardsToLay = this.selectedCards;
    } else {
      cardsToLay = this.player.removeFromHand(index);
    }

    this.shitheadService.dealCardsFromHand(this.gameId, this.player.getJson(), cardsToLay)
    .subscribe(() => {
      this.setIsLoading(false);
    }, () => {
      this.setIsLoading(false);
    });

    this.selectedCards.length = 0;
  }

  dealCardFromFaceUp(index: number): void {
    this.setIsLoading(true);
    const card = this.faceUp.splice(index, 1);
    this.shitheadService.dealCardsFromFaceUp(this.gameId, this.player.getJson(), card)
    .subscribe(() => {
      console.log('dealCardFromFaceUp');
      this.setIsLoading(false);
    }, () => {
      this.setIsLoading(false);
    });
  }

  clickOnCard(card: ICard): void {
    if (!this.clickTimeout) {
      this.clickTimeout = setTimeout(this.selectCard.bind(this, card), 300);
    }
  }

  selectCard(card: ICard): void {
    const isSelect = this.selectedCards.findIndex((c) => c.name === card.name);
    if (isSelect > -1) {
      this.selectedCards.splice(isSelect, 1);
    } else {
      this.selectedCards.push(card);
    }

    this.cdr.detectChanges();

    this.clickTimeout =  null;
  }

  isSelected(card: ICard): boolean {
    return !!this.selectedCards.find((c) => c.name === card.name);
  }

  canLayCard(card: ICard): boolean {
    if (!this.isCurrentPlayer) {
      return false;
    }

    if (this.selectedCards.length) {
      return !!this.selectedCards.find((c) => c.rank === card.rank);
    }

    return ShitheadRules.canLay(card, this.currentRank);
  }

  checkCanLay(): boolean {
    return this.hand && !!this.hand.find((card) => ShitheadRules.canLay(card, this.currentRank));
  }

  cantPlay(): void  {
    this.setIsLoading(true);
    this.shitheadService.takePile(this.gameId, this.player.id)
    .subscribe(() => {
      this.setIsLoading(false);
      this.canLay = true;
    }, () => {
      this.setIsLoading(false);
      this.canLay = true;
    });
  }

  canLayFromFaceUp(): boolean {
    return this.deck.isEmpty() && this.player.canLayFaceUp();
  }

  canLayFromFaceDown(): boolean {
    return this.deck.isEmpty() && this.player.canLayFaceDown();
  }

  setIsLoading(isLoading: boolean): void {
    this.isLoading = isLoading;
    this.cdr.detectChanges();
  }
}
