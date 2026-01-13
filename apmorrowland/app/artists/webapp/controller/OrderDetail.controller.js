sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("ns.artists.controller.OrderDetail", {
        
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteOrderDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sOrderID = window.decodeURIComponent(oEvent.getParameter("arguments").orderID);
            
            this.getView().bindElement({
                path: "/Orders('" + sOrderID + "')", 
                parameters: {
                    "$expand": "items"
                }
            });
        },
onExportPDF: function () {
            // 1. Haal de data op uit de huidige view
            var oView = this.getView();
            var oContext = oView.getBindingContext();
            
            if (!oContext) {
                sap.m.MessageToast.show("Geen order data gevonden.");
                return;
            }

          
            var oOrder = oContext.getObject();
            
            
            var aItems = [];
          
            if (oOrder.items) {
                aItems = oOrder.items;
            } else {
             
                sap.m.MessageToast.show("Items worden nog geladen, probeer zo opnieuw.");
                return;
            }

       
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

        
            doc.setFontSize(22);
            doc.setTextColor(42, 110, 187); 
            doc.text("TOMORROWLAND", 105, 20, null, null, "center");
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Orderbevestiging", 105, 30, null, null, "center");

        
            doc.setFontSize(10);
            doc.text("Klant:", 15, 45);
            doc.setFont("helvetica", "bold");
            doc.text(oOrder.customerName || "Onbekend", 15, 50);
            doc.setFont("helvetica", "normal");
            doc.text(oOrder.email || "", 15, 55);

         
            var sDate = new Date(oOrder.orderDate).toLocaleDateString();
            doc.text("Ordernummer:", 140, 45);
            doc.text(oOrder.ID.substring(0, 8) + "...", 140, 50); 
            doc.text("Datum:", 140, 60);
            doc.text(sDate, 140, 65);
            doc.text("Type:", 140, 75);
            doc.text(oOrder.orderType || "Ticket", 140, 80);

       
            var aTableBody = aItems.map(function(item) {
                return [
                    item.itemName,
                    item.quantity,
                    parseFloat(item.price).toFixed(2) + " EUR",
                    parseFloat(item.subTotal).toFixed(2) + " EUR"
                ];
            });

            doc.autoTable({
                startY: 90,
                head: [['Omschrijving', 'Aantal', 'Prijs', 'Totaal']],
                body: aTableBody,
                theme: 'striped',
                headStyles: { fillColor: [42, 110, 187] },
                columnStyles: {
                    0: { cellWidth: 80 },
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                }
            });

          
            var finalY = doc.lastAutoTable.finalY || 150;
            
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Totaalbedrag:", 140, finalY + 15);
            doc.text(parseFloat(oOrder.totalAmount).toFixed(2) + " EUR", 195, finalY + 15, null, null, "right");

           
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(150);
            doc.text("Bedankt voor je bestelling bij Tomorrowland.", 105, 280, null, null, "center");

            
            doc.save("Order_" + oOrder.ID.substring(0, 5) + ".pdf");
        },
        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteOrders");
            }
        }
    });
});