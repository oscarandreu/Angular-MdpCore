
function EffectsFactory($rootScope,  $window, qsCommon, modalMessage) {
    let $this = {}   

    /**
     * Return the difference between top element and window height available.
     *
     * @param idElement
     * @returns Number
     */
    $this.getViewPortHeight = function(idElement) {
        return !qsCommon.isUndefined($('#' + idElement).offset())
            ? $(window).height() - $('#' + idElement).offset().top
            : $(window).height()
    }

    /** 
     * Open a self window.
	 * 
     * @param {type} dest
     * @param {type} w
     * @param {type} h
     * @param {type} scrollbars
     * @param {type} resizable
     */
    $this.openSelfWindow = function(dest, title, w, h, scrollbars, resizable) {	
		$this.openOuterWindow($scope.getSiteName() + '/' + $rootScope.getFullPath(dest), title, w, h, scrollbars, resizable)
    }
    
    /** 
     * Open a outer window.
	 * 
     * @param {type} url
     * @param {type} w
     * @param {type} h
     * @param {type} scrollbars
     * @param {type} resizable
     */
    $this.openOuterWindow = function(url, title, w, h, scrollbars, resizable) {
		if ( !w || w === null ) {
			w = 960
		}
		
		if (!h || h === null ) {
			h = 770
		}
		
        if ( !scrollbars || scrollbars === null ) {
            scrollbars = 'no'
        }
		
        if ( !resizable || resizable === null ) {
            resizable = 'no'
        }
		
        let top = (screen.height / 2) - (h / 2)
        let left = (screen.width / 2) - (w / 2)		
		let params = `top=${top},left=${left},height=${h},width=${w},status=no,toolbar=no,menubar=no,location=no,scrollbars=${scrollbars},resizable=${resizable}`
		
        $window.open(url, title, params)
    }
    
    /**
     * open a new window
     * 
     * @param {type} url
     * @param {type} title
     * @returns {undefined}
     */
    $this.openNewWindow = function(url, title){
        $window.open(url, title)
    }
    
    /**
     * Show information modal view.
     * 
     * @param Sting message
     */
    $this.showMessage = function(message, title) {
        modalMessage.showMessage(message, title)
    }
    
    /**
     * Show warning modal view.
     * 
     * @param Sting message
     */
    $this.showWarning = function(message, title) {
        modalMessage.showWarning(message, title)
    }
    
    /**
     * Show error modal view.
     * 
     * @param Sting message
     */
    $this.showError = function(message, title) {
        modalMessage.showError(message, title)
    }

    /**
     * Show news modal view.
     * 
     * @param Sting message
     */
    $this.showNews = function() {       
        $('#skin-news-message').modal('show')
    }    
    
    /**
     * Show confirm modal view.
     * 
     * @param Json options
     */
    $this.showConfirm = function(opt) {
        let DEFAULTS = {
		    title     : 'Confirm',
            text      : '',
            ok        : 'Ok',
            cancel    : 'Cancel',
            onConfirm : function() {},
            onCancel  : function() {}
            }
        let options = $.extend({}, DEFAULTS, opt || {})

        let show = function(el, text) {
            if (text) { 
                el.html(text) 
                el.show() 
            } 
            else {
                 el.hide() 
            }
        }

        let dialog = $('#skin-confirm-dialog')
        let footer = dialog.find('.modal-footer')

        show(dialog.find('.modal-body'), options.text)
        show(dialog.find('.modal-header h3'), options.title)
        footer.find('.btn-danger').html(options.ok ? options.ok : 'Ok')
        footer.find('.btn-cancel').html(options.cancel ? options.cancel : 'Cancel')
        dialog.modal('show')

        footer.find('.btn-danger').off('click').on('click', function(e) {
            e.preventDefault()
            dialog.modal('hide')
            
            if (typeof options.onConfirm === 'function')
                options.onConfirm.call(this, null)
        })
        
        footer.find('.btn-cancel').off('click').on('click', function(e) {
            e.preventDefault()
            dialog.modal('hide')
            
            if (typeof options.onConfirm === 'function')
                options.onCancel.call(this, null)
        })
    }

	/**
	 * css effect.
	 * 
	 * @param selector
	 * @param opt
	 */
	$this.css = function(selector, opt) {
        let 
        DEFAULTS = {
		    /* Empty */
        }, 
        options = $.extend({}, DEFAULTS, opt || {})
		
		$(selector).css(options)
	}
    
    /**
     * Shake effect.
     * 
     * @param selector
     * @param {type} opt
     */
    $this.shake = function(selector){
        $(selector).effect( "shake", "slow" )
    }
    
	/**
	 * Popover effect.
	 * 
	 * @param selector
	 * @param opt
	 */
	$this.popover = function(selector, opt) {
        let 
        DEFAULTS = {
		    /* Empty */
        }, 
        options = $.extend({}, DEFAULTS, opt || {})
		
		$(selector).popover(options)
	}
		
	/**
	 * Flexslider effect.
	 * 
	 * @param selector
	 * @param opt
	 */
	$this.flexslider = function(selector, opt) {
        let 
        DEFAULTS = {
            /* Emtpy */
        }, 
        options = $.extend({}, DEFAULTS, opt || {})
        $(selector).flexslider(options)
	}

	/**
	 * Event handler.
	 * 
	 * @param selector
	 * @param event
	 * @param action
	 */
	$this.on = function(selector, event, action) {
        $(selector).on(event, action)
	}
    
	$this.off = function(selector, event, action) {
		if (!action) {
			$(selector).off(event)
		}
		else {
			$(selector).off(event, action)
		}
	}
	
    /**
     * Set mdp skin background.
     * 
     * @param {String} wallpaper  
     * @param {String} pattern
     */
    $this.wallpaper = function(wallpaper, pattern) {        
        let str = `url('${wallpaper}'), url('${pattern}')`

        $('body').addClass('multi-bg')		
		$('body').css( 'background-image', str)
    }
    
    /**
     * Clear mdp skin background.     
     */
    $this.wallpaperClear = function() {    
        $('body').removeClass('multi-bg')   
        //$('body').css('background-image', 'none')
        $('body').removeAttr('style')
    }
	
	return $this
}

EffectsFactory.$inject = ['$rootScope',  '$window', 'qsCommon', 'modalMessage']

export default EffectsFactory