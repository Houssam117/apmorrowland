sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Sorter"
], function (Controller, Sorter) {
    "use strict";

    return Controller.extend("ns.artists.controller.List", {
        
        onInit: function () {
        },

        
        onSelectionChange: function (oEvent) {
            var oList = oEvent.getSource();
            var oItem = oList.getSelectedItem();
            
            if (oItem) {
                var oBindingContext = oItem.getBindingContext();
                var sPath = oBindingContext.getPath().substr(1); // haal '/' weg
                
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteDetail", {
                    orderPath: window.encodeURIComponent(sPath)
                });
            }
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