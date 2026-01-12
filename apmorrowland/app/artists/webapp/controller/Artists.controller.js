sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, Filter, FilterOperator) {
        "use strict";

        return Controller.extend("ns.artists.controller.Artists", {
            onInit: function () {
            },

            onSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("query");
                var aFilters = [];

                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("name", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }

                var oList = this.byId("artistsTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters);
            },

            onPress: function (oEvent) {
                console.log("Clicked!");
            }
        });
    });