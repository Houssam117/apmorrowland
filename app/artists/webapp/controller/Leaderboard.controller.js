sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ns.artists.controller.Leaderboard", {
        
        onInit: function () {
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext();
            var sID = oCtx.getProperty("ID");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail", {
                artistID: sID
            });
        },

        formatTopRatedVisible: function (sRating) {
            if (!sRating) return false;
            return parseFloat(sRating) > 4.0;
        },

        
        formatHypeIconVisible: function(sCount) {
            var iCount = sCount || 0;
            return iCount > 50;
        },

        formatHotIconVisible: function(sCount) {
            var iCount = sCount || 0;
            return iCount > 20 && iCount <= 50;
        },

        formatRisingIconVisible: function(sCount) {
            var iCount = parseInt(sCount) || 0;
            return iCount <= 20;
        },

        formatHypeText: function(sCount) {
            var iCount = parseInt(sCount) || 0;
            if (iCount > 50) return "HYPE!";
            if (iCount > 20) return "Hot";
            return "Rising";
        },

        formatHypeState: function(sCount) {
            var iCount = parseInt(sCount) || 0;
            if (iCount > 50) return "Error";   // Rood
            if (iCount > 20) return "Warning"; // Oranje
            return "Success";                  // Groen
        },

        onFilterGenre: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            var aFilters = [];

            if (sKey !== "All") {
                aFilters.push(new Filter("genre", FilterOperator.Contains, sKey));
            }

            var oTable = this.byId("leaderboardTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        }
    });
});