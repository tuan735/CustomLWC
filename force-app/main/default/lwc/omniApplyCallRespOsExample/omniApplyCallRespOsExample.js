import {
    LightningElement, api, track
} from 'lwc';
import {
    OmniscriptBaseMixin
} from 'vlocity_cmt/omniscriptBaseMixin'; //To-do: replace with namespace
export default class OmniApplyCallRespOsExample extends OmniscriptBaseMixin(LightningElement) {
    inputValue = '';

    myData = {
        "Step1" : {
           "CustomLWC1" : "newprop"
        },
        "Anotherprop" : {
           "prop1" : "anotherValue"
        }
     }

    handleChange(event) {
        console.log('event: ', event, 'inputValue: ', event.target.value);
        // this.myData.Anotherprop.prop1 = "should be new value";
        this.myData.Anotherprop.prop1 = event.target.value;
        this.omniApplyCallResp(this.myData);
    }
}