/**
 * Created by aoliveir on 04/11/16.
 */
const crypto = require('crypto');
const tmp    = require('tmp');
const fs     = require('fs');
const sizeOf = require('image-size');
const sharp  = require('sharp');

const config = require('../../conf/config.json')[process.env.NODE_ENV || 'dev'];
const db     = require('../database');

var mkdir = function(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

exports.store = function(origin, meta, reply) {
    const hash = crypto.createHash('sha1');
    var tmpobj = tmp.fileSync();
    var file = fs.createWriteStream(tmpobj.toString());

    file.on('error', function (err) {
        console.error(err);
        tmpobj.removeCallback();
    });

    origin.on('data', function(data) {
        hash.update(data);
    });

    origin.on('end', function (err) {
        var digest = hash.digest('hex');


        mkdir(config.storage.path + "/" + digest.slice(0, 2));
        mkdir(config.storage.path + "/" + digest.slice(0, 2) + "/"+ digest.slice(2, 4));

        var filepath = config.storage.path + "/" + digest.slice(0, 2) + "/"+ digest.slice(2, 4) + "/" + digest.slice(4);
        console.log("storing at: "+filepath);
        fs.renameSync(tmpobj.toString(),filepath);

        var dimensions = sizeOf(filepath);
        meta["id"] = digest;
        meta["size"]   = fs.statSync(filepath)["size"];
        meta["width"]  = dimensions.width;
        meta["height"] = dimensions.height;

        var archive = db.Archive.create(meta);

        console.log(JSON.stringify(meta));

        reply(meta);
    })

    origin.pipe(file);
}