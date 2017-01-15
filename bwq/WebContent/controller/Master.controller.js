/*global history */
sap.ui.define([
	"com/mindset/zbwquery_admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"com/mindset/zbwquery_admin/model/formatter",
	"sap/ui/model/odata/ODataModel",
	"com/mindset/zbwquery_admin/controller/Services",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"sap/ui/core/EventBus"
], function(BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter, ODataModel, Service, MessageBox, oBusy, EventBus) {
	"use strict";
	return BaseController.extend("com.mindset.zbwquery_admin.controller.Master", {
		formatter: formatter,
		onInit: function() 
		{
			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
			var catpage = "CATALOG_PAGE",
				onEventBus = new EventBus(),
				bReplace = !Device.system.phone;
			onEventBus.subscribe("Detail", "onUpdateFinished", this.onUpdateFinished, this);
			// if(bReplace) {
			// 	this.getRouter().navTo("noObject", {}, bReplace);
			// }
			//INITIAL DIALOG BOX FOR CATALOG SELECTION//
			var catModel = new JSONModel(),
					that = this,
					url = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/",
					entity="/Catalogs?$filter= type eq '" + catpage + "' ";
	            ///CatalogSet?$expand=ToTile
	            Service.callService(url,entity,
						function(data)	{
	        	   			catModel.setData(data);
	        	   			that.setModel(catModel,"catalogModel");
	        	   			that.onCatelogChange();
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
			//END OF INITIAL DIALOG BOX FOR CATALOG SELECTION//
		},
		onCatelogChange: function(evt) {
			if (! this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.mindset.zbwquery_admin.Fragments.Dialog", this);
				this._oDialog.open();
			}
			this._oDialog.setModel(this.getView().getModel("catalogModel"),"catalogModel");
			this._oDialog.open();
		},
		catlogFilter: function(oEvent) {
			// /sap/opu/odata/UI2/PAGE_BUILDER_CONF/Pages('X-SAP-UI2-CATALOGPAGE:Z_HD_SSDR')/PageChipInstances
			var catID = oEvent.getParameters().selectedContexts[0].getObject().id.replace("/","%2F").replace("/","%2F"),
				catName = oEvent.getParameters().selectedContexts[0].getObject().title,
				emptyModel = this.getModel("emptyModel");
			emptyModel.setData({"disable":true});
			this.getView().getModel("emptyModel").updateBindings(true);
			this.getView().byId("masterPage").setTitle(catName);
			oEvent.getSource().getBinding("items").filter([]);
			//SERVICE CALL BASED ON CATALOG SELECTION
			var that = this,
				url = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/",
				entity="/Pages('"+catID+"')/PageChipInstances",
				Busy = new oBusy();
				Busy.open();
	            // entity = "/CatalogSet('"+catID+"')?$expand=ToTile";
            Service.callService(url,entity,
					function(data)	{
						Busy.close();
        	   			var masterdata=data.results,
        	   			queryID = "";
        	   				for(var i=0;i<masterdata.length;i++) {
        	   					if(masterdata[i].referenceChipInstanceId || !masterdata[i].configuration) {
									masterdata.splice(i,1);
									i--;
									continue;
								}
        	   					masterdata[i].chipIdnew = masterdata[i].chipId;
								masterdata[i].configuration = masterdata[i].configuration.tileConfiguration?
																						masterdata[i].configuration:
																						JSON.parse(masterdata[i].configuration);
								masterdata[i].configuration.tileConfiguration = masterdata[i].configuration.tileConfiguration.length?
																									JSON.parse(masterdata[i].configuration.tileConfiguration):
																									masterdata[i].configuration.tileConfiguration;
								if(masterdata[i].configuration.tileConfiguration.mapping_signature) {
									queryID = masterdata[i].configuration.tileConfiguration.mapping_signature.split("Query=")[1]?
													masterdata[i].configuration.tileConfiguration.mapping_signature.split("Query=")[1].split("&")[0].split("%22")[1]:"";
								}
								masterdata[i].queryId = queryID?queryID.replace("%2F","/"):queryID;
								if(masterdata[i].configuration) {
									masterdata[i].itemTitle = formatter.handlemastertitle(masterdata[i].title,masterdata[i].configuration.tileConfiguration.display_title_text);
									masterdata[i].itemSemObj = formatter.handleSemObj(masterdata[i].configuration.tileConfiguration.semantic_object,masterdata[i].configuration.tileConfiguration.navigation_semantic_object);
									masterdata[i].itemSemAct = formatter.handleSemAct(masterdata[i].configuration.tileConfiguration.semantic_action,masterdata[i].configuration.tileConfiguration.navigation_semantic_action);
								}
								if(masterdata[i].chipId==="X-SAP-UI2-CHIP:/UI2/ACTION") {
									if(!masterdata[i].configuration.tileConfiguration.signature) {
										masterdata.splice(i,1);
										i--;
										continue;
									}
									masterdata[i].status="Target Mapping";
									var parameterFlag = masterdata[i].configuration.tileConfiguration.signature.parameters?
														true:false; 
									if(parameterFlag) {
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.VizType) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.VizType.defaultValue) {
												masterdata[i].vizType = masterdata[i].configuration.tileConfiguration.signature.parameters.VizType.defaultValue.value?
																		formatter.optinViz(masterdata[i].configuration.tileConfiguration.signature.parameters.VizType.defaultValue.value):"";
												masterdata[i].vizType = decodeURIComponent(masterdata[i].vizType).replace(/[.=*"+?^${}()|[\]\\]/g, "");
											} else {
												masterdata[i].vizType = "";
											}
										} else {
											masterdata[i].vizType = "";
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.EnableExportTo) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue) {
												masterdata[i].EnableExportTo = masterdata[i].configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue.value?
																			   formatter.EnableExportTo(masterdata[i].configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue.value):false;
											} else {
												masterdata[i].EnableExportTo = false;
											}
										} else {
											masterdata[i].EnableExportTo = false;
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.ShowYAxisLabel) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue) {
												masterdata[i].ShowYAxisLabel = masterdata[i].configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue.value?
																			   formatter.ShowYAxisLabel(masterdata[i].configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue.value):false;
											} else {
												masterdata[i].ShowYAxisLabel = false;
											}
										} else {
											masterdata[i].ShowYAxisLabel = false;
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.PO_URL) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.PO_URL.defaultValue) {
												masterdata[i].PO_URL = masterdata[i].configuration.tileConfiguration.signature.parameters.PO_URL.defaultValue.value?
																	   formatter.punchUrl(masterdata[i].configuration.tileConfiguration.signature.parameters.PO_URL.defaultValue.value):"";
											} else {
												masterdata[i].PO_URL = "";
											}
										} else {
											masterdata[i].PO_URL = "";
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames.defaultValue) {
												masterdata[i].UseTechnicalQueryNames = masterdata[i].configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames.defaultValue.value?
																					   formatter.useTchQuery(masterdata[i].configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames.defaultValue.value):false;
											}else {
												masterdata[i].UseTechnicalQueryNames = false;
											}
										} else {
											masterdata[i].UseTechnicalQueryNames = false;
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.Query) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.Query.defaultValue) {
												masterdata[i].queryId = masterdata[i].configuration.tileConfiguration.signature.parameters.Query.defaultValue.value?
																					   formatter.queryConvert(masterdata[i].configuration.tileConfiguration.signature.parameters.Query.defaultValue.value):"";
											}else {
												masterdata[i].queryId = "";
											}
										} else {
											masterdata[i].queryId = "";
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.disabledVizTypes) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue) {
												masterdata[i].disabledVizTypes = masterdata[i].configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value?
																					   formatter.queryConvert(masterdata[i].configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value):"";
											}else {
												masterdata[i].disabledVizTypes = "";
											}
										} else {
											masterdata[i].disabledVizTypes = "";
										}
										if(masterdata[i].configuration.tileConfiguration.signature.parameters.MeasureInDimensions) {
											if(masterdata[i].configuration.tileConfiguration.signature.parameters.MeasureInDimensions.defaultValue) {
												masterdata[i].MeasureInDimensions = masterdata[i].configuration.tileConfiguration.signature.parameters.MeasureInDimensions.defaultValue.value?
																					   formatter.measureInDim(masterdata[i].configuration.tileConfiguration.signature.parameters.MeasureInDimensions.defaultValue.value):"";
											}else {
												masterdata[i].MeasureInDimensions = "";
											}
										} else {
											masterdata[i].MeasureInDimensions = "";
										}
									}
								}
								else {
										masterdata[i].status="Tile";	
								}
    						}
    						
        	   			that.getView().getModel("masterView1").setData(data);
	        	   		that.getView().getModel("masterView1").updateBindings(true);
					},
					function(error)	{
						Busy.close();
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
			//END OF SERVICE CALL BASED ON CATALOG SELECTION//
		},
		handleCatSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("title", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleCancel: function(oEvent) {
			oEvent.getSource().getBinding("items").filter([]);
			var bReplace = !Device.system.phone,
				masterModel = this.getView().getModel("masterView1").getData(),
				emptyModel = this.getModel("emptyModel");
			if(!masterModel.results) { 
				this.getRouter().navTo("empty", {}, bReplace);
				emptyModel.setData({"disable":false});
				this.getView().getModel("emptyModel").updateBindings(true);
			}
			else {
				emptyModel.setData({"disable":true});
				this.getView().getModel("emptyModel").updateBindings(true);
			}
				
		},
		_onMasterMatched: function() {
			
		},
		onUpdateFinished: function(oEvent) {
			var bReplace = !Device.system.phone;
			//var data = this.getView().getModel("masterModel").getData();
			//this.getView().getModel("masterView").setData(data);
			//var data1 = this.getView().getModel("masterModel1").getData();
			//this.getView().setModel(new JSONModel(data1),"masterView1");
			if(bReplace) {
				if (this.getView().byId("list").getItems()[0]) {
					this.getView().byId("list").getItems()[0].setSelected(true);
					this.byId("pullToRefresh").hide();
					this.getRouter().navTo("object", {
						id: this.getView().byId("list").getItems()[0].getFirstStatus().getText()
					}, bReplace);
				}
				else {
					this.getRouter().navTo("noObject", {}, bReplace);
				}    
			}
			
		},
		
		_showDetail: function(oItem) {
			var bReplace = !Device.system.phone;
			// var qid = oItem.getAttributes()[0].getText();
			var qid =	oItem.getBindingContext("masterView1").getObject().instanceId;
			this.getRouter().navTo("object", {
				id: qid//oItem.getIntro()
			}, bReplace);
		},
		onSearch: function(oEvent) {
			var oView = this.getView();
			var filter = [];
			var searchString = oEvent.getSource().getValue();
			var searchAfter = 0;
			filter = [new sap.ui.model.Filter("itemTitle", sap.ui.model.FilterOperator.Contains, searchString),
					  new sap.ui.model.Filter("itemSemObj", sap.ui.model.FilterOperator.Contains, searchString),
					  new sap.ui.model.Filter("itemSemAct", sap.ui.model.FilterOperator.Contains, searchString)];
			var filters = new Filter(filter, false);
			this.getView().byId("list").getBinding("items").filter([filters]);
		},
		handleFilterChange: function(evt) {
			this._updateList();
		},
		_updateList: function() {
			var oView = this.getView();
			var select = oView.byId("filterselect");
			var key = select.getSelectedKey();
			var filters = [];
			if (key != "All") {
				filters.push(new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, key));
			}
			this.getView().byId("list").getBinding("items").filter(filters);
			 
		},
		onRefresh: function() {
			this._oList.getBinding("items").refresh();
		},
		onSelectionChange: function(oEvent) {
			this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
		},
		onBypassed: function() {
			this._oList.removeSelections(true);
		},
		createGroupHeader: function(oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},
		handleCreatePress: function() {
			
			
			if (! this._oTiletargetDialog) {
				this._oTiletargetDialog = sap.ui.xmlfragment("com.mindset.zbwquery_admin.Fragments.TileTargetMappingDialog", this);
				this.getView().addDependent(this._oTiletargetDialog);
				this._oTiletargetDialog.open();
			}
			this._oTiletargetDialog.setModel(this.getView().getModel("tiletargetmodel"),"tiletargetmodel");
	
			
			this._oTiletargetDialog.open();
			// 
		},
		handletiletargetokpress:function(evt){
			var me=this;
				this._oTiletargetDialog.close();
				var bReplace = !Device.system.phone;
			var selectedIndex=this._oTiletargetDialog.getContent()[0].getItems()[0].getSelectedIndex();	
			if(selectedIndex=== 0){
				this.getView().getModel("tiletargetmodel").getData().status="Tile";
			}else{
				this.getView().getModel("tiletargetmodel").getData().status="Target Mapping";
			}
			this.getView().getModel("tiletargetmodel").updateBindings("true");
			this.getRouter().navTo("create", {}, bReplace);
		
		},
		handletiletargetCancelpress:function(evt){
			this._oTiletargetDialog.close();
		},
		onAfterRendering: function() {
			//
		}

	});

});