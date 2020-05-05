const { broadcastState, send, getRoom } = require('../rooms.js');

const start = ({roomId, connId}) => {
  const room = getRoom(roomId);
  room.state.status = 'playing';
  broadcastState(roomId);
  send({type:'state', status:'names', names: room.names}, connId);
}
const addName = ({roomId, name}) => {
  const room = getRoom(roomId);
  if(!room.names) room.names = [];
  room.names.push(name);
  room.state.numberOfNames = room.names.length;
  broadcastState(roomId);
}

const endRound = ({roomId, progress, isDeckEmpty}) => {
  const room = getRoom(roomId);
  room.state.status = 'results';
  if(!room.doneNames) room.doneNames = [];
  room.names.forEach((name) => {
    if(progress[name]) room.doneNames.push(name);
  });
  room.names = room.names.filter(name => !progress[name]);
  const namesLeft = room.names.length;
  if(namesLeft === 0) {
    room.names = room.doneNames;
    room.doneNames = [];
    room.state.allGone = true;
  } else {
    room.state.allGone = false;
  }
  room.state.namesLeft = room.names.length;
  room.state.progress = progress;
  broadcastState(roomId);
}

module.exports = {
  addName,
  start,
  endRound,
};