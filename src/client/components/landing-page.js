import { hideAllElements } from '../scripts/main';
import { showGameChooser } from './game-chooser';
import { showJoinDialog } from './join-page';

const $landingButtons = document.getElementById('landing-buttons');
const $hostBtn = document.getElementById('hostBtn');
const $joinBtn = document.getElementById('joinBtn');

const showLandingButtons = () => {
  hideAllElements();
  $landingButtons.style.display = 'grid';
}

const wireUpLandingButtons = () => {
  $hostBtn.addEventListener('click', showGameChooser);
  $joinBtn.addEventListener('click', showJoinDialog);
}

export {
  showLandingButtons,
  wireUpLandingButtons,
}