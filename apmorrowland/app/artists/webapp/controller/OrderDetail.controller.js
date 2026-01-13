sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("ns.artists.controller.OrderDetail", {
        
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrderDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sOrderID = window.decodeURIComponent(oEvent.getParameter("arguments").orderID);
            
            this.getView().bindElement({
                path: "/Orders('" + sOrderID + "')", 
                parameters: {
                    "$expand": "items"
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteOrders");
            }
        }
    });
});