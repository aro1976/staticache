/**
 * Created by aoliveir on 04/11/16.
 */

const fs          = require('fs');
const boom        = require('boom');
const config      = require('../../conf/config.json')[process.env.NODE_ENV || 'dev'];
const db          = require('../database');
const fileService = require("../services/FileService");


var fileController = {
    createFile: function (request, replyCreate) {
        var data = request.payload;

        if (data.file) {

            console.log("path: ",JSON.stringify(request.payload.path));

            var meta = {
                "content_type": data.file.hapi.headers["content-type"],
                "path": request.payload.path,
            };

            if (request.payload.scale) {
                meta["scale"]= request.payload.scale
            }

            console.log("headers: ", JSON.stringify(data.file.hapi.headers));

            fileService.store(data.file, meta, function (data) {
                replyCreate(data)
                    .type('application/json');
            });
        }
    },
    fetchFile: function (request, reply) {
        console.log("fetching file", request.params.id);
        db.Archive.findById(request.params.id)
            .then(function(archive) {
                console.log("found",JSON.stringify(archive));
                if (archive) {
                    let path = fileService.convertIdToPath(archive.id);
                    console.log("replying", path);
                    let file = fs.createReadStream(path);

                    reply(file)
                        .type(archive.content_type)
                        .etag(archive.id.slice(0,8))
                        .bytes(archive.size);
                } else {
                    console.log("not found");
                    return reply(boom.notFound());
                }
            })
            .catch(function(err) {
                console.error('fetching error ', err);
                return reply(boom.internal("cannot fetch file"));
            });
    }
};

module.exports = fileController;

