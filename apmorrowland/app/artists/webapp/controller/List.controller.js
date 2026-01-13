sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Sorter"
], function (Controller, Sorter) {
    "use strict";

    return Controller.extend("ns.artists.controller.List", {
        
        onInit: function () {
        },

    onPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oBindingContext = oItem.getBindingContext();
            
            var sOrderID = oBindingContext.getProperty("ID");

            this.getOwnerComponent().getRouter().navTo("RouteOrderDetail", {
                orderID: sOrderID
            });
        },
        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },
        
        onSort: function () {
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            var aSorters = oBinding.getSorter();
            var bDesc = (aSorters.length > 0) ? !aSorters[0].bDescending : true;
            
            oBinding.sort(new Sorter("totalAmount", bDesc));
        },

        onCreateOrder: function () {
            // Hier komt straks de Wizard!
            sap.m.MessageToast.show("Wizard start binnenkort...");
        }
    });
});