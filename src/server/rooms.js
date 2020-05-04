const { connect, disconnect, getRoomsFor, broadcast, send } = require('./sockets');

const rooms = {};

const broadcastState = (roomId) => broadcast(
  {type: 'state', ...rooms[roomId].state},
  Object.keys(rooms[roomId].participants),
);

const updateParticipantCount = (roomId) => {
  rooms[roomId].state.count = Object.keys(rooms[roomId].participants).length;
};

exports.getRoom = (roomId) => rooms[roomId];

exports.broadcastState = broadcastState;

exports.setState = (roomId, prop, value) =>{  
  rooms[roomId].state[prop] = value;
}

exports.createRoom = (hostId, roomId, game) => {
  const lowerRoomId = roomId.toLowerCase();
  connect(hostId, lowerRoomId);
  rooms[lowerRoomId] = { participants: {} };
  rooms[lowerRoomId].participants[hostId] = { state: 'not-ready' };
  rooms[lowerRoomId].state = { game, count: 1 };
};

const leaveRoom = (participantId, roomId) => {
  if(!rooms[roomId]) return;
  delete rooms[roomId].participants[participantId];
  updateParticipantCount(roomId);
  broadcastState(roomId);
};

exports.leaveAllRooms = (participantId) => {
  getRoomsFor(participantId).forEach(roomId => leaveRoom(participantId, roomId));
  disconnect(participantId);
}

exports.updateReadiness = (roomId) => {
  rooms[roomId].state.readyCount = Object
    .values(rooms[roomId].participants)
    .filter(x => x.state === 'ready')
    .length;
  if(rooms[roomId].state.readyCount === rooms[roomId].state.count) {
    rooms[roomId].state.status = 'ready';
  }
};

exports.joinRoom = (participantId, roomId) => {
  const cleanRoomId = roomId;
  if(!rooms[cleanRoomId]) {
    return send({type:'noRoom', roomId: cleanRoomId}, participantId);
  }
  rooms[cleanRoomId].participants[participantId] = {state: 'not-ready'};
  connect(participantId, cleanRoomId);
  updateParticipantCount(cleanRoomId);
  broadcastState(cleanRoomId);
};