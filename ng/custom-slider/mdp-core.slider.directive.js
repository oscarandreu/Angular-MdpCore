
import '../../../node_modules/swiper/dist/js/swiper.js';
import '../../../node_modules/swiper/dist/css/swiper.css'

import controller from './mdp-core.slider.controller'
import templateUrl from './mdp-core.slider.html'

function SliderDirective() {
    return{
        restrict: 'E',
        controller: controller,
        transclude: true,
        replace: true,
        scope: {
            elements: '=',
            speed: '@',
            centeredSlides: '@',
            autoplay: '@',
            autoplayDisableOnInteraction: '@',
            slidesPerView: '@',
            paginationClickable: '@',
            effect: '@',
            onSlideChangeStart: '=',
            loop: '@'
        },
        templateUrl: templateUrl
    }

}

//SliderDirective.$inject = ['qsCommon', 'qcEvents', '$filter']

export default SliderDirective