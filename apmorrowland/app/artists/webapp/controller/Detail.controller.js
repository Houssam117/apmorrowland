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
                sArtistID = sArtistID.split("(")[1].replace(")", "").replace("'", "").replace("'", "");
            }

            console.log("Schone Artist ID:", sArtistID); // C console (moet a-005 zijn)

            if (!sArtistID) {
                return;
            }
            
         
            var sPath = "/ArtistsLeaderboard('" + sArtistID + "')";

            this.getView().bindElement({
                path: sPath,
                parameters: {
                    $expand: "reviews"
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
            
            var oTitleInput = this.byId("reviewTitleInput");
            var oTextInput = this.byId("reviewTextInput");
            var oRatingInput = this.byId("reviewRatingInput");

            if (!oTitleInput || !oTextInput || !oRatingInput) return;

            var sTitle = oTitleInput.getValue();
            var sText = oTextInput.getValue();
            var iRating = oRatingInput.getValue();

           
            var oContext = this.getView().getBindingContext();
            var sArtistID = oContext ? oContext.getProperty("ID") : null;

            if (!sTitle || !sText || iRating === 0) {
                sap.m.MessageToast.show("Vul alle velden in en geef sterren!");
                return;
            }

            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/Reviews");

            var sReviewID = "r-" + new Date().getTime(); 

         
            oListBinding.create({
                ID: sReviewID,       
                title: sTitle,
                text: sText,
                rating: iRating,
                artist_ID: sArtistID
            });

            sap.m.MessageToast.show("Review geplaatst!");
            this.onCancelReview();

          
            oTitleInput.setValue("");
            oTextInput.setValue("");
            oRatingInput.setValue(0);
            
           
            if (this.getView().getBindingContext()) {
                this.getView().getBindingContext().refresh();
            }
        },
    });
});