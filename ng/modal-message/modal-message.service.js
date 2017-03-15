import modalMessageController from './modal-message.controller'
import modalMessageTemplateUrl from './modal-message.html'

class ModalMessageService {
    constructor($uibModal, $document) {
        this.$uibModal = $uibModal
        this.$document = $document
    }

    getOptions(options) {
        options = options || {}

        return {
            appendTo: angular.element(document.querySelector('#skin-message-hook')),
            backdrop: 'static',
            controller: modalMessageController,
            controllerAs: 'vm',
            openedClass: options.customClass ? options.customClass + ' fade in' : 'modal-info fade in',
            templateUrl: modalMessageTemplateUrl
        }
    }

    showMessage(message, title, options) {                
        let modalOptions = angular.extend({}, this.getOptions(options), {
            resolve: { 
                messageType: () => { return 'info' },
                message: () => { return message },
                title: () => { return title } 
            }});
        let modalInstance = this.$uibModal.open(modalOptions);
        
        if (options && options.autoCloseTimeout && options.autoCloseTimeout > 0)
            setTimeout(() => { 
                modalInstance.close()
            }, options.autoCloseTimeout)
    }

    showWarning(message, title) {
        let options = angular.extend({}, this.getOptions(), {
            openedClass: 'modal-info-alert fade in',
            resolve: { 
                messageType: () => { return 'warning' },
                message: () => { return message },
                title: () => { return title } 
            }});
        let modalInstance = this.$uibModal.open(options);
    }
    
    showError(message, title) {        
        let options = angular.extend({}, this.getOptions(), {
            openedClass: 'modal-info-error fade in',
            resolve: { 
                messageType: () => { return 'error' },
                message: () => { return message },
                title: () => { return title } 
            }});
        let modalInstance = this.$uibModal.open(options);
    }
}

ModalMessageService.$inject = ['$uibModal', '$document'];

export default ModalMessageService