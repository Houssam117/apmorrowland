sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",             
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, Sorter, Fragment, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("ns.artists.controller.List", {

        onNavHome: function () {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var sOrderID = oItem.getBindingContext().getProperty("ID");
            this.getOwnerComponent().getRouter().navTo("RouteOrderDetail", {
                orderID: sOrderID
            });
        },
onFilter: function () {
            var aFilters = [];

          
            var oSearchField = this.byId("searchField");
            if (oSearchField) {
                var sQuery = oSearchField.getValue();
                if (sQuery) {
                    aFilters.push(new Filter({
                        path: "customerName",
                        operator: FilterOperator.Contains,
                        value1: sQuery,
                        caseSensitive: false  
                    }));
                }
            }

            var oStatusSelect = this.byId("statusFilter");
            if (oStatusSelect) {
                var sStatus = oStatusSelect.getSelectedKey();
                if (sStatus) {
                    aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
                }
            }

            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilters);
        },
    // Wordt aangeroepen als we naar Stap 3 (Items) gaan
        onActivateItemStep: function () {
            var oModel = this.getView().getModel("newOrder");
            var sType = oModel.getProperty("/orderType"); // bv. "Ticket"
            
            console.log("Stap 3 geactiveerd. Zoeken naar producten van type:", sType);

            // 1. Haal de producten op uit de OData database die matchen met het type
            var oODataModel = this.getView().getModel();
            var oListBinding = oODataModel.bindList("/Products", undefined, undefined, 
                [new Filter("type", FilterOperator.EQ, sType)]
            );

            // 2. Vraag de data op
            oListBinding.requestContexts().then(function (aContexts) {
                var aProducts = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });
                
                console.log("Gevonden producten:", aProducts); // <--- Check je console (F12)

                // 3. Stop ze in het tijdelijke model voor de dropdown
                oModel.setProperty("/productOptions", aProducts);
            });
            
            this.validateItemStep();
        },
        onProductChange: function (oEvent) {
            var oControl = oEvent.getSource(); 
            var sSelectedKey = oControl.getSelectedKey(); 
            var oModel = this.getView().getModel("newOrder");
            
            var aOptions = oModel.getProperty("/productOptions");
            var oSelectedProduct = aOptions.find(function(p) { return p.ID === sSelectedKey; });
            
            if (oSelectedProduct) {
                var sPath = oControl.getBindingContext("newOrder").getPath();
                oModel.setProperty(sPath + "/itemName", oSelectedProduct.name);
                oModel.setProperty(sPath + "/price", oSelectedProduct.price);
                
                this.validateItemStep(); 
            }
        },
        // Wisselen tussen 'Lijst' en 'Nieuw'
        onCustomerModeChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oModel = this.getView().getModel("newOrder");
            
            // Reset de data als we wisselen, om verwarring te voorkomen
            oModel.setProperty("/customerName", "");
            oModel.setProperty("/email", "");
            
            this.validateCustomerStep(); // Check validatie direct
        },

        // Als je iemand kiest uit de Dropdown
        onCustomerSelect: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var oModel = this.getView().getModel("newOrder");

            if (oSelectedItem) {
                // We hebben de email als 'key' gebruikt in de XML, en de tekst is de naam
                // Maar we kunnen de data beter uit de binding context halen
                var sName = oSelectedItem.getBindingContext().getProperty("name");
                var sEmail = oSelectedItem.getBindingContext().getProperty("email");

                oModel.setProperty("/customerName", sName);
                oModel.setProperty("/email", sEmail);
            } else {
                oModel.setProperty("/customerName", "");
                oModel.setProperty("/email", "");
            }
            
            this.validateCustomerStep();
        },

        // De validatie (werkt voor beide methodes omdat ze hetzelfde model vullen)
        validateCustomerStep: function () {
            var oModel = this.getView().getModel("newOrder");
            var sName = oModel.getProperty("/customerName");
            var sEmail = oModel.getProperty("/email");
            var oWizard = this.byId("CreateOrderWizard");
            var oStep = this.byId("stepCustomer");

            // Simpele check: Naam moet bestaan, Email moet '@' bevatten
            if (sName && sName.length > 1 && sEmail && sEmail.includes("@")) {
                oWizard.validateStep(oStep);
            } else {
                oWizard.invalidateStep(oStep);
            }
        },
        onCreateOrder: function () {
            var oView = this.getView();

            var oNewOrderData = {
                customerName: "",
                email: "",
                orderType: "Ticket",
                items: [],        
                customerMode: "Existing",
                productOptions: [],  
                totalAmount: 0.00
            };
            var oJsonModel = new JSONModel(oNewOrderData);
            oView.setModel(oJsonModel, "newOrder");

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "ns.artists.fragment.CreateOrderWizard",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

           
            this.pDialog.then(function (oDialog) {
                var oWizard = this.byId("CreateOrderWizard");
                var oStep1 = this.byId("stepCustomer");
                oWizard.discardProgress(oStep1); 
                oWizard.goToStep(oStep1);        
                oWizard.invalidateStep(oStep1); 
                
                this.byId("btnSubmitOrder").setEnabled(false);
                oDialog.open();
            }.bind(this));
        },

        // Stap 1 Validatie: Klant
        validateCustomerStep: function () {
            var oModel = this.getView().getModel("newOrder");
            var sName = oModel.getProperty("/customerName");
            var sEmail = oModel.getProperty("/email");
            var oWizard = this.byId("CreateOrderWizard");
            var oStep = this.byId("stepCustomer");

            if (sName && sName.length > 2 && sEmail && sEmail.includes("@")) {
                oWizard.validateStep(oStep);
            } else {
                oWizard.invalidateStep(oStep);
            }
        },

       
        onTempItemAdd: function () {
            var oModel = this.getView().getModel("newOrder");
            var aItems = oModel.getProperty("/items");
            
          
            aItems.push({ itemName: "", quantity: 1, price: 0 });
            oModel.setProperty("/items", aItems);
            
            this.validateItemStep(); 
        },

        onTempItemDelete: function (oEvent) {
            var oModel = this.getView().getModel("newOrder");
            var sPath = oEvent.getSource().getBindingContext("newOrder").getPath();
            var iIndex = parseInt(sPath.split("/").pop());
            var aItems = oModel.getProperty("/items");

            aItems.splice(iIndex, 1); 
            oModel.setProperty("/items", aItems);
            
            this.validateItemStep();
        },

       
        validateItemStep: function () {
            var oModel = this.getView().getModel("newOrder");
            var aItems = oModel.getProperty("/items");
            var oBtnSubmit = this.byId("btnSubmitOrder");
            var fTotal = 0;
            var bValid = true;

            
            if (aItems.length === 0) {
                bValid = false;
            }

            
            aItems.forEach(function (item) {
                if (!item.itemName || item.quantity <= 0) {
                    bValid = false;
                }
                var fSub = (parseFloat(item.price) || 0) * item.quantity;
                fTotal += fSub;
            });

        
            oModel.setProperty("/totalAmount", fTotal.toFixed(2));

            oBtnSubmit.setEnabled(bValid);
        },

        onWizardCancel: function () {
            this.byId("CreateOrderWizard").getParent().close();
        },

      
        onWizardSubmit: function () {
            var oView = this.getView();
            var oModel = oView.getModel("newOrder");
            var oData = oModel.getData();
            var oODataModel = oView.getModel(); 

            var aOrderItems = oData.items.map(function(item) {
                return {
                    itemName: item.itemName,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    subTotal: (item.quantity * parseFloat(item.price)).toFixed(2)
                };
            });

          
            var oListBinding = this.byId("ordersTable").getBinding("items");

         
            var oContext = oListBinding.create({
                customerName: oData.customerName,
                email: oData.email,
                orderType: oData.orderType,
                status: "Pending",           
                totalAmount: oData.totalAmount,
                currency_code: "EUR",
                items: aOrderItems           
            });

           
            oContext.created().then(function () {
                MessageToast.show("Order succesvol aangemaakt!");
                this.byId("CreateOrderWizard").getParent().close();
            }.bind(this), function (oError) {
                MessageToast.show("Fout bij aanmaken: " + oError.message);
            });
        },
        
     onSort: function () {
            var oTable = this.byId("ordersTable");
            var oBinding = oTable.getBinding("items");

            this._bDescending = !this._bDescending;

            oBinding.sort(new Sorter("orderDate", this._bDescending));
        },
      
    });
});