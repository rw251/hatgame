import { joinRoom } from './scripts/room-management';
import { initWebSocket } from './scripts/web-sockets';
import { showLandingButtons } from './components/landing-page';
import { showParticipantBar } from './components/game-bar';
import { updateGameState } from './components/game-chooser';
import { wireUpJoinPage } from './components/join-page';
import { initializeHatGame } from './games/hatgame';
import { initializeScattergories } from './games/scattergories';

const { wsc } = initWebSocket();

function init() {
  const [, roomId] = window.location.pathname.split('/');
  console.log(roomId);
  
  initializeHatGame();
  initializeScattergories();
 
  if(roomId) {
    joinRoom(roomId);
    showParticipantBar();
  } else {
    showLandingButtons();
    wireUpJoinPage();
  }
}

wsc.onmessage = function (evt) {
  const signal = JSON.parse(evt.data);
  switch (signal.type) {
    case 'state':
      updateGameState(signal);
      break;
    default:
      console.log('Unrecognised signal', signal);
  }
};

init();

