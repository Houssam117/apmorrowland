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
            
          
            var sID = oCtx.getProperty("ID");

            // Navigeer
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
                
                // Toggle sort order
                if (aSorters && aSorters.length > 0) {
                    bDescending = !aSorters[0].bDescending;
                }
                oBinding.sort(new sap.ui.model.Sorter("averageRating", bDescending)); // Sorteer op Rating
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

                // 1. Data ophalen uit inputs (Basis)
                var sName = this.byId("inputArtistName").getValue();
                var sGenre = this.byId("inputGenre").getSelectedKey();
                // Let op: Country is nu een dropdown (zie stap 2) of nog een input
                var oCountryControl = this.byId("inputCountry");
                var sCountry = oCountryControl.getSelectedKey ? oCountryControl.getSelectedKey() : oCountryControl.getValue();
                
                var sLabel = this.byId("inputLabel").getSelectedKey();
                var sBio = this.byId("inputBio").getValue();

                // 1b. Data ophalen (Socials & Foto)
                var sImageUrl = this.byId("inputImageUrl").getValue();
                var sSpotify = this.byId("inputSpotify").getValue();
                var sInstagram = this.byId("inputInstagram").getValue();

                // 1c. Data ophalen (Planning)
                var sDay = this.byId("inputDay").getSelectedKey();
                var sStageID = this.byId("inputStage").getSelectedKey();
                var oStartTime = this.byId("inputStartTime").getDateValue(); 
                var oEndTime = this.byId("inputEndTime").getDateValue();

                // Validatie
                if (!sName || !sStageID || !oStartTime || !oEndTime) {
                    MessageToast.show("Vul minstens Naam, Stage en Tijden in.");
                    return;
                }

                // Datum Hack
                var now = new Date();
                oStartTime.setFullYear(2026); oStartTime.setMonth(0); oStartTime.setDate(16); // 16 Jan 2026
                oEndTime.setFullYear(2026); oEndTime.setMonth(0); oEndTime.setDate(16);

                // --- DE FIX: BINDEN AAN DE ECHTE TABEL ---
                // We mogen niet schrijven naar 'ArtistsLeaderboard' (view), dus binden we tijdelijk aan '/Artists'
                var oListBinding = oModel.bindList("/Artists");

                // We genereren zelf een ID omdat we Strings gebruiken ipv UUIDs
                var sNewID = "a-" + new Date().getTime(); 

                // 2. Stap 1: Artiest aanmaken in /Artists
                var oArtistContext = oListBinding.create({
                    ID: sNewID,  // <--- Zelf ID meegeven!
                    name: sName,
                    genre: sGenre,
                    country: sCountry,
                    label: sLabel,
                    biography: sBio,
                    imageUrl: sImageUrl,
                    spotifyUrl: sSpotify,
                    instagramUrl: sInstagram
                });

                // 3. Stap 2: Wachten tot artiest is opgeslagen, dan performance maken
                oArtistContext.created().then(function () {
                    
                    // Performance aanmaken
                    var oPerformanceBinding = oModel.bindList("/Performances");
                    
                    // Performance ID genereren
                    var sPerfID = "p-" + new Date().getTime();

                    var oPerfContext = oPerformanceBinding.create({
                        ID: sPerfID,
                        day: sDay,
                        startTime: oStartTime.toISOString(),
                        endTime: oEndTime.toISOString(),
                        artist_ID: sNewID, // Gebruik de ID die we net maakten
                        stage_ID: sStageID
                    });

                    // Als ook de performance klaar is:
                    oPerfContext.created().then(function() {
                        MessageToast.show("Artiest " + sName + " toegevoegd!");
                        this.byId("addArtistDialog").close();
                        
                        // Velden wissen
                        this.byId("inputArtistName").setValue("");
                        this.byId("inputBio").setValue("");
                        this.byId("inputImageUrl").setValue("");
                        
                        // Ververs de tabel op het scherm zodat de nieuwe artiest verschijnt
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

                var oContext = oListBinding.create({
                    name: sStageName
                });

                oContext.created().then(function () {
                    sap.m.MessageToast.show("Podium '" + sStageName + "' toegevoegd!");
                });
            }
        });
    });