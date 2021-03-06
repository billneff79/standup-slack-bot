/* eslint-disable new-cap */

let log = require('../getLogger')('Standup model');

module.exports = function (sequelize, DataTypes) {
	log.verbose('Initializing');
	let Standup = sequelize.define('Standup', {
		channel: {
			type: DataTypes.STRING
		},
		date: {
			type: DataTypes.DATEONLY
		},
		user: {
			type: DataTypes.STRING
		},
		userRealName: {
			type: DataTypes.STRING
		},
		thumbUrl: {
			type: DataTypes.STRING
		},
		yesterday: {
			type: DataTypes.STRING(1000)
		},
		today: {
			type: DataTypes.STRING(1000)
		},
		blockers: {
			type: DataTypes.STRING(1000)
		},
		goal: {
			type: DataTypes.STRING(1000)
		}
	});

	return Standup;
};
