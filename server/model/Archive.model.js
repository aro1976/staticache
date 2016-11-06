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
        },
        original:{
            type: DataTypes.STRING(40)
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: "archive",
        instanceMethods: {
            toJSON: function() {
                var json = {
                    id: this.id,
                    content_type: this.content_type,
                    path: this.path,
                    size: this.size
                };
                if (this.width>0) { json.width = this.width };
                if (this.height>0) { json.height = this.height };
                if (this.original) { json.original = this.original };
                return json;
            }
        }
    });

    return model;
}