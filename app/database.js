/**
 * Created by aoliveir on 04/11/16.
 */

var config	= require('../conf/config.json')[process.env.NODE_ENV || 'dev'];
var Sequelize = require('sequelize');

var db = {
    sequelize: new Sequelize(
        config.database.database,
        config.database.username,
        config.database.password,
        config.database.options)
};

db.Archive = db.sequelize.import('./model/Archive.model');

module.exports = db;