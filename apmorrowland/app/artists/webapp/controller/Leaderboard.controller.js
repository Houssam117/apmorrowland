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