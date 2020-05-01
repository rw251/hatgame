import { hideAllElements } from '../scripts/main';
import { showGameChooser, wireUpGameChooser } from './game-chooser';
import { showJoinDialog } from './join-page';

const $landingButtons = document.getElementById('landing-buttons');
const $hostBtn = document.getElementById('hostBtn');
const $joinBtn = document.getElementById('joinBtn');

const showLandingButtons = () => {
  hideAllElements();
  $landingButtons.style.display = 'grid';

  $hostBtn.addEventListener('click', showGameChooser);
  $joinBtn.addEventListener('click', showJoinDialog);

  wireUpGameChooser();
}

export {
  showLandingButtons,
}