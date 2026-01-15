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
            var oArgs = oEvent.getParameter("arguments");
            var sArtistID = oArgs.artistID;

            
            if (sArtistID && sArtistID.includes("(")) {
                sArtistID = sArtistID.split("(")[1].replace(")", "").replace(/'/g, "");
            }

            console.log("Schone Artist ID:", sArtistID); // MOET nu 'a-005' zijn

            if (!sArtistID) {
                return;
            }
            
         
            var sPath = "/ArtistsLeaderboard('" + sArtistID + "')";

            this.getView().bindElement({
                path: sPath,
                parameters: {
                    $expand: "reviews,performances($expand=stage)"
                }
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteHome", {}, true);
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
            this.pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onCancelReview: function () {
            this.byId("reviewDialog").close();
        },

        onSaveReview: function () {
            var oTitleInput = this.byId("reviewTitleInput");
            var oTextInput = this.byId("reviewTextInput");
            var oRatingInput = this.byId("reviewRatingInput");
            var oNameInput = this.byId("reviewNameInput");

            if (!oTitleInput || !oTextInput || !oRatingInput) return;

            var sTitle = oTitleInput.getValue();
            var sText = oTextInput.getValue();
            var iRating = oRatingInput.getValue();
            var sVisitorName = (oNameInput && oNameInput.getValue()) ? oNameInput.getValue() : "Anoniem";

            if (!sTitle || !sText || iRating === 0) {
                sap.m.MessageToast.show("Vul titel, tekst en sterren in!");
                return;
            }

            var oContext = this.getView().getBindingContext();
            var sArtistID = oContext ? oContext.getProperty("ID") : null;

            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/Reviews");
            var sReviewID = "r-" + new Date().getTime(); 

            oListBinding.create({
                ID: sReviewID,
                visitorName: sVisitorName,
                title: sTitle,
                text: sText,
                rating: iRating,
                artist_ID: sArtistID
            });

            sap.m.MessageToast.show("Review geplaatst!");
            this.onCancelReview();

            var oEventBus = this.getOwnerComponent().getEventBus();
            oEventBus.publish("reviews", "reviewAdded");

            oTitleInput.setValue("");
            oTextInput.setValue("");
            if(oNameInput) oNameInput.setValue("");
            oRatingInput.setValue(0);
            
            if (this.getView().getBindingContext()) {
                this.getView().getBindingContext().refresh();
            }
        },

        formatTopRatedVisible: function (sRating) {
            if (!sRating) { return false; }
            var fRating = parseFloat(sRating);
            return fRating > 4.0;
        }
    });
});