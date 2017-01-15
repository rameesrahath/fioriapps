sap.ui.define([
	"com/mindset/zbwquery_admin/controller/BaseController",
	"com/mindset/zbwquery_admin/controller/Services",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/Filter",
	"com/mindset/zbwquery_admin/model/formatter",
	"sap/m/MessageBox",
	'sap/m/MessageToast',
	"sap/ui/core/EventBus"
], function(BaseController, Service, JSONModel, ODataModel, Filter, formatter, MessageBox, MessageToast, oEventBus) {
	"use strict";

	return BaseController.extend("com.mindset.zbwquery_admin.controller.Detail", {

		formatter: formatter,
		onInit: function() {
			var oViewModel = new JSONModel({
					busy: false,
					delay: 0
				}),
				onEventBus = sap.ui.getCore().getEventBus();
			onEventBus.subscribe("com.mindset.zbwquery_admin",
				"refreshMaster",
				this.refreshMaster,
				this);
			onEventBus.subscribe("com.mindset.zbwquery_admin",
				"handleactionsettings",
				this.handleactionsettings,
				this);
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

			//Action setting Dialog Services
			var url = "/sap/opu/odata/UI2/TRANSPORT/",
				entity = "/WorkbenchRequests",
				obusy = new sap.m.BusyDialog(),
				that = this;

			obusy.open();
			// entity = "/CatalogSet('"+catID+"')?$expand=ToTile";
			Service.callService(url, entity,
				function(data) {
					obusy.close();
					data.TR = "";
					data.flag = false;
					that.getView().getModel("workbenchrequestmodel").setData(data);
					that.getView().getModel("workbenchrequestmodel").updateBindings(true);
				},
				function(error) {
					obusy.close();
					var errdetail;
					if (error.response) {
						errdetail = $(error.response.body).find('message').first().text();
					} else {
						errdetail = error.message;
					}
					MessageBox.show(
						errdetail, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (oAction === "OK") {
									//
								}
							}
						});
				});

			//End Of Action setting Dialog Services
			
			///Viz Type Enabling Model///
			var vizEnableModel = new JSONModel({
				"col":true,
				"bar":true,
				"line":true,
				"pie":true,
				"heat":true,
				"comp":true,
				"bullet":true
			});
			this.getView().setModel(vizEnableModel,"vizEnableModel");
			this.getView().setModel(new JSONModel(),"MeasDIm");
			
			var urlGenModel = new sap.ui.model.json.JSONModel();
			this.setModel(urlGenModel, "urlGenModel");
		},

		_onObjectMatched: function(oEvent) {
			var sObjectId = oEvent.sId ? oEvent.getParameter("arguments").id : oEvent;
			// var detModel = this.getView().getModel("masterView");
			// this.getView().getModel("detModel").setData(detModel.getData());

			//DETAIL PAGE DATA BINDING
			var results = this.getView().getModel("masterView1").getData().results,
				that = this,
				queryID = "",
				helpURL = "",
				obusy = new sap.m.BusyDialog();
			$.each(results, function(ind, item) {
				if (item.instanceId === sObjectId) {
					queryID = item.queryId;
					helpURL = item.configuration?item.configuration.tileConfiguration.service_url:"";
					
					if(item.chipId !== "X-SAP-UI2-CHIP:/UI2/ACTION") {
						that._onTileChange(item.chipId);
					} else {
						if(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes) {
							if(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue) {
								if(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value) {
									item.vizCol = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"column");
									item.vizBar = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"bar");
									item.vizLine = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"line");
									item.vizPie = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"pie");
									item.vizHeat = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"heatmap");
									item.vizComp = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"combination");
									item.vizBullet = formatter.defaultVizTypes(item.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value,"vertical_bullet");
								}
							}
						}
						that.vizSelChange(item.vizType);
					}
					that.getView().getModel("detailModel").setData(item);
					that.getView().getModel("detailModel").updateBindings(true);
				}
			});
			//END OF DETAILS DATA BINDING
			
			//SEARCH HELP SERVICE CALL//
			if (helpURL) {
				var queryId = decodeURIComponent(helpURL.split("Query")[1]) ? decodeURIComponent(helpURL.split("Query")[1]).split("'")[1] :
					"",
					helpEntity = "/MeasureSet?$skip=0&$top=100&$filter=CubeNam+eq+'" + queryId + "'",
					url = "/sap/opu/odata/MINDSET/FIORIBW_SRV/";
				if (queryId) {
					obusy.open();
					Service.callService(url, helpEntity,
						function(data) {
							obusy.close();
							that.getView().getModel("helpModel").setData(data);
							that.getView().getModel("helpModel").updateBindings(true);
						},
						function(error) {
							obusy.close();
							var errdetail;
							if (error.response) {
								errdetail = $(error.response.body).find('message').first().text();
							} else {
								errdetail = error.message;
							}
							MessageBox.show(
								errdetail, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										if (oAction === "OK") {
											//
										}
									}
								});
						});
				}
			}
			//END OF SEARCH HELP SERVICE CALL//
			this.getView().getModel("commonModel").getData().queryId=queryID?queryID:this.getView().getModel("queryModel1").oData.results[0].CubeNam;
			this.getView().getModel("commonModel").updateBindings(true);
			this.submitBatch(this.getView().getModel("commonModel").getData().queryId,"lstQuery");
		
		},
		submitBatch: function(queryID,queryType) {
				/// Batch Call for Dimensions, Measures, Filters Icon TabBar Binding based on Query selected//
			var batchModel = new ODataModel("/sap/opu/odata/MINDSET/FIORIBW_SRV/"),
				batchRead = [],
				diamensionModel = new JSONModel(),
				measureModel = new JSONModel(),
				filterModel = new JSONModel(),
				oView = this.getView(),
				viewData = "",
				that = this,
				urlGenModel = this.getView().getModel("urlGenModel"),
				urlObj = {},
				dimensionSet = "/DimensionSet?$skip=0&$top=100&$filter=CubeNam+eq+'" + queryID + "'",
				measuredSet = "/MeasureSet?$skip=0&$top=100&$filter=CubeNam+eq+'" + queryID + "'",
				filterSet = "/VariableSet?$filter=CubeNam+eq+'" + queryID + "'";
			if (queryID) {
				var obusy1 = new sap.m.BusyDialog();
				batchRead.push(batchModel.createBatchOperation(dimensionSet, "GET"));
				batchRead.push(batchModel.createBatchOperation(measuredSet, "GET"));
				batchRead.push(batchModel.createBatchOperation(filterSet, "GET"));
				batchModel.addBatchReadOperations(batchRead);
				obusy1.open();
				batchModel.submitBatch(
					function(data) {
						obusy1.close();
						viewData = that.getView().getModel("detailModel").getData();
						$.each(data.__batchResponses[0].data.results,
							function(ind, val) {
								val.visible = formatter.dimensionState(viewData.configuration.tileConfiguration.mapping_signature, val.DimUnam);
								val.default = formatter.dimensionDefault(viewData.configuration.tileConfiguration.mapping_signature, val.DimUnam);
								val.enabled = formatter.dimensionState(viewData.configuration.tileConfiguration.mapping_signature, val.DimUnam);
							});
						$.each(data.__batchResponses[1].data.results,
							function(ind, val) {
								val.visible = formatter.measuresState(viewData.configuration.tileConfiguration.mapping_signature, val.MesUnam);
								val.default = formatter.measuresDefault(viewData.configuration.tileConfiguration.mapping_signature, val.MesUnam);
								val.enabled = formatter.measuresState(viewData.configuration.tileConfiguration.mapping_signature, val.MesUnam);
							});
						$.each(data.__batchResponses[2].data.results,
							function(ind, val) {
								val.visible = formatter.filterState(viewData.configuration.tileConfiguration.mapping_signature, val.VarNam);
								val.default = formatter.filtersDefault(viewData.configuration.tileConfiguration.mapping_signature, val.VarNam);
								val.enabled = formatter.filterState(viewData.configuration.tileConfiguration.mapping_signature, val.VarNam);
								val.lock = formatter.filterLock(formatter.filtersDefault(viewData.configuration.tileConfiguration.mapping_signature, val.VarNam),viewData.configuration.tileConfiguration.mapping_signature, val.VarNam);
							});
						urlObj.dimension = data.__batchResponses[0].data.results;
						urlObj.measures = data.__batchResponses[1].data.results;
						urlObj.filters = data.__batchResponses[2].data.results;
						if(queryType === "urlQuery") {
							urlGenModel.setData(urlObj);
							urlGenModel.updateBindings(true);
						} else {
							urlGenModel.setData(urlObj);
							urlGenModel.updateBindings(true);
							diamensionModel.setData(data.__batchResponses[0].data);
							measureModel.setData(data.__batchResponses[1].data);
							filterModel.setData(data.__batchResponses[2].data);
							oView.setModel(diamensionModel, "diamensionModel_1");
							oView.setModel(measureModel, "measureModel_1");
							oView.setModel(filterModel, "filterModel_1");
						}
						that.updateValueHelp();
					},
					function(error) {
						obusy1.close();
						var errdetail;
						if (error.response) {
							errdetail = $(error.response.body).find('message').first().text();
						} else {
							errdetail = error.message;
						}
						MessageBox.show(
							errdetail, {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {

								}
							});

					}
				);
			} else {
				diamensionModel.setData("");
				measureModel.setData("");
				filterModel.setData("");
				oView.setModel(diamensionModel, "diamensionModel_1");
				oView.setModel(measureModel, "measureModel_1");
				oView.setModel(filterModel, "filterModel_1");
			}
			// End of Batch Call for Dimensions, Measures, Filters Icon TabBar Binding based on Query selected//	
		},
		/* AjayChanges */
		handleactionsettings: function(evt) {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.mindset.zbwquery_admin.Fragments.ActionSettingDialog", this);
				this.getView().addDependent(this._oDialog);
				this._oDialog.open();
			}
			this._oDialog.setModel(this.getView().getModel("workbenchrequestmodel"), "workbenchrequestmodel");
			this._oDialog.setModel(this.getView().getModel("packagemodel"), "packagemodel");

			this._oDialog.open();
		},

		actionsettiongokpress: function(evt) {
			var TR = this.getView().getModel("workbenchrequestmodel").getData().TR,
				that = this,
				onEventBus = sap.ui.getCore().getEventBus(),
				tr_package = this.getView().getModel("packagemodel").getData().results[0].id,
				url = "/sap/opu/odata/UI2/TRANSPORT/",
				entity1 = "/WorkbenchRequests('" + TR + "')",
				entity2 = "/Packages('" + tr_package + "')",
				oEntry = {},
				actionFrm = this.getModel("commonModel").getData().transportB4save,
				oBusy = new sap.m.BusyDialog();
			oBusy.open();
			Service.callService(url, entity1,
				function(data) {
					oEntry.description = data.description;
					oEntry.id = data.id;
					oEntry.isDefaultRequest = data.isDefaultRequest;
					Service.updateService(url, entity1, oEntry,
						function() {
							that.getView().getModel("workbenchrequestmodel").getData().flag = true;
							Service.callService(url, entity2,
								function(data) {
									that.getView().getModel("packagemodel").getData().results[0].flag = true;
									oBusy.close();
									switch (actionFrm) {
										case "detSave":
											that.handleSavePress();
											break;
										case "detRem":
											that.handleDelPress();
											break;
										case "createSave":
											onEventBus.publish("com.mindset.zbwquery_admin", "handleSavePress");
											break;
										default:
									}
								},
								function(error) {
									oBusy.close();
									var errdetail;
									if (error.response) {
										errdetail = $(error.response.body).find('message').first().text();
									} else {
										errdetail = error.message;
									}
									MessageBox.show(
										errdetail, {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: "Error",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {
												if (oAction === "OK") {
													that.handleactionsettings();
												}
											}
										});
								});
						},
						function(error) {
							var errdetail;
							if (error.response) {
								errdetail = $(error.response.body).find('message').first().text();
							} else {
								errdetail = error.message;
							}
							MessageBox.show(
								errdetail, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										if (oAction === "OK") {
											that.handleactionsettings();
										}
									}
							});
						});
				},
				function(error) {
					oBusy.close();
					var errdetail;
					if (error.response) {
						errdetail = $(error.response.body).find('message').first().text();
					} else {
						errdetail = error.message;
					}
					MessageBox.show(
						errdetail, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (oAction === "OK") {
									that.handleactionsettings();
								}
							}
						});
				});
			this._oDialog.close();
		},
		actionsettiongcancelpress: function(evt) {
			//this.getView().getModel("workbenchrequestmodel").updateBindings(true);
			this._oDialog.close();
		},
		/* AjayChanges */

		_onMetadataLoaded: function() {
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/busy", true);
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		_onTileChange: function(oEvent) {
			var selectedValue = "";
			if (oEvent.sId) {
				selectedValue = oEvent.getSource().getSelectedKey();
			} else {
				selectedValue = oEvent;
			}

			switch (selectedValue) {
				case "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER":
					this._showFormFragment("Static");
					break;
				case "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER":
					this._showFormFragment("Dynamic");
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/BULLET_CHART_TILE_CHIP":
					this._showFormFragment("Bullet");
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/COLUMN_CHART_CHIP":
					this._showFormFragment("Column");
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/COMPARISON_CHART_CHIP":
					this._showFormFragment("Comparison");
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/HARVEY_BALL_CHART_CHIP":
					this._showFormFragment("Harvey");
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/TREND_CHART_CHIP":
					this._showFormFragment("Trend");
					break;
				default:
					/*this.onExit();
					break;*/
			}

		},
		_formFragments: {},
		_getFormFragment: function(sFragmentName) {
			var oFormFragment = this._formFragments[sFragmentName];
			if (oFormFragment) {
				return oFormFragment;
			}

			oFormFragment = sap.ui.xmlfragment("com.mindset.zbwquery_admin.Fragments." + sFragmentName, this);
			this.getView().addDependent(oFormFragment);
			return this._formFragments[sFragmentName] = oFormFragment;
		},
		_showFormFragment: function(sFragmentName) {
			var oTab = this.getView().byId("idIconTabBar"),
				oTileTab = oTab.getItems()[1];

			oTileTab.removeAllContent();
			oTileTab.insertContent(this._getFormFragment(sFragmentName));
		},
		diamVizChange: function(oEvent) {
			var view = this.getView(),
				state = oEvent.getParameters().state,
				id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if (state === false) {
				view.getModel("diamensionModel_1").getData().results[id].default = false;
				view.getModel("diamensionModel_1").getData().results[id].enabled = false;
			} else {
				view.getModel("diamensionModel_1").getData().results[id].enabled = true;
			}
			view.getModel("diamensionModel_1").updateBindings(true);
			
			
			this.getView().getModel("detailModel").getData().MeasureInDimensions = "";
			this.getView().getModel("detailModel").updateBindings(true);
			this.updateValueHelp();
		},
		updateValueHelp: function() {
			///Measure In Dimensions Value Help Filtering Data////////
			var dimData = this.getView().getModel("diamensionModel_1").getData().results,
				arr = [],
				cnt = 0;
			$.each(dimData,function(ind,val) {
				if(val.visible) {
					arr[cnt++] = val;
				}
			});
			this.getView().getModel("MeasDIm").setData(arr);
			this.getView().getModel("MeasDIm").updateBindings(true);	
			
		},
		mesVizChange: function(oEvent) {
			var view = this.getView(),
				state = oEvent.getParameters().state,
				id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if (state === false) {
				view.getModel("measureModel_1").getData().results[id].default = false;
				view.getModel("measureModel_1").getData().results[id].enabled = false;
			} else {
				view.getModel("measureModel_1").getData().results[id].enabled = true;
			}
			view.getModel("measureModel_1").updateBindings(true);
		},
		mesDefChange: function(oEvent) {
			var evt = oEvent;
			evt.getSource().getParent().getCells()[3].setEnabled(true);
		},
		filVizChange: function(oEvent) {
			var view = this.getView();
			var evt = oEvent;
			var state = oEvent.getParameters().state;
			var id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if (state === false) {
				view.getModel("filterModel_1").getData().results[id].default = false;
				view.getModel("filterModel_1").getData().results[id].enabled = false;
				view.getModel("filterModel_1").getData().results[id].lock = false;
			} else {
				view.getModel("filterModel_1").getData().results[id].enabled = true;
			}
			view.getModel("filterModel_1").updateBindings(true);
		},
		filDefChange: function(oEvent) {
			//var view = this.getView();
			var state = oEvent.getParameters().state,
			    view = this.getView(),
			    id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if(state === false) {
				oEvent.getSource().getParent().getCells()[4].setEnabled(false);
				view.getModel("filterModel_1").getData().results[id].lock = false;
			} else {
				oEvent.getSource().getParent().getCells()[4].setEnabled(true);
			}
		},
		querySelChange: function(oEvent) {
			/*var	list = this.getView().getModel("queryModel").getData().queryList;
			var sel = oEvent.getSource().getSelectedItem().getKey();
			var detail = this.getView().getModel("detailModel");
			for(var a=0;a<list.length;a++)
			{
				if(sel === list[a].key){
					detail.queryid = sel;
					detail.updateBindings(true);
				}
			}*/
		},
		onRefreshPress: function(oEvent) {
			var detModel = this.getView().getModel("detailModel").getData(),
				url = detModel.configuration.tileConfiguration.service_url,
				that = this,
				oBusy = new sap.m.BusyDialog();
			if (url) {
				var queryId = decodeURIComponent(url.split("Query")[1]) ? decodeURIComponent(url.split("Query")[1]).split("'")[1] :
					"",
					helpEntity = "/MeasureSet?$skip=0&$top=100&$filter=CubeNam+eq+'" + queryId + "'",
					url1 = "/sap/opu/odata/MINDSET/FIORIBW_SRV/";
				if (queryId) {
					oBusy.open();
					Service.callService(url1, helpEntity,
						function(data) {
							oBusy.close();
							that.getView().getModel("helpModel").setData(data);
							that.getView().getModel("helpModel").updateBindings(true);
						},
						function(error) {
							oBusy.close();
							var errdetail;
							if (error.response) {
								errdetail = $(error.response.body).find('message').first().text();
							} else {
								errdetail = error.message;
							}
							MessageBox.show(
								errdetail, {
									icon: sap.m.MessageBox.Icon.ERROR,
									title: "Error",
									actions: [sap.m.MessageBox.Action.OK],
									onClose: function(oAction) {
										if (oAction === "OK") {
											//
										}
									}
								});
						});
				}
			}
		},
		valueHelpForForMeasures: function(oEvent) {
			var source = oEvent.getSource();
			var oDialog = new sap.m.TableSelectDialog({
				title: "Measure",
				columns: [
					new sap.m.Column({
						width: "30%",
						header: new sap.m.Text({
							text: "Name"
						}),
						minScreenWidth: "Tablet",
						demandPopin: true,
						hAlign: "Begin"
					}),
					new sap.m.Column({
						width: "70%",
						header: new sap.m.Text({
							text: "ID"
						}),
						minScreenWidth: "Tablet",
						demandPopin: true,
						hAlign: "Begin"
					})
				],
				liveChange: function(data) {
					var sval = data.getParameter("value");
					var filter = [new Filter("MesUnam", sap.ui.model.FilterOperator.Contains, sval),
								  new Filter("Dscrptn", sap.ui.model.FilterOperator.Contains, sval)];
					var filters = new Filter(filter, false);
					var oBinding = data.getSource().getBinding("items");
					oBinding.filter([filters]);
				},
				confirm: function handleGet(handle) {
					var oContext = handle.getParameter('selectedContexts');
					if (oContext.length) {
						oContext.map(function(cont) {
							var key = cont.getObject().MesUnam,
								value = cont.getObject().Dscrptn;
							source.setValue(key);
						});

					}
				},
				cancel: function(dilg) {

				}
			});

			var lst = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{Dscrptn}"
					}),
					new sap.m.Text({
						text: "{MesUnam}"
					})
				]
			});
			oDialog.setModel(this.getView().getModel("helpModel"));
			oDialog.bindItems("/results", lst);
			oDialog.open();
		},
		valueHelpForForDimensions: function(oEvent) {
			var source = oEvent.getSource();
			var oDialog = new sap.m.TableSelectDialog({
				title: "Dimensions",
				columns: [
					new sap.m.Column({
						width: "30%",
						header: new sap.m.Text({
							text: "Name"
						}),
						minScreenWidth: "Tablet",
						demandPopin: true,
						hAlign: "Begin"
					}),
					new sap.m.Column({
						width: "70%",
						header: new sap.m.Text({
							text: "ID"
						}),
						minScreenWidth: "Tablet",
						demandPopin: true,
						hAlign: "Begin"
					})
				],
				liveChange: function(data) {
					var sval = data.getParameter("value");
					var filter = [new Filter("DimUnam", sap.ui.model.FilterOperator.Contains, sval),
								  new Filter("DimNam", sap.ui.model.FilterOperator.Contains, sval)];
					var filters = new Filter(filter, false);
					var oBinding = data.getSource().getBinding("items");
					oBinding.filter([filters]);
				},
				confirm: function handleGet(handle) {
					var oContext = handle.getParameter('selectedContexts');
					if (oContext.length) {
						oContext.map(function(cont) {
							var key = cont.getObject().DimUnam,
								value = cont.getObject().DimNam;
							source.setValue(key);
						});

					}
				},
				cancel: function(dilg) {

				}
			});

			var lst = new sap.m.ColumnListItem({
				cells: [
					new sap.m.Text({
						text: "{DimUnam}"
					}),
					new sap.m.Text({
						text: "{DimNam}"
					})
				]
			});
			oDialog.setModel(this.getView().getModel("MeasDIm"));
			oDialog.bindItems("/", lst);
			oDialog.open();
		},
		valueHelpForSerUrl:function() {
			if (!this._urlDialog) {
				this._urlDialog = sap.ui.xmlfragment("com.mindset.zbwquery_admin.Fragments.urlGenarator", this);
				this.getView().addDependent(this._urlDialog);
				this._urlDialog.open();
			}
			// this._urlDialog.setModel(this.getView().getModel("workbenchrequestmodel"), "workbenchrequestmodel");
			// this._urlDialog.setModel(this.getView().getModel("packagemodel"), "packagemodel");

			this._urlDialog.open();
		},
		urlQuerySelChange: function(oEvent) {
			var queryId = oEvent.getSource().getSelectedKey();
			this.getView().getModel("commonModel").getData().queryId=queryId;
			this.getView().getModel("commonModel").updateBindings(true);
			this.submitBatch(queryId,"urlQuery");
		},
		handleConfirm: function(oEvent) {
			var selItems = oEvent.getParameter("filterItems"),
				query = this.getView().getModel("commonModel").getData().queryId,
				parent = "",
				dimList = "Dimensions eq '",
				measList = "Measures eq '",
				filtList = "Variables eq '",
				queryList = "Query eq '" + query + "'",
				decodedUrl = "",
				servURL = "/sap/opu/odata/MINDSET/FIORIBW_SRV/ResultSet?$select=Column,Row,Data,ValueDataType&$filter=";
			$.each(selItems,function(ind,val) {
				parent = val.getParent().getText();
				if(parent === "Dimensions") {
					dimList = dimList + val.getKey() + ",";	
				} else if(parent === "Measures") {
					measList = measList + val.getKey() + ",";
				} else if(parent === "Filters") {
					filtList = filtList + val.getKey() + ",";
				}	
			});
			dimList = dimList[dimList.length-1] === ","?
					  dimList.slice(dimList[dimList.length-1],dimList.length-1) + "'":
					  dimList + "'";
			measList = measList[measList.length-1] === ","?
					  measList.slice(measList[measList.length-1],measList.length-1) + "'":
					  measList + "'";
			filtList = filtList[filtList.length-1] === ","?
					  filtList.slice(filtList[filtList.length-1],filtList.length-1) + "'":
					  filtList + "'";
			decodedUrl = servURL + measList + " and " + dimList + " and " + queryList + " and " + filtList;
			this.getView().getModel("detailModel").getData().configuration.tileConfiguration.service_url = decodedUrl;
			this.getView().getModel("detailModel").updateBindings(true);
			
			oEvent.getSource().setSelectedPresetFilterItem("");
		},
		handleCancel: function(oEvent) {
			oEvent.getSource().setSelectedPresetFilterItem("");
		},
		handleSavePress: function(oEvent) {
			var changeData = this.getView().getModel("detailModel").getData(),
				TR = this.getView().getModel("workbenchrequestmodel").getData().flag,
				tr_package = this.getView().getModel("packagemodel").getData().results[0].flag,
				oEntry = {},oEntry1 = {},
				url = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/",
				entity = "",
				that = this,
				title = "",
				conf = "";
			this.getModel("commonModel").getData().transportB4save = "detSave";
			this.getModel("commonModel").updateBindings(true);
			if (TR && tr_package) {
				if (changeData.status === "Tile") {
					oEntry.chipId = changeData.chipId;
					oEntry.instanceId = changeData.instanceId;
					oEntry.isReadOnly = changeData.isReadOnly;
					oEntry.layoutData = changeData.layoutData;
					oEntry.outdated = changeData.outdated;
					oEntry.pageId = changeData.pageId;
					oEntry.referenceChipInstanceId = changeData.referenceChipInstanceId;
					oEntry.referencePageId = changeData.referencePageId;
					oEntry.remoteCatalogId = changeData.remoteCatalogId;
					oEntry.scope = changeData.scope;
					oEntry.title = changeData.configuration.tileConfiguration.display_title_text;
					oEntry.updated = changeData.updated;

					title = changeData.title || 
							changeData.configuration?changeData.configuration.tileConfiguration.display_title_text:"" || 
							changeData.chipId.split("UI2/")[1];
					conf = "Do you want to save Changes on " + "'" + title + "'" + "?";
					MessageBox.show(conf, {
						icon: sap.m.MessageBox.Icon.QUESTION,
						title: "Confirmation",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction === "YES") {
								changeData.configuration.tileConfiguration = JSON.stringify(changeData.configuration.tileConfiguration);
								changeData.configuration = JSON.stringify(changeData.configuration);
								oEntry.configuration = changeData.configuration;
								that.oEntry = oEntry;
								oEntry1 = {};
								oEntry1.bagId = "tileProperties";
								oEntry1.instanceId = that.oEntry.instanceId;
								oEntry1.name = "display_title_text";
								oEntry1.pageId = that.oEntry.pageId;
								oEntry1.translatable = "X";
								oEntry1.value = that.oEntry.title;
								entity = "ChipInstanceProperties(pageId='"+that.oEntry.pageId+"',instanceId='"+that.oEntry.instanceId+"',bagId='tileProperties',name='display_title_text')";
								Service.updateService(url, entity, oEntry1,
									function(data) {
										var entity1 = "/PageChipInstances(pageId='" + that.oEntry.pageId + "',instanceId='" + that.oEntry.instanceId + "')",
											url1 = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/";
										Service.updateService(url1, entity1, that.oEntry,
												function(data) {
													MessageToast.show("Changes Successfully Updated");
													if(sap.ui.Device.system.phone) {
														that.getRouter().navTo("master");
													}
													that.refreshMaster();
												},
												function(error) {
													var errdetail;
													if (error.response) {
														errdetail = $(error.response.body).find('message').first().text();
													} else {
														errdetail = error.message;
													}
													MessageBox.show(
														errdetail, {
															icon: sap.m.MessageBox.Icon.ERROR,
															title: "Error",
															actions: [sap.m.MessageBox.Action.OK],
															onClose: function(oAction) {
																if (oAction === "OK") {
																	that.refreshMaster();
																}
															}
														});
												});
									},
									function(error) {
										var errdetail;
										if (error.response) {
											errdetail = $(error.response.body).find('message').first().text();
										} else {
											errdetail = error.message;
										}
										MessageBox.show(
											errdetail, {
												icon: sap.m.MessageBox.Icon.ERROR,
												title: "Error",
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function(oAction) {
													if (oAction === "OK") {
														that.refreshMaster();
													}
												}
											});
									});
								
							}
						}
					});
				} else if (changeData.status === "Target Mapping") {
					var mapSign = this.createMappingSignature(),
						confData1 = changeData.configuration;
					confData1.tileConfiguration.mapping_signature = mapSign;
					that.oEntry = {};
					that.oEntry.chipId = changeData.chipId;
					that.oEntry.instanceId = changeData.instanceId;
					that.oEntry.isReadOnly = changeData.isReadOnly;
					that.oEntry.layoutData = changeData.layoutData;
					that.oEntry.outdated = changeData.outdated;
					that.oEntry.pageId = changeData.pageId;
					that.oEntry.referenceChipInstanceId = changeData.referenceChipInstanceId;
					that.oEntry.referencePageId = changeData.referencePageId;
					that.oEntry.remoteCatalogId = changeData.remoteCatalogId;
					that.oEntry.scope = changeData.scope;
					that.oEntry.title = changeData.title;
					that.oEntry.updated = changeData.updated;

					title = changeData.title || changeData.configuration.tileConfiguration.display_title_text;
					conf = "Do you want to save Changes on " + "'" + title + "'" + "?";
					entity = "/PageChipInstances(pageId='" + that.oEntry.pageId + "',instanceId='" + that.oEntry.instanceId + "')";
					MessageBox.show(conf, {
						icon: sap.m.MessageBox.Icon.QUESTION,
						title: "Confirmation",
						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
						onClose: function(oAction) {
							if (oAction === "YES") {
								that.title = confData1.tileConfiguration.display_title_text;
								confData1.tileConfiguration = JSON.stringify(confData1.tileConfiguration);
								confData1 = JSON.stringify(confData1);
								that.oEntry.configuration = confData1;
								Service.updateService(url, entity, that.oEntry,
									function(data) {
											var oEntry2 = {
													bagId:"tileProperties",
													instanceId:that.oEntry.instanceId,
													name:"display_title_text",
													pageId:that.oEntry.pageId,
													translatable:"X",
													value:that.title
												};
											/////////////////////////////
											var url2 = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/",
											entity2 = "/ChipInstanceProperties(pageId='"+that.oEntry.pageId+"',instanceId='"+that.oEntry.instanceId+"',bagId='tileProperties',name='display_title_text')";
											Service.updateService(url2, entity2,oEntry2,
												function(data) {
													MessageToast.show("Changes Successfully Updated");
													if(sap.ui.Device.system.phone) {
														that.getRouter().navTo("master");
													}
													that.refreshMaster();
												},
												function(error) {
													var errdetail;
													if (error.response) {
														errdetail = $(error.response.body).find('message').first().text();
													} else {
														errdetail = error.message;
													}
													MessageBox.show(
														errdetail, {
															icon: sap.m.MessageBox.Icon.ERROR,
															title: "Error",
															actions: [sap.m.MessageBox.Action.OK],
															onClose: function(oAction) {
																if (oAction === "OK") {
																	that.refreshMaster();
																}
															}
														});
												});
											/////////
									},
									function(error) {
										var errdetail;
										if (error.response) {
											errdetail = $(error.response.body).find('message').first().text();
										} else {
											errdetail = error.message;
										}
										MessageBox.show(
											errdetail, {
												icon: sap.m.MessageBox.Icon.ERROR,
												title: "Error",
												actions: [sap.m.MessageBox.Action.OK],
												onClose: function(oAction) {
													if (oAction === "OK") {
														that.refreshMaster();
													}
												}
											});
									});
							}
						}
					});
				}
			} else {
				this.handleactionsettings();
			}
		},
		createMappingSignature: function() {
			var dimenData = this.getView().getModel("diamensionModel_1").getData(),
				mesData = this.getView().getModel("measureModel_1").getData(),
				filterData = this.getView().getModel("filterModel_1").getData(),
				detData = this.getView().getModel("detailModel").getData(),
				dimStr = "",
				mesStr = "",
				filtStr = "",
				hide_mesStr = "",
				hide_dimStr = "",
				hide_filtStr = "",
				lock_filtStr = "",
				EnableStr = "",
				ShowYAxisStr = "",
				queryStr = "",
				PO_URL = "",
				vizTypeStr = "",
				techStr = "",
				MeasureInDimensionsStr = "",
				arr = [],
				arr1 = [],
				arr2 = [],
				returnData;
			$.each(dimenData.results, function(ind, val) {
				if (val.default === true) {
					arr.push('"' + val.DimUnam + '"');
				}
				if (val.visible === false) {
					arr1.push('"' + val.DimUnam + '"');
				}
			});
			if(arr.length) {
				detData.configuration.tileConfiguration.signature.parameters.Dimensions = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Dimensions.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Dimensions.defaultValue.value = "[" + arr.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Dimensions = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Dimensions.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Dimensions.defaultValue.value = ""; 
			}
			if(arr1.length) {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions.defaultValue.value = "[" + arr1.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions.defaultValue.value = "";
			}
			dimStr = arr.length ? "[Dimensions=" + encodeURIComponent("[" + arr.toString()) + "]" : "[Dimensions=]";
			hide_dimStr = arr1.length ? "[Hide_Dimensions=" + encodeURIComponent("[" + arr1.toString() + "]") + "]" : "[Hide_Dimensions=]";
			arr = [];
			arr1 = [];
			arr2 = [];
			$.each(mesData.results, function(ind, val) {
				if (val.default === true) {
					arr.push('"' + val.MesUnam + '"');
				}
				if (val.visible === false) {
					arr1.push('"' + val.MesUnam + '"');
				}
			});
			if(arr.length) {
				detData.configuration.tileConfiguration.signature.parameters.Measures = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Measures.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Measures.defaultValue.value = "[" + arr.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Measures = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Measures.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Measures.defaultValue.value = "";
			}
			if(arr1.length) {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures.defaultValue.value = "[" + arr1.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures.defaultValue.value = ""; 
			}
			mesStr = arr.length ? "[Measures=" + encodeURIComponent("[" + arr.toString() + "]") + "]" : "[Measures=]";
			hide_mesStr = arr1.length ? "[Hide_Measures=" + encodeURIComponent("[" + arr1.toString() + "]") + "]" : "[Hide_Measures=]";
			arr = [];
			arr1 = [];
			$.each(filterData.results, function(ind, val) {
				if (val.default === true) {
					arr.push('"' + val.VarNam + '"');
				}
				if (val.visible === false) {
					arr1.push('"' + val.VarNam + '"');
				}
				if (val.lock === true) {
					arr2.push('"' + val.VarNam + '"');
				}
			});
			if(arr.length) {
				detData.configuration.tileConfiguration.signature.parameters.Variables = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Variables.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Variables.defaultValue.value = "[" + arr.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Variables = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Variables.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Variables.defaultValue.value = ""; 
			}
			if(arr1.length) {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters.defaultValue.value = "[" + arr1.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters.defaultValue.value = ""; 
			}
			if(arr2.length) {
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters.defaultValue.value = "[" + arr2.toString() + "]";                   
			} else {
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters.defaultValue.value = "";
			}
			filtStr = arr.length ? "[Variables=" + encodeURIComponent("[" + arr.toString( ) + "]") + "]" : "[Variables='']";
			hide_filtStr = arr1.length ? "[Hide_Filters=" + encodeURIComponent("[" + arr1.toString() + "]") + "]" : "[Hide_Filters=]";
			lock_filtStr = arr2.length ? "[Lock_Filters=" + encodeURIComponent("[" + arr2.toString() + "]") + "]" : "[Lock_Filters=]";
			arr = [];
			arr1 = [];
			
			var enableExp = detData.EnableExportTo?
						 detData.EnableExportTo:false;
			detData.configuration.tileConfiguration.signature.parameters.EnableExportTo = {"required":false};
			detData.configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue = {};
			detData.configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue.value = '"' + enableExp.toString() + '"';
			
			var ShowYAxis = detData.ShowYAxisLabel?
						 detData.ShowYAxisLabel:false;
			detData.configuration.tileConfiguration.signature.parameters.ShowYAxisLabel = {"required":false};
			detData.configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue = {};
			detData.configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue.value = '"' + ShowYAxis.toString() + '"';
			
			var query = detData.queryId?
						 detData.queryId:"";
			if(query) {
				detData.configuration.tileConfiguration.signature.parameters.Query = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.Query.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.Query.defaultValue.value = '"' + query + '"';
			}
			
			var pourl = detData.PO_URL?
						 detData.PO_URL:"";
			detData.configuration.tileConfiguration.signature.parameters.PO_URL = {"required":false};
			detData.configuration.tileConfiguration.signature.parameters.PO_URL.defaultValue = {};
			detData.configuration.tileConfiguration.signature.parameters.PO_URL.defaultValue.value = '"' + pourl + '"';
			
			var vizType = detData.vizType?
						  detData.vizType:"";
			if(vizType) {
				detData.configuration.tileConfiguration.signature.parameters.VizType = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.VizType.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.VizType.defaultValue.value = '"' + vizType + '"';
			} else {
				detData.configuration.tileConfiguration.signature.parameters.VizType = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.VizType.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.VizType.defaultValue.value = "";
			}
			
			var techconf = detData.UseTechnicalQueryNames?
						  detData.UseTechnicalQueryNames:false;
			detData.configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames = {"required":false};
			detData.configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames.defaultValue = {};
			detData.configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames.defaultValue.value = '"' + techconf.toString() + '"';
			
			var MeasureInDimensions = detData.MeasureInDimensions?
						  detData.MeasureInDimensions:"";
			detData.configuration.tileConfiguration.signature.parameters.MeasureInDimensions = {"required":false};
			detData.configuration.tileConfiguration.signature.parameters.MeasureInDimensions.defaultValue = {};
			detData.configuration.tileConfiguration.signature.parameters.MeasureInDimensions.defaultValue.value = '"' + MeasureInDimensions + '"';
			
			var disVizTypeStr = "";
			disVizTypeStr = detData.vizCol?disVizTypeStr + '"column"' + ",":disVizTypeStr;
			disVizTypeStr = detData.vizBar?disVizTypeStr + '"bar"' + ",":disVizTypeStr;
			disVizTypeStr = detData.vizLine?disVizTypeStr + '"line"' + ",":disVizTypeStr;
			disVizTypeStr = detData.vizPie?disVizTypeStr + '"pie"' + ",":disVizTypeStr;
			disVizTypeStr = detData.vizHeat?disVizTypeStr + '"heatmap"' + ",":disVizTypeStr;
			disVizTypeStr = detData.vizComp?disVizTypeStr + '"combination"' + ",":disVizTypeStr;
			disVizTypeStr = detData.vizBullet?disVizTypeStr + '"vertical_bullet"':disVizTypeStr;
			disVizTypeStr = disVizTypeStr[disVizTypeStr.length-1] === ","?
							disVizTypeStr.slice(disVizTypeStr[disVizTypeStr.length-1],disVizTypeStr.length-1):
							disVizTypeStr;
			if(disVizTypeStr.length) {
				detData.configuration.tileConfiguration.signature.parameters.disabledVizTypes = {"required":false};
				detData.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue = {};
				detData.configuration.tileConfiguration.signature.parameters.disabledVizTypes.defaultValue.value = "[" + disVizTypeStr + "]";
				disVizTypeStr = "[disabledVizTypes=[" + disVizTypeStr + "]";
			} else {
				disVizTypeStr = "[disabledVizTypes=]";
			}
			
			EnableStr = "[EnableExportTo=" + "'" + enableExp + "'" + "]";
			ShowYAxisStr = "[ShowYAxisLabel=" + "'" + ShowYAxis + "'" + "]";
			queryStr = query?"[Query=" + "'" + query + "'" + "]":"[Query=]";
			PO_URL = pourl?"[PO_URL=" + "'" + pourl + "'":"[PO_URL=]";
			vizTypeStr = vizType?"[VizType=" + "'" + vizType + "'" + "]":"[VizType=]";
			techStr = "[UseTechnicalQueryNames=" + "'" + techconf + "'" + "]";
			MeasureInDimensionsStr = MeasureInDimensions?"[MeasureInDimensions=" + "'" + MeasureInDimensions + "'" + "]":"[MeasureInDimensions=]";

			returnData = mesStr + "&" + dimStr + "&" + queryStr + "&" + EnableStr + "&" + ShowYAxisStr + "&" + PO_URL + "&" + hide_dimStr + "&" + hide_filtStr + "&" +
				lock_filtStr + "&" + hide_mesStr + "&" + filtStr + "&" + vizTypeStr + "&" + techStr + "&" + disVizTypeStr + "&" + MeasureInDimensionsStr + "&" + "*=*";
			returnData = returnData.replace(/[']/g, "%22");
			return (returnData);
		},
		handleDelPress: function() {
			var detData = this.getView().getModel("detailModel").getData(),
				pageId = detData.pageId,
				instanceId = detData.instanceId,
				TR = this.getView().getModel("workbenchrequestmodel").getData().flag,
				tr_package = this.getView().getModel("packagemodel").getData().results[0].flag,
				title = detData.configuration.tileConfiguration.display_title_text || detData.chipId.split("UI2/")[1],
				conf = "Do you want to delete " + "'" + title + "'" + "?",
				that = this,
				url = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/",
				entity = "/PageChipInstances(pageId='" + pageId + "',instanceId='" + instanceId + "')";
			that.title = title;
			this.getModel("commonModel").getData().transportB4save = "detRem";
			this.getModel("commonModel").updateBindings(true);
			if (TR && tr_package) {
				MessageBox.show(conf, {
					icon: sap.m.MessageBox.Icon.QUESTION,
					title: "Confirmation",
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
					onClose: function(oAction) {
						if (oAction === "YES") {
							Service.deleteService(url, entity,
								function(data) {
									MessageToast.show("'"+that.title+"' Deleted Successfully ");
									that.refreshMaster();
								},
								function(error) {
									var errdetail;
									if (error.response) {
										errdetail = $(error.response.body).find('message').first().text();
									} else {
										errdetail = error.message;
									}
									MessageBox.show(
										errdetail, {
											icon: sap.m.MessageBox.Icon.ERROR,
											title: "Error",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {
												if (oAction === "OK") {
													//
												}
											}
										});
								});
						}
					}
				});
			} else {
				this.handleactionsettings();
			}
		},
		addNewColumnData: function() {
			var itemData = this.getView().getModel("detailModel").getData(),
				obj = {
					"columnColor": "",
					"columnLabel": "",
					"columnValue": ""
				};
			if (itemData.configuration.tileConfiguration.columnChartData) {
				itemData.configuration.tileConfiguration.columnChartData.push(obj);
				this.getView().getModel("detailModel").setData(itemData);
				this.getView().getModel("detailModel").updateBindings(true);
			}
			else
			{
				itemData.configuration.tileConfiguration.columnChartData = [];
				itemData.configuration.tileConfiguration.columnChartData.push(obj);
				this.getView().getModel("detailModel").setData(itemData);
				this.getView().getModel("detailModel").updateBindings(true);
			}
		},
		removeColumnData: function() {
			var oTable = sap.ui.getCore().byId("columnChartTable"),
				itemData = this.getView().getModel("detailModel").getData();
			if (itemData.configuration.tileConfiguration.columnChartData) {
				itemData.configuration.tileConfiguration.columnChartData.splice(oTable.getSelectedIndices()[0], 1);
				this.getView().getModel("detailModel").setData(itemData);
				this.getView().getModel("detailModel").updateBindings(true);
			}
		},
		addNewTrendRow: function() {
			var itemData = this.getView().getModel("detailModel").getData(),
				obj = {
					"chartPointX": "",
					"chartPointY": "",
					"maxThresholdPointX": "",
					"maxThresholdPointY": "",
					"minThresholdPointX": "",
					"minThresholdPointY": "",
					"targetPointX": "",
					"targetPointY": ""
				};
			if (itemData.configuration.tileConfiguration.chartPoints) {
				itemData.configuration.tileConfiguration.chartPoints.push(obj);
				this.getView().getModel("detailModel").setData(itemData);
				this.getView().getModel("detailModel").updateBindings(true);
			}
			else
			{
				itemData.configuration.tileConfiguration.chartPoints = [];
				itemData.configuration.tileConfiguration.chartPoints.push(obj);
				this.getView().getModel("detailModel").setData(itemData);
				this.getView().getModel("detailModel").updateBindings(true);
			}
		},
		remOneTrendRow: function() {
			var oTable = sap.ui.getCore().byId("trendChartTable"),
				itemData = this.getView().getModel("detailModel").getData();
			if (itemData.configuration.tileConfiguration.chartPoints) {
				itemData.configuration.tileConfiguration.chartPoints.splice(oTable.getSelectedIndices()[0], 1);
				this.getView().getModel("detailModel").setData(itemData);
				this.getView().getModel("detailModel").updateBindings(true);
			}
		},
		refreshMaster: function() {
			//SERVICE CALL BASED ON CATALOG
			var that = this,
				catId = this.getView().getModel("detailModel").getData().pageId,
				url = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/",
				entity = "/Pages('" + catId + "')/PageChipInstances",
				Busy = new sap.m.BusyDialog();
			Busy.open();
			// entity = "/CatalogSet('"+catID+"')?$expand=ToTile";
			Service.callService(url, entity,
				function(data) {
					Busy.close();
					var masterdata = data.results,
						queryID = "";
					for (var i = 0; i < masterdata.length; i++) {
						if(masterdata[i].referenceChipInstanceId || !masterdata[i].configuration) {
							masterdata.splice(i,1);
							i--;
							continue;
						}
						masterdata[i].chipIdnew = masterdata[i].chipId;
						masterdata[i].configuration = masterdata[i].configuration.tileConfiguration ?
							masterdata[i].configuration :
							JSON.parse(masterdata[i].configuration);
						if (masterdata[i].configuration.tileConfiguration) {
							masterdata[i].configuration.tileConfiguration = masterdata[i].configuration.tileConfiguration.display_title_text ?
								masterdata[i].configuration.tileConfiguration :
								JSON.parse(masterdata[i].configuration.tileConfiguration);
							if (masterdata[i].configuration.tileConfiguration.mapping_signature) {
								queryID = masterdata[i].configuration.tileConfiguration.mapping_signature.split("Query=")[1] ?
									masterdata[i].configuration.tileConfiguration.mapping_signature.split("Query=")[1].split("&")[0].split("%22")[1] : "";
							}
						}
						masterdata[i].queryId = queryID ? queryID.replace("%2F", "/") : queryID;
						masterdata[i].itemTitle = formatter.handlemastertitle(masterdata[i].title,masterdata[i].configuration.tileConfiguration.display_title_text);
						masterdata[i].itemSemObj = formatter.handleSemObj(masterdata[i].configuration.tileConfiguration.semantic_object,masterdata[i].configuration.tileConfiguration.navigation_semantic_object);
						masterdata[i].itemSemAct = formatter.handleSemAct(masterdata[i].configuration.tileConfiguration.semantic_action,masterdata[i].configuration.tileConfiguration.navigation_semantic_action);
						if (masterdata[i].chipId === "X-SAP-UI2-CHIP:/UI2/ACTION") {
							if(!masterdata[i].configuration.tileConfiguration.signature) {
								masterdata.splice(i,1);
								i--;
								continue;
							}
							masterdata[i].status = "Target Mapping";
							var parameterFlag = masterdata[i].configuration.tileConfiguration.signature.parameters?
												true:
												false; 
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
						} else {
							masterdata[i].status = "Tile";
						}
					}

					that.getView().getModel("masterView1").setData(data);
					that.getView().getModel("masterView1").updateBindings(true);
					//	onEventBus.publish("Detail", "onUpdateFinished");  
					that._onObjectMatched(data.results[0].instanceId);
				},
				function(error) {
					Busy.close();
					var errdetail;
					if (error.response) {
						errdetail = $(error.response.body).find('message').first().text();
					} else {
						errdetail = error.message;
					}
					MessageBox.show(
						errdetail, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (oAction === "OK") {
									//
								}
							}
						});
				});
			//END OF SERVICE CALL BASED ON CATALOG//
		},
		vizSelChange: function(oEvent) {
			var vizEnabled = this.getView().getModel("vizEnableModel"),
				detModel = this.getView().getModel("detailModel"),
				obj = {},
				selectedViz = oEvent?oEvent.sId?oEvent.getSource().getSelectedKey():oEvent:"";
			switch (selectedViz) {
						case "column":
									 obj = {"col":false,"bar":true,"line":true,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizCol = false;
									 detModel.updateBindings(true);
									 break;
						case "bar":
									 obj = {"col":true,"bar":false,"line":true,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizBar = false;
									 detModel.updateBindings(true);
									 break;
						case "line":
							         obj = {"col":true,"bar":true,"line":false,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizLine = false;
									 detModel.updateBindings(true);
									 break;
						case "pie":
									 obj = {"col":true,"bar":true,"line":true,"pie":false,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizPie = false;
									 detModel.updateBindings(true);
									 break;
						case "heatmap":
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":false,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizHeat = false;
									 detModel.updateBindings(true);
									 break;
						case "combination":
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":true,"comp":false,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizComp = false;
									 detModel.updateBindings(true);
									 break;
						case "vertical_bullet":
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":true,"comp":true,"bullet":false};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.getData().vizBullet = false;
									 detModel.updateBindings(true);
									 break;
						default:
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 detModel.updateBindings(true);
									 break;
			}
		},
		onNavBack: function() {
			this.getRouter().navTo("master");
		},
		onExit: function() {
			for (var sPropertyName in this._formFragments) {
				if (!this._formFragments.hasOwnProperty(sPropertyName)) {
					return;
				}

				this._formFragments[sPropertyName].destroy();
				this._formFragments[sPropertyName] = null;
			}
		}

	});
});