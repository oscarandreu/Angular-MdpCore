/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
require('jquery.cookie');

var mdpRest = require('./mdp.system.rest');

var
    // Use the correct document accordingly with window argument (sandbox)
    document = window.document,
    location = window.location,
    navigator = window.navigator;
	
	// String.replaceAt()
	if (!String.prototype.replaceAt) {
		String.prototype.replaceAt = function(index, character) {
			return this.substr(0, index) + character + this.substr(index+character.length);
		};
	}

	// Array.lastIndexOf()
	if (!Array.prototype.lastIndexOf) {
		Array.prototype.lastIndexOf = function(elt /*, from*/) {
			var len = this.length;
			var from = Number(arguments[1]);
			if (isNaN(from)) {
				from = len - 1;
			}
			else {
				from = (from < 0)
					? Math.ceil(from)
					: Math.floor(from);
				if (from < 0) {
					from += len;
				}
				else if (from >= len) {
					from = len - 1;
				}
			}

			for (; from > -1; from--) {
				if (from in this &&
						this[from] === elt)
					return from;
			}
			return -1;
		};
	}
		
	// Array.indexOf()
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(obj){
		for(var i = 0, l = this.length; i < l; i++){
			if(this[i] === obj){
			return i;
			}
		}
		return -1;
		};
	}

	navigator.browser = (function() {
		var appName = navigator.appName
		  , userAgent = navigator.userAgent
		  , tem;

		var idNav = userAgent.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);

		if (idNav && (tem = userAgent.match(/version\/([\.\d]+)/i)) !== null) idNav[2] = tem[1];

		idNav = idNav ? [idNav[1], idNav[2]] : [appName, navigator.appVersion, '-?'];
		
		return idNav;
	})();

    
	
var mdp = new Object();      
    
/**
* mdp.system provee de funciones de caracter general para la 
* aplicación.
* 
* @returns {mdp.system}
*/
mdp.system = function(config) {
	if (typeof config === 'undefined') 
		throw new Error('Configuration not provided');

	this.config    = config;
	this.bq_rest   = null;
	this.appInfo   = null;
	this.language  = null;
	this.timezone  = null;
	this.timezones = [];
	
	this.__loadDefaultLanguage();
	this.__loadDefaultTimezone();
	
	this.bq_rest = new mdpRest(this.config.APIURL, this.config.SKIN_ID);
};

mdp.system.SETTINGS = {
	 APP_INFO_URL         : ''
	,APP_INFO_PARAMS      : null
	,LOAD_ROUTE_MAPS      : true
	,ROUTE_MAPS_FROM_FILE : false
	,ROUTE_MAPS_URL       : ''
	,ROUTE_MAPS_PARAMS    : null
	,LOAD_TIMEZONES       : true
	,TIMEZONES_FROM_FILE  : false
	,TIMEZONES_URL        : ''
	,TIMEZONES_PARAMS     : null
};

mdp.system.prototype = {   
	initialize : function() {
		this.__loadAppInfo();

		if (mdp.system.SETTINGS.LOAD_ROUTE_MAPS) {
			if (mdp.system.SETTINGS.ROUTE_MAPS_FROM_FILE) {
				this.__loadRouteMapsFromFile();
			}
			else {
				this.__loadRouteMapsFromAPI();
			}
		}

		if (mdp.system.SETTINGS.LOAD_TIMEZONES) {
			if (mdp.system.SETTINGS.TIMEZONES_FROM_FILE) {
				this.__loadTimeZonesFromFile();
			}
			else {
				this.__loadTimeZonesFromAPI();
			}
		}
	}
	
	,getConfig : function() {
		return this.config;
	}
	
	,getDefaultLanguage : function() {
		return this.language;
	}
	
	,getDefaultTimezone : function() {
		return this.timezone;
	}
	
	,getAppInfo : function() {
		return this.appInfo;
	}
	
	,getRouteMaps : function() {
		return this.config.ROUTES[this.language];
	}
	
	,getTimeZones : function() {
		return this.timezones;
	}
	
	,getQueryParam : function (param) {
		var result =  window.location.search.match(new RegExp("(\\?|&)" + param + "(\\[\\])?=([^&]*)"));
		return result ? result[3] : false;
	}
	
	,getJsonFile : function(url){
		var settings = {
			type: "GET",
			async: false,
			crossDomain: false,
			url: url,
			processData: false
		};
		return JSON.parse($.ajax(settings).responseText);
	}

	/**
		 * Gets a text file
		* @param {type} url
		*/
	,getTextFile : function(url){
		var settings = {
			type: "GET",
			async: false,
			crossDomain: false,
			url: url,
			processData: false
		};
		return $.ajax(settings).responseText;
	}
	
	/* HELPERS */

	,__loadDefaultLanguage : function() {
		// ISO 639-1 (two character)
		var queryLang = this.getQueryParam("lang");
		var defaultLang = $.cookie( this.config.COOKIES.language );
		if (!defaultLang || defaultLang.length !== 2) {
			defaultLang = this.config.DEFAULT_LANG
				? this.config.DEFAULT_LANG
				: 'it';
		}

		var lang = (!queryLang) || queryLang.length !== 2 || (this.appInfo && $.inArray(queryLang, this.appInfo.ActiveLanguages) < 0) 
			? defaultLang 
			: queryLang;
			
		if (!lang || (this.config.ROUTES && !this.config.ROUTES[lang])) {
			lang = defaultLang;
		}
		
		this.language = lang;
	}
	
	,__loadDefaultTimezone : function() {
		var defaulttz = $.cookie( this.config.COOKIES.timezone );
		if (!defaulttz) {
			defaulttz = this.config.DEFAULT_TIMEZONE 
				? this.config.DEFAULT_TIMEZONE 
				: "GMT Standard Time";
		}
		
		this.timezone = defaulttz;
	}
	
	,__loadAppInfo: function () {
		if (!mdp.system.SETTINGS.APP_INFO_URL) {
			return;
		}

		var skinId = this.getQueryParam("skinId");
		var body = null;
		this.config.IS_EMBEDDED = false;

		if (skinId) {
			if (this.config.DEBUG) {
				console.debug("!! IS EMBEDDED ¡¡ " + skinId);
			}
			this.config.SKIN_ID = skinId;
			this.config.IMGURL = this.config.BASE_IMGURL + '/' + skinId;
			this.config.IS_EMBEDDED = true;
			body = {
				idSkin: skinId
			};
		}

		var context = this;
		this.bq_rest.get(mdp.system.SETTINGS.APP_INFO_URL, mdp.system.SETTINGS.APP_INFO_PARAMS, body, false, {
			success: function(info) { 
				if (context.config.DEBUG) {
					console.debug('AppInfo');
					console.debug(info); 
				}					
				
				context.appInfo = info; 
			},
			error: function (err) {
				if (context.config.DEBUG) {
					console.error('AppInfo');
					console.error(err);
				}
			}
		});
	}
	
	,__loadRouteMapsFromAPI : function() {
		this.config.ROUTES = [];

		if (!mdp.system.SETTINGS.ROUTE_MAPS_URL) {
			return;
		}

		var context = this;
		this.bq_rest.get(mdp.system.SETTINGS.ROUTE_MAPS_URL, mdp.system.SETTINGS.ROUTE_MAPS_PARAMS, null, false, {
			success: function(maps) { 
				if (context.config.DEBUG) {						
					console.debug('Routes');
					console.debug(maps); 
				}
		
				for (var lang in maps) {
					context.config.ROUTES[lang] = [];
					
					for (var group in maps[lang]) {
						for (var key in maps[lang][group]) {
							context.config.ROUTES[lang][key] = maps[lang][group][key];
						}
					}
				}
			}
			,error: function(err) {
				if (context.config.DEBUG) {						
					console.debug('Routes');
					console.error(err); 
				}
			}
		});			
	}

	,__loadRouteMapsFromFile: function () {
		this.config.ROUTES = [];

		try {
			var settings = {
				type: "GET",
				async: false,
				crossDomain: false,
				url: 'app/routes/' + this.language + '.json',
				processData: false
			};

			this.config.ROUTES[this.language] = JSON.parse($.ajax(settings).responseText);
		}
		catch (err) {
			if (this.config.DEBUG) {
				console.error(err);
			}
		}
	}
	
	,__loadTimeZonesFromAPI: function() {
		this.timezones = [];

		if (!mdp.system.SETTINGS.TIMEZONES_URL) {
			return;
		}

		var context = this;
		this.bq_rest.get(mdp.system.SETTINGS.TIMEZONES_URL, mdp.system.SETTINGS.TIMEZONES_PARAMS, null, false, {
			success: function(timezones) { 
				if (context.config.DEBUG) {						
					console.debug('TimeZones');
					console.debug(timezones); 
				}

						for (var i = 0; i < timezones.length; i++) {
							if (timezones[i].hasOwnProperty('UTC')) {
								timezones[i].offset = timezones[i].UTC.replace(':', '');
							}
						}

						context.timezones = timezones;
			}
			,error: function(err) {
				if (context.config.DEBUG) {						
					console.debug('TimeZones');
					console.error(err); 
				}
			}
		});
	}
	
	,__loadTimeZonesFromFile: function() {
		this.timezones = [];
		
		try {
			var settings = {
				type: "GET",
				async: false,
				crossDomain: false,
				url: 'data/timezones/timezones.json',
				processData: false
			};

			this.timezones = JSON.parse($.ajax(settings).responseText);
			for (var i = 0; i < this.timezones.length; i++) {
				if (this.timezones[i].hasOwnProperty('UTC')) {
					this.timezones[i].offset = this.timezones[i].UTC.replace(':', '');
				}
			}
		}
		catch (err) {
			if (this.config.DEBUG) {
				console.error(err);
			}
		}
	}
};

module.exports = mdp.system;