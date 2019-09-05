

let Sequelize = require('sequelize');
let db = {};

let conString = process.env.DATABASE_URL || 'postgres://localhost/standup';

let sequelize = new Sequelize(conString, {
	logging: false
});
let models = ['Channel','Standup'];
models.forEach((file) => {
	let model = sequelize.import(__dirname + '/' + file);
	db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
	if ('associate' in db[modelName]) {
		db[modelName].associate(db);
	}
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
