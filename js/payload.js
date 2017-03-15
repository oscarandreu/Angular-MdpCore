/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
var CryptoJS = require('crypto-js');

var mdpEncrypt = require('./mdp.system.encrypt');
var mdpConsts = require('./mdp.security.constants');
var mdpStorage = require('./storage');

/*
* mdpEncryptPayload
*/

/**
 * Represent the playload of the request QHeader in the non-loging requests
 * 
 * @param {string} url
 * @param {string} method
 *
 * @returns {mdpEncryptPayload}
 */
var mdpEncryptPayload = function (api, url, method, applicationId, body, key, iv) {
    this.api = api;
    this.storage = mdpStorage;
    this.crypto = mdpEncrypt;
    this.url = url;
    this.method = method;
    this.applicationId = applicationId;
    this.body = body;
    this.key = key;
    this.iv = iv;
};

mdpEncryptPayload.prototype = {
    /**
     * Returns the url without uri params
     * @returns string
     */
    urlParse: function(url) {
        var returnValue = url;
        var uriIndex = url.indexOf("?");

        if (uriIndex != -1) 
            returnValue = returnValue.substring(0, uriIndex);

        return returnValue;
    },
    /**
     * Returns the uri params string
     * @returns string
     */
    urlBodyParse: function (url, formatedBody) {
        var returnValue = "";

        var uriIndex = url.indexOf("?");

        if (uriIndex != -1) {
            returnValue = url.substring(uriIndex + 1);
            if (formatedBody != "")
                returnValue = returnValue + '&';
        }

        return returnValue;
    },
    /**
     * Returns a json object representation of the instance
     * @returns {json}
     */
    toJson: function () {
        var returnValue = {};
        var formatedBody = this.body;

        if (this.body == '{}' || !this.body || this.body == "null" || this.body == '[]')
            formatedBody = "";

        returnValue[mdpConsts.QHEADER.KEY_APP_ID_SHORT] = this.applicationId;
        returnValue[mdpConsts.QHEADER.KEY_TIMESTAMP_SHORT] = Date.now().toString();
        returnValue[mdpConsts.QHEADER.KEY_HASH] = this.crypto.mD5Encrypt(this.api + "/" + this.url + this.method + formatedBody);

        return returnValue;
    },
    /**
     * Returns a string representation of the instance
     * @returns {string}
     */
    toString: function () {
        return JSON.stringify(this.toJson());
    },
    /** 
     * Returns an encrypted string representation of the instance
     * @returns {string}
     */
    toAesEncrypted: function () {
        var base64_key = CryptoJS.enc.Base64.parse(this.key);
        var base64_iv = CryptoJS.enc.Base64.parse(this.iv);

        return this.crypto.aesEncrypt(this.toString(), base64_key, base64_iv);
    }
};

module.exports = mdpEncryptPayload;