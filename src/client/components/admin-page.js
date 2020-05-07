import { hideAllElements } from '../scripts/main';
import { admin } from '../scripts/web-sockets';

const $adminPage = document.getElementById('admin-page');
const $adminStatus = document.getElementById('admin-status');

const showAdminPage = () => {  
  hideAllElements();
  $adminPage.style.display = 'block';

  admin();
}

const hatGameHtml = (room) => `<ul>
  <li>Participants: [${Object.keys(room.participants).join(', ')}]</li>
  <li>Names: [${room.names ? room.names.map(x=>x.name).join(', ') : ''}]</li>
  <li>Done names: [${room.doneNames ? room.doneNames.map(x=>x.name).join(', ') : ''}]</li>
  <li>State: ${room.state.progress
    ? `${room.state.progress.firstRound
      ? `${room.state.status === 'results'
        ? 'Waiting for first round to start'
        : 'Playing the first round'}`
      : `${room.state.status === 'results'
        ? 'Waiting for a round to start'
        : 'Playing a round'}`}`
    : 'Not started'
  }</li>
  </ul>`;

const updateAdminPage = ({type, ...rooms}) => {
  const roomIds = Object.keys(rooms);
  if(roomIds.length === 0) {
    $adminStatus.innerText = 'There are no rooms at the moment.'
  } else {
    $adminStatus.innerHTML = roomIds
      .map(x => {
        if(rooms[x].state.game==='hatgame') return hatGameHtml(rooms[x]);
      })
      .join('');
  }
  console.log(rooms);
}

export {
  showAdminPage,
  updateAdminPage,
}