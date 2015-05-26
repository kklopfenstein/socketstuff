var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.use(express.static('public'));

var board = {};

var ids = 0;
var users = {};

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('add piece', function (data) {
    addPiece(socket, data); 
  });

  socket.on('get id', function (data) {
    sendId(socket);
  });
  getState(socket);
  socket.on('clear pos', function (data) {
    clearPos(data);
  });
  socket.on('identify', function(data, fn) {
    identify(data, fn); 
  });
});


function identify(data, fn) {
  if (data !== undefined && data.length > 4 && users[data] == undefined) {
    console.log('user ' + data + ' has entered the game');
    users[data] = {score: 0};
    fn(true);
  } else {
    fn(false);
  }
}

function clearPos(positions) {
  if (positions !== null && positions.length > 0) {
    console.log('clearing ' + positions.length + ' positions');
    for(var i = 0; i < positions.length; i++) {
      var data = positions[i];
      if (data !== undefined && data.x !== undefined
        && data.y !== undefined) {
        console.log('removing pieces at: ' + data.x + ',' + data.y);
        if (board[data.x] !== undefined) {
          if (board[data.x][data.y] !== undefined) {
            userId = board[data.x][data.y].id;
            if (userId !== undefined) {
              console.log(userId + ' lost a point');
              if (users[userId] !== undefined)
                users[userId].score = users[userId].score - 1;
            }
          }
          board[data.x][data.y] = {}
        }
      }
    }
  }
}

function addPiece(socket, data) {
  console.log("adding piece: " + data);
  if (data !== undefined && data.id !== undefined
      && data.x !== undefined && data.y !== undefined) {
    console.log(data.x + ',' + data.y);
    if (board[data.x] === undefined) {
      board[data.x] = { }
    }
    board[data.x][data.y] = data;
    if (users[data.id] !== undefined) {
      users[data.id].score = users[data.id].score + 1;
      console.log(data.id + ' gained a point');
    }
    socket.emit('success', { success: true });
  } else {
    socket.emit('success', { success: false });
  }
}

function getState(socket) {
  socket.on('get pieces', function (data) {
    socket.emit('pieces', board);
  });
}

function sendId(socket) {
  socket.emit('send id', { id: ids });
  ids++;
}

