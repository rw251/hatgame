const express = require('express');
const morgan = require('morgan');
const server = require('http').createServer();
const path = require('path');

const hatgame = require('./games/hatgame.js');
const scattergories = require('./games/hatgame.js');

const { 
  createRoom, 
  joinRoom,
  leaveAllRooms,
  initRoomManagement,
} = require('./rooms.js');
const { initWebSocket } = require('./sockets.js');

const port = process.env.PORT || 3091;

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// for heroku we are behind a proxy so req.secure is false as
// the internal traffic is http. If we "trust the proxy", then
// we truxt the x-forwarded--blah header and req.secure is true
if (process.env.NODE_ENV === 'production') {
  console.log('Production and heroku so lets do some http to https redirects');
  app.enable('trust proxy');
  app.use((req, res, next) => {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

app.use(express.static(path.join(__dirname, '..', '..', 'public_html')));

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, '..', '..', 'public_html', 'index.html'))
});

const games = {
  scattergories,
  hatgame,
};

initWebSocket({ server, games, createRoom, joinRoom, leaveAllRooms });

server.on('request', app);

server.listen(port, err => {
  if (err) throw err
  console.log(`> Ready on server http://localhost:${port}`)
})
