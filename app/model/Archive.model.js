/**
 * Created by aoliveir on 04/11/16.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    var model = sequelize.define('archive', {
        id: {
            type: DataTypes.STRING(40),
            primaryKey: true
        },
        content_type: {
            type: DataTypes.STRING(100)
        },
        path: {
            type: DataTypes.STRING()
        },
        size: {
            type: DataTypes.INTEGER
        },
        width: {
            type: DataTypes.INTEGER
        },
        height:{
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: "archive"
    });

    return model;
}