function RenderFactory(qsCommon, $rootScope, $location, qsEffects) {
    var $this = {};       
      
    /**
     * Unique entry point for eval expresions, this point could be fortified as necessary
     * @param {type} code
     * @returns {undefined}
     */
    $this.eval = (code) => {
        eval(code);
    };

	/**
	 * Given the area and the templates, this function builds the section content.
	 * 
	 * @param {Object} section
	 * @param {Object} templates
	 * @returns {Object}
	 */
    $this.getContent = (section, templates) => {
        var getTemplate = function(name) {            
            for (var index in templates) {                
                if (templates[index].Id === name)
                    return templates[index];
            }
            
            return null;
        };       
        
        var contents = [];
        var scripts = [];        
        var keys = Object.keys(section.Zones);
        
        // In config .NET properties in 'UPPERCASE'. In config .php properties in 'UpperCamelCase'.
        var imgUrlProp = $rootScope.config.hasOwnProperty('IMGURL') ? 'IMGURL' : 'ImgUrl';
        
        for (var zone in keys) {
            var imgUrl = $rootScope.config[imgUrlProp];
            var content = getZoneHtml(section.Zones[zone], imgUrl, getTemplate);
            
            contents[section.Zones[zone].Id] = content.Html;
            scripts[section.Zones[zone].Id] = content.Scripts;
        }

        return {
            Zones   : contents,
            Scripts : scripts
        };
    };

	/**
	 * Given the zone identifier and content, this function injected the content in the zones.
	 * 
	 * @param {String} zoneIdentifier
	 * @param {Object} value
	 * @param {Bool} ignoreWallpaper. Is optional.
	 */
    $this.updateSection = (zoneIdentifier, value, ignoreWallpaper) => {
        var wallpaper = false;
        var wallpaperClear = function() {
            if (!wallpaper && !ignoreWallpaper) {
                qsEffects.bqWallpaperClear();
            }
        };

        if ( qsCommon.isUndefined(value) ) {
            wallpaperClear();
            return;
        }

        for (var zone in value.Zones) {
            var domNode = $('#' + zoneIdentifier + zone);		
            if( domNode.length ) {				
                domNode.html( value.Zones[zone] );
                if (value.Scripts[zone] instanceof Array) {
                    $this.eval(value.Scripts[zone].join(''));
					
					if (zone === '0') {
						wallpaper = true;
					}
                }
            } 
            domNode = null;
        }

        wallpaperClear();
    };

    /**
     * Search and replace variables (<#name> format) in the template (object or array of objects)
     * @param template Template to search/replace skin template vars
     * @returns {*}
     */
    $this.replaceSkinVars = (template) => {
        if (template instanceof Array) {
            // Replace Skin template vars.
            for (var i = 0; i < template.length; i++) {
                template[i] = replaceObjectSkinVars(template[i]);
            }
        }
        else {
            template = replaceObjectSkinVars(template);
        }

        return template;
    };

    // Helpers
    /**
     * Search and replace variables (<#name> format) in the template (only object)
     * @param template Template to search/replace skin template vars
     * @returns {*}
     */
    function replaceObjectSkinVars (template) {
        for (var varName in $rootScope.SkinInfo.TemplateVars) {
            var re = new RegExp('<#' + varName + '>', 'g');  // Regular expression for varName, and 'g' for replace all.

            for (var key in template) {
                if (typeof (template[key]) == 'string')
                    template[key] = template[key].replace(re, $rootScope.SkinInfo.TemplateVars[varName]);
            }
        }
        return template;
    }

	function getZoneHtml(zone, imgUrl, getTemplate) {
        if (qsCommon.isUndefined(zone.Template))
            return { Html : '', Scripts: []};
        
        var getTagId = function(tagName) { return "<#" + tagName + '>'; };
        var template = getTemplate(zone.Template);       
        var html = template.Html;
        var script = template.Script;       
        var scripts = [];        
        
        if ('Pattern' in template) {
            zone = $.extend({}, template.Pattern, zone || {});
        }
        
        for (var tagName in zone) {            
            var value = zone[tagName];
            
            if ((tagName == 'Template') || 
                (tagName == 'TemplateSubItem') || 
                (tagName == 'Id') || 
                (tagName == 'ZoneName') || 
                (tagName == 'From') ||
                (tagName == 'To')) {
                continue;
            } 
            
            if (tagName == 'SubItems') {                
                if (value instanceof Array) {
                    var htmlChild = '';
                    for (var child in value) {
                        var result = getZoneHtml(value[child], imgUrl, getTemplate);
                        htmlChild += result.Html;
                        if (result.Scripts.length > 0)
                            scripts = scripts.concat(result.Scripts);
                    }
                }
                
                value = htmlChild;
            } 
            else if (tagName == 'aHref') {
                if (value == '')
                    value = '#' + $location.path();
            }
            else if (tagName == 'imgSrc') {
                value = imgUrl + value;
            }
            
            if (value == 'GUIDgenerator') {
                value = qsCommon.GUID();
            } 
            
            html = html.replace(new RegExp(getTagId(tagName), 'g'), value );
            if (! qsCommon.isUndefined(script)) {
                script = script.replace(new RegExp(getTagId(tagName), 'g'), value );
            }
        }
        
        if (script)
            scripts.unshift(script);
        
        return  {
            Html   : html,
            Scripts : scripts
        };
	}

    return $this;

}

RenderFactory.$inject = ['$rootScope', '$location', 'qsCommon', 'qsEffects']

export default RenderFactory