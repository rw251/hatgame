import { joinRoom } from './scripts/room-management';
import { initWebSocket } from './scripts/web-sockets';
import { showLandingButtons, wireUpLandingButtons } from './components/landing-page';
import { showParticipantBar } from './components/game-bar';
import { updateGameState, showGameChooser, wireUpGameChooser } from './components/game-chooser';
import { wireUpJoinPage, showJoinDialog } from './components/join-page';
import { initializeHatGame } from './games/hatgame';
import { initializeScattergories } from './games/scattergories';

const { wsc } = initWebSocket();

wireUpLandingButtons();
wireUpGameChooser();
wireUpJoinPage();
  
initializeHatGame();
initializeScattergories();

const displayPage = (pathname) => {
  // / - landing page
  // /host - host a new game
  // /join - join a new game
  // /sadfsd - a room

  const [, roomId] = pathname.split('/');
  console.log(roomId);
 
  if(!roomId) {
    showLandingButtons();
  } else if(roomId === 'host') {
    showGameChooser();
  } else if (roomId === 'join') {
    showJoinDialog();
  } else {
    joinRoom(roomId);
    showParticipantBar();
  }
}

window.onpopstate = () => {
  displayPage(document.location.pathname);
};

function init() {
  displayPage(window.location.pathname);  
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

