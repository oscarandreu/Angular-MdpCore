var AppConfig = require('../../app/app.config');
var MDPSystem = require('../js/mdp.system.js');
var MDPRest = require('../js/mdp.system.rest.js');

module.exports = function($rootScope) {
    var
        $this = {}
        ,mdp_system = new MDPSystem(AppConfig.getConfig())
        ,config = AppConfig.getConfig()
        ,rest = new MDPRest(config.APIURL, config.SKIN_ID, null, refresh, refresh);

    $this.setToken = function(token) {
        rest.setToken(token);
    };
    
    $this.getRequest = function(route, async, callbacks) {
        return rest.getRequest(route, async, callbacks);
    };

    $this.delRequest = function (route, body, async, callbacks) {
        return rest.delRequest(route, body, async, callbacks);
    }

    $this.putRequest = function (route, body, async, callbacks) {
        return rest.putRequest(route, body, async, callbacks);
    }

    $this.postRequest = function (route, body, async, callbacks) {
        return rest.postRequest(route, body, async, callbacks);
    }

    $this.get = function(url, params, body, async, callbacks) {
        return rest.get(url, params, body, async, callbacks);
    };	
    
    $this.post = function(url, params, body, async, callbacks) {
        return rest.post(url, params, body, async, callbacks);		
    };
    
    $this.put = function(url, params, body, async, callbacks, header) {
        return rest.put(url, params, body, async, callbacks, header);	
    };
    
    $this.del = function(url, params, body, async, callbacks) {
        return rest.del(url, params, body, async, callbacks);
    };   
    
    $this.uploadImage = function(url, params, body, async, callbacks) {
        return rest.uploadImage(url, params, body, async, callbacks);
    };
    
    $this.getJsonFile = function(url) {
        return mdp_system.getJsonFile(url);
    };
    
    /**
     * Gets a text file
     * @param {type} url
     * @returns {jqXHR.responseText}
     */
    $this.getTextFile = function(url) {		
        return mdp_system.getTextFile(url);
    };  
    
    /* HELPER */            
    
    function refresh() {
        if (!$rootScope.$$phase) {
            $rootScope.$$phase || $rootScope.$apply();
        }
    }   
    
    return $this;
}