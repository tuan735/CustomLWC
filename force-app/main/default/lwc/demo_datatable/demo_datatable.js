/**
  This custom LWC is used to display a table and uses the standard Salesforce lightning-datatable LWC.
  
  @see https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable
  
  @authors Joe McMaster(joe.mcmaster@salesforce.com) and Dean Fischesser(dfischesser@salesforce.com)
  @version 2.4
 
  History
  =======
  Aug 25, 2020 - v1.0 - Initial Version
  Feb 10, 2021 - v2.0 - Updates to make fully metadata driven (no hard-coded columns or row key)
                      - Support for sorting, inline editing (including calling an optional DataRaptor to persist changes)
                      - Support for LWC OmniOut (requires some changes to the NodeJS project)
  Apr 21, 2021 - v2.1 - Renamed CSS class (to be more consistent)
                      - Documented list of CSS token overrides
  May 26, 2022 - v2.2 - Added Search Bar & Pagination Support
  Jun 13, 2022 - v2.3 - Added Advanced Filtering and counts (total rows, selected rows) in the footer
                      - Fixed infinite loop issue when 2x demo_datatable LWCs are configured on the same step
  Jun 14, 2022 - v2.4 - Further Styling enhancements
                      - Support for event generation (totally experimental at this stage)
                      - Support for initial sorting
                      - Table state will now be restored when backstepping in OmniScript
                      - Code Cleanup

  Configuration
  =============
  Set the following custom LWC properties for this component
  
  rows                   - (Mandatory) References a list of data in the OmniScript that should appear in the table
  key-field              - (Mandatory) The field name to use as the unique key for each row
  columns                - (Mandatory) The list of columns to display in the table in the form (you will need to set this using a SetValues):
                            [
                             {
                                "fieldName": <the name of the field in the data>,
                                "label": <the label to use as the column name>,
                                "type": <optional type>,
                                "sortable": true,
                                "editable": true
                                ...
                              }
                            ]
                            ** See the Salesforce lightning-datatable developer documentation for a complete list of column properties you can set
  max-row-selection      - The maximum number of rows that can be selected in the table.  Setting this to a value < 1 will hide the selection column (Optional, Default = 1000)
  hide-search            - Hide the search bar and filtering options (Default is false)
  page-size              - The maximum number of rows to display per page (Default is 10)
  show-row-number-column - Shows the row number column (**Note, the row number column will always show if any columns are editable) (Optional, Default = false)
  update-dataraptor      - The DataRaptor to call when one or more cells are updated manually within the table (Optional)
  send-events            - In addition to updating the OmniScript JSON with selected rows, a pub-sub event will be fired each time a row is selected
                           The events will be published to a channel called OS-Step-Channel-<step-element-name>
  sorted-by              - Name of the field to sort by
  sorted-direction       - The sort direction (desc or asc)
  debug                  - show extra debug information in the browser console (Optional, Default = false)

  Notes
  =====
  -If any columns are marked as editable, the row number column is always shown (behaviour of the datatable LWC)
  -Bulk inline edits can be performed by selecting >=1 row and then editing one of the fields (an option will appear asking if you want to update all records)

 */
import { LightningElement, api, track } from 'lwc';
import { OmniscriptBaseMixin } from 'vlocity_cmt/omniscriptBaseMixin';
import pubsub from 'vlocity_cmt/pubsub';

export default class demo_datatable extends OmniscriptBaseMixin(LightningElement) {  

    @api namespace = "vlocity" + "_cmt";  // Fool the OmniOut export process so it doesn't change the namespace to 'c'
    @api keyField;
    @api sortedBy;
    @api sortedDirection = "desc";
    @api showRowNumberColumn = false;
    @api updateDataraptor; // Optional DataRaptor to handle inline editing
    @api pageSize = 10; // Pagination Support

    // Initialize the debug flag
    @api
    get debug() {
        return this._debug;
    }
    set debug(data) {
        try {
            if (data) this._debug = String(data) === "true";
        } catch (err) {
            console.error("Error in set debug() -> " + err);
        }
    }
    // Initialize the Send Events flag
    @api
    get sendEvents() {
        return this._sendEvents;
    }
    set sendEvents(data) {
        try {
            if (data) this._sendEvents = String(data) === "true";
        } catch (err) {
            console.error("Error in set sendEvents() -> " + err);
        }
    }

    // Search/Filters
    @api
    get hideSearch() {
        return this._hideSearch;
    }
    set hideSearch(data) {
        try {
            if (data) this._hideSearch = String(data) === "true";
        } catch (err) {
            console.error("Error in set hideSearch() -> " + err);
        }
    }

    // Advanced Text Filters
    @api
    get showTextFilters() {
        return this.textFilters.length > 0;
    }
    // Advanced Text Filter # 1
    @api
    get showTextFilter1() {
        return this.textFilters[0];
    }
    @api 
    get textFilterName1() {
        if (this.textFilters[0]) return this.textFilters[0].name;
    }
    @api
    get textFilterLabel1() {
        if (this.textFilters[0]) return this.textFilters[0].label;
    }
    @api
    get textFilterValue1() {
        if (this.textFilters[0]) return this.textFilters[0].value;
    }
    @api
    get textFilterPlaceholder1() {
        if (this.textFilters[0]) return this.textFilters[0].placeholder;
    }
    @api
    get textFilterOptions1() {        
        return this.getAdvancedTextFilterOptions(this.textFilters[0]);
    }

    // Advanced Text Filter # 2
    @api
    get showTextFilter2() {
        return this.textFilters[1];
    }
    @api
    get textFilterName2() {
        if (this.textFilters[1]) return this.textFilters[1].name;
    }
    @api
    get textFilterLabel2() {
        if (this.textFilters[1]) return this.textFilters[1].label;
    }
    @api
    get textFilterValue2() {
        if (this.textFilters[1]) return this.textFilters[1].value;
    }
    @api
    get textFilterPlaceholder2() {
        if (this.textFilters[1]) return this.textFilters[1].placeholder;
    }
    @api
    get textFilterOptions2() {
        return this.getAdvancedTextFilterOptions(this.textFilters[1]);
    }

    // Advanced Text Filter # 3
    @api
    get showTextFilter3() {
        return this.textFilters[2];
    }
    @api
    get textFilterName3() {
        if (this.textFilters[2]) return this.textFilters[2].name;
    }
    @api
    get textFilterLabel3() {
        if (this.textFilters[2]) return this.textFilters[2].label;
    }
    @api
    get textFilterValue3() {
        if (this.textFilters[2]) return this.textFilters[2].value;
    }
    @api
    get textFilterPlaceholder3() {
        if (this.textFilters[2]) return this.textFilters[2].placeholder;
    }
    @api
    get textFilterOptions3() {
        return this.getAdvancedTextFilterOptions(this.textFilters[2]);
    }

    // Advanced Text Filter # 4
    @api
    get showTextFilter4() {
        return this.textFilters[3];
    }
    @api
    get textFilterName4() {
        if (this.textFilters[3]) return this.textFilters[3].name;
    }
    @api
    get textFilterLabel4() {
        if (this.textFilters[3]) return this.textFilters[3].label;
    }
    @api
    get textFilterValue4() {
        if (this.textFilters[3]) return this.textFilters[3].value;
    }
    @api
    get textFilterPlaceholder4() {
        if (this.textFilters[3]) return this.textFilters[3].placeholder;
    }
    @api
    get textFilterOptions4() {
        return this.getAdvancedTextFilterOptions(this.textFilters[3]);
    }

    // Advanced Text Filter # 5
    @api
    get showTextFilter5() {
        return this.textFilters[4];
    }
    @api
    get textFilterName5() {
        if (this.textFilters[4]) return this.textFilters[4].name;
    }
    @api
    get textFilterLabel5() {
        if (this.textFilters[4]) return this.textFilters[4].label;
    }
    @api
    get textFilterValue5() {
        if (this.textFilters[4]) return this.textFilters[4].value;
    }
    @api
    get textFilterPlaceholder5() {
        if (this.textFilters[4]) return this.textFilters[4].placeholder;
    }
    @api
    get textFilterOptions5() {
        return this.getAdvancedTextFilterOptions(this.textFilters[4]);
    }

    // Advanced Text Filter # 6
    @api
    get showTextFilter6() {
        return this.textFilters[5];
    }
    @api
    get textFilterName6() {
        if (this.textFilters[5]) return this.textFilters[5].name;
    }
    @api
    get textFilterLabel6() {
        if (this.textFilters[5]) return this.textFilters[5].label;
    }
    @api
    get textFilterValue6() {
        if (this.textFilters[5]) return this.textFilters[5].value;
    }
    @api
    get textFilterPlaceholder6() {
        if (this.textFilters[5]) return this.textFilters[5].placeholder;
    }
    @api
    get textFilterOptions6() {
        return this.getAdvancedTextFilterOptions(this.textFilters[5]);
    }

    // Advanced Numeric Filters
    @api
    get showNumericFilters() {
        return this.numericFilters.length > 0;
    }
    // Advanced Numeric Filter 1
    @api
    get showNumericFilter1() {
        return this.numericFilters[0];
    }
    @api
    get numericFilterMinLabel1() {
        if (this.numericFilters[0]) return "Min " + this.numericFilters[0].label;
    }
    @api
    get numericFilterMaxLabel1() {
        if (this.numericFilters[0]) return "Max " + this.numericFilters[0].label;
    }
    @api
    get numericFilterMinValue1() {
        if (this.numericFilters[0]) return this.numericFilters[0].min;
    }
    @api
    get numericFilterMaxValue1() {
        if (this.numericFilters[0]) return this.numericFilters[0].max;
    }
    @api
    get numericFilterMinPlaceholder1() {
        if (this.numericFilters[0]) return "0";
    }
    @api
    get numericFilterMaxPlaceholder1() {
        if (this.numericFilters[0]) return "Unlimited";
    }

    // Advanced Numeric Filter 2
    @api
    get showNumericFilter2() {
        return this.numericFilters[1];
    }
    @api
    get numericFilterMinLabel2() {
        if (this.numericFilters[1]) return "Min " + this.numericFilters[1].label;
    }
    @api
    get numericFilterMaxLabel2() {
        if (this.numericFilters[1]) return "Max " + this.numericFilters[1].label;
    }
    @api
    get numericFilterMinValue2() {
        if (this.numericFilters[1]) return this.numericFilters[1].min;
    }
    @api
    get numericFilterMaxValue2() {
        if (this.numericFilters[1]) return this.numericFilters[1].max;
    }
    @api
    get numericFilterMinPlaceholder2() {
        if (this.numericFilters[1]) return "0";
    }
    @api
    get numericFilterMaxPlaceholder2() {
        if (this.numericFilters[1]) return "Unlimited";
    }

    // Advanced Numeric Filter 3
    @api
    get showNumericFilter3() {
        return this.numericFilters[2];
    }
    @api
    get numericFilterMinLabel3() {
        if (this.numericFilters[2]) return "Min " + this.numericFilters[2].label;
    }
    @api
    get numericFilterMaxLabel3() {
        if (this.numericFilters[2]) return "Max " + this.numericFilters[2].label;
    }
    @api
    get numericFilterMinValue3() {
        if (this.numericFilters[2]) return this.numericFilters[2].min;
    }
    @api
    get numericFilterMaxValue3() {
        if (this.numericFilters[2]) return this.numericFilters[2].max;
    }
    @api
    get numericFilterMinPlaceholder3() {
        if (this.numericFilters[2]) return "0";
    }
    @api
    get numericFilterMaxPlaceholder3() {
        if (this.numericFilters[2]) return "Unlimited";
    }

    // Advanced Boolean Filters
    @track showSelectedRows = false;

    // Advanced Boolean Filter 1
    @api
    get showBooleanFilter1() {
        return this.booleanFilters[0];
    }
    @api
    get booleanFilterLabel1() {
        if (this.booleanFilters[0]) return this.booleanFilters[0].label;
    }

    // Advanced Boolean Filter 2
    @api
    get showBooleanFilter2() {
        return this.booleanFilters[1];
    }
    @api
    get booleanFilterLabel2() {
        if (this.booleanFilters[1]) return this.booleanFilters[1].label;
    }

    // Advanced Boolean Filter 3
    @api
    get showBooleanFilter3() {
        return this.booleanFilters[2];
    }
    @api
    get booleanFilterLabel3() {
        if (this.booleanFilters[2]) return this.booleanFilters[2].label;
    }

    // Advanced Boolean Filter 4
    @api
    get showBooleanFilter4() {
        return this.booleanFilters[3];
    }
    @api
    get booleanFilterLabel4() {
        if (this.booleanFilters[3]) return this.booleanFilters[3].label;
    }

    // Advanced Boolean Filter 5
    @api
    get showBooleanFilter5() {
        return this.booleanFilters[4];
    }
    @api
    get booleanFilterLabel5() {
        if (this.booleanFilters[4]) return this.booleanFilters[4].label;
    }

    // Advanced Date Filters
    @api
    get showDateFilters() {
        return this.dateFilters.length > 0;
    }
    // Advanced Date Filter 1
    @api
    get showDateFilter1() {
        return this.dateFilters[0];
    }
    @api
    get dateFilterMinLabel1() {
        if (this.dateFilters[0]) return "Min " + this.dateFilters[0].label;
    }
    @api
    get dateFilterMaxLabel1() {
        if (this.dateFilters[0]) return "Max " + this.dateFilters[0].label;
    }
    @api
    get dateFilterMinValue1() {
        if (this.dateFilters[0]) return this.dateFilters[0].min;
    }
    @api
    get dateFilterMaxValue1() {
        if (this.dateFilters[0]) return this.dateFilters[0].max;
    }
    @api
    get dateFilterMinPlaceholder1() {
        if (this.dateFilters[0]) return "Since";
    }
    @api
    get dateFilterMaxPlaceholder1() {
        if (this.dateFilters[0]) return "Before";
    }

    // Advanced Date Filter 2
    @api
    get showDateFilter2() {
        return this.dateFilters[1];
    }
    @api
    get dateFilterMinLabel2() {
        if (this.dateFilters[1]) return "Min " + this.dateFilters[1].label;
    }
    @api
    get dateFilterMaxLabel2() {
        if (this.dateFilters[1]) return "Max " + this.dateFilters[1].label;
    }
    @api
    get dateFilterMinValue2() {
        if (this.dateFilters[1]) return this.dateFilters[1].min;
    }
    @api
    get dateFilterMaxValue2() {
        if (this.dateFilters[1]) return this.dateFilters[1].max;
    }
    @api
    get dateFilterMinPlaceholder2() {
        if (this.dateFilters[1]) return "Since";
    }
    @api
    get dateFilterMaxPlaceholder2() {
        if (this.dateFilters[1]) return "Before";
    }

    // Advanced Date Filter 3
    @api
    get showDateFilter3() {
        return this.dateFilters[2];
    }
    @api
    get dateFilterMinLabel3() {
        if (this.dateFilters[2]) return "Min " + this.dateFilters[2].label;
    }
    @api
    get dateFilterMaxLabel3() {
        if (this.dateFilters[2]) return "Max " + this.dateFilters[2].label;
    }
    @api
    get dateFilterMinValue3() {
        if (this.dateFilters[2]) return this.dateFilters[2].min;
    }
    @api
    get dateFilterMaxValue3() {
        if (this.dateFilters[2]) return this.dateFilters[2].max;
    }
    @api
    get dateFilterMinPlaceholder3() {
        if (this.dateFilters[2]) return "Since";
    }
    @api
    get dateFilterMaxPlaceholder3() {
        if (this.dateFilters[2]) return "Before";
    }

    // Columns
    @api
    get columns() {
        return this._columns;
    }
    set columns(data) {

        if (data) {

            this._columns = JSON.parse(JSON.stringify(data));

            // Process the columns (set filters, etc.)
            this.processColumns();
        }
    }

    // Rows
    @api
    get rows() { 
        return this.processRows(); 
    }
    set rows(data) {

        if (data) {

            if (Array.isArray(data)) this._rows = JSON.parse(JSON.stringify(data));
            else this._rows = [ JSON.parse(JSON.stringify(data)) ];
        }
    }
    
    // Max Row Selection
    @api
    get maxRowSelection() { 
        return this._maxRowSelection;
    }
    set maxRowSelection(data) {

        if (data) {

            this._maxRowSelection = data;

            // Hide the checkbox column if row selection is set to 0
            if (this._maxRowSelection < 1) this.hideCheckboxColumn = true;
            else this.hideCheckboxColumn = false;
        }
    }

    @api
    get showSelectionMessage() {
        return this.maxRowSelection > 1;  // only show when in multi-select mode
    }
    @api
    get selectionMessage() {
        return this._selectedRows.length + " Selected";
    }

    @api
    get showPagination() {
        return this._pages.length > 1; // show pagination only when we have more than 1 page
    }
    @api
    get previousButtonDisabled() {
        return this._currentPage == 0;
    }
    @api
    get nextButtonDisabled() {
        return (this._currentPage + 1) == this._pages.length;
    }
    @api
    get paginationMessage() {
        return "Page " + (this._currentPage + 1) + " of " + this._pages.length;
    }
    @api
    get totalTotalRowsMessage() {
        
        let rowCount = 0;
        for (let page of this._pages) rowCount += page.length;
        
        let msg = "";
        
        if (rowCount == 1) msg += rowCount + " Row";
        else msg += rowCount + " Rows";

        if (rowCount != this._rows.length) msg += " ( Filters Applied )";

        return msg;
    }

    // Internal Data
    @track _rows = [[]];    // initialize with a single, blank page
    @track _columns = [];    
    hideCheckboxColumn = false;
    draftValues = [];
    _selectedRows = [];
    _maxRowSelection = 1000;
    _sendEvents = false;

    _hideSearch = false;
    _searchFilter = "";
    @track showAdvancedFilters = false;
    @track textFilters = [];
    @track numericFilters = [];
    @track booleanFilters = [];
    @track dateFilters = [];

    _pages = [];       // Pagination Support - All pages
    _currentPage = 0;  // Pagination Support - Current Visible Page Number

    _rendered = false;
    _debug = false;

    /**
     * Standared LWC Callback triggered when the element is added into the document.
     * We will use this to rehydrate the table selections if we've backstepped into it
     */
    connectedCallback() {

        // Restore any pre-existing data
        this.restore();
    }

    /**
     * Standard LWC Callback triggered after each render
     * 
     */
    renderedCallback() {

        // Update OmniScript JSON Data
        super.omniUpdateDataJson(this._rows.filter(r => r.isSelected));
    }

    /**
     * Restores the table data if the user has back-stepped within the OmniScript and the table
     * needs to be re-rendered from the original input + any selections/modifications the user has made
     */
    restore() {

        let data = this.getDataJson(); // Fetch the data JSON for this table
        if (data) {

            // Go through the rows
            for (let row of this._rows) {

                // Look for this row in the existing data
                let match = null;
                for (let e_row of data) {

                    if (row[this.keyField] == e_row[this.keyField]) {
                        match = e_row;
                        break;
                    }
                }

                if (!match) row.isSelected = false; // if we've backstepped there could be pre-selected rows which had been de-selected
                else {
                    for (let key in match) row[key] = match[key]; // rehydrate the row                   
                }
            }
        }
    }

    /**
     * Locates any pre-existing Data JSON for this component (if there is any).
     * This is useful to support backstepping and re-initializing the LWC state
     * 
     * @return The JSON Data currently associated to this component
     */
    getDataJson() {

        // Determine the Path to the JSON data we should look for
        let jsonPath = super.omniJsonDef.JSONPath.split(":"); // for example: AddOnSelections:AddOnContainer|1:SelectedAddOns

        // Dig through the JSON to find the data
        let jsonData = super.omniJsonData;

        for (let elementName of jsonPath) {

            // See if the element name contains a pipe (|) which signifies the data could be a list and we need to work with
            // a specific node in the list
            let elementIndex = -1;
            let elementParts = elementName.split('|');
            if (elementParts.length > 1) {
                elementName = elementParts[0];
                elementIndex = Number(elementParts[1]);
            }

            if (jsonData[elementName]) {

                jsonData = jsonData[elementName]; // Getting warmer

                // If we are to get a particular index and we have a list, grab it
                if (elementIndex >= 0 && Array.isArray(jsonData)) jsonData = jsonData[elementIndex - 1];

            } else return; // Nothing found
        }

        return jsonData;
    }

    /**
     * Processes the columns to populate filters, etc.
     * 
     */
    processColumns() {

        for (let column of this._columns) {

            // Handle advanced filtering various data types
            if (column.filterable) {

                // Construct the filter
                let filter = {
                    name: column.fieldName,
                    label: column.fieldName,
                    placeholder: column.fieldName,
                };

                // Use Nice Label if we have one
                if (column.label) {
                    filter.label = column.label;
                    filter.placeholder = column.label;
                }

                // Text-based filters
                if (!column.type || column.type == "text" || column.type == "email" || column.type == "phone" || column.type == "url" || column.type == "location") {
                    filter.value = undefined;
                    this.textFilters.push(filter);
                }
                // Numeric-based filters
                else if (column.type == "number" || column.type == "currency" || column.type == "percent") {
                    filter.min = undefined;
                    filter.max = undefined;
                    this.numericFilters.push(filter);
                }
                // Boolean-based filters
                else if (column.type == "boolean") {
                    filter.value = false;
                    this.booleanFilters.push(filter);
                }
                // Date-based filters
                else if (column.type == "date" || column.type == "date-local") {
                    filter.min = undefined;
                    filter.max = undefined;
                    this.dateFilters.push(filter);
                }
            }
        }
    }

    /**
     * Clears any advanced filters that may be set
     */
    clearAdvancedFilters() {

        // Clear All the Filters
        this.showSelectedRows = false;
        for (let filter of this.booleanFilters) filter.value = false;
        for (let filter of this.textFilters) filter.value = undefined;
        for (let filter of this.numericFilters) {
            filter.min = undefined;
            filter.max = undefined;
        }
        for (let filter of this.dateFilters) {
            filter.min = undefined;
            filter.max = undefined;
        }
    }

    /**
     * Handles any processing of the overall row set by applying any filters,
     * pre-selecting any rows, applying pagination, etc.
     * 
     * @returns The list of rows to display in the table
     */
    processRows() {

        let visibleRows = [];
        this._selectedRows = [];  // Reset Selected Rows
        
        // Sort the Rows
        this.sortRows();

        // Apply Pre-Selection/Filters
        for (let row of this._rows) {

            // handle pre-selection
            if (row.isSelected) this._selectedRows.push(row[this.keyField]);
            else row.isSelected = false;

            // handle search filter
            if (this.isRowVisible(row)) visibleRows.push(row);
        }

        // Paginate the visible rows
        this._pages = this.paginate(visibleRows);
        
        // Recalculate the Total Pages (if there has been a material change)
        // Don't get stranded on a page if it no longer exists!
        if ((this._currentPage + 1) > this._pages.length) this._currentPage = 0;

        // Return only the rows from the current page
        return this._pages[this._currentPage];
    }

    /**
     * Determines if the row is visible
     * 
     * @param row  The row to evaluate
     * 
     * @return true if the row should be visible, false otherwise
     */
    isRowVisible(row) {

        // Assume rows aren't visible unless they pass the search filter
        let visible = false;
        
        let filter = this._searchFilter.toLowerCase();
        if (filter != "") {

            for (let column of this._columns) {

                let val = row[column.fieldName];
                if (val && val.toString().toLowerCase().includes(filter)) {
                    visible = true;
                    break;
                }
            }
        }
        else visible = true;

        // If we make it here, and the row has passes the search filter, 
        // proceed to check other filters to determine if we keep it visible or not

        // Go through all of the Advanced Boolean Filters 
        if (visible) {

            if (this.showSelectedRows && !row.isSelected) visible = false;
            for (let booleanFilter of this.booleanFilters) {

                let name = booleanFilter.name;
                let val = booleanFilter.value;

                // Assume a cell with no value is intepretted as false - This may not be a good assumption in all use cases!
                // DataRaptors will return a Yes/No string value for boolean fields unless you explicitly set the output value to be of type "Boolean"
                let cellval = row[name];
                if (!cellval) cellval = false;
                else if (cellval == "No" || cellval == "no") cellval = false;
                else if (cellval == "Yes" || cellval == "yes") cellval = true;

                if (val && cellval != val) visible = false;
            }

            // Go through all of the Advanced Text Filters
            for (let textFilter of this.textFilters) {

                let name = textFilter.name;
                let val = textFilter.value;

                if (val && val != "" && row[name] != val) visible = false;
            }

            // Go through all of the Advanced Numeric Filters        
            for (let numFilter of this.numericFilters) {

                let name = numFilter.name;
                let min = numFilter.min;
                let max = numFilter.max;

                // Assume a cell with no value is intepretted as zero - This may not be a good assumption in all use cases!
                let cellval = row[name];
                if (!cellval) cellval = 0;

                // If value is less than minimum, hide it
                if (min && cellval < min) {
                    visible = false;
                    break;
                }
                // If value is more than maximum, hide it
                if (max && cellval > max) {
                    visible = false;
                    break;
                }
            }

            // Go through all of the Advanced Date Filters
            for (let dateFilter of this.dateFilters) {

                let name = dateFilter.name;
                let min = dateFilter.min;
                let max = dateFilter.max;

                // Assume a cell with no value is intepretted as no date and should be omitted - This may not be a good assumption in all use cases!
                let cellval = row[name];

                // If value is less than minimum, hide it
                if (min && (!cellval || cellval < min)) {
                    visible = false;
                    break;
                }
                // If value is more than maximum, hide it
                if (max && (!cellval || cellval > max)) {
                    visible = false;
                    break;
                }
            }
        }

        return visible;
    }

    /**
     * Paginates the visible rows
     *
     * @param rows  The rows to paginate
     * 
     * @return List of pages
     */
    paginate(rows) {

        let pages = [];
        for (let i=0; i<rows.length; i+= this.pageSize) {
            pages.push(rows.slice(i, i + this.pageSize));
        }

        return pages;
    }

    /**
     * Sorts the rows by the selected column and sort direction
     */
    sortRows() {

        if (this.sortedBy && this.sortedDirection) {
        
            if (this.debug) console.log("Sorting by " + this.sortedBy + " in " + this.sortedDirection + "ending direction");
        
            // Sort it
            var direction = this.sortedDirection;  // make scope visible in sort
            var sortField = this.sortedBy;         // make scope visible in sort
            this._rows.sort(function (a, b) {

                // Sort Ascending
                if (direction === "asc") {

                    // undefined values always appear first in an ascending sort
                    if (a[sortField] === undefined && b[sortField] !== undefined) return -1;
                    else if (a[sortField] !== undefined && b[sortField] === undefined) return 1;
                    else if (a[sortField] > b[sortField]) return 1;
                    else if (a[sortField] < b[sortField]) return -1;
                    else return 0;
                }
                // Sort Descending
                else {

                    // undefined values always appear last in a decending sort
                    if (a[sortField] === undefined && b[sortField] !== undefined) return 1;
                    else if (a[sortField] !== undefined && b[sortField] === undefined) return -1;
                    else if (a[sortField] > b[sortField]) return -1;
                    else if (a[sortField] < b[sortField]) return 1;
                    else return 0;
                }
            });
        }
    }

    /**
     * Handle sorting events
     * 
     * @param event  The sorting event
     */
    handleSort(event) {

        try {
        
            var fieldName = event.detail.fieldName;
            var sortDirection = event.detail.sortDirection;
            
            // sort the rows
            this.sortedBy = fieldName;
            this.sortedDirection = sortDirection;
            //this.sortData(fieldName, sortDirection);
        }
        catch (err) {
            console.error("Error in demo_datatable.handleSort()", err);
        }
    }

    /**
     * Handles selection/deselection of rows in the table
     * 
     * @param event The row selection event
     */
    handleRowSelection(event) {
        
        try {

            // The Row Selection Event is fired anytime the table changes (page change, filter, etc.)
            // We need to maintain a list of all selected rows and handle events against the current page
            let selections = event.detail.selectedRows;

            if (this.debug) console.log("Row(s) Selected -> " + JSON.stringify(selections));

            // Go through rows on the current page to determine what has been selected/deselected                    
            if (this._pages.length > 0) {

                for(let row of this._pages[this._currentPage]) {

                    let rowKey = row[this.keyField];

                    // Look at the selected Rows
                    let selected = false;
                    for (let srow of selections) {
                        if (rowKey == srow[this.keyField]) {
                            selected = true;
                            break;
                        }
                    }

                    row.isSelected = selected;
                }
            }

            // Send the event (if configured)
            this.sendEvent();
        }
        catch (err) {
            console.error("Error in demo_datatable.handleRowSelected() -> " + err);
        }
    }

    /**
     * Handles any inline edit.  The event can contain updates for multiple rows,
     * and each row may have multiple updates.
     * 
     * @param event The inline edit event 
     */
    handleSave(event) {

        try {
        
            let updates = event.detail.draftValues;

            // Track updates for a call to a DataRaptor
            //let drUpdates = [];

            // Handle multiple updates at once
            for (let i=0; i<updates.length; i++) {

                if (this.debug) console.log("Handling Save! -> " + JSON.stringify(updates[i]));

                // Find the row and update accordingly
                for (let x=0; x<this._rows.length; x++) {
                    
                    if (this._rows[x][this.keyField] == updates[i][this.keyField]) {
                        
                        // Found the Row, make the update(s)
                        for (let key in updates[i]) this._rows[x][key] = updates[i][key];

                        // Call the DataRaptor
                        if (this.updateDataraptor) {
                            // Sending multiple DR requests is failing for some reason.  Send one at a time for now
                            this.dataRaptorUpdates([this._rows[x]]);
                            //drUpdates.push(this._rows[x]);

                        }
                    }
                }
            }

            // Clear the draft values now that we've persisted them
            this.draftValues = [];

            // Call the Update DataRaptor
            //this.dataRaptorUpdates(drUpdates);  // commented out as sending multiple records to the DR fails
        }
        catch (err) {
            console.error("Error in demo_datatable.handleSave() -> " + err);
        }
    }

    /**
     * Calls a DataRaptor to update one or more records
     * 
     * @param updates  List of records to update
     */
    dataRaptorUpdates(updates) {   

        if (this.updateDataraptor && updates && updates.length > 0) {

            // Setup the call
            let inputData  = {
                bundleName: this.updateDataraptor,
                bulkUpload: false,
                ignoreCache: true,
                inputType: "JSON",
                objectList: updates
            };
            let optionData = {
                useQueuableApexRemoting: false
            };

            let request = {
               sClassName: this.namespace + ".DefaultDROmniScriptIntegration",
               sMethodName: "invokeInboundDR",
               input: JSON.stringify(inputData),
               options: JSON.stringify(optionData)
            };         
            if (this.debug) {
                console.log("Calling DataRaptor '" + this.updateDataraptor + "' with payload -> " + JSON.stringify(updates));
                //console.log("Raw DataRaptor Request -> " + JSON.stringify(request));
            } 

            // Call the DataRaptor
            super.omniRemoteCall(request, true).then(response => {

                if (response.result && response.result.IBDRresp && response.result.IBDRresp.hasErrors) console.error("DataRaptor Error -> " + JSON.stringify(response));
                else if (this.debug) console.log("DataRaptor Response -> " + JSON.stringify(response));

            }).catch(error => {
                console.error("DataRaptor Error -> " + JSON.stringify(error));
            });
        }
    }

    /**
     * Returns the advanced filter options
     * 
     * @param filter  The text filter for which to return options
     * 
     * @return The list of unique options based on the values found in the rows 
     */
    getAdvancedTextFilterOptions(filter) {

        let optionSet = new Set();
        optionSet.add(""); // Always add an empty value so users can clear a text filter

        if (filter) {

            // Go through all the rows to generate a list of unique options for the filter
            for (let row of this._rows) optionSet.add(row[filter.name]);            
        }

        let options = [];
        for (let option of optionSet) options.push({
            label: option,
            value: option
        });

        return options;
    }

    /**
     * Handles the Search
     * 
     * @param event The search event
     */
    handleSearch(event) {

        this._searchFilter = event.detail.value;
    }

    /**
     * Toggles the advanced filters section
     * 
     * @param event The toggle event
     */
    toggleAdvancedFilters(event) {

        this.showAdvancedFilters = !this.showAdvancedFilters;

        // Clear any advanced filters when the user disables the advanced filter toggler
        if (!this.showAdvancedFilters) this.clearAdvancedFilters();
    }

    /**
     * Handles Text Filter Events
     * 
     * @param event  The filter event
     */
    handleTextFilter(event) {
        
        let index = parseInt(event.currentTarget.dataset.index);

        if (isNaN(index)) return;
        this.textFilters[index - 1].value = event.detail.value;
    }

    /**
     * Handles Numeric Filter Events
     * 
     * @param event  The filter event
     */
    handleNumericFilterMin(event) {

        let index = parseInt(event.currentTarget.dataset.index);

        if (isNaN(index)) return;
        this.numericFilters[index - 1].min = event.detail.value;
    }
    handleNumericFilterMax(event) {
        
        let index = parseInt(event.currentTarget.dataset.index);

        if (isNaN(index)) return;
        this.numericFilters[index - 1].max = event.detail.value;
    }

    /**
     * Handles the stateful button to control if only selected rows should be displayed in the table
     * 
     * @param event The button event
     */
    showOnlySelectedRows(event) {
        this.showSelectedRows = !this.showSelectedRows;
    }

    /**
     * Handles Boolean Filter Events
     * 
     * @param event  The filter event
     */
    handleBooleanFilter(event) {
        
        let index = parseInt(event.currentTarget.dataset.index);

        if (isNaN(index)) return;
        this.booleanFilters[index - 1].value = !this.booleanFilters[index - 1].value;
    }
    
    /**
     * Handles Date Filter Events
     * 
     * @param event The filter event
     */
    handleDateFilterMin(event) {
        
        let index = parseInt(event.currentTarget.dataset.index);

        if (isNaN(index)) return;
        this.dateFilters[index - 1].min = event.detail.value;
    }
    handleDateFilterMax(event) {

        let index = parseInt(event.currentTarget.dataset.index);

        if (isNaN(index)) return;
        this.dateFilters[index - 1].max = event.detail.value;
    }

    /**
     * Handles the "Previous" Page Button
     * 
     * @param event  The button event
     */
    showPreviousPage(event) {
        this._currentPage--;
    }

    /**
     * Handles the "Next" Page Button
     * 
     * @param event  The button event
     */
    showNextPage(event) {
        this._currentPage++;
    }

    /**
     * Sends an event if configured to do so
     * 
     */
    sendEvent() {

        // Send event
        if (this.sendEvents) {

            // Generate a channel name based on the Element Name of the Step
            let stepChannel = "OS-Step-Channel-" + super.omniJsonDef.JSONPath.split(":")[0];

            // Publish the event (slight delay to give time for the OS data to update)
            setTimeout(() => {
                
                let pubsub_event = {};
                pubsub_event[super.omniJsonDef.name] = this._rows.filter(r => r.isSelected);

                if (this.debug) console.log(super.omniJsonDef.name + " (" + super.omniJsonDef.type + ") -> Publishing Event to " + stepChannel + ", Event -> " + JSON.stringify(pubsub_event));
                pubsub.fire(stepChannel, "result", pubsub_event);
            }, 250);
        }
    }
}