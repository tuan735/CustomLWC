import {
    LightningElement,
    api
} from 'lwc';
import dcCatalog from "vlocity_cmt/dcCatalog";

export default class TestDcCatalog extends dcCatalog {
    _catalogList;

    @api
    get catalogList() {
        return this._catalogList;
    }
    set catalogList(value) {
        console.log("set catalogList, input: ", JSON.parse(JSON.stringify(value)));
        
        this._catalogList = Array.from(JSON.parse(JSON.stringify(value)));
        console.log("set catalogList, this._catalogList: ", this._catalogList);

        this.catalogs = Array.from(this._catalogList);
        console.log("set catalogList, catalog: ", this.catalogs);

        this.getCatalogs();
    }

    // connectedCallback() {
    //     console.log("connectedCallback");
    //     }
    // }

    /**
     * Override getCatalogs
     */
    async getCatalogs() {
        console.log("override getCatalogs, _catalogList: ", this._catalogList, ", catalogs: ", this.catalogs);

        if (this.catalogs.length !== 0  && this._catalogList !== undefined) {
            console.log("override getCatalogs, catalogCode: ", this.catalogCode);

            this.selectedCatalogIndex = this.catalogs.findIndex(catalog => catalog.catalogCode === this.catalogCode);
            console.log("override getCatalogs, set selectedCatalogIndex to ", this.selectedCatalogIndex);

            console.log("override getCatalogs, setting active catalog")
            this.catalogs[this.selectedCatalogIndex].active = true;

            this.selectedCatalogCode = this.catalogs[this.selectedCatalogIndex].catalogCode;
            console.log("override getCatalogs, set selectedCatalogCode to ", this.selectedCatalogCode);

            Promise.resolve().then(() => {
                console.log("override getCatalogs updating OmniScript Data JSON with parentCatalogCode with selected catalog code");
                this.updateOmniScriptDataJson({
                    parentCatalogCode: this.selectedCatalogCode
                })
            })
        } else {
            console.log("override getCatalogs, catalog is empty");
        }

        this.getSDKInstance();
    }

    /**
     * Override
     * Method to get digital commerce SDK instance
     */
    getSDKInstance() {
        this.getDigitalCommerceSDK()
        .then(sdkInstance => {
            console.log("getSDKInstance, getDigitialCommerceSDK success: SDK Instance: ", sdkInstance);
            this.digitalCommerceSDK = sdkInstance;

            console.log("getSDKInstance, fire event vlocity-dc-update-parent-catalog");
            this.digitalCommerceSKD && this.digitalCommerceSDK.fire(
                "vlocity-dc-update-parent-catalog",
                "result",
                {
                    parentCatalogCode: this.selectedCatalogCode
                }
            );
        })
        .catch(e => {
            console.log("getSDKInstance, error in getting SDK Instance", e);
        })
    }

}