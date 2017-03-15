/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
var JSEncrypt = require('jsencrypt').JSEncrypt;
var CryptoJS = require('crypto-js');

var MDPEncryptError = require('./error');

/* HELPERS */

/**
 * Returns encrypted(RSA) string 
 * 
 * @param {string} inStr
 * @param {string} pulicKey
 * @returns {string}
 */
var __encryptRsa = function (inStr, publicKey) {
    var jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    var encrypted = jsEncrypt.encrypt(inStr);

    return encrypted;
}

/**
 * Returns encrypted(AES) string using 16 bytes key and iv
 * 
 * @param {string} inStr
 * @param {string} key
 * @param {string} iv
 * @returns {string}
 */
var __encryptAes = function (inStr, key, iv) {
    var plaintext = null;

    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(inStr), key, { mode: CryptoJS.mode.CBC, iv: iv, padding: CryptoJS.pad.Pkcs7 });
    plaintext = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

    return plaintext;
}

/**
 * Returns Un encrypted(AES) string using 16 bytes key and iv
 * 
 * @param {string} inStr
 * @param {string} key
 * @param {string} key
 * @returns {string}
 */
var __decryptAes = function (inStr, key, iv) {
    var returnValue = null;

    var cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(inStr)
    });

    var decrypted = CryptoJS.AES.decrypt(cipherParams, key, { mode: CryptoJS.mode.CBC, iv: iv, padding: CryptoJS.pad.Pkcs7 });
    returnValue = decrypted.toString(CryptoJS.enc.Utf8);

    return returnValue;
}

/**
 * Returns encrypted MD5 hash
 * 
 * @param {string} inStr
 * @returns {string}
 */
var __encryptMd5 = function (inStr) {
    var returnValue = null;

    var encryptedHashByteArray = CryptoJS.MD5(inStr);
    returnValue = btoa(encryptedHashByteArray);

    return returnValue;
}

var mdpEncrypt = {};

mdpEncrypt.SETTINGS = {
    POSSIBLE_BASE_CHAR: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',

    /**
     * Public RSA API Key
     * NOTE: It has to correspond with the private RSA Key that API Uses.
     *
     */
    PUBLIC_SERVER_KEY:'-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAjg99uMKKmLPq20NcVX2IOcv4dAjMgAhxjdl6SegV/1s9dLsXbrjVIaMkpHjIckOmhXVkNEK6h0SEjghgQZTTan5TgUoWQoHm6eyB8FVUViV5fcJnEeNHzD7cVYzgMXdanOkWw0Zca1K8yWmuz4ZZTtUAtNR9FLiFygmkq36rcBJT6U040NJX7d80Kp0wqTalKPVRadRFO2tMaePVd8TJuZVgu1Ima3Ib9Y1SptldQtw+I7bFxev94lnc5D5Bc/i6zmxRx7roRtfgFFqukcIeIxa3B7PmENgUHmpN26duDwJ7kn0NwOh2JpaLa71A6l+7ta250Gs3CYtMaKO8Bmmc41RvESPDser4QuYeHuD7bMjUVsNoEdhNQH06XxwaEpLl6L1Vkto4M/5WOljGWu3Fz1aUpM0lVHAZaai0od6Q5fa0HnwIPSGpkcOUi2Aqko+GJTX1unMghbsEAW25flVjbZ9uOsVTbQuRUADALBrW524A/64nbxKEL6L+NzUpthjcGihzK1KUGqoILUxwoI7uPhEph0tmm7b+bXWRv5oF/hxNCNGrz6eEO1/S/Eu3Yx0Z51fTmkocKKRLleqilhGUS7GDWmM/jafTET80rI9HAwoy9lmxG0VZ65oOLCUhXeMtgsDjd89EZdGC0bXHduGyW0c7moV4SJPglXCI4T9ZoGMCAwEAAQ==-----END PUBLIC KEY-----',

    /**
     * Maximun time offset difference allowed (in seconds) between login response time offset and subsequent responses time offsets
     *
     */
    MAX_COMMUNICATION_SECONDS_OFFSET_DIFF: 60,


    /**
     * The identifier of this front app
     *
     */
    APP_ID: "",

    /**
     * The API login url
     *
     */
    LOGIN_URL: 'login',

    /**
     * The API logout url
     *
     */
    LOGOUT_URL: 'logout',

    LOGIN_TOKEN_HINT_URL: 'hint_not defined',
    LOGIN_TOKEN_URL: 'not defined',

    LOGIN_EXTERNAL_TOKEN_HINT_URL: 'hint_not defined',
    LOGIN_EXTERNAL_TOKEN_URL: 'not defined'
};

/**
 * Returns an RSA encrypted of the input parameter inStr
 * @param {string} inStr
 * @returns {string}
 */
mdpEncrypt.rsaEncrypt = function (inStr) {
    var returnValue = null;

    try {
        returnValue = __encryptRsa(inStr, mdpEncrypt.SETTINGS.PUBLIC_SERVER_KEY);
    }
    catch (err) {
        throw new MDPEncryptError(MDPEncryptError.CONST.ENCRYPTION_PROCCESS);
    }

    return returnValue;
}

/**
 * Returns an MD5 encrypted string of url+method
 * @param {strin} url
 * @param {string} method
 * @param {type} inStr
 * @returns {string}
 */
mdpEncrypt.mD5Encrypt = function (inStr) {
    var returnValue = null;

    try {
        returnValue = __encryptMd5(inStr);
    }
    catch (err) {
        throw new MDPEncryptError(MDPEncryptError.CONST.ENCRYPTION_PROCCESS);
    }

    return returnValue;
}

/**
 * Returns an AES encrypted string of inStr
 * @param {strin} inStr
 * @param {string} key
 * @param {string} iv
 * @returns {string}
 */
mdpEncrypt.aesEncrypt = function(inStr, key, iv) {
    var returnValue = null;

    try {
        returnValue = __encryptAes(inStr, key, iv);
    }
    catch (err) {
        throw new MDPEncryptError(MDPEncryptError.CONST.ENCRYPTION_PROCCESS);
    }

    return returnValue;
}

/**
 * Returns an AES decrypted string of inStr
 * @param {strin} inStr
 * @param {string} key
 * @param {string} iv
 * @returns {string}
 */
mdpEncrypt.aesDecrypt = function(inStr, key, iv) {
    var returnValue = null;

    try {
        returnValue = __decryptAes(inStr, key, iv);
    }
    catch (err) {
        throw new MDPEncryptError(MDPEncryptError.CONST.DECRYPTION_PROCCESS);
    }

    return returnValue;
}

/**
 * Returns a random string with a longitude that is passed by param. It is used to generate symmetric keys
 * 
 * @param {int} numchars
 * @returns {string}
 */
mdpEncrypt.makeId = function (numChars) {
    var text = '';

    var possible = mdpEncrypt.SETTINGS.POSSIBLE_BASE_CHAR;

    for (var i = 0; i < numChars; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = mdpEncrypt;