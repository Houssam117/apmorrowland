sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, History, Fragment, MessageToast) {
    "use strict";

    return Controller.extend("ns.artists.controller.Detail", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sPath = window.decodeURIComponent(oEvent.getParameter("arguments").artistPath);
            this.getView().bindElement({
                path: "/" + sPath
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteArtists", {}, true);
            }
        },

       
        onOpenReviewDialog: function () {
            var oView = this.getView();

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ns.artists.fragment.ReviewDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            // Open de dialoog
            this.pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        formatTopRatedVisible: function (sRating) {
            if (!sRating) {
                return false;
            }
            
            var fRating = parseFloat(sRating);
            return fRating > 4.0;
        },
        onCancelReview: function () {
            this.byId("reviewDialog").close();
        },

        onSaveReview: function () {
            // 1. Haal de waarden op uit de input velden
            var sName = this.byId("inputName").getValue();
            var iRating = this.byId("inputRating").getValue();
            var sComment = this.byId("inputComment").getValue();

            if (!sName) {
                MessageToast.show("Vul je naam in.");
                return;
            }

            var oListBinding = this.byId("reviewsList").getBinding("items");

            var oContext = oListBinding.create({
                visitorName: sName,
                rating: iRating,
                comment: sComment,
            });

            this.byId("inputName").setValue("");
            this.byId("inputComment").setValue("");
            this.byId("inputRating").setValue(0);
            this.byId("reviewDialog").close();
            
            MessageToast.show("Review geplaatst!");
        }
    });
});