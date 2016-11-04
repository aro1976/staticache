/**
 * Created by aoliveir on 04/11/16.
 */

var fileService = require("../services/FileServices");

exports.createFile = function (request, reply) {
    var data = request.payload;

    if (data.file) {

        console.log("request.params",JSON.stringify(data.file.hapi));

        var meta = {
            "content_type": data.file.hapi.headers["content-type"],
            "filename": data.file.hapi.filename
        };

        console.log("headers ",JSON.stringify(data.file.hapi.headers));

        fileService.store(data.file, meta, function (data) {
            reply(JSON.stringify(data));
        });
    }
};

exports.fetchFile = function (request, reply) {
    console.log("get static "+JSON.stringify(request.params));
    reply();
}

