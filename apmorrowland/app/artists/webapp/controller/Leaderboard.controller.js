sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ns.artists.controller.Leaderboard", {
        
        onInit: function () {
            // Eventuele extra logica
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        }
    });
});