import { LightningElement } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin'; //To-do: replace with namespace

export default class OsCustomLwcTester extends OmniscriptBaseMixin(LightningElement) {

    connectedCallback() {
        window.console.log("connectedCallback");
    }

    renderedCallback(){
        window.console.log("renderedCallback");
    }

}