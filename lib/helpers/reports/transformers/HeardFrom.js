

const HeaderField = require('./HeaderField');

module.exports = class HeardFrom extends HeaderField {
	title() {
		return 'Heard from';
	}

	value() {
		return this.attachments.length + (this.attachments.length === 1 ? ' person' : ' people');
	}

	shortValue() {
		return true;
	}
};
