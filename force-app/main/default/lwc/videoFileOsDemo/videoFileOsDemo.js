import { LightningElement, api } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin'; //To-do: replace with namespace

export default class VideoFileOsDemo extends OmniscriptBaseMixin(LightningElement) {
    _videos;

    @api
    get videos() {
        return this._videos;
    }
    set videos(value) {
        this._videos = value;
        window.console.log("videos set to: ", this._videos);
    }

}