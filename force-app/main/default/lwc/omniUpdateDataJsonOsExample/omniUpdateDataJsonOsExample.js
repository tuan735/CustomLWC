import { LightningElement } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin'; //To-do: replace with namespace

export default class OmniUpdateDataJsonOsExample extends OmniscriptBaseMixin(LightningElement) {
    //myData = "Custom LWC value"; //any kind of data that is a string, object, number, etc
    myData1 = {
        "prop1": "data1"
    }

    myData2 = {
        "prop2": "data2"
    }

    aggregrateOverrideValue = "false";
    aggregrateOverride = false;

    get options() {
        return [
            { label: "true", value: "true" },
            { label: "false", value: "false" }
        ]
    }

    aggregrateOverrideHandle = (event) => {
        console.log("aggregrateOverrideHandle, value selected: ", event.target.value);
        this.aggregrateOverrideValue = event.target.value;
        this.aggregrateOverride = (event.target.value === "true") ? true: false;
    }

    handleClick = (event) => {
        console.log("update button click: ", event.target.label);
        this.omniUpdateDataJson(this.myData1, this.aggregrateOverride);
    }

    handleClick2 = (event) => {
        console.log("update button click: ", event.target.label);
        this.omniUpdateDataJson(this.myData2, this.aggregrateOverride);
    }

}