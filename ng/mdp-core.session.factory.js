"use strict";

var appConfig = require('../../app/app.config');
var mdpConsts = require('../js/mdp.security.constants');
var mdpStorage = require('../js/storage');
var mdpEncrypt = require('../js/mdp.system.encrypt');
var MDPEncryptQHeader = require('../js/qheader');
var MDPEncryptError = require('../js/error');

/**
 * @name qsSession
 * @description
 * Factory to manage general session data, login, logout and refresh token.
 *
 * @author Gustavo Hdez, �scar Andreu, David L�pez.
 * @version 1.0
 */
module.exports = function( $rootScope,   qsRest,   qcEvents,   qsCommon,   qcApiRoutes,   $location,   $q) {
    var
     REFRESH_TOKEN_TIME = 3          // In minutes
    ,CHECK_LOCAL_TOKEN  = 3000       // In milliseconds
    ,IDLE_TIME          = 20 * 60000 // In minutes * milliseconds
    ,IDLE_TIME_CHECKS   = 1;         // In minutes

    var
     $this                          = {}
    ,storage                        = mdpStorage
    ,crypto                         = mdpEncrypt
    ,config                         = appConfig.getConfig()
    ,refreshTokenId                 = null
    ,validateLocalStorageId         = null

    /**
     * Counter: time without user actions in milliseconds
     * @type {{}}
     */
    ,idleTime                       = 0
    ,storageSessionId               = storage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID)
    /**
     * cookie Time To Live
     * @type {{}}
     */
    ,cookieLifeTime                 = CHECK_LOCAL_TOKEN * 1.5
    /**
     * Tell us if the session can expire by time or not
     * @type {{}}
     */
    ,checkIdleTime                  = false
    /**
     * The decimal representation of the user permissions mask (Object with PermissionGroupId as key and sum of permissionsId as value
     * @type {{}}
     */
    ,userMask                       = {};

    $this.SessionId = null;

    /**
     * Returns a flag that indicate if has specific permission or not.
     * @param int groupId
     * @param int permissionId
     * @returns {boolean}
     */
    $this.hasPermission = function(groupId, permissionId) {
        return (userMask.hasOwnProperty(groupId)) ? (userMask[groupId] & permissionId) > 0 : false;
    };

    /**
     * Returns a flagh that indicate if exist session id.
     * @returns {boolean}
     */
    $this.isLogged = function () {
        return ($this.SessionId !== null);
    };

    /**
     * Tries to login.
     *
     * @param username
     * @param passwd
     *
     * @returns {string} if login success,
     *          null otherwise.
     */
    $this.login = function(username, passwd) {
        var qHeaderLogin = $this.getQHeaderLogin(username, passwd);

        var data = qsRest.put(qcApiRoutes.USR_LOGIN, null, null, false, null, qHeaderLogin);
        if (data.Code === 0) {
            data.Result = $this.checkLoginResponse(data.Result);
            $this.SessionId = data.Result.SessionId;

            startRefreshToken();

            // $rootScope.$broadcast(qcEvents.LOGIN, data.Result);
            return data.Result;
        }

        return null;
    };

    $this.externalLogin = function(token) {
        var extWebLoginHeader = $this.getExtWebLoginHeader(token);
        var data = qsRest.put(qcApiRoutes.USR_EXT_LOGIN, null, null, false, null, extWebLoginHeader);

        if (data.Code === 0) {
            data.Result = $this.checkLoginResponse(data.Result);
            $this.SessionId = data.Result.SessionId;

            startRefreshToken();

            // $rootScope.$broadcast(qcEvents.LOGIN, data.Result);
            return data.Result;
        }

        return null;
    };

    /**
     * Executes logout and clears user data
     */
    $this.logout = function (isIdle) {
        if (storageSessionId) {
            var idleParam = isIdle ? '?idle=true' : '';
            qsRest.put(qcApiRoutes.USR_LOGOUT, [idleParam], null, true);
        }

        checkLogout();
    };

    /**
     * Try to validate session identifier:
     * - First check token on url
     * - If not, check storageSession and call with full request (in case doesn't exist sessionId in the factory or only check token if exists sessionId)
     */
    $this.validateToken = function(sessionId) {
        var
         deferred     = $q.defer()
        ,tokenParam   = !$location.search().tk       ? "" : $location.search().tk
        ,provider     = !$location.search().provider ? "" : $location.search().provider
        ,apiRoute     = null
        ,params       = []
        ,decryptType  = 0 // Dont decript default
        ,qHeaderLogin = null;

        if (tokenParam && provider) {
            // 1. If the token comes from url
            delete $location.$$search.tk;
            delete $location.$$search.provider;
            $location.$$compose();

            apiRoute = qcApiRoutes.USR_LOGIN_EXTERNAL_TOKEN;
            params.push(provider);
            params.push(tokenParam);
            qHeaderLogin = $this.getQHeaderLogin();
            decryptType = 2; // Login decrypt type
        }
        else if (storageSessionId) {
            // 2. If the token NOT comes from url
            if (!sessionId) {
                // If user factory sessionId is filled
                apiRoute = qcApiRoutes.USR_CHECKTOKEN_FULL;
                decryptType = 1; // Checktoken User data decrypt
            }
            else {
                // If user factory sessionId is NOT filled
                apiRoute = qcApiRoutes.USR_CHECKTOKEN;
            }
        }

        if (apiRoute) {
            // If found any session data, call to API to check the token is already active
            qsRest.put(apiRoute, params, null, false, {
                success: function (result) {
                    if (qsCommon.isUndefined(result)) {
                        checkLogout();
                        deferred.reject();
                    }
                    else {
                        switch(decryptType) {
                            case 1: // Validated with storage session Id. Returns all user data.
                                result = $this.checkLoginResponse(result);
                                $this.SessionId = result.SessionId;
                                deferred.resolve(result);
                                $this.refreshSession();
                                break;
                            case 2: // Validate with tk and provider
                                result = $this.checkLoginResponse(result);
                                $this.SessionId = result.SessionId;
                                deferred.resolve(result);
                                break;
                            default: // Validated with local session Id
                                deferred.resolve();
                                $this.refreshSession();
                                break;
                        }

                        startRefreshToken();
                    }
                },
                error: function () {
                    checkLogout();
                    deferred.reject();
                }
            }, qHeaderLogin);
        }
        else {
            checkLogout();
            deferred.reject();
        }

        return deferred.promise;
    };

    /**
     * Change password in a non-logged page coming from an email url with token
     */
    $this.changePasswordFromUrlWithToken = function(username, password, token) {
        var deferred = $q.defer();
        qsRest.put(qcApiRoutes.ACC_RESET_PASSWORD, [token], null, false, {
            success: function () {
                deferred.resolve(true);
            },
            error: function () {
                deferred.resolve(false);
            }
        }, $this.getQHeaderLogin(username, password));

        return deferred.promise;
    };

    /**
     * Clear all the data of the session from cookie storage
     */
    $this.clearSession = function() {
        storage.removeCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY);
        storage.removeCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_IV);
        storage.removeCookie(mdpConsts.QHEADER.KEY_SESSION_ID);
        storage.removeCookie(mdpConsts.QHEADER.KEY_LOGIN_TIME_OFFSET);
    };

    /**
     * Clear all the data of the session from cookie storage
     */
    $this.refreshSession = function () {
        storage.setToCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY, storage.getFromCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY), cookieLifeTime);
        storage.setToCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_IV, storage.getFromCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_IV), cookieLifeTime);
        storage.setToCookie(mdpConsts.QHEADER.KEY_SESSION_ID, storage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID), cookieLifeTime);
        storage.setToCookie(mdpConsts.QHEADER.KEY_LOGIN_TIME_OFFSET, storage.getFromCookie(mdpConsts.QHEADER.KEY_LOGIN_TIME_OFFSET), cookieLifeTime);
    };

    $this.getQHeaderLogin = function (username, password) {

        // Default values
        if (qsCommon.isUndefined(username)) username = "";
        if (qsCommon.isUndefined(password)) password = "";

        // Clear old session cookies
        $this.clearSession();

        // Get New encryption keys
        var symmetricKey = getNewSymmetricKey();
        var symmetricIv = getNewSymmetricIv();

        // Get the string representation of the content (without encrypt yet)
        var contentJson = {};
        contentJson[mdpConsts.QHEADER.KEY_USERNAME] = username;
        contentJson[mdpConsts.QHEADER.KEY_PASSWORD] = password;
        contentJson[mdpConsts.QHEADER.KEY_SYMMETRIC_KEY] = symmetricKey;
        contentJson[mdpConsts.QHEADER.KEY_SYMMETRIC_IV] = symmetricIv;
        contentJson[mdpConsts.QHEADER.KEY_TIMESTAMP] = Date.now().toString();

        // String representation of Json content
        var contentString = JSON.stringify(contentJson);

        // Encrypt the content
        var encryptedContentString = crypto.rsaEncrypt(contentString);

        // Return JSON representation of the content of the header
        var headerContent = {};
        headerContent[mdpConsts.QHEADER.KEY_ENCRYPTEDCONTENT] = encryptedContentString;
        headerContent[mdpConsts.QHEADER.KEY_APPID] = config.SKIN_ID;

        // Retrun QHeaderLogin
        var returnValue = {};
        returnValue[mdpConsts.QHEADER.KEY_QHEADER_LOGIN] = JSON.stringify(headerContent);

        return returnValue;
    };

    $this.getExtWebLoginHeader = function(token) {
        $this.clearSession();

        // Get New encryption keys
        var symmetricKey = getNewSymmetricKey();
        var symmetricIv = getNewSymmetricIv();

        // Get the string representation of the content (without encrypt yet)
        var contentJson = {};
        contentJson[mdpConsts.QHEADER.KEY_SESSION_TOKEN] = token;
        contentJson[mdpConsts.QHEADER.KEY_SYMMETRIC_KEY] = symmetricKey;
        contentJson[mdpConsts.QHEADER.KEY_SYMMETRIC_IV] = symmetricIv;
        contentJson[mdpConsts.QHEADER.KEY_TIMESTAMP] = new Date().toISOString();

        // String representation of Json content
        var contentString = JSON.stringify(contentJson);

        // Encrypt the content
        var encryptedContentString = crypto.rsaEncrypt(contentString);

        // Return JSON representation of the content of the header
        var headerContent = {};
        headerContent[mdpConsts.QHEADER.KEY_ENCRYPTEDCONTENT] = encryptedContentString;
        headerContent[mdpConsts.QHEADER.KEY_APPID] = parseInt(config.SKIN_ID);

        // Return ExtWebLoginHeader
        var returnValue = {};
        returnValue[mdpConsts.QHEADER.KEY_EXTWEB_LOGIN] = JSON.stringify(headerContent);

        return returnValue;
    };

    $this.checkLoginResponse = function (encryptedMessage) {
        // Get Symmetric Keys from storage
        var symmetricKey = storage.getFromCookieBase64(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY);
        var symmetricIv = storage.getFromCookieBase64(mdpConsts.QHEADER.KEY_SYMMETRIC_IV);

        // Decrypt to string
        var decryptedMessage = crypto.aesDecrypt(encryptedMessage, symmetricKey, symmetricIv);
        var returnValue = JSON.parse(decryptedMessage);

        // Check json integrity before return it
        var incommingSessionId = returnValue[mdpConsts.QHEADER.KEY_SESSION_ID];
        if (!incommingSessionId) { throw new MDPEncryptError(MDPEncryptError.CONST.SESSION_CAN_NOT_INITIALIZED); }

        var incommingTimeStamp = returnValue[mdpConsts.QHEADER.KEY_TIMESTAMP];
        if (!incommingTimeStamp) { throw new MDPEncryptError(MDPEncryptError.CONST.SESSION_CAN_NOT_INITIALIZED); }

        //Save sessionID to Local Storage
        storage.setToCookie(mdpConsts.QHEADER.KEY_SESSION_ID, incommingSessionId, cookieLifeTime);

        //Save login offset to Local Storage
        var offsetDiff = (Date.now() - incommingTimeStamp) / 1000;
        storage.setToCookie(mdpConsts.QHEADER.KEY_LOGIN_TIME_OFFSET, offsetDiff, cookieLifeTime);

        // Start checking the idle time
        if( returnValue.UserType == 0){ //be careful, comes as string
            checkIdleTime = true;
        }

        userMask = returnValue.Permissions;
        return returnValue;
    };

    function clearRefreshToken() {
        if (refreshTokenId !== null) {
            clearInterval(refreshTokenId);
            refreshTokenId = null;
        }
    }

    function startRefreshToken() {
        if (refreshTokenId) {
            return;
        }

        storageSessionId = storage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID);
        if (qsCommon.isUndefined(storageSessionId)) {
            return;
        }

        refreshTokenId = setInterval(function() {
            storageSessionId = storage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID);
            if (qsCommon.isUndefined(storageSessionId)) {
                clearInterval(refreshTokenId);
            }
            else {
                $this.validateToken(storageSessionId);
            }
        }, REFRESH_TOKEN_TIME * 60000);// Convert to milis

        validateLocalStorage();
    }

    /**
     * Check local storage: if not exist send message to clean User factory (probably because logout in another tab)
     */
    function validateLocalStorage() {
        if (validateLocalStorageId) {
            return;
        }

        if (checkIdleTime) {
            window.addEventListener("mousemove", mouseMoveEvent);
        }

        validateLocalStorageId = setInterval(function () {
            storageSessionId = storage.getFromCookie(mdpConsts.QHEADER.KEY_SESSION_ID);
            if (!storageSessionId  || (checkIdleTime && idleTime >= IDLE_TIME)) {

                if(checkIdleTime && idleTime >= IDLE_TIME){
                    $this.logout(true);
                }

                clearInterval(validateLocalStorageId);
                checkLogout();
            }
            else{
                idleTime += CHECK_LOCAL_TOKEN;
                //console.log("idle:: "+idleTime+" of " + (IDLE_TIME));
            }
        }, CHECK_LOCAL_TOKEN);
    }

    /**
     * Reset session id and throw LOGOUT event.
     */
    function checkLogout() {
        $this.clearSession();

        clearRefreshToken();

        // Throw LOGOUT event only if exists SessionId
        if ($this.SessionId) {
            $this.SessionId = null;
            $rootScope.$broadcast(qcEvents.LOGOUT);
        }
    }

    /**
     * Checks if the user is doing something
     */
    function mouseMoveEvent(e) {
        window.removeEventListener("mousemove", mouseMoveEvent);
        idleTime = 0;
        setTimeout(function() {
            window.addEventListener("mousemove", mouseMoveEvent);
        }, IDLE_TIME_CHECKS * 60000);
    }

    /** 
     * Create a new symmetric key, stores it in the cookie Store and returns it 
     * @returns {string}
     */
    function getNewSymmetricKey() {
        var returnValue = null;
        try {
            returnValue = btoa(crypto.makeId(16));
            storage.setToCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_KEY, returnValue, cookieLifeTime);
        }
        catch (err) {
            throw new MDPEncryptError(MDPEncryptError.CONST.NOT_ENCRYPTED_KEYS_FOUND);
        }

        return returnValue;
    }

    /** 
     * Create a new symmetric IV, stores it in the cookie Store and returns it 
     * @returns {string}
     */
    function getNewSymmetricIv() {
        var returnValue = null;
        try {
            returnValue = btoa(crypto.makeId(16));
            storage.setToCookie(mdpConsts.QHEADER.KEY_SYMMETRIC_IV, returnValue, cookieLifeTime);
        }
        catch (err) {
            throw new MDPEncryptError(MDPEncryptError.CONST.NOT_ENCRYPTED_KEYS_FOUND);
        }

        return returnValue;
    }

    return $this;
}