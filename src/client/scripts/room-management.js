import { createRoomOnServer, joinRoomOnServer } from './web-sockets';

const createRoom = (game) => {
  return createRoomOnServer(game);
}

const joinRoom = (localRoomId) => {
  
  document.querySelectorAll('.guest-only').forEach(el => el.classList.remove('guest-only'));

  // update url if not already
  const newUrl = `/${localRoomId}`;
  if(window.location.pathname !== newUrl) {
    window.history.pushState(null, null, newUrl);
  }

  console.log(`Joining room ${localRoomId}`);

  joinRoomOnServer(localRoomId);
}

export {
  createRoom,
  joinRoom,
}