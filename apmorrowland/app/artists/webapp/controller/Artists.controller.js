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
                var oRouter = this.getOwnerComponent().getRouter();
                
                oRouter.navTo("RouteDetail", {
                  
                    artistID: window.encodeURIComponent(oItem.getBindingContext().getPath().substr(1))
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

            // --- DIALOGS: Artiest & Stage ---

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
                
                // 1. Data ophalen uit inputs (Basis)
                var sName = this.byId("inputArtistName").getValue();
                var sGenre = this.byId("inputGenre").getSelectedKey();
                var sCountry = this.byId("inputCountry").getValue();
                var sLabel = this.byId("inputLabel").getSelectedKey();
                var sBio = this.byId("inputBio").getValue();

                // 1b. Data ophalen (Socials & Foto)
                var sImageUrl = this.byId("inputImageUrl").getValue();
                var sSpotify = this.byId("inputSpotify").getValue();
                var sInstagram = this.byId("inputInstagram").getValue();

                // 1c. Data ophalen (Planning)
                var sDay = this.byId("inputDay").getSelectedKey();
                var sStageID = this.byId("inputStage").getSelectedKey();
                // Hier ging het mis: we moeten de datums ophalen!
                var oStartTime = this.byId("inputStartTime").getDateValue(); 
                var oEndTime = this.byId("inputEndTime").getDateValue();

                // Validatie
                if (!sName || !sStageID || !oStartTime || !oEndTime) {
                    MessageToast.show("Vul minstens Naam, Stage en Tijden in.");
                    return;
                }

                // Datum Hack: Tijd goed zetten op een vaste datum (zodat het 'echte' timestamps zijn)
                // In een echt scenario pak je de datum van de gekozen dag.
                var now = new Date();
                oStartTime.setFullYear(2025); oStartTime.setMonth(6); oStartTime.setDate(25); 
                oEndTime.setFullYear(2025); oEndTime.setMonth(6); oEndTime.setDate(25);

                // 2. Stap 1: Artiest aanmaken
                var oListBinding = this.byId("artistsTable").getBinding("items");
                var oArtistContext = oListBinding.create({
                    name: sName,
                    genre: sGenre,
                    country: sCountry,
                    label: sLabel,
                    biography: sBio,
                    imageUrl: sImageUrl,
                    spotifyUrl: sSpotify,
                    instagramUrl: sInstagram,
                    // Standaardwaarden
                    averageRating: 0,
                    reviewCount: 0
                });

                // 3. Stap 2: Wachten tot artiest is opgeslagen, dan performance maken
                oArtistContext.created().then(function () {
                    
                    // Nu maken we de performance aan via een nieuwe binding op het model
                    var oPerformanceBinding = oView.getModel().bindList("/Performances");
                    
                    var oPerfContext = oPerformanceBinding.create({
                        day: sDay,
                        startTime: oStartTime.toISOString(),
                        endTime: oEndTime.toISOString(), // Hier gebruiken we de variabele
                        artist_ID: oArtistContext.getProperty("ID"),
                        stage_ID: sStageID
                    });

                    // Als ook de performance klaar is:
                    oPerfContext.created().then(function() {
                        MessageToast.show("Artiest " + sName + " toegevoegd!");
                        this.byId("addArtistDialog").close();
                        
                        // Velden wissen (netjes opruimen)
                        this.byId("inputArtistName").setValue("");
                        this.byId("inputBio").setValue("");
                        this.byId("inputImageUrl").setValue("");
                    }.bind(this));

                }.bind(this)).catch(function (oError) {
                    MessageToast.show("Fout: " + oError.message);
                });
            },

            // --- Stage Toevoegen (Popup) ---

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