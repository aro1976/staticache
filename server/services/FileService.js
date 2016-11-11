/**
 * Created by aoliveir on 04/11/16.
 */
const crypto = require('crypto');
const tmp    = require('tmp');
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

    file.on('error', function (err) {
        console.error(err);
        tmpobj.removeCallback();
    });

    origin.on('data', function(data) {
        hash.update(data);
    });

    origin.on('end', function (err) {
        var digest = hash.digest('hex');
        logger.info("store",JSON.stringify(tmpobj) ,digest, meta);

        mkdir(config.storage.data + "/" + digest.slice(0, 2));
        mkdir(config.storage.data + "/" + digest.slice(0, 2) + "/"+ digest.slice(2, 4));

        db.Archive.findById(digest).then(function(archive) {
            if (archive) {
                logger.info("this image has already been uploaded");
                return replyStore(archive.toJSON());
            } else {
                var filepath = exports.convertIdToPath(digest);

                logger.debug("storing at: "+filepath);
                fs.renameSync(tmpobj.name,filepath);

                meta["id"]     = digest;
                meta["size"]   = fs.statSync(filepath)["size"];

                if (meta["content_type"].match(/image\/.*/)) {
                    sharp(filepath)
                        .metadata()
                        .then(function(metadata) {
                            meta["width"]  = metadata.width;
                            meta["height"] = metadata.height;

                            if (meta.scale && meta.width) {
                                var scales = meta.scale.split(",");
                                logger.debug("scales",scales);
                                var processed = 0;
                                meta.scaled = [];
                                delete meta.scale;

                                for (i = 0; i < scales.length; i++) {
                                    logger.debug("processing image",scales[i]);
                                    var tempMeta = {
                                        path: meta.path,
                                        content_type: meta.content_type,
                                        scale: scales[i],
                                        original: meta.id
                                    };
                                    exports.scale(filepath, tempMeta, function(scaledMeta) {
                                        meta.scaled.push({
                                            id: scaledMeta.id,
                                            width: scaledMeta.width,
                                            height: scaledMeta.height,
                                            size: scaledMeta.size
                                        });
                                        if (meta.scaled.length == scales.length) {
                                            logger.info("finished",JSON.stringify(meta));
                                            var archive = db.Archive.create(meta);
                                            return replyStore(meta);
                                        }
                                    });
                                }
                            } else {
                                logger.info("finished",JSON.stringify(meta));
                                var archive = db.Archive.create(meta);
                                return replyStore(meta);
                            }
                        });
                } else {
                    logger.info("finished",JSON.stringify(meta));
                    var archive = db.Archive.create(meta);
                    return replyStore(meta);
                }
            }
        })
        .catch(function(err) {
            logger.error('(archive error ', err);
            tmpobj.removeCallback();
            return replyStore();
        });

    });
    origin.pipe(file);
};

exports.scale = function (filepath, meta, reply) {
    logger.info("scaling image to", meta.scale);

    var res = meta.scale.match(/(\d{1,4})[x|X](\d{1,4})/);
    if (res) {
        delete meta.scale;
        var tmpresized = tmp.fileSync({dir:config.storage.temp});
        logger.debug("scaling to temporary file: ",tmpresized.name);
        sharp(filepath)
            .resize(parseInt(res[1]), parseInt(res[2]))
            .quality(100)
            .blur(0.4)
            .toFile(tmpresized.name, function(err) {
                exports.store(fs.createReadStream(tmpresized.name),meta,function(resized) {
                    logger.debug("scaled ",resized);
                    tmpresized.removeCallback();
                    meta.id = resized.id;
                    return reply(meta);
                });
            });
    }
    logger.debug("resolution",res);
}

exports.mkdir = mkdir;