const WebSocketServer = require('ws').Server;

const wsClients = {};

const id = () => Math.floor(Math.random()*10000000000);

exports.initWebSocket = ({server, games, createRoom, joinRoom, leaveAllRooms}) => {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws) => {

    const connId = id();
    console.log('connection up', connId);

    wsClients[connId] = { ws, rooms: [] };

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
      const signal = JSON.parse(message);
      console.log(signal.type, signal.roomId);
      switch(signal.type) {
        case 'join':
          joinRoom(connId, signal.roomId);
          break;
        case 'host':
          createRoom(connId, signal.roomId, signal.game);
          break;
        case 'hatgame-round-ends':
          games.hatgame.endround(signal.roomId, signal.progress, signal.isDeckEmpty);
          break;
        case 'hatgame-add-name':
          games.hatgame.addName(signal.roomId, signal.name);
          break;
        case 'hatgame-start':
          games.hatgame.start(signal.roomId, connId);
          break;
        case 'scattergories-add-category':
          games.scattergories.addCategory(signal.roomId, signal.category);
          break;
        case 'scattergories-remove-category':
          games.scattergories.removeCategory(signal.roomId, signal.category);
          break;
        case 'scattergories-start':
          games.scattergories.start(signal.roomId, connId);
          break;
        case 'scattergories-ready':
          games.scattergories.ready(connId, signal.roomId);
          break;
        default:
          console.log(signal);
      }
    });

    ws.on('close', () => {
      leaveAllRooms(connId);
    });

  });
}

exports.broadcast = (message, people) => {
  people.forEach(person => wsClients[person].ws.send(JSON.stringify(message)));
};

exports.send = (message, person) => {
  wsClients[person].ws.send(JSON.stringify(message));
};

exports.disconnect = (participantId) => {
  delete wsClients[participantId];
};

exports.getRoomsFor = (participantId) => wsClients[participantId].rooms;

exports.connect = (participantId, roomId) => {
  wsClients[participantId].rooms.push(roomId);
};