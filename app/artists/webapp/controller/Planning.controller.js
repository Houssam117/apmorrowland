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
                startDate: new Date("2026-01-16T08:00:00")
            });
            this.getView().setModel(oStateModel, "settings");
        },

        formatDate: function (sDate) {
            if (!sDate) { return null; }
            return new Date(sDate);
        },

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            if (!oAppointment) { return; }

            var sArtist = oAppointment.getTitle() || "Geen artiest gevonden";
            var sGenre = oAppointment.getText() || "Geen genre";

            console.log("Geselecteerde artiest:", sArtist);

            var oStart = oAppointment.getStartDate();
            var oEnd = oAppointment.getEndDate();
            var sStartStr = "--:--";
            var sEndStr = "--:--";

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

            if (!this._oPopover) {
                this._oPopover = new Popover({
                    title: "Details",
                    placement: "Auto",
                    contentWidth: "250px",
                    content: new VBox({
                        items: [
                            new Label({ text: "Artiest:", design: "Bold" }),
                            new Text({ text: "{popover>/artistName}" }),

                            new Label({ text: "Genre:", design: "Bold" }).addStyleClass("sapUiTinyMarginTop"),
                            new Text({ text: "{popover>/genre}" }),

                            new Label({ text: "Tijd:", design: "Bold" }).addStyleClass("sapUiTinyMarginTop"),
                            new Text({ text: "{popover>/start} - {popover>/end}" })
                        ]
                    }).addStyleClass("sapUiSmallMargin")
                });
                this.getView().addDependent(this._oPopover);
            }

            var oModel = new JSONModel({
                artistName: sArtist,
                genre: sGenre,
                start: sStartStr,
                end: sEndStr
            });

            this._oPopover.setModel(oModel, "popover");

            this._oPopover.openBy(oAppointment);
        },

        onAppointmentDrop: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            var oStartDate = oEvent.getParameter("startDate");
            var oEndDate = oEvent.getParameter("endDate");
            var oCalendarRow = oEvent.getParameter("calendarRow");

            console.log("onAppointmentDrop triggered", { oAppointment, oStartDate, oEndDate, oCalendarRow });

            if (!oAppointment || !oStartDate || !oEndDate) {
                return;
            }

            var oContext = oAppointment.getBindingContext();

            oContext.setProperty("startTime", oStartDate.toISOString());
            oContext.setProperty("endTime", oEndDate.toISOString());

            if (oCalendarRow) {
                var oRowContext = oCalendarRow.getBindingContext();
                var sStageId = oRowContext.getProperty("ID");

                console.log("Changing stage to:", sStageId);

                oContext.setProperty("stage_ID", sStageId);
            }

        },

        onAppointmentResize: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment");
            var oStartDate = oEvent.getParameter("startDate");
            var oEndDate = oEvent.getParameter("endDate");

            if (!oAppointment || !oStartDate || !oEndDate) {
                return;
            }

            var oContext = oAppointment.getBindingContext();
            oContext.setProperty("startTime", oStartDate.toISOString());
            oContext.setProperty("endTime", oEndDate.toISOString());
        },

        onAppointmentCreate: function (oEvent) {
            console.log("Create triggered");
        }
    });
});