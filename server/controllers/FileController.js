/**
 * Created by aoliveir on 04/11/16.
 */

const fs          = require('fs');
const boom        = require('boom');
const config      = require('../../conf/config.json')[process.env.NODE_ENV || 'dev'];
const db          = require('../database');
const fileService = require("../services/FileService");
const log4js      = require('log4js');
const logger      = log4js.getLogger("FileController");

var fileController = {
    createFile: function (request, replyCreate) {
        var data = request.payload;

        if (data.file) {

            logger.info("path: ",JSON.stringify(request.payload.path));

            var meta = {
                "content_type": data.file.hapi.headers["content-type"],
                "path": request.payload.path,
            };

            if (request.payload.scale) {
                meta["scale"]= request.payload.scale
            }

            logger.info("headers: ", JSON.stringify(data.file.hapi.headers));

            fileService.store(data.file, meta, function (data) {
                replyCreate(data)
                    .type('application/json');
            });
        }
    },
    fetchFile: function (request, reply) {
        logger.info("fetching file", request.params.id);
        db.Archive.findById(request.params.id)
            .then(function(archive) {
                logger.debug("found",JSON.stringify(archive));
                if (archive) {
                    let path = fileService.convertIdToPath(archive.id);
                    logger.debug("replying", path);
                    let file = fs.createReadStream(path);

                    reply(file)
                        .type(archive.content_type)
                        .etag(archive.id.slice(0,8))
                        .bytes(archive.size);
                } else {
                    logger.info("not found");
                    return reply(boom.notFound());
                }
            })
            .catch(function(err) {
                logger.error('fetching error ', err);
                return reply(boom.internal("cannot fetch file"));
            });
    },
    searchAndRedirect: function (request, reply) {
        logger.info("searching file", request.params.path, request.query.scale);
        var whereClause = {
            where: {
                path: request.params.path,
            }
        };
        if (typeof request.query.scale !== 'undefined') {
            var res = request.query.scale.match(/(\d{1,4})[x|X](\d{1,4})/);
            whereClause.where["width"]=res[1];
            whereClause.where["height"]=res[2];
        } else {
            whereClause.where["original"]=null;
        }
        db.Archive.findOne(whereClause)
            .then(function(archive) {
                logger.debug("found",JSON.stringify(archive));
                if (archive) {
                    reply()
                        .redirect("/cache/"+archive.id);
                } else {
                    logger.error("not found");
                    return reply(boom.notFound());
                }
            })
            .catch(function(err) {
                logger.error('fetching error ', err);
                return reply(boom.internal("cannot fetch file"));
            });
    }
};

module.exports = fileController;

