class ModalMessageController {    
    constructor($uibModalInstance, messageType, message, title) {
        this.$uibModalInstance = $uibModalInstance

        this.iconClass = this.getIconClass(messageType)
        this.title = title
        this.message = message
    }

    getIconClass(messageType) {
        switch(messageType) {
            case 'error': return 'remove-2'
            case 'warning': return 'circle-exclamation-mark'
            case 'info': return 'ok-2'
        }
    }

    close() {
        this.$uibModalInstance.close()
    }
}

ModalMessageController.$inject = ['$uibModalInstance', 'messageType', 'message', 'title']

export default ModalMessageController