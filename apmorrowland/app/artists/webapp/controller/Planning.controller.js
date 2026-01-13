sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Popover",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/VBox"
], function (Controller, JSONModel, Popover, Label, Text, VBox) {
    "use strict";

    return Controller.extend("ns.artists.controller.Planning", {

        onInit: function () {
            // Startdatum: 16 Januari 2026 (Winter Editie)
            var oStateModel = new JSONModel({
                startDate: new Date("2026-01-16T08:00:00") 
            });
            this.getView().setModel(oStateModel, "settings");
        },

        // Formatter voor de View (zorgt dat de blokjes verschijnen)
        formatDate: function(sDate) {
            if (!sDate) { return null; }
            return new Date(sDate);
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        // HIER ZIT DE FIX
        onAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            if (!oAppointment) { return; }

            // 1. DATA OPHALEN (Direct van het scherm)
            // We gebruiken "||" om zeker te zijn dat er altijd IETS staat
            var sArtist = oAppointment.getTitle() || "Geen artiest gevonden";
            var sGenre = oAppointment.getText() || "Geen genre";
            
            console.log("Geselecteerde artiest:", sArtist); // <--- Kijk in je F12 console!

            // 2. TIJD OPHALEN (Bulletproof methode)
            var oStart = oAppointment.getStartDate();
            var oEnd = oAppointment.getEndDate();
            var sStartStr = "--:--";
            var sEndStr = "--:--";

            // Simpele handmatige formatting om errors te voorkomen
            if (oStart) {
                var h = oStart.getHours().toString().padStart(2, '0');
                var m = oStart.getMinutes().toString().padStart(2, '0');
                sStartStr = h + ":" + m;
            }
            if (oEnd) {
                var h = oEnd.getHours().toString().padStart(2, '0');
                var m = oEnd.getMinutes().toString().padStart(2, '0');
                sEndStr = h + ":" + m;
            }

            // 3. POPOVER MAKEN (Als die nog niet bestaat)
            if (!this._oPopover) {
                this._oPopover = new Popover({
                    title: "Details",
                    placement: "Auto",
                    contentWidth: "250px",
                    content: new VBox({
                        items: [
                            new Label({ text: "Artiest:", design: "Bold" }),
                            new Text({ text: "{popover>/artistName}" }), // Let op: popover> prefix
                            
                            new Label({ text: "Genre:", design: "Bold" }).addStyleClass("sapUiTinyMarginTop"),
                            new Text({ text: "{popover>/genre}" }),
                            
                            new Label({ text: "Tijd:", design: "Bold" }).addStyleClass("sapUiTinyMarginTop"),
                            new Text({ text: "{popover>/start} - {popover>/end}" })
                        ]
                    }).addStyleClass("sapUiSmallMargin")
                });
                this.getView().addDependent(this._oPopover);
            }

            // 4. MODEL UPDATEN
            // We gebruiken een NAAM ("popover") voor het model om conflicten te vermijden
            var oModel = new JSONModel({
                artistName: sArtist,
                genre: sGenre,
                start: sStartStr,
                end: sEndStr
            });
            
            this._oPopover.setModel(oModel, "popover");
            
            // 5. OPENEN
            this._oPopover.openBy(oAppointment);
        }
    });
});