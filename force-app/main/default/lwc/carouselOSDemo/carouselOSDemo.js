/**
 * https://developer.salesforce.com/docs/component-library/bundle/lightning-carousel/example
 * 
 * 
 */

import {
    LightningElement,
    api
} from 'lwc';
import {
    OmniscriptBaseMixin
} from 'vlocity_cmt/omniscriptBaseMixin'; //To-do: replace with namespace

export default class CarouselOSDemo extends OmniscriptBaseMixin(LightningElement) {
    _images;

    sampleData = [{
            "src": "https://www.lightningdesignsystem.com/assets/images/carousel/carousel-01.jpg",
            "header": "First Card",
            "description": "First card description.",
            "alternativeText": "First card accessible description.",
            "href": "javascript:void(0)"
        },
        {
            "src": "https://www.lightningdesignsystem.com/assets/images/carousel/carousel-02.jpg",
            "header": "Second Card",
            "description": "Second card description.",
            "alternativeText": "Second card accessible description.",
            "href": "javascript:void(0)"
        }
    ];

    @api
    get images() {
        window.console.log("getter _images: ", JSON.stringify(this._images));
        return this._images;
    }
    set images(value) {
        window.console.log("setter _images: ", JSON.stringify(value));
        this._images = value;
        window.console.log("_image: ", JSON.stringify(this._images));
    }

}