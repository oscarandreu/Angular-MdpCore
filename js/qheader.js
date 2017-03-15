/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
var mdpConsts = require('./mdp.security.constants');
var MDPEncryptPayload = require('./payload');

/**
 * Represent the request QHeader in the non-loging requests
 * 
 * 
 * @param {string} url
 * @param {string} method
 *
 * @returns {mdpEncryptQHeader}
 */
var mdpEncryptQHeader = function(api, url, method, sessionId, applicationId, body, key, iv) {
    this.api = api;
    this.url = url;
    this.method = method;
    this.sessionId = sessionId;
    this.applicationId = applicationId;
    this.body = JSON.stringify(body);
    this.key = key;
    this.iv = iv;
};

mdpEncryptQHeader.prototype = {
    /**
     * Returns a json representation of an instance
     * @returns {json}
     */
    toJSON: function () {
        var returnValue = {};
        var payload = null;

        returnValue[mdpConsts.QHEADER.KEY_SESSION_ID] = this.sessionId;

        // Test if public/non public QApiAction
        if (this.sessionId) {
            var payload = new MDPEncryptPayload(this.api, this.url, this.method, this.applicationId, this.body, this.key, this.iv);
            returnValue[mdpConsts.QHEADER.KEY_PAYLOAD] = payload.toAesEncrypted();
        } else {
            returnValue[mdpConsts.QHEADER.KEY_PAYLOAD] = "";
        }
        returnValue[mdpConsts.QHEADER.KEY_APPID] = this.applicationId;

        return returnValue;
    },
    /**
     * Returns a string representation of an instance
     * @returns {string}
     */ 
    toHeader: function () {
        var qHeader = {};

        qHeader[mdpConsts.QHEADER.KEY_QHEADER] = JSON.stringify(this.toJSON());

        return qHeader;
    } 
};

module.exports = mdpEncryptQHeader;