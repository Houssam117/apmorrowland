sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, Fragment, MessageToast) {
    "use strict";

    return Controller.extend("ns.artists.controller.Artists", {

        onInit: function () {
            var oEventBus = this.getOwnerComponent().getEventBus();
            oEventBus.subscribe("reviews", "reviewAdded", this.onReviewAdded, this);
        },


        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
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
            var oCtx = oItem.getBindingContext();
            
            // Haal de ID op (a-001)
            var sID = oCtx.getProperty("ID");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteDetail", {
                artistID: sID
            });
        },

        onSort: function () {
            var oList = this.byId("artistsTable");
            var oBinding = oList.getBinding("items");
            var aSorters = oBinding.getSorter();
            var bDescending = false;
            
            if (aSorters && aSorters.length > 0) {
                bDescending = !aSorters[0].bDescending;
            }
            oBinding.sort(new sap.ui.model.Sorter("averageRating", bDescending));
        },

        onReviewAdded: function () {
            var oTable = this.byId("artistsTable");
            if (oTable) {
                oTable.getBinding("items").refresh();
            }
        },


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
            var oView = this.getView();
            var oModel = oView.getModel();

            var sName = this.byId("inputArtistName").getValue();
            var sGenre = this.byId("inputGenre").getSelectedKey();
            
            var oCountryBox = this.byId("inputCountry");
            var sCountry = oCountryBox.getSelectedKey() || oCountryBox.getValue(); // Fallback als je zelf typt

            var sLabel = this.byId("inputLabel").getSelectedKey();
            var sBio = this.byId("inputBio").getValue();
            var sImageUrl = this.byId("inputImageUrl").getValue();
            var sSpotify = this.byId("inputSpotify").getValue();
            var sInstagram = this.byId("inputInstagram").getValue();

            var sStageID = this.byId("inputStage").getSelectedKey();
            
            var oStartTime = this.byId("inputStartTime").getDateValue(); 
            var oEndTime = this.byId("inputEndTime").getDateValue();

            if (!sName || !sStageID || !oStartTime || !oEndTime) {
                MessageToast.show("Vul minstens Naam, Stage en Tijden in.");
                return;
            }

            var aDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var sDay = aDays[oStartTime.getDay()];

            
            var oListBinding = oModel.bindList("/Artists");

            var sNewID = "a-" + new Date().getTime(); 

            
            var oArtistContext = oListBinding.create({
                ID: sNewID,
                name: sName,
                genre: sGenre,
                country: sCountry,
                label: sLabel,
                biography: sBio,
                imageUrl: sImageUrl,
                spotifyUrl: sSpotify,
                instagramUrl: sInstagram
            });

            oArtistContext.created().then(function () {
                
                var oPerformanceBinding = oModel.bindList("/Performances");
                var sPerfID = "p-" + new Date().getTime();

                var oPerfContext = oPerformanceBinding.create({
                    ID: sPerfID,
                    day: sDay,
                    startTime: oStartTime.toISOString(),
                    endTime: oEndTime.toISOString(),
                    artist_ID: sNewID,
                    stage_ID: sStageID
                });

                oPerfContext.created().then(function() {
                    MessageToast.show("Artiest " + sName + " toegevoegd!");
                    this.byId("addArtistDialog").close();
                    
                    this.byId("inputArtistName").setValue("");
                    this.byId("inputBio").setValue("");
                    this.byId("inputImageUrl").setValue("");
                    
                    this.byId("artistsTable").getBinding("items").refresh();

                }.bind(this));

            }.bind(this)).catch(function (oError) {
                MessageToast.show("Fout: " + oError.message);
            });
        },


        onAddStage: function () {
            var that = this;
            if (!this.oStageDialog) {
                this.oStageDialog = new sap.m.Dialog({
                    title: "Nieuw Podium",
                    contentWidth: "300px",
                    content: [
                        new sap.m.Label({ text: "Naam podium", labelFor: "newStageInput" }),
                        new sap.m.Input("newStageInput", { placeholder: "bv. The Rave Cave" })
                    ],
                    beginButton: new sap.m.Button({
                        text: "Toevoegen",
                        type: "Emphasized",
                        press: function () {
                            var sName = sap.ui.getCore().byId("newStageInput").getValue();
                            if (sName) {
                                that._saveNewStage(sName);
                            }
                            that.oStageDialog.close();
                        }
                    }),
                    endButton: new sap.m.Button({
                        text: "Annuleren",
                        press: function () {
                            that.oStageDialog.close();
                        }
                    })
                });
                this.getView().addDependent(this.oStageDialog);
            }
            var oInput = sap.ui.getCore().byId("newStageInput");
            if(oInput) oInput.setValue("");
            this.oStageDialog.open();
        },

        _saveNewStage: function (sStageName) {
            var oModel = this.getView().getModel();
            var oListBinding = oModel.bindList("/Stages");
            var sStageID = "s-" + new Date().getTime();

            var oContext = oListBinding.create({
                ID: sStageID,
                name: sStageName
            });

            oContext.created().then(function () {
                sap.m.MessageToast.show("Podium '" + sStageName + "' toegevoegd!");
            });
        }
    });
});