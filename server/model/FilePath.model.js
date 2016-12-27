/**
 * Created by aoliveir on 04/11/16.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    var model = sequelize.define('FilePath', {
        id : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        path: {
            type: DataTypes.STRING(),
            unique: 'file_path_data_un'
        },
    }, {
        timestamps: true,
        underscored: true,
        tableName: "file_path",
        classMethods: {
            associate: function(models) {
                model.belongsToMany(models.FileData, {
                    through: {
                        model: models.FilePathData,
                        unique: models.FilePathData
                    },
                    foreignKey: 'file_path_id',
                    constraints: false
                });
            }
        }
    });

    return model;
}