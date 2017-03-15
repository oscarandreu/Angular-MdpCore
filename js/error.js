/*
 * mdp JavaScript Library v1.0.0
 *
 * Copyright 2015 mdp
 */

/**
 * Error message prototype.
 * 
 * 
 * @returns {MDPEncryptError}
 */
var mdpEncryptError = function (message) {
    this.name = mdpEncryptError.CONST.EXCEPTION_NAME;
    this.message = (message || "");
};

mdpEncryptError.CONST = {
    EXCEPTION_NAME: 'mdp.system.encrypt',
    NOT_ENCRYPTED_KEYS_FOUND: 'Not encrypted keys found',
    SESSION_NOT_FOUND: 'Session not found',
    ENCRYPTION_PROCCESS: 'Error in encryption process',
    DECRYPTION_PROCCESS: 'Error in decryption process',
    SESSION_CAN_NOT_INITIALIZED: 'Session can not being initialized',
    ENCRYPTED_HEADER_UNDEFINED: 'QHeader undefined',
    SESSION_HAS_BEEN_COMPROMMISED: 'Session has been compromised',
    USERNAME_KEY_OR_VALUE_NOT_FOUND: 'Username key or Username value not found',
    PASSWORD_KEY_OR_VALUE_NOT_FOUND: 'Password key or password value not found'
};
mdpEncryptError.prototype = Error.prototype;

module.exports = mdpEncryptError;