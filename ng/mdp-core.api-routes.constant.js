var appConfig = require('../../app/app.config');

var config = appConfig.getConfig();

module.exports = {
    /* Account - prefix: ACC  */
    ACC_RESET_PASSWORD        : config.APISYSTEM + '/session/changepasswordwithtoken/%s'

    /* User - prefix: USR */
    ,USR_LOGIN                : config.APISYSTEM + '/session/login'
    ,USR_EXT_LOGIN            : config.APISYSTEM + '/session/extlogin'
    ,USR_LOGOUT               : config.APISYSTEM + '/session/logout'
    ,USR_CHECKTOKEN_FULL      : config.APISYSTEM + '/session/checktoken/userdata'
    ,USR_CHECKTOKEN           : config.APISYSTEM + '/session/checktoken'
    ,USR_LOGIN_EXTERNAL_TOKEN : config.APISYSTEM + '/session/providers/%s/token/%s'
}