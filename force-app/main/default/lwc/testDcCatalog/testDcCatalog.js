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
        console.log("set catalogList, input: ", JSON.stringify(value));
        this._catalogList = value;
        console.log("set catalogList, this._catalogList: ", JSON.stringify(this._catalogList));
        this.getCatalogs();
    }

    connectedCallback() {
        console.log("customDcCatalog callback, this.catalog: ", this.catalogCode);
        console.log("customDcCatalog callback, getCatalogs, catalogs: ", JSON.stringify(this.catalogs));
    }

    /**
     * Override getCatalogs
     */
    async getCatalogs() {
        console.log("override getCatalogs, _catalogList: ", JSON.stringify(this._catalogList));
        if (this.catalogs == 0 && this._catalogList != undefined) {
            console.log("override getCatalogs, populating catalog");
            this.catalogs = JSON.parse(JSON.stringify(this._catalogList));
            console.log("override getCatalogs, catalog: ", JSON.stringify(this.catalogs));
        }

        if (this.catalogs != 0) {
            console.log("override getCatalogs, cached catalog ", JSON.stringify(this.catalogs));

            console.log("override getCatalogs, catalogCode: ", this.catalogCode);
            this.selectedCatalogIndex = this.catalogs.findIndex(catalog => catalog.catalogCode === this.catalogCode);
            console.log("override getCatalogs, set selectedCatalogIndex to ", this.selectedCatalogIndex);

            console.log("override getCatalogs, setting active catalog")
            this.catalogs[this.selectedCatalogIndex].active = true;

            this.selectedCatalogCode = this.catalogs[this.selectedCatalogIndex].catalogCode;
            console.log("override getCatalogs, set selectedCatalogCode to ", this.selectedCatalogCode);

            console.log("override getCatalogs updating OmniScript Data JSON with parentCatalogCode with selected catalog code");
            Promise.resolve().then(() => {
                this.updateOmniScriptDataJson({
                    parentCatalogCode: this.selectedCatalogCode
                })
            })
        } else {
            console.log("override getCatalogs, catalog is empty")
        }

        this.getSDKInstance();
    }
}