import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Deck } from '../../src/app/deck';
import { Player } from '../../src/app/player';
import { ShitheadRules } from '../../src/app/shithead-rules';
import { Rank, Other, ICard, IGame, GameDirection } from '../../src/app/interface';

admin.initializeApp();
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

function addCors(response: functions.Response) {
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', '*');
}

export const createGame = functions.https.onRequest(async (request, response) => {
  addCors(response);
  if (request.body.data) {
    const {username} = request.body.data;
    const gameRef = admin.database().ref('game').push({});
    const playerRef = gameRef.child('players').push({username});
    await gameRef.update({
      owner: playerRef.key,
      started: false,
      deck: [],
      pile: [],
      burnt: []
    });
    response.send({
      data: {
        game: gameRef.key,
        player: playerRef.key
      }
    });
  } else {
    response.send({});
  }
});

export const addGamePlayer = functions.https.onRequest(async (request, response) => {
  addCors(response);
  if (request.body.data) {
    const {username, gameId} = request.body.data;
    const gameRef = admin.database().ref(`game/${gameId}`);
    const playerRef = gameRef.child('players').push({username});
    response.send({
      data: {
        player: playerRef.key
      }
    });
  } else {
    response.send({});
  }
});

export const startGame = functions.https.onRequest(async (request, response) => {
  addCors(response);
  if (request.body.data) {
    const promises: Promise<any>[] = [];
    const players: Player[] = [];
    const {gameId} = request.body.data;
    const gameRef = admin.database().ref(`game/${gameId}`);
    const playersQuery = gameRef.child('players').orderByKey();
    await playersQuery.once("value").then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const user = childSnapshot.val();
        players.push(new Player(key as string, user.username));
      });
      const deck = new Deck();
      deck.distributePlayersCards(players);
      players.forEach((player) => {
        const promise = gameRef.child(`players/${player.id}`).update({
          hand: player.hand,
          faceUp: player.faceUp,
          faceDown: player.faceDown
        });
        promises.push(promise);
      });

      promises.push(gameRef.update({
        deck: deck.cards,
        started: true,
        currentPlayer: players[0].id,
        direction: GameDirection.Left
      }));

      // tslint:disable-next-line: no-floating-promises
      Promise.all(promises).then(() => {
        response.send({
          data: { success: true }
        });
      });
    });
  } else {
    response.send({});
  }
})

interface DealFromHandData {
  gameId: string;
  playerDeck: Player;
  cards: ICard[];
}

export const dealCardsFromHand = functions.https.onRequest(async (request, response) => {
  addCors(response);
  if (request.body.data) {
    const {gameId, playerDeck, cards} = request.body.data as DealFromHandData;
    const player = new Player(playerDeck.id, playerDeck.username, playerDeck.hand, playerDeck.faceUp, playerDeck.faceDown);
    const gameRef = admin.database().ref(`game/${gameId}`);
    await addCardsToPile(gameRef, cards);
    await gameRef.once('value').then(async (gameSnapshot) => {
      const game = gameSnapshot.val();
      const deck = new Deck(game.deck);

      if (!deck.isEmpty() && player.hand.length < 3) {
        player.hand.push(...deck.takeCards(player.nbCardsNeeded()));
      }

      await gameRef.update({
        deck: deck.cards
      });

      await gameRef.child(`players/${player.id}`).update({
        hand: player.hand,
        faceUp: player.faceUp,
        faceDown: player.faceDown
      });  
    });
    response.send({data: {success: true}});
  } else {
    response.send({});
  }
});

const addCardsToPile = async (gameRef: admin.database.Reference, cards: ICard[]) => {
  await gameRef.once('value').then(async (gameSnapshot) => {
    const game: any = gameSnapshot.val();
    let goToNextPlayer = false;

    if (!game.pile) {
      game.pile = [];
    }
    game.pile = game.pile.sort((a: any, b: any) => a.position - b.position);
    cards.forEach((c) => {
      c.rotate = Math.random() * 100
      c.position = game.pile.length + 1;
      game.pile.push(c);
    });

    const card = cards[0];
    if (card.rank === Rank.TEN || cards.length === 4) {
      if (!game.burnt) {
        game.burnt = [];
    }
      game.burnt.push(...game.pile);
      game.pile.length = 0;
      game.pileRank = null;
    } else {
      goToNextPlayer = true;
      if (card.rank === Rank.TWO) {
        game.pileRank = null;
      } else if (card.rank === Other.JOKER) {
        toggleDirection(game);
        game.pileRank = getPileRank(game);
      } else {
        game.pileRank = getPileRank(game);
      }
    }

    await gameRef.update({
      pile: game.pile,
      burnt: game.burnt ? game.burnt : [] ,
      pileRank: game.pileRank
    }).then(async () => {
      if (goToNextPlayer) {
        await nextPlayer(gameRef);
      }
    });
  });
} 

const nextPlayer = async (gameRef: admin.database.Reference): Promise<void> => {
  await gameRef.once('value').then(async (gameSnapshot) => {
    const {players, currentPlayer, direction} = gameSnapshot.val();
    const playersId = Object.keys(players);
    const currentUserIndex = playersId.findIndex((playerId) => playerId === currentPlayer);
    const nextIndex = currentUserIndex + direction;
    let player: string;
    if (direction === GameDirection.Left) {
      player = nextIndex >= 0 ? playersId[nextIndex] : playersId[playersId.length - 1];
    } else {
      player = nextIndex <= playersId.length - 1 ? playersId[nextIndex] : playersId[0];
    }
    
    await gameRef.update({
      currentPlayer: player
    })
  });
}

const toggleDirection = (game: IGame): void => {
  game.direction = game.direction === GameDirection.Left ? GameDirection.Right : GameDirection.Left;
}

const getPileRank = (game: IGame, index?: number): ICard | null => {
  const i = index !== undefined ? index : game.pile.length - 1;
  if (i < 0) {
    return null;
  }
  const card = game.pile[i];
  if (card && [Rank.THREE, Other.JOKER].includes(card.rank)) {
    return getPileRank(game, i - 1);
  }

  return card;
}

export const takePile = functions.https.onRequest(async (request, response) => {
  addCors(response);
  if (request.body.data) {
    const {playerId, gameId} = request.body.data;
    const gameRef = admin.database().ref(`game/${gameId}`);
    await gameRef.once('value').then(async (gameSnapshot) => {
      const {pile, players} = gameSnapshot.val();
      const player: Player = players[playerId];
      player.hand.push(...pile);

      await gameRef.child(`players/${playerId}`).update({
        ...player
      });

      await gameRef.update({
        pile: [],
        pileRank: null,
      });

      await nextPlayer(gameRef);

      response.send({ data: {success: true}});
    });

  } else {
    response.send({});
  }

});

interface DealFromFaceUpData {
  gameId: string;
  playerDeck: Player;
  cards: ICard[];
}

export const dealCardsFromFaceUp = functions.https.onRequest(async (request, response) => {
  addCors(response);
  if (request.body.data) {
    const {gameId, playerDeck, cards} = request.body.data as DealFromFaceUpData;
    const player = new Player(playerDeck.id, playerDeck.username, playerDeck.hand, playerDeck.faceUp, playerDeck.faceDown);
    const gameRef = admin.database().ref(`game/${gameId}`);
    let clearPile = false;
    await gameRef.once('value').then(async (gameSnapshot) => {
      const game: IGame = gameSnapshot.val();
      if (!game.pile) {
        game.pile = [];
      }

      cards.forEach((card) => {
        card.position = game.pile.length - 1;
        game.pile.push(card);
      });

      if (game.pileRank && !ShitheadRules.canLay(cards[0], game.pileRank)) {
        player.takeCards(game.pile);
        clearPile = true;
      }

      await gameRef.child(`players/${player.id}`).update({
        ...player.getJson()
      });

      await gameRef.update({
        pile: !clearPile ? game.pile : [],
        pileRank: !clearPile ? getPileRank(game) : null,
      });

      if (cards[0].rank !== Rank.TEN) {
        await nextPlayer(gameRef);
      }
    });

  } else {
    response.send({});
  }
});

// export GOOGLE_APPLICATION_CREDENTIALS="/Users/kemy/Documents/JSLab/firebase/shithead-283014-691b28a8ac2b.json"
