module.exports = function() {
    return function(input) {
		return String(input).replace(/<(?:.|\n)*?>/gm, '');
    }
}