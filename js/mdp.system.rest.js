/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
var mdpEncrypt = require('./mdp.system.encrypt');
var mdpConsts = require('./mdp.security.constants');
var mdpStorage = require('./storage');
var MDPEncryptQHeader = require('./qheader');
var MDPEncryptResponseHeader = require('./responseheader');

var RESPONSE_ACTIONS = {
	before  : function() { /* empty */ },
	after   : function() { /* empty */ },
	success : function() { /* empty */ },
	error   : function() { /* empty */ }
};  
    	
/**
 * mdpRest provee de funciones para llamadas tipo rest a la api indicada
 * por parámetro.
 * 
 * @param {String} api API url
 * @returns {mdpRest}
 */
var mdpRest = function(api, applicationId, onFormatError, onAfterResolve, onAfterReject) {
	this.api = api;
	this.applicationId = applicationId;
	this.token = null;  
	this.encrypt = mdpEncrypt;
	this.onFormatError = onFormatError;
	this.onAfterResolve = onAfterResolve;
	this.onAfterReject = onAfterReject;
};

mdpRest.SETTINGS = {
	ACCEPT_LANGUAGE : 'en'
};

mdpRest.prototype = {
	getRequest : function(route, async, callbacks){
		return this.__requestManager(this.__urlConstructor(route), null, "GET", async, callbacks);
	}
	, delRequest: function (route, body, async, callbacks) {
		return this.__requestManager(this.__urlConstructor(route), body, "DELETE", async, callbacks);
	}
	, putRequest: function (route, body, async, callbacks) {
		return this.__requestManager(this.__urlConstructor(route), body, "PUT", async, callbacks);
	}
	, postRequest: function (route, body, async, callbacks) {
		return this.__requestManager(this.__urlConstructor(route), body, "POST", async, callbacks);
	}
	,get : function(url, params, body, async, callbacks){
		return this.__requestManager(this.__urlInjector(url, params), body, "GET", async, callbacks, null);
	}
	,post : function(url, params, body, async, callbacks){
		return this.__requestManager(this.__urlInjector(url, params), body, "POST", async, callbacks, null);		
	}
	,put : function(url, params, body, async, callbacks, header){
		return this.__requestManager(this.__urlInjector(url, params), body, "PUT", async, callbacks, header);	
	}
	,del : function(url, params, body, async, callbacks){
		return this.__requestManager(this.__urlInjector(url, params), body, "DELETE", async, callbacks, null);
	}
	,uploadImage : function(url, params, body, async, callbacks){
		return this.__requestManager(this.__urlInjector(url, params), body, "UPLOADIMAGE", async, callbacks, null);
	}
	,setToken : function(token) {			
		this.token = token;
	}
	// Helper
	,__sendRequest: function (url, body, method, headers, async) {
		var stringBody = null;
		
		if (body && !$.isEmptyObject(body)) {
			stringBody = JSON.stringify(body);
		}

		var settings = {
			type: method !== 'UPLOADIMAGE' ? method : 'POST',
			contentType: 'application/json',
			beforeSend: function (request)
			{
				try {
					for (var key in headers) {
						request.setRequestHeader(key, headers[key]);
					}
				}
				catch (err) {
					console.error('SYSTEM.REST ERR [setRequestHeader]: %O', err);
				}
				request.setRequestHeader("Accept-Language", mdpRest.SETTINGS.ACCEPT_LANGUAGE);
			},
			async: async,
			crossDomain: true,
			data: stringBody,
			dataType: 'json',
			url: method !== 'UPLOADIMAGE' ? this.api + '/' + url : url, // (mdp_system.config && mdp_system.config.DEBUG ? '?XDEBUG_SESSION_START=dbgp' : ''), 
			processData: false
		};
		if (async) {
			//var deferred = $q.defer();
			var deferred = new jQuery.Deferred();
			var context = this;

			var xhr = $.ajax(settings).done(function (data) {
				try {
					var responseheader = new MDPEncryptResponseHeader(xhr, url, method);
					responseheader.decryptToJson();

					deferred.resolve(data);
				}
				catch (err) {
					console.error('SYSTEM.REST ERR [encrypt.checkResponse][' + url + ']: %O', err);
					deferred.reject({ Code: -1, Result: err.message });
				}
				finally {
					if ($.isFunction(context.onAfterResolve)) {
						context.onAfterResolve.call(context);
					}
				}
			}).fail(function (err) {
				console.error('SYSTEM.REST ERR [call error][' + url + ']: %O', err);
				var data = (err && err.hasOwnProperty('responseJSON') && err.responseJSON)
					? err.responseJSON
					: context.__tryParseToJSON(err && err.responseText ? err.responseText : err);
				
				deferred.reject(data);
				
				if ($.isFunction(context.onAfterReject)) {
					context.onAfterReject.call(context);
				}
			});

			return deferred.promise();
		} else {
			var res = $.ajax(settings);
			var json = this.__tryParseToJSON(res);
			if (json.Code == 0) {
				try {
					var responseheader = new MDPEncryptResponseHeader(res, url, method);
					responseheader.decryptToJson();
				}
				catch (err) {
					console.error('SYSTEM.REST ERR [encrypt.checkResponse][' + url + ']: %O', err);

					return { Code: -1, Result: err.message };
				}
			}				
		
			return json;
		}
	}
	,__tryParseToJSON:function(res) {
		var json = {Code : -1, Result: null};
		
		try {
			json = JSON.parse(res.responseText);
		} catch(e) {
			json.Result = res.responseText;
		}

		return json;
	}
	/**
	 * Inject the parameters in the url (Old style)
	 * 
	 * @param {string} url
	 * @param {array} params
	 */
	,__urlInjector(url, params){
		if (!params) return url;

		for (var i in params) {
			url = url.replace(new RegExp("%s"), params[i]);
		}
		return url;
	}		
	/**
	 * Contruct the url with the given parameters
	 * 
	 * @param {string} url
	 * @param {array} params
	 */
	,__urlConstructor(route){
		var url = route.url;
		if (route.urlParams && route.urlParams.length > 0){
			url = this.__urlInjector(route.url, route.urlParams);
		}
		if (route.queryParams != null){
			var keys = Object.keys(route.queryParams);
			var first = true;
			for (var i = 0; i < keys.length; i++) {
				var value = route.queryParams[keys[i]];
				if (value === null || value === "" || typeof value === 'undefined') {
					continue;
				}
				url += (first ? '?' : '&') + keys[i] + '=' + value;
				first = false;
			}
		}			

		return url;
	}
	/**
	 * Request manager.
	 * 
	 * @param {string} url
	 * @param {array} params
	 * @param {type} body
	 * @param {type} method
	 * @param {type} async
	 * @param {type} callbacks
	 */
	, __requestManager: function (url, body, method, async, callbacks, header) {
		if (method !== 'UPLOADIMAGE') {
			try {
				// Add QHeader
				var qHeaderJson = new MDPEncryptQHeader(this.api, url, method, this.__getSessionId(), this.applicationId, body, this.__getSymmetricKey(), this.__getSymmetricIV());
				var qHeader = qHeaderJson.toHeader();

				if (!header) {
					header = {};
				}

				for (var key in qHeader) {
					header[key] = qHeader[key];
				}
			}
			catch (error) {
				var calls = $.extend({}, RESPONSE_ACTIONS, callbacks || {});
				
				if ($.isFunction(calls.after))
					calls.after.call(this, null);

				if ($.isFunction(calls.error))
					calls.error.call(this, error);

				return error;
			}
			finally {
				if (url === mdpEncrypt.SETTINGS.LOGIN_URL)
					body = null;
			}
		}
		if (!callbacks) {
			// Default behavior
			return this.__sendRequest(url, body, method, header, async);
		}
		else {
			// Internal response management by callbacks
			var calls = $.extend({}, RESPONSE_ACTIONS, callbacks || {});

			if ($.isFunction(calls.before))
				calls.before.call(this, null);

			if (async) {
				var context = this;
				this.__sendRequest(url, body, method, header, true).then(
					function (data) {
						context.__responseManager(data, calls);
					},
					function(error) {
						if ($.isFunction(calls.after))
							calls.after.call(this, null);

						if ($.isFunction(calls.error))
							calls.error.call(this, error);
					});

				return null;
			}
			else {
				return this.__responseManager(this.__sendRequest(url, body, method, header, false), calls);
			}
		}
	}  
	/**
	 * Response manager.
	 * 
	 * @param Object data
	 * @param Object calls
	 */
	, __responseManager: function (data, calls) {
		if ($.isFunction(calls.after))
			calls.after.call(this, null);

		if (!data) {
			data = {Code : -1, Result: "unexpected error"};
		}

		if (data && data.Code == 0) {
			if ($.isFunction(calls.success))
				calls.success.call(this, data.Result, data.hasOwnProperty('Info') ? data.Info : null);

			return;
		}

		if ($.isFunction(calls.error)) {
			if ($.isFunction(this.onFormatError)) {
				calls.error.call(this, this.onFormatError.call(this, data));
			}
			else {
				calls.error.call(this, data);
			}
		}
	}
	, __getSessionId: function() {
		return mdpStorage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID);
	}
	, __getSymmetricKey: function() {
		return mdpStorage.getFromCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY);
	}
	, __getSymmetricIV: function() {
		return mdpStorage.getFromCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_IV);
	}
};

module.exports = mdpRest;