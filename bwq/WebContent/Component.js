sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/Device",
		"com/mindset/zbwquery_admin/model/models",
		"com/mindset/zbwquery_admin/controller/ListSelector",
		"com/mindset/zbwquery_admin/controller/ErrorHandler",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/odata/ODataModel",
		"com/mindset/zbwquery_admin/controller/Services",
		"sap/m/MessageBox"
	], function (UIComponent, Device, models, ListSelector, ErrorHandler, JSONModel, ODataModel, Service, MessageBox) {
		"use strict";

		return UIComponent.extend("com.mindset.zbwquery_admin.Component", {

			metadata : {
				manifest : "json"
			},

			/**
			 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
			 * In this method, the FLP and device models are set and the router is initialized.
			 * @public
			 * @override
			 */
			init : function () {
				this.oListSelector = new ListSelector();
				this._oErrorHandler = new ErrorHandler(this);
				//set stylesheet
				jQuery.sap.includeStyleSheet(
										jQuery.sap.getModulePath("com.mindset.zbwquery_admin")+ "/localService/Style.css","style");
										
				// set the device model
				this.setModel(models.createDeviceModel(), "device");
				// set the FLP model
				this.setModel(models.createFLPModel(), "FLP");

				// call the base component's init function and create the App view
				UIComponent.prototype.init.apply(this, arguments);

				// create the views based on the url/hash
				this.getRouter().initialize();
				
				var masterView1 = new sap.ui.model.json.JSONModel();
				this.setModel(masterView1, "masterView1");
				var detModel = new sap.ui.model.json.JSONModel();
				this.setModel(detModel, "detModel");
				var filModel1 = new sap.ui.model.json.JSONModel();
				this.setModel(filModel1, "filModel1");
				var mesureModel1 = new sap.ui.model.json.JSONModel();
				this.setModel(mesureModel1, "mesureModel1");
				var dimensionModel1 = new sap.ui.model.json.JSONModel();
				this.setModel(dimensionModel1, "dimensionModel1");
				var emptyModel = new JSONModel({"disable":false});
				this.setModel(emptyModel, "emptyModel");
				var commonModel = new JSONModel({"transportB4save":"","createFragType":"","queryId":"","create_queryId":""});
				this.setModel(commonModel, "commonModel");
				var tiletargetmodel = new JSONModel({"status":"Tiles"});
				this.setModel(tiletargetmodel, "tiletargetmodel");
				
				
				var detailModel = new sap.ui.model.json.JSONModel();
				this.setModel(detailModel, "detailModel");
				var packagemodel = new sap.ui.model.json.JSONModel();
				this.setModel(packagemodel, "packagemodel");
				var workbenchrequestmodel = new sap.ui.model.json.JSONModel();
				this.setModel(workbenchrequestmodel, "workbenchrequestmodel");
				var searchHelpModel = new sap.ui.model.json.JSONModel();
				this.setModel(searchHelpModel, "helpModel");
				var searchHelpCreateModel = new sap.ui.model.json.JSONModel();
				this.setModel(searchHelpCreateModel, "helpCreateModel");
				
				var colorModel =  new JSONModel(jQuery.sap.getModulePath("com.mindset.zbwquery_admin.model", "/columnBarColor.json"));
				this.setModel(colorModel, "colorModel");
				var vizModel =  new JSONModel(jQuery.sap.getModulePath("com.mindset.zbwquery_admin.model", "/vizType.json"));
				this.setModel(vizModel, "vizModel");
				var vizTypeModel = new JSONModel(jQuery.sap.getModulePath("com.mindset.zbwquery_admin.model", "/visualType.json"));
				this.setModel(vizTypeModel, "vizTypeModel");
				
			//Basics-Query Overview-Query-dropdown binding
				var queryModel1 = new JSONModel(),
					that = this;
				var url = "/sap/opu/odata/MINDSET/FIORIBW_SRV/";
	            var entity = "CubeSet?$skip=0&$top=20&$orderby=CatNam%20asc";
	            Service.callService(url,entity,
						function(data)	{
	        	   			queryModel1.setData(data);
	        	   			that.setModel(queryModel1,"queryModel1");
						},
						function(error)	{
				  			var errdetail;
				            if(error.response) {
				            	errdetail=$(error.response.body).find('message').first().text();
		                    }
				            else{
				            	errdetail=error.message;
				            }
				            MessageBox.show(
				            				errdetail, {
							                     icon: sap.m.MessageBox.Icon.ERROR,
							                     title: "Error",
							                     actions: [sap.m.MessageBox.Action.OK],
							                     onClose: function(oAction) { 
									                    	 if(oAction === "OK") {
							                    	 		 	//
							                    	 		 }
							                     		  }
							                });
						});
				var urlpack = "/sap/opu/odata/UI2/TRANSPORT/";
				var packentity="/Packages";
	            // entity = "/CatalogSet('"+catID+"')?$expand=ToTile";
            Service.callService(urlpack,packentity,
					function(data)	{
						data.results[0].flag = false;
        	   			packagemodel.setData(data);
	        	   		packagemodel.updateBindings(true);
					},
					function(error)	{
			  		 
			          
					});
			},

			/**
			 * The component is destroyed by UI5 automatically.
			 * In this method, the ListSelector and ErrorHandler are destroyed.
			 * @public
			 * @override
			 */
			destroy : function () {
				this.oListSelector.destroy();
				this._oErrorHandler.destroy();
				// call the base component's destroy function
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			/**
			 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
			 * design mode class should be set, which influences the size appearance of some controls.
			 * @public
			 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
			 */
			getContentDensityClass : function() {
				if (this._sContentDensityClass === undefined) {
					// check whether FLP has already set the content density class; do nothing in this case
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}
				return this._sContentDensityClass;
			}

		});

	}
);