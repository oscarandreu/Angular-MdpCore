/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
var mdpEncrypt = require('./mdp.system.encrypt');
var mdpConsts = require('./mdp.security.constants');
var mdpStorage = require('./storage');
var MDPEncryptQHeader = require('./qheader');
var MDPEncryptError = require('./error');

/**
 * Decrypts the response security header.
 * Checks communication integrity.
 * 
 * @param {object} ajaxObjext
 * @param {string} url
 * @param {string} method
 * @param {boolean} encrypt
 *
 * @returns {MDPEncryptResponseHeader}
 */
var mdpEncryptResponseHeader = function (ajaxObject, url, method) {
    this.storage = mdpStorage;
    this.crypto = mdpEncrypt;
    this.ajaxObject = ajaxObject;
    this.url = url;
    this.method = method;
    this.decryptedJson = null;
};

mdpEncryptResponseHeader.prototype = {
    /**
     * Returns the url without uri params
     * @returns string
     */
    urlParse: function (url) {
        var returnValue = url;
        var uriIndex = url.indexOf("?");

        if (uriIndex != -1)
            returnValue = returnValue.substring(0, uriIndex);

        return returnValue;
    },
    /**
     * Returns the encrypted response header from ajaxObject
     * @returns {string}
     */
    getEncryptedHeader: function () {
        var returnValue = this.ajaxObject.getResponseHeader(mdpConsts.QHEADER.KEY_QHEADER);

        //if (!returnValue) { throw new MDPEncryptError(MDPEncryptError.CONST.ENCRYPTED_HEADER_UNDEFINED); }

        return returnValue;
    },
    /**
     * Decrypt and convert to jSON
     */
    decryptToJson: function () {
        // Get the head
        var encryptedHead = this.getEncryptedHeader();

        // If not encryptedHeader => public requests => No QHeader in response => do nothing
        if (!encryptedHead)
            return;

        // Get Symmetric Keys from storage
        var symmetricKey = this.storage.getFromCookieBase64(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY);
        var symmetricIv = this.storage.getFromCookieBase64(mdpConsts.QHEADER.KEY_SYMMETRIC_IV);

        // Decrypt the header to string
        var stringDecryptedHead = this.crypto.aesDecrypt(encryptedHead, symmetricKey, symmetricIv);

        // To JSON
        this.decryptedJson = JSON.parse(stringDecryptedHead);

        // Prove Integrity
        this.proveSessionIntegrity();
    },
    /** 
     * Run all check functions
     * 
     * @returns {undefined}
     */
    proveSessionIntegrity: function () {
        // Prove sessionId: Throw exception if fails
        this.checkSessionIp(this.decryptedJson[mdpConsts.QHEADER.KEY_SESSION_ID]);

        // Prove MD5 hash: Throw exception if fails
        //this.checkMD5Hash(this.decryptedJson[mdpConsts.QHEADER.KEY_HASH], this.url, this.method);

        // Prove time offset diference: Throw exception if fails
        var loginTimeOffset = this.storage.getFromCookie(mdpConsts.QHEADER.KEY_LOGIN_TIME_OFFSET);
            
        this.checkTimeOffsetDifference(this.decryptedJson[mdpConsts.QHEADER.KEY_TIMESTAMP_SHORT], loginTimeOffset);
    },
    /** 
     * Cheks if sessionId param matckes with stored one
     * @param {string} sessionId
     */
    checkSessionIp: function (sessionId) {
        var storedSessionId = this.storage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID);

        if (storedSessionId != sessionId) { throw new MDPEncryptError(MDPEncryptError.CONST.SESSION_HAS_BEEN_COMPROMMISED); }
    },
    /** Cheks if url and params makes an MD5 hash that matckes with md5hash param
     * @param {string} md5hash
     * @param {string} url
     * @param {string} method
     */
    checkMD5Hash: function (md5hash, url, method) {
        var md5HashToProve = atob(this.crypto.mD5Encrypt(this.urlParse(url) + method));
        if (md5HashToProve != md5hash) { throw new MDPEncryptError(MDPEncryptError.CONST.SESSION_HAS_BEEN_COMPROMMISED); }
    },
    /**
     * Cheks if the difference between the storedTimeOffset and the offset maked by the clientRequetTime and "NOW" are less than it is required by 
     *
     * config constant MAX_COMMUNICATION_SECONDS_OFFSET_DIFF
     * @param {int} clientRequetTime
     * @param {int} storedTimeOffset
     */
    checkTimeOffsetDifference: function (clientRequetTime, storedTimeOffset) {
        var currentRequestTimeOffset = (Date.now() - clientRequetTime) / 1000;
        var offsetDiff = Math.abs(storedTimeOffset - currentRequestTimeOffset);

        if (offsetDiff > mdpEncrypt.SETTINGS.MAX_COMMUNICATION_SECONDS_OFFSET_DIFF)
            throw new MDPEncryptError(MDPEncryptError.CONST.SESSION_HAS_BEEN_COMPROMMISED);
    }
};

module.exports = mdpEncryptResponseHeader;