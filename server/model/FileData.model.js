/**
 * Created by aoliveir on 04/11/16.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
    var model = sequelize.define('FileData', {
        id: {
            type: DataTypes.STRING(40),
            primaryKey: true
        },
        content_type: {
            type: DataTypes.STRING(100)
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
        tableName: "file_data",
        instanceMethods: {
            toJSON: function() {
                var json = {
                    id: this.id,
                    content_type: this.content_type,
                    size: this.size
                };
                if (this.width>0) { json.width = this.width };
                if (this.height>0) { json.height = this.height };
                return json;
            }
        },
        classMethods: {
            associate: function(models) {
                model.belongsToMany(models.FilePath, {
                    through: {
                        model: models.FilePathData,
                        unique: models.FilePathData
                    },
                    foreignKey: 'file_data_id',
                    constraints: false
                });
            }
        }
    });

    return model;
}