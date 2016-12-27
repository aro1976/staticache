/**
 * Created by aoliveir on 04/11/16.
 */

var config	= require('../conf/config.json')[process.env.NODE_ENV || 'dev'];
var Sequelize = require('sequelize');
const log4js  = require('log4js');
const logger  = log4js.getLogger("database");

if (process.env.STATICACHE_DB) {
    config.database.connection = process.env.STATICACHE_DB;
}

var db = {
    sequelize: new Sequelize(
        config.database.connection,
        config.database.options)
};

db.FileData = db.sequelize.import('./model/FileData.model');
db.FilePath = db.sequelize.import('./model/FilePath.model');
db.FilePathData = db.sequelize.import('./model/FilePathData.model');

const models = db.sequelize.models;
Object.keys(models)
    .map(name => models[name])
.filter(model => model.associate)
.forEach(model => model.associate(models));

db.sequelize.sync().then(function() {
    logger.info('seeding');

   db.FilePath.findOrCreate({
            where: {
                path: 'index.html'
            }
        })
        .spread(function(filePath, initialized) {
            console.log(filePath.toJSON());
            db.FileData.findOrCreate({
                    where: {
                        id: '84cf4b9279cedadcb5e5c19572c7ec752e53ce17'
                    },
                    defaults: {
                        size: 459,
                        'content_type': 'text/html'
                    }
                })
                .spread(function(fileData, created) {
                    console.log(fileData.toJSON());
                    filePath.addFileData(fileData);
                    filePath.save();
                })
        });

    db.FilePath.find({
        where:{
            path:'index.html'
        },
        include: db.FileData
        }).then(function(file) {
        if (file!=null) {
            console.log("file", file.toJSON());
            file.getFileData();
        }

    });
});

module.exports = db;