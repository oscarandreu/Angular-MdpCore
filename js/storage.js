/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */
var CryptoJS = require('crypto-js');

/**
 * Inplicit Static Class to manage the symmetric keys stores and getters
 * 
 * 
 * @returns {mdpEncryptStorage}
 */
var mdpEncryptStorage = {};

mdpEncryptStorage.SETTINGS = {
    ENVIRONMENT: '',
    APPID: '',
};
mdpEncryptStorage.EXCEPTIONS = {
    LOCAL_STORAGE: 'Local Storage error',
};

/** 
 * Get the stored cookie in base64 string representation 
 * @returns {string}
 */
mdpEncryptStorage.getFromCookieBase64 = function(key) {
    return CryptoJS.enc.Base64.parse(this.getFromCookie(key));
}

/**
 * Retrieve a value that is associate with a key string from the cookie Storage
 *
 * @param {string} key
 * @returns {string}
 */
mdpEncryptStorage.getFromCookie = function (key) {
    var name = mdpEncryptStorage.SETTINGS.ENVIRONMENT + "_" + mdpEncryptStorage.SETTINGS.APPID + "_" + key + "=";
    var ca = document.cookie.split(';');

    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
}

/** 
 * Save a pair key - value in the cookie Storage
 * @param {string} key
 * @param {string} value
 */
mdpEncryptStorage.setToCookie = function (key, value, expirationSeconds) {
    var name = mdpEncryptStorage.SETTINGS.ENVIRONMENT + "_" + mdpEncryptStorage.SETTINGS.APPID + "_" + key;
    var expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + expirationSeconds);
    document.cookie = name + "=" + value + ";expires=" + expirationDate + ";domain=" + this.__rootDomain() + ";path=/";
}

/** 
 * Remove a item with a key from cookie storage
 * 
 * @param {string} key
 */
mdpEncryptStorage.removeCookie = function (key) {
    var name = mdpEncryptStorage.SETTINGS.ENVIRONMENT + "_" + mdpEncryptStorage.SETTINGS.APPID + "_" + key;
    document.cookie = name + '=""; expires=Thu, 01 Jan 1970 00:00:01 GMT' + ";domain=" + this.__rootDomain() + ";path=/";
}

/**
 * Retrieve a value that is associate with a key string from the Local Storage
 *
 * @param {string} key
 * @returns {string}
 */
mdpEncryptStorage.getFromStorage = function(key) {
    var returnValue = null;

    if (typeof (Storage) !== 'undefined') {
        var name = mdpEncryptStorage.SETTINGS.ENVIRONMENT + "_" + mdpEncryptStorage.SETTINGS.APPID + "_" + key;
        returnValue = localStorage.getItem(name);
    }
    else {
        throw mdpEncryptStorage.EXCEPTIONS.LOCAL_STORAGE;
    }

    return returnValue;
}

/** 
 * Save a pair key - value in the Local Storage
 * @param {string} key
 * @param {string} value
 */
mdpEncryptStorage.setToStorage = function(key, value) {
    if (typeof (Storage) !== 'undefined') {
        var name = mdpEncryptStorage.SETTINGS.ENVIRONMENT + "_" + mdpEncryptStorage.SETTINGS.APPID + "_" + key;
        localStorage.setItem(name, value);
    }
    else {
        throw mdpEncryptStorage.EXCEPTIONS.LOCAL_STORAGE;
    }
}

/** 
 * Remove a item with a key from storage
 * 
 * @param {string} key
 */
mdpEncryptStorage.removeFromLocalStorage = function(key) {
    if (typeof (Storage) !== 'undefined') {
        var name = mdpEncryptStorage.SETTINGS.ENVIRONMENT + "_" + mdpEncryptStorage.SETTINGS.APPID + "_" + key;
        localStorage.removeItem(name);
    }
    else {
        throw mdpEncryptStorage.EXCEPTIONS.LOCAL_STORAGE;
    }
}

mdpEncryptStorage.__rootDomain = function () {
    var hostname = document.location.hostname;

    //Check for an ip domain
    if (this.__validateIPaddress(hostname)) return hostname;
    
    var temp = hostname.split('.').reverse();
    var returnValue = "";

    for (var i = 0; i < temp.length && i < 2 && temp.length > 1; i++) {
        returnValue = "." + temp[i] + returnValue;
    }

    return returnValue;
}
 
mdpEncryptStorage.__validateIPaddress = function(inputText)  
{  
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return inputText.match(ipformat);
} 

module.exports = mdpEncryptStorage;