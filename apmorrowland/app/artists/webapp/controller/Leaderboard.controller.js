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

        // --- 1. FORMATTER VOOR DE BADGE (DE FIX) ---
        formatTopRatedVisible: function (sRating) {
            // Veiligheidscheck: is er wel een rating?
            if (!sRating) {
                return false;
            }
            
            // Zet om naar een echt getal en check de drempelwaarde (4.0)
            // Dus 3.5 = false, 4.0 = false, 4.1 = true
            var fRating = parseFloat(sRating);
            return fRating > 3.9;
        },

        // --- 2. FILTER FUNCTIE VOOR TABS ---
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