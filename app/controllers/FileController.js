/**
 * Created by aoliveir on 04/11/16.
 */

var fileService = require("../services/FileServices");

exports.createFile = function (request, replyCreate) {
    var data = request.payload;

    if (data.file) {

        console.log(JSON.stringify(request.payload.path));

        var meta = {
            "content_type": data.file.hapi.headers["content-type"],
            "path": request.payload.path,
            "scale": request.payload.scale
        };

        console.log("headers ",JSON.stringify(data.file.hapi.headers));

        fileService.store(data.file, meta, function (data) {
            replyCreate(JSON.stringify(data));
        });
    }
};

exports.fetchFile = function (request, reply) {
    console.log("get static "+JSON.stringify(request.params));
    reply();
}

