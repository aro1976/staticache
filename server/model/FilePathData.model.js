/**
 * Created by aoliveir on 04/11/16.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    var model = sequelize.define('FilePathData', {
        // id : {
        //     type: DataTypes.INTEGER,
        //     primaryKey: true,
        //     autoIncrement: true
        // },
        file_path_id: {
            type: DataTypes.INTEGER,
            // unique: 'file_path_data_un'
            primaryKey: true,
        },
        file_data_id: {
            type: DataTypes.STRING(40),
            // unique: 'file_path_data_un',
            primaryKey: true,
            references: null
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: "file_path_data"

    });

    return model;
}