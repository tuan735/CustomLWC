/**
 * Based on slideshow: https://www.w3schools.com/howto/howto_js_slideshow.asp
 */


import {
    LightningElement,
    api
} from 'lwc';
import {
    OmniscriptBaseMixin
} from 'vlocity_cmt/omniscriptBaseMixin'; //To-do: replace with namespace

export default class SlideshowOsDemo extends OmniscriptBaseMixin(LightningElement) {
    _slideIndex = 1;
    _imagesdata;

    _sampleData = [{
            "ImageSource": "https://www.w3schools.com/howto/img_nature_wide.jpg",
            "Caption": "Caption Text",
            "Id": "01ABC"
        },
        {
            "ImageSource": "https://www.w3schools.com/howto/img_snow_wide.jpg",
            "Caption": "Caption Two",
            "Id": "02ABC"
        }
    ];

    @api
    get imagesdata() {
        return this._imagesdata;
    }
    set imagesdata(value) {
        // window.console.log("setting image source: ", JSON.stringify(value));
        this._imagesdata = value;
        window.console.log("after setter, images data: ", JSON.stringify(this._imagesdata));
    }

    // Next/previous controls
    plusSlides(event) {
        // window.console.log("plusSlides event: ", event);
        window.console.log("data-to-slide attribute: ", event.target.getAttribute('data-to-slide'));

        let navigateSlide = event.target.getAttribute('data-to-slide');
        let n = (navigateSlide == "next" ? +1 : -1)

        this.showSlides(this._slideIndex += n);
    }

    // Thumbnail image controls
    currentSlide(event) {
        // window.console.log("currentSlide event: ", event);
        window.console.log("slide index attribute: ", event.target.getAttribute('data-slide-index'));
        let n = Number(event.target.getAttribute('data-slide-index')) + 1;

        this.showSlides(this._slideIndex = n);
    }

    showSlides = (n) => {
        let slides = this.template.querySelectorAll('.mySlides');
        // window.console.log("slides: ", JSON.stringify(slides), " length: ", slides.length);

        if (n > slides.length) {
            this._slideIndex = 1
        }
        if (n < 1) {
            this._slideIndex = slides.length
        }

        slides.forEach((slide, index) => {
            // window.console.log("setting style display for: ", index);
            slide.style.display = "none";
        })

        window.console.log("setting slide ", this._slideIndex, " to display");
        slides[this._slideIndex - 1].style.display = "block";

    }

    renderedCallback() {
        window.console.log("renderedCallback, setting first image to display");
        // let divTag = this.template.querySelectorAll('div');
        // window.console.log("divTag: ", JSON.stringify(divTag));
        this.showSlides(this._slideIndex);
    }
}