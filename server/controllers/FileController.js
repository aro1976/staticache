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

            logger.info("headers: ", JSON.stringify(data.file.hapi.headers));

            fileService.store(data.file, meta, function (data) {
                replyCreate(data)
                    .type('application/json');
            });
        }
    },
    fetchFile: function (request, reply) {
        logger.info("fetching file", request.params.id);
        db.FileData.findById(request.params.id)
            .then(function(fileData) {
                logger.debug("found",JSON.stringify(fileData));
                if (fileData) {
                    let path = fileService.convertIdToPath(fileData.id);
                    logger.debug("replying", path);
                    let file = fs.createReadStream(path);

                    reply(file)
                        .type(fileData.content_type)
                        .etag(fileData.id.toEtag)
                        .bytes(fileData.size);
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
        logger.info("searching file", request.params.path);
        var whereClause = {
            where: {
                path: request.params.path,
            }
        };
        db.FilePath.findOne(whereClause)
            .then(function(filePath) {
                logger.debug("found",JSON.stringify(filePath));
                if (filePath) {
                    if (filePath.path.match(/\.(js|css|htm|html)/)) {
                        // check etag
                        var reqEtag = request.headers['if-none-match'] ? request.headers['if-none-match'].slice(1,9) : null;
                        logger.debug("match etag:",filePath.toEtag(), reqEtag, filePath.toEtag()==reqEtag);

                        if (reqEtag) {
                            //not modified
                            reply().code(304);
                        } else {
                            db.FileData.findById(filePath.file_data_id)
                                .then(function(fileData) {
                                    if (fileData) {
                                        let path = fileService.convertIdToPath(fileData.id);
                                        logger.debug("replying", path);
                                        let file = fs.createReadStream(path);

                                        reply(file)
                                            .type(fileData.content_type)
                                            .etag(fileData.toEtag())
                                            .bytes(fileData.size);
                                    } else {
                                        logger.info("not found");
                                        return reply(boom.notFound());
                                    }
                                })
                                .catch(function(err) {
                                    logger.error('fetching error ', err);
                                    return reply(boom.internal("cannot fetch file"));
                                });
                        }

                    } else {
                        reply()
                            .redirect("/cache/"+filePath.file_data_id);
                    }

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

