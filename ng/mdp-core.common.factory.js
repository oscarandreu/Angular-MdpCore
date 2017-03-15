function CommonFactory($location){
    let ITALY_UTF_OFFSET = -120

	let $this = {}
    
	$this.message = new Array()
    
	/**
	 * Return true if param is 'null' or empty or undefined. Otherwise it returns false
	 * 
	 * @param object
     * @returns {Boolean}
	 */
	$this.isUndefined = function(object) {
        if ((object === null) || (object === "") || (typeof object === 'undefined')) {
            return true
        }
        
        return false
	}		
    
	/**
	 * Return true if all array|object items are 'null' or empty or undefined. Otherwise it returns false
	 * 
	 * @param object
     * @returns {Boolean}
	 */
    $this.isUndefinedItems = function(items) {
        for (let i in items) {
            if (!$this.isUndefined(items[i])) {
                return false
            }
        }
        
        return true
    }
	
    /**
     * Return true if param is a object. Otherwise it returns false
     * 
     * @param {type} object
     * @returns {Boolean}
     */
    $this.isObject = function(object) {
        if ($this.isUndefined(object))
            return false
        
        if (typeof object === 'object')
            return true
        
        return false
    }
    
    /**
	 * Toggle flag state.
	 * @param {Object} root   Root object.
     * @param {String} flag   Flag name to set value (boolean). Property of root or child of root.
     * @param {Boolean} value  Value to set flag. Can be undefined.     
     */
	$this.toggleFlag = function(root, flag, value) {
		if (!flag) {
			return
		}
		
		let path = [ flag ]
		if (flag.indexOf('.') > -1) {
			path = flag.split('.')
		}
		
		let object = null
		if (path.length > 1) {
			for (let i = 0; i < path.length; i++) {				
				if (i === path.length - 1) {
					break
				}

				if (!object) {
					if (!root.hasOwnProperty(path[i])) {
						return
					}

					object = root[ path[i] ]
					continue
				}

				if (!object.hasOwnProperty(path[i])) {
					return
				}

				object = object[ path[i] ]
			}
		}
		else if (root.hasOwnProperty(path[0])) {
			object = root
		}
		else {
			return
		}
		
		object[ path[path.length - 1] ] = typeof value !== 'undefined'
			? value 
			: !object[ path[path.length - 1] ]
	}
	
    /**
     * The locales and options arguments are not supported in all browsers yet. To check whether an implementation supports them already, 
     * you can use the requirement that illegal language tags are rejected with a RangeError exception
     */
    $this.toLocaleDateStringSupportsLocales = function() {
        try {
            new Date().toLocaleDateString("i")
        } catch (e) {
        	if($this.isUndefined(e))
        		return false
        	
            return e.name === "RangeError"
        }
        return false
    }

	/**
	 * Conver server date to local date.
	 * 
	 * @param {type} date
	 * @param {type} offset UTC offset
	 * @returns {Date}
	 */
	$this.date2Local = function(date, offset) {
		if (!offset) {
			offset = ITALY_UTF_OFFSET
		}
		
        let localDate = new Date()
        let localOffset = -localDate.getTimezoneOffset() // Difference between UTC and Local date
        let utc = date.getTime() + (offset * 60000)      // obtain UTC time in msec for the given date

        // convert msec value to date for the local date.
        localDate = new Date (utc + (60000 * localOffset))
        
        return localDate
	}
    
    /**
     * Return a uniq id.
     * https://github.com/kvz/phpjs/blob/master/functions/misc/uniqid.js
     * 
     * example 1: uniqid()
     * returns 1: 'a30285b160c14'
     * example 2: uniqid('foo')
     * returns 2: 'fooa30285b1cd361'
     * example 3: uniqid('bar', true)
     * returns 3: 'bara20285b23dfd1.31879087'
     * 
     * @param {type} prefix
     * @param {type} more_entropy
     * @returns {unresolved}
     */    
    $this.uniqid = function(prefix, more_entropy) {
        if (typeof prefix === 'undefined') {
            prefix = ''
        }

        let retId
        let formatSeed = function(seed, reqWidth) {
            seed = parseInt(seed, 10).toString(16) // to hex str
            if (reqWidth < seed.length) { // so long we split
                return seed.slice(seed.length - reqWidth)
            }
            if (reqWidth > seed.length) { // so short we pad
                return Array(1 + (reqWidth - seed.length)).join('0') + seed
            }
            return seed
        }

        // BEGIN REDUNDANT
        if (!$this.php_js) {
            $this.php_js = {}
        }
        // END REDUNDANT
        if (!$this.php_js.uniqidSeed) { // init seed with big random int
            $this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15)
        }
        $this.php_js.uniqidSeed++

        retId = prefix // start with prefix, add current milliseconds hex string
        retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8)
        retId += formatSeed($this.php_js.uniqidSeed, 5) // add seed hex string
        if (more_entropy) {
            // for more entropy we add a float lower to 10
            retId += (Math.random() * 10).toFixed(8).toString()
        }

        return retId
    }
	
    /**
     * Return a hash key for a string. This function takes a string as input. 
     * It processes the string four bytes at a time, and interprets each of the 
     * four-byte chunks as a single long integer value
     * 
     * @param {String} string
     * @param {Number} m. Module.
     * @returns {Number}
     */
    $this.hashkey = function(string, m) {
        if ($this.isUndefined(m)) {
            m = 100000
        }
        
        let fold = 4        
        let intLength = Math.floor( string.length / fold )
        let sum = 0
        for (let i = 0; i < intLength; i++) {
            let c = string.substring(i * fold, (i * fold) + fold)
            let mult = 1
            
            for (let j = 0; j < c.length; j++) {
                sum += c.charCodeAt(j) * mult
                mult *= 256
            }
        }
        
        let c = string.substring(intLength * 4)
        let mult = 1
            
        for (let j = 0; j < c.length; j++) {
            sum += c.charCodeAt(j) * mult
            mult *= 256
        }
        
        return (Math.abs(sum) % m)
    }
    
    /**
     * Return the time stamp string.
     * 
     * @returns {String}
     */
    $this.getTmsTag = function() {
        let current = new Date()
        // Used, for example, for files named to upload.
        // No use charactes as ':'
        return (current.getFullYear() 
            + '-' + (current.getMonth() + 1)
            + '-' + current.getDate() 
            + '.' + current.getHours()
            + '.' + current.getMinutes()
            + '.' + current.getSeconds())
    }
    
    /**
     * Return Date object from array values.
     * 
     * @param {Array} values
     * @returns {Date}
     */
    $this.getDateFromArray = function(values) {
        return (new Date(
            values[0],     // year
            values[1] - 1, // month
            values[2],     // date
            values.length >= 4 ? values[3] : 0, // hour
            values.length >= 5 ? values[4] : 0, // minute
            values.length >= 6 ? values[5] : 0  // seconds
        ))
    }

    /**
     * Return Date object. if days|hours|min parameter is specified, the function adds the days to the date.
     *
     * @param (Number) days
     * @returns (Date)
     */
    $this.getDate = function (days, hours, min) {
        let date = new Date()
        if (days || hours || min) {
            let minutes = 0
            if (days) {
                minutes += (days * 24 * 60)
            }
            if (hours) {
                minutes += (hours * 60)
            }
            if (min) {
                minutes += (min)
            }

            date.setTime(date.getTime() + (minutes * 60 * 1000))
        }
        return date
    }

    /**
     * Return Array from date in string format.
     * 
     * @param {String} date
     * @param {String} time
     * @returns {Array}
     */
    $this.getArrayFromDateStr = function(date, time) {        
        let d = new Date(date + ($this.isUndefined(time) ? '' : ' ' + time) )
        if (isNaN(d.getTime())) {
            return new Array()
        }
        
        let result = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]
        return result
    }
    
	/**
	 * Insert a message from array and removes it.
	 */
	$this.addMessage = function (key,object) {
		$this.message[key] = object
		return true
	}
	
	/**
	 * Gets a message from array and removes it.
	 */
	$this.getMessage = function (key) {
		let obj = $this.message[key]
		delete $this.message[key]
		return obj
	}
	
	$this.containMessage = function (key) {
		if ($this.isUndefined($this.message[key]))
			return false
		return true
	}	

    $this.cleanSlug = function(slug){		
    	slug = slug.replace(/[^a-zA-Z0-9\s]/g,"")
    	slug = slug.toLowerCase()
    	slug = slug.replace(/\s/g,'_')
        
        return slug
    }	
	
    /**
     * Clean angular properties as '$$hashKey'.
     * 
     * @param {Object} ngObj
     * @returns {Object}
     */
    $this.cleanNgObject = function(ngObj) {
        let output

        output = angular.toJson(ngObj)
        output = angular.fromJson(output)
        
        return output
    }
	
	/**
	 * GUID Generator
	 */
	$this.GUID = function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    let r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8)
		    return v.toString(16)
		})
	}
	
	$this.validateDate = function(year, month, day){
		 if (day < 1 || day > 31) {
             return false
         }
         if (month < 1 || month > 12) { 
             return false
         }
         
         if ((month==4 || month==6 || month==9 || month==11) && day==31) {
             return false
         }
         
         if (month == 2) { // bisiesto
             let bisiesto = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0))
             if (day > 29 || (day==29 && !bisiesto)) {
                 return false
             }
         }
         return true
	}

    /**
     * Clear all the elements of an array/object without changing the reference, this must be used in objects binded
     * instead of:
     *      obj = {}
     * This assignments change the reference of the object (pointer) because they create a new object, with this method this can be avoided.
     */
    $this.clearObject = function(obj){
        let keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            delete obj[keys[i]]
        }
    }

   
    /**
     * Return true if path is null, undefined, empty string or root path ('/').
     * 
     * @param {type} path
     * @returns {Boolean}
     */
    $this.isEmptyPath = function(path) {
        return $this.isUndefined(path) || (path.trim() === '/')
    };
    
    /**
     * Given a relative path, without the language prefix, checks it is the current route.
     * 
     * @param {String} path
     * @param (Boolean) hasLangPrefix
     * @returns {Boolean}
     */
    $this.isCurrentPath = function(path, hasLangPrefix) {           
        let current = $location.path();
        if ($this.isUndefined(hasLangPrefix) || !hasLangPrefix) {
            // Ignore the language.
            current = current.replace(/^\/([^\/]*)(.*)$/, '$2')
        }
        
        // If path is empty and current no empty.
        if ($this.isEmptyPath(path) && !$this.isEmptyPath(current))
            return false;       
        
        return (current === ((path === '/') ? '' : path ))
    };
    
    /**
     * Given a relative path, without the language prefix, 
     * determines whether the route is part of the current path.
     * 
     * @param {String} path
     * @returns {Boolean}
     */
    $this.inCurrentPath = function(path) {   
        // Ignore the language.
        let current = $location.path().replace(/^\/([^\/]*)(.*)$/, '$2')
        path = $this.isUndefined(path) ? '' : path

        if (current === '' || current.replace(/^(.*)(.)$/, '$2') !== '/')
            current += '/'
        
        if (path === '' || path.replace(/^(.*)(.)$/, '$2') !== '/')
            path += '/'

        return (current.indexOf(path) === 0)
    };
	
	return $this
}


CommonFactory.$inject = ['$location']

export default CommonFactory