// Mock sequelize
let path = require('path');
let mockRequire = require('mock-require');

function noop() { return Promise.resolve(); }

// Default all used methods to no-ops that resolve
// an empty promise.  Tests that rely on other
// behavior should stub these methods individually.
mockRequire('sequelize', function () {
	this.import = function(filepath) {
		return {
			name: path.basename(filepath),
			findOrCreate: noop,
			update: noop,
			findAll: noop,
			findOne: noop,
			upsert: noop,
			destroy: noop
		};
	};
});
