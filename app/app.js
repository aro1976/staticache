const config = require('../conf/config.json')[process.env.NODE_ENV || 'dev'];
const fileController = require("./controllers/FileController");
const db = require("./database");

db.sequelize.sync().then(function () {
    console.log("database initialized");
});


const Hapi   = require('hapi');
const joi    = require('joi');


var server = new Hapi.Server({
    debug : {
        request : [ 'error' ]
    },
    connections: {
        routes: {
            cors: true
        }
    }
});

server.connection(config.server);

server.register(require('inert'), () => {});

server.route({
    method: 'POST',
    path: '/static',
    config: {

        payload: {
            output: 'stream',
            parse: true,
            allow: 'multipart/form-data'
        },

        handler: fileController.createFile
    }
});

server.route({
    method: 'GET',
    path: '/static/{id}',
    config: {
        validate: {
            params: {
                id: joi.string().length(40)
            }
        },
        handler: fileController.fetchFile,
        cache: {
            expiresIn: 365 * 24 * 60 * 60 * 1000,
            privacy: 'public'
        }
    }
});

server.start(function () {
    console.log('info', 'Server running at: ' + server.info.uri);
});

