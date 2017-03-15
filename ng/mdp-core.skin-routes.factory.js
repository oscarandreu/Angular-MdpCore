module.exports = function($rootScope) {
    var $this = {};
	
	$this.updateForLocale = function(locale) {
		// In config .NET properties in 'UPPERCASE'. In config .php properties in 'UpperCamelCase'.
		if (!$rootScope.config.hasOwnProperty('ROUTES') && !$rootScope.config.hasOwnProperty('Routes')) {
			return;
		}
		
		var routes = $rootScope.config.hasOwnProperty('ROUTES') ? 'ROUTES' : 'Routes';
		angular.extend($this, $rootScope.config[routes][locale]);
	};			
	
	return $this;
}