/**
 * Created by aoliveir on 04/11/16.
 */

var config	= require('../conf/config.json')[process.env.NODE_ENV || 'dev'];
var Sequelize = require('sequelize');

if (process.env.STATICACHE_DB) {
    config.database.connection = process.env.STATICACHE_DB;
}

var db = {
    sequelize: new Sequelize(
        config.database.connection,
        config.database.options)
};

db.Archive = db.sequelize.import('./model/Archive.model');

module.exports = db;