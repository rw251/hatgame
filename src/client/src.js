const wsConfig = { 
  wssHost: window.location.hostname === 'localhost'
    ? `ws://${window.location.host}`
    : `wss://${window.location.host}`
};
const wsc = new WebSocket(wsConfig.wssHost);

let connId;

const $landingButtons = document.getElementById('landing-buttons');
const $pages = Array.from(document.querySelectorAll('.page'));

const hideAllElements = () => {
  $pages.forEach($page => $page.style.display = 'none');
}
const showLandingButtons = () => {
  hideAllElements();
  $landingButtons.style.display = 'grid';
}

function init() {
  const [, action, value] = window.location.pathname.split('/');
  console.log(action, value);
  if(action === 'host') {
    $hosting.style.display = 'grid';
  } else if(action === 'join') {
    $joining.style.display = 'grid';
  } else {
    showLandingButtons();
    $hostBtn.addEventListener('click', createRoom);
    $joinBtn.addEventListener('click', joinRoom);
  }
}

async function createRoom() {
  showHostingBar();
  setRoomLink(connId);
  wsc.send(JSON.stringify({ type:'host' }));
  if(!localStream) {
    showLoader();
    await openUserMedia().catch(err => console.log(err));
    hideLoader();
  } 
}

async function joinRoom() {
  roomId = document.querySelector('#room-id').value;
  console.log('Join room: ', roomId);
  console.log(`Current room is ${roomId} - You are the callee!`);
  await joinRoomById(roomId);
}

async function joinRoomById(roomId) {
  if(!localStream) {
    showLoader();
    await openUserMedia().catch(err => console.log(err));
    hideLoader();
  }

  wsc.send(JSON.stringify({type: 'join', roomId}));

  await initiatePeerConnectionAndSendOffer(roomId);
}

wsc.onmessage = function (evt) {
  const signal = JSON.parse(evt.data);
  switch (signal.type) {
    case 'id':
      connId = signal.connId;
      console.log(connId);
      break;
    case 'ice':
      $remoteVideos[signal.remoteId].peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
      break;
    case 'offer':
      initiatePeerConnection(signal.remoteId)
        .then(() => $remoteVideos[signal.remoteId].peerConnection.setRemoteDescription(new RTCSessionDescription(signal.offer)))
        .then(() => $remoteVideos[signal.remoteId].peerConnection.createAnswer())
        .then(answer => $remoteVideos[signal.remoteId].peerConnection.setLocalDescription(answer))
        .then(() => wsc.send(JSON.stringify({type: 'answer', remoteId: signal.remoteId, answer: $remoteVideos[signal.remoteId].peerConnection.localDescription})));
      break;
    case 'answer':
      $remoteVideos[signal.remoteId].peerConnection.setRemoteDescription(new RTCSessionDescription(signal.answer));
      break;
    case 'newMember':
      initiatePeerConnectionAndSendOffer(signal.id);
      break;
    case 'participantList':
      initiatePeerConnectionAndSendOffers(signal.participants);
      break;
    default:
      console.log(signal);
  }
  return;
};

init();
