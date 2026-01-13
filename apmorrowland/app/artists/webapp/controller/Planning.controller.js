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
            var oStateModel = new JSONModel({
                startDate: new Date("2026-07-24T08:00:00") 
            });
            this.getView().setModel(oStateModel, "settings");
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            
            if (!oAppointment) { return; }
            
            var oCtx = oAppointment.getBindingContext();
            if (!oCtx) { return; }

            var sArtist = oCtx.getProperty("artist/name") || "Onbekend";
            var sGenre = oCtx.getProperty("artist/genre") || "-";
            var oStart = oCtx.getProperty("startTime");
            var oEnd = oCtx.getProperty("endTime");
            
            var sStartStr = oStart ? new Date(oStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";
            var sEndStr = oEnd ? new Date(oEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "";

            if (!this._oPopover) {
                this._oPopover = new Popover({
                    title: "Performance Details",
                    placement: "Auto",
                    contentWidth: "250px",
                    content: new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Label({ text: "Artiest:", design: "Bold" }),
                            new Text({ text: "{artistName}" }),
                            
                            new Label({ text: "Genre:", design: "Bold", class: "sapUiTinyMarginTop" }),
                            new Text({ text: "{genre}" }),
                            
                            new Label({ text: "Tijd:", design: "Bold", class: "sapUiTinyMarginTop" }),
                            new Text({ text: "{start} - {end}" })
                        ]
                    })
                });
                this.getView().addDependent(this._oPopover);
            }

            var oModel = new JSONModel({
                artistName: sArtist,
                genre: sGenre,
                start: sStartStr,
                end: sEndStr
            });
            this._oPopover.setModel(oModel);

            this._oPopover.openBy(oAppointment);
        }
    });
});