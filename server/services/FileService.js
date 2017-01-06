/**
 * Created by aoliveir on 04/11/16.
 */
const crypto = require('crypto');
const tmp    = require('tmp');
const boom   = require('boom');
const fs     = require('fs');
const sharp  = require('sharp');
const log4js = require('log4js');
const logger = log4js.getLogger("FileService");

const config = require('../../conf/config.json')[process.env.NODE_ENV || 'dev'];
const db     = require('../database');

var mkdir = function(path) {
    logger.debug("checking path",path);
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
}

exports.convertIdToPath = function(digest) {
    return config.storage.data + "/" + digest.slice(0, 2) + "/"+ digest.slice(2, 4) + "/" + digest.slice(4);
};

exports.store = function(origin, meta, replyStore) {
    const hash = crypto.createHash('sha1');
    let tmpobj = tmp.fileSync({keep:true,dir:config.storage.temp});
    let file = fs.createWriteStream(tmpobj.name);
    let size = 0;

    file.on('error', function (err) {
        console.error(err);
        tmpobj.removeCallback();
    });

    origin.on('data', function(data) {
        hash.update(data);
        size+=data.length;
    });

    origin.on('end', function (err) {
        meta['id'] = hash.digest('hex');
        meta["size"] = size;

        db.FileData.findOrCreate({
            where: {
                id: meta['id']
            },
            defaults: meta
        }).spread(function (fileData, created) {
            if (created) {
                mkdir(config.storage.data + "/" + meta['id'].slice(0, 2));
                mkdir(config.storage.data + "/" + meta['id'].slice(0, 2) + "/" + meta['id'].slice(2, 4));

                var filepath = exports.convertIdToPath(meta['id']);
                logger.debug("storing at: " + filepath);
                fs.renameSync(tmpobj.name, filepath);
            } else {
                logger.debug(meta['id'] + " already exists, skipping");
            }

            db.FilePath.findOrCreate({
                where: {
                    path: meta['path']
                }
            }).spread(function (filePath, created) {
                logger.debug("associating: %s to %s", filePath.path, fileData.id);
                filePath.setFileData(fileData);

                return replyStore(meta);
            });

        });
    });

    origin.pipe(file);
};

exports.mkdir = mkdir;