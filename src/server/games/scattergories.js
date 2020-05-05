const { broadcastState } = require('../rooms.js');

const addCategory = ({roomId, category}) => {
  if(!rooms[roomId].state.categories) rooms[roomId].state.categories = [];
  rooms[roomId].state.categories.push(category);
  broadcastState(roomId);
}
const removeCategory = ({roomId, category}) => {
  rooms[roomId].state.categories = rooms[roomId].state.categories.filter(x => x !== category);
  broadcastState(roomId);
}
const start = ({roomId}) => {
  rooms[roomId].state.status = 'waiting';
  broadcastState(roomId);
}
const ready = ({participantId, roomId}) => {
  rooms[roomId].participants[participantId].state = 'ready';
  updateReadiness(roomId);
  broadcastState(roomId);
}

module.exports = {
  addCategory,
  removeCategory,
  start,
  ready,
};