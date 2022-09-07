import {
    LightningElement,
    api
} from 'lwc';
import dcChildCatalogs from "vlocity_cmt/dcChildCatalogs"

export default class TestDcChildCatalogs extends dcChildCatalogs {
    _catalogList = [];

    @api
    get catalogList() {
        return this._catalogList;
    }
    set catalogList(value) {
        console.log("set catalogList, input: ", JSON.parse(JSON.stringify(value)));

        this._catalogList = Array.from(JSON.parse(JSON.stringify(value)));
        console.log("set catalogList, _catalogList: ", this._catalogList);

        this.catalogs = Array.from(this._catalogList);
        console.log("set catalogList, catalogs: ", this.catalogs);

        this.fetchChildCatalogs();
    }

    /**
     * connectedCallback
     */
    connectedCallback() {
        this.updateParentCatalogCodeEventHandler = {
            result: this.updateParentCatalogCode.bind(this)
        }
    }


    /**
     * Override fetchChildCatalogs method
     */
    async fetchChildCatalogs() {
        console.log("fetchChildCatalogs, catalogs not empty: ", this.catalogs.length !== 0, "parentCatalog is: ", this.parentCatalogCode);
        if (this.catalogs.length !== 0 && this.parentCatalogCode !== "") {
            this.selectedCatalogIndex = this.catalogs.findIndex(
                catalog => catalog.catalogCode === this.parentCatalogCode
            );
            this.selectedCatalogIndex =
                this.selectedCatalogIndex == -1 ? 0 : this.selectedCatalogIndex;
            console.log("fetchChildCatalogs, selectedCatalogIndex: ", this.selectedCatalogIndex);

            console.log("fetchChildCatalogs, child catalog: ", this.catalogs[this.selectedCatalogIndex].childCatalogs.records);
            this.childCatalogs = Array.from(this.catalogs[this.selectedCatalogIndex].childCatalogs.records);
            console.log("fetchChildCatalogs, childCatalogs: ", JSON.stringify(this.childCatalogs));

            this.catalogCode = this.childCatalogs[0].catalogCode;
            console.log("fetchChildCatalogs, child catalogCode: ", this.catalogCode);

            Promise.resolve().then(() => {
                console.log("fetchChildCatalogs, update OS data json: child catalog code");
                this.updateOmniScriptDataJson({
                    catalogCode: this.catalogCode
                });
            });
        } else {
            console.log("fetchChildCatalogs, either catalog is empty or no parent catalog code");
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

                this.digitalCommerceSDK.register("vlocity-dc-update-parent-catalog", this.updateParentCatalogCodeEventHandler);
                
                console.log("getSDKInstance, fire event vlocity-dc-update-catalog-code");
                this.digitalCommerceSKD && this.digitalCommerceSDK.fire(
                    "vlocity-dc-update-catalog-code",
                    "result", {
                        catalogCode: this.catalogCode
                    }
                );
            })
            .catch(e => {
                console.log("getSDKInstance, error in getting SDK Instance", e);
            })
    }

    /**
     * Callback method for upate catalog code (vlocity-dc-update-parent-catalog)
     */
    updateParentCatalogCode(data) {
        console.log("upateParentCatalogCode event, data: ", data);
        this.parentCatalogCode = null;
        Promise.resolve().then(() => {
            this.parentCatalogCode = data.parentCatalogCode;
        });
    }

    /**
     * disconnectedCallback()
     */
    disconnectedCallback() {
        console.log("disconnectedCallback");
        if (this.digitalCommerceSDK) {
            this.digitalCommerceSDK.unregister("vlocity-dc-update-parent-catalog", this.updateParentCatalogCodeEventHandler);
        }
    }
}