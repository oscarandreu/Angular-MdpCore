require('angular')

const MODULE_NAME = 'mdpCore'

import qcApiRoutes from './mdp-core.api-routes.constant'
import qcEvents from './mdp-core.events.constant'
import qcKeyCodes from './mdp-core.key-codes.constant'

import qsCommon from './mdp-core.common.factory'
import qsEffects from './mpd-core.effects.factory'
import qsRender from './mdp-core.render.factory'
import qsRest from './mdp-core.rest.factory'
import qsSession from './mdp-core.session.factory'
import skinRoutes from './mdp-core.skin-routes.factory'

import escapeClick from './escape-click/mdp-core.escape-click.directive'
import loaderComponent from './loader/mdp-core.loader.component'
import ngBindHtmlUnsafe from './ng-bind-html-unsafe/mdp-core.ng-bind-html-unsafe.directive'
import repeatDone from './repeat-done/mdp-core.repeat-done.directive'
import customSlider from './custom-slider/mdp-core.slider.directive'

import htmlToPlainText from './html-to-plain-text/mdp-core.html-to-plain-text.filter'
import startFromFilter from './start-from/mdp-core.start-from.filter'
import object2Array from './object-2-Array/mdp-core.object-2-array.filter'

import modalMessage from './modal-message/modal-message.service'

qsRender.$inject = ['qsCommon', '$rootScope', '$location', 'qsEffects']
qsRest.$inject = ['$rootScope']
qsSession.$inject = ['$rootScope', 'qsRest', 'qcEvents', 'qsCommon', 'qcApiRoutes', '$location', '$q']
skinRoutes.$inject = ['$rootScope']

angular.module(MODULE_NAME, [])

angular.module(MODULE_NAME).component('loader', loaderComponent)

angular.module(MODULE_NAME).constant('qcApiRoutes', qcApiRoutes)
angular.module(MODULE_NAME).constant('qcEvents', qcEvents)
angular.module(MODULE_NAME).constant('qcKeyCodes', qcKeyCodes)

angular.module(MODULE_NAME).directive('escapeClick', escapeClick)
angular.module(MODULE_NAME).directive('ngBindHtmlUnsafe', ngBindHtmlUnsafe)
angular.module(MODULE_NAME).directive('repeatDone', repeatDone)

angular.module(MODULE_NAME).directive('customSlider', customSlider)

angular.module(MODULE_NAME).factory('qsCommon', qsCommon)
angular.module(MODULE_NAME).factory('qsEffects', qsEffects)
angular.module(MODULE_NAME).factory('qsRender', qsRender)
angular.module(MODULE_NAME).factory('qsRest', qsRest)
angular.module(MODULE_NAME).factory('qsSession', qsSession)
angular.module(MODULE_NAME).factory('qsSkinRoutes', skinRoutes)

angular.module(MODULE_NAME).filter('htmlToPlainText', htmlToPlainText)
angular.module(MODULE_NAME).filter('startFrom', startFromFilter)
angular.module(MODULE_NAME).filter('object2Array', object2Array)

angular.module(MODULE_NAME).service('modalMessage', modalMessage)