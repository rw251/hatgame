import { hideAllElements } from '../scripts/main';
import { createRoom } from '../scripts/room-management';
import { showHostingBar, setRoomLink, setParticipantCount } from './game-bar';
import { hatgame } from '../games/hatgame';
import { scattergories } from '../games/scattergories';
import { exlibris } from '../games/exlibris';

const $gameChooser = document.getElementById('game-chooser');

const $games = {
  scattergories,
  hatgame,
  exlibris,
};

function showRound(state) {
  $games[game].round.style.display = 'grid';
  $games[game].setup.style.display = 'none';
  $games[game].showRound(state);
}

let game;

const showGame = ({ game, ...state}) => {
  $games[game].setup.style.display = 'block';
  $games[game].init(state);
};

const showGameChooser = () => {
  // update url if not already
  const newUrl = '/host';
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }
  hideAllElements();
  $gameChooser.style.display = 'grid';
}

const wireUpGameChooser = () => {
  document.querySelectorAll('.game-chooser').forEach(($game) => {
    $game.addEventListener('click', async (e) => {
      game = $game.dataset.game;
      document.querySelectorAll('.host-only').forEach(el => el.classList.remove('host-only'));
      showHostingBar();
      showGame({ game });
      const roomId = createRoom(game);      
      setRoomLink(roomId);
    });
  });
}

const setGame = (proposedGame) => {
  game = proposedGame;
};

const updateGameState = (state) => {
  if(state.count) setParticipantCount(state.count);
  if(state.game) setGame(state.game); 
  $games[game].updateState(state);
}

export {
  showGameChooser,
  wireUpGameChooser,
  updateGameState,
}