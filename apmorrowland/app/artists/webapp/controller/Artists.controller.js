sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
],
    function (Controller, Filter, FilterOperator, Fragment, MessageToast) {
        "use strict";

        return Controller.extend("ns.artists.controller.Artists", {
            onInit: function () {
            },

            onSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("query");
                var aFilters = [];
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter("name", FilterOperator.Contains, sQuery);
                    aFilters.push(filter);
                }
                var oList = this.byId("artistsTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters);
            },

            onPress: function (oEvent) {
                var oItem = oEvent.getSource();
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteDetail", {
                    artistPath: window.encodeURIComponent(oItem.getBindingContext().getPath().substr(1))
                });
            },

            //  Add Artist Logic ---

            onOpenAddArtistDialog: function () {
                var oView = this.getView();
                if (!this.pDialog) {
                    this.pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "ns.artists.fragment.AddArtistDialog",
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

            onCancelArtist: function () {
                this.byId("addArtistDialog").close();
            },

            onSaveArtist: function () {
                // 1. Waarden ophalen
                var sName = this.byId("inputArtistName").getValue();
                var sGenre = this.byId("inputGenre").getSelectedKey();
                var sCountry = this.byId("inputCountry").getValue();
                var sLabel = this.byId("inputLabel").getSelectedKey();
                var sBio = this.byId("inputBio").getValue();

                if (!sName) {
                    MessageToast.show("Naam is verplicht!");
                    return;
                }

                var oBinding = this.byId("artistsTable").getBinding("items");

                var oContext = oBinding.create({
                    name: sName,
                    genre: sGenre,
                    country: sCountry,
                    label: sLabel,
                    biography: sBio,
                    averageRating: 0,
                    reviewCount: 0
                });

               
                
                oContext.created().then(function () {
                    MessageToast.show("Artiest " + sName + " toegevoegd!");
                }, function (oError) {
                    MessageToast.show("Fout bij opslaan: " + oError.message);
                });

                // Reset velden
                this.byId("inputArtistName").setValue("");
                this.byId("inputCountry").setValue("");
                this.byId("inputBio").setValue("");
                this.byId("addArtistDialog").close();
            }
        });
    });