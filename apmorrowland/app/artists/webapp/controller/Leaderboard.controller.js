sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("ns.artists.controller.Leaderboard", {
        
        onInit: function () {
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        formatTopRatedVisible: function (sRating) {
            if (!sRating) {
                return false;
            }
            
            
            var fRating = parseFloat(sRating);
            return fRating > 4.0;
        }
    });
});