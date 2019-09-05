

module.exports = class HeaderField {
	constructor(attachments) {
		this.attachments = attachments;
	}

	shortValue() {
		return false;
	}

	formatValues() {
		let templates =  this.values().map((value) => '- ' + value + '\n');
		return templates.join('');
	}

	value() {
		let values = this.values();
		if (!values || !values.length) { return; }
		return this.formatValues();
	}

	field() {
		if (!this.value()) { return; }

		return {
			title: this.title(),
			value: this.value(),
			short: this.shortValue()
		};
	}
};
