sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter"
], function (Controller, Filter, FilterOperator, Sorter) {
    "use strict";

    return Controller.extend("ns.artists.controller.List", {

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var sOrderID = oItem.getBindingContext().getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("RouteOrderDetail", {
                orderID: sOrderID
            });
        },
onFilter: function () {
            var aFilters = [];

          
            var oSearchField = this.byId("searchField");
            if (oSearchField) {
                var sQuery = oSearchField.getValue();
                if (sQuery) {
                    aFilters.push(new Filter({
                        path: "customerName",
                        operator: FilterOperator.Contains,
                        value1: sQuery,
                        caseSensitive: false  
                    }));
                }
            }

            var oStatusSelect = this.byId("statusFilter");
            if (oStatusSelect) {
                var sStatus = oStatusSelect.getSelectedKey();
                if (sStatus) {
                    aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
                }
            }

            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },
        
        onSort: function () {
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            var aSorters = oBinding.getSorter();
            var bDescending = false;

            if (aSorters && aSorters.length > 0) {
                bDescending = !aSorters[0].bDescending;
            }

            oBinding.sort(new Sorter("orderDate", bDescending));
        },

        onCreateOrder: function () {
             sap.m.MessageToast.show("Nieuwe order wizard komt hier!");
        }
    });
});