sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ns.artists.controller.Home", {
        
        onNavToArtists: function () {
            this.getOwnerComponent().getRouter().navTo("RouteArtists");
        },

        onNavToOrders: function () {
            this.getOwnerComponent().getRouter().navTo("RouteOrders");
        }
      ,
        onNavToPlanning: function () {
            this.getOwnerComponent().getRouter().navTo("RoutePlanning");
        }
    });
    
});