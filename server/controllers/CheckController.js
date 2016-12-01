/**
 * Created by aoliveir on 04/11/16.
 */

const fs          = require('fs');
const boom        = require('boom');
const config      = require('../../conf/config.json')[process.env.NODE_ENV || 'dev'];
const db          = require('../database');
const fileService = require("../services/FileService");
const log4js      = require('log4js');
const logger      = log4js.getLogger("CheckController");

var checkController = {
    check: function (request, reply) {
        logger.info("check from", request.info.remoteAddress);
        return reply();
    },
};

module.exports = checkController;

