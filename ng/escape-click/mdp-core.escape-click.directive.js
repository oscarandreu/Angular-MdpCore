module.exports = function() {
    return {
		restrict: 'A',
		link: function(scope, elm, attrs) {
			var preventDefault = function(event) {
				event.preventDefault();
			};
			
			$(elm).off('click', preventDefault).on('click', preventDefault);
		}
	};
}