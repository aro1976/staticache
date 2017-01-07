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
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: "file_path",
        classMethods: {
            associate: function (models) {
                model.belongsTo(models.FileData, {
                    as: 'FileData',
                    foreignKey: 'file_data_id',
                    constraints: false
                });
            }
        }
        , indexes: [
            // A BTREE index with a ordered field
            {
                name: 'file_path_file_data_ix',
                method: 'BTREE',
                fields: ['file_data_id']
            }
        ],
        instanceMethods: {
            toEtag: function() {
                return this.file_data_id.slice(0,8)
            }
        }
    });

    return model;
}