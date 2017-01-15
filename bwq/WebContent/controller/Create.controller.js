sap.ui.define([
	"com/mindset/zbwquery_admin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/mindset/zbwquery_admin/model/formatter",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/Filter",
	"sap/m/MessageBox",
	"sap/m/BusyDialog",
	"com/mindset/zbwquery_admin/controller/Services",
	'sap/m/MessageToast',
	"sap/ui/core/EventBus"
], function(BaseController, JSONModel, formatter, ODataModel, Filter, MessageBox, oBusy, Service, MessageToast, EventBus) {
	"use strict";

	return BaseController.extend("com.mindset.zbwquery_admin.controller.Create", {

		formatter: formatter,
		onInit: function() {
			var oViewModel = new JSONModel({
					busy: false,
					delay: 0
				}),
				onEventBus = sap.ui.getCore().getEventBus();
			onEventBus.subscribe("com.mindset.zbwquery_admin",
				"handleSavePress",
				this.handleSavePress,
				this);
			this.getRouter().getRoute("create").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "createView");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

			var diamensionModel = new JSONModel(),
				measureModel = new JSONModel(),
				filterModel = new JSONModel();
			this.getView().setModel(diamensionModel, "diamensionModel_2");
			this.getView().setModel(measureModel, "measureModel_2");
			this.getView().setModel(filterModel, "filterModel_2");
			
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
			
			this.setModels();
		},
		setModels: function() {
			var createModel = this.getDefaultCreateModel(),
				trendModel = this.getTrendModel(),
				dynamicModel = this.getDynamicModel(),
				statModel = this.getStatModel(),
				columnModel = this.getColumnModel(),
				bulletModel = this.getBulletModel(),
				comparisonModel = this.getComarisonModel(),
				harveyModel = this.getHarveyModel(),
				helpModel = new JSONModel({
					"TileTem": ""
				});
			this.getView().setModel(createModel, "createModel");
			this.getView().setModel(dynamicModel, "dynamicModel");
			this.getView().setModel(trendModel, "trendModel");
			this.getView().setModel(statModel, "statModel");
			this.getView().setModel(columnModel, "columnModel");
			this.getView().setModel(bulletModel, "bulletModel");
			this.getView().setModel(comparisonModel, "comparisonModel");
			this.getView().setModel(harveyModel, "harveyModel");
			this.getView().setModel(helpModel, "tileTemp");
		},
		clearModels: function() {
			var oView = this.getView();
			oView.getModel("diamensionModel_2").setData("");
			oView.getModel("measureModel_2").setData("");
			oView.getModel("filterModel_2").setData("");
			oView.getModel("diamensionModel_2").updateBindings(true);
			oView.getModel("measureModel_2").updateBindings(true);
			oView.getModel("filterModel_2").updateBindings(true);	
		},
		onNavBack: function() {
			var diamensionModel = this.getView().getModel("diamensionModel_1"),
				measureModel = this.getView().getModel("measureModel_1"),
				filterModel = this.getView().getModel("filterModel_1");
			if (diamensionModel) {
				diamensionModel.setData("");
				diamensionModel.updateBindings(true);
			}
			if (measureModel) {
				measureModel.setData("");
				measureModel.updateBindings(true);
			}
			if (filterModel) {
				filterModel.setData("");
				filterModel.updateBindings(true);
			}
			this.setModels();
			this.clearModels();
			this.setDefaultFrag();
			this.clearValidation();
			this.getRouter().navTo("createback", {}, true);
		},
		setDefaultFrag: function() {
			this._showFormFragment("Create_Static");
			this.getView().getModel("tileTemp").getData().TileTem = "static";
			this.getView().getModel("commonModel").getData().createFragType = "statModel";
			this.getView().getModel("commonModel").updateBindings(true);
			this.getView().getModel("tileTemp").updateBindings(true);
		},
		_onMetadataLoaded: function() {
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("createView");
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/busy", true);
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},
		_onObjectMatched: function(oEvent) {
			this.queryID = this.getView().getModel("queryModel1").oData.results[0].CubeNam;
			this.queryName = this.getView().getModel("queryModel1").oData.results[0].Dscrptn;
			this.querySelectionChane(this.queryID);
			this.getView().getModel("createModel").getData().queryid = this.queryID;   
			this.getView().getModel("createModel").getData().configuration.tileConfiguration.display_title_text = this.queryName;  
			this.getView().getModel("createModel").updateBindings(true);
			this.vizSelChange("column");
			
			this.getView().getModel("commonModel").getData().create_queryId=this.queryID;
			this.getView().getModel("commonModel").updateBindings(true);
			this.submitBatch(this.queryID,"lstQuery");
		},
		tileValidateField: function() {
			var flag = true;
			var semObj = this.getView().byId("inp_tile_sem"),
				semAct = this.getView().byId("inp_tile_act"),
				valueStateMsg = "";
			if(semObj.getValue() === "") {
				flag = false;
				valueStateMsg = semObj.mProperties.valueStateText;
				semObj.mProperties.valueStateText = valueStateMsg;
				semObj.setValueState("Error");
			} else {
				semObj.setValueState("None");
			}
			if(semAct.getValue() === "") {
				flag = false;
				valueStateMsg = semAct.mProperties.valueStateText;
				semAct.mProperties.valueStateText = valueStateMsg;
				semAct.setValueState("Error");
			} else {
				semAct.setValueState("None");
			}
			return flag;
		},
		targetValidateField: function() {
			var flag = true;
			var semObj = this.getView().byId("inp_targ_sem"),
				semAct = this.getView().byId("inp_targ_act"),
				valueStateMsg = "";
			if(semObj.getValue() === "") {
				flag = false;
				valueStateMsg = semObj.mProperties.valueStateText;
				semObj.mProperties.valueStateText = valueStateMsg;
				semObj.setValueState("Error");
			} else {
				semObj.setValueState("None");
			}
			if(semAct.getValue() === "") {
				flag = false;
				valueStateMsg = semAct.mProperties.valueStateText;
				semAct.mProperties.valueStateText = valueStateMsg;
				semAct.setValueState("Error");
			} else {
				semAct.setValueState("None");
			}
			return flag;
		},
		clearValidation: function() {
			var semObj = this.getView().byId("inp_tile_sem"),
				semAct = this.getView().byId("inp_tile_act"),
				targSemObj = this.getView().byId("inp_targ_sem"),
				targSemAct = this.getView().byId("inp_targ_act");
			semObj.setValueState("None");
			semAct.setValueState("None");
			targSemObj.setValueState("None");
			targSemAct.setValueState("None");
		},
		handleSavePress: function(oEvent) {
			var tileType = this.getView().getModel("tileTemp").getData().TileTem,
				confType = this.getView().getModel("tiletargetmodel").getData().status,
				TR = this.getView().getModel("workbenchrequestmodel").getData().flag,
				tr_package = this.getView().getModel("packagemodel").getData().results[0].flag,
				that = this,
				configData = "",
				title = "",
				conf = "", f = "",
				onEventBus = sap.ui.getCore().getEventBus();
			this.url = "/sap/opu/odata/UI2/PAGE_BUILDER_CONF/";
			this.oEntry = this.getView().getModel("createModel").getData();
			this.getModel("commonModel").getData().transportB4save = "createSave";
			this.getModel("commonModel").updateBindings(true);
			if (TR && tr_package) {
				if (confType === "Tile") {
					f = this.tileValidateField();
					if(f) {
						switch (tileType) {
							case "static":
								configData = this.getView().getModel("statModel").getData();
								break;
							case "dynamic":
								configData = this.getView().getModel("dynamicModel").getData();
								break;
							case "bullet":
								configData = this.getView().getModel("bulletModel").getData();
								break;
							case "column":
								configData = this.getView().getModel("columnModel").getData();
								break;
							case "comparison":
								configData = this.getView().getModel("comparisonModel").getData();
								break;
							case "harvey":
								configData = this.getView().getModel("harveyModel").getData();
								break;
							case "trend":
								configData = this.getView().getModel("trendModel").getData();
								break;
							default:
								configData = this.getView().getModel("statModel").getData();
								break;
						}
						configData.tileConfiguration.navigation_semantic_object = this.oEntry.semObj || this.oEntry.nav_semObj;
						configData.tileConfiguration.navigation_semantic_action = this.oEntry.semAct || this.oEntry.nav_semAct;
						configData.tileConfiguration.navigation_use_semantic_object = true;
						configData.tileConfiguration.scalingFactor = Number(configData.tileConfiguration.scalingFactor) || configData.tileConfiguration.scalingFactor;
	
						title = configData.tileConfiguration.display_title_text || this.oEntry.tileViz.split("UI2/")[1];
						conf = "Do you want Create Tile Configuration for " + "'" + title + "'" + "?";
						MessageBox.show(conf, {
							icon: sap.m.MessageBox.Icon.QUESTION,
							title: "Confirmation",
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function(oAction) {
								if (oAction === "YES") {
									that.tileTitle = configData.tileConfiguration.display_title_text;
									that.subTitle = configData.tileConfiguration.display_subtitle_text;
									that.infoTitle = configData.tileConfiguration.display_info_text;
									that.search_keywords = configData.tileConfiguration.display_search_keywords;
									configData.tileConfiguration = JSON.stringify(configData.tileConfiguration);
									that.oEntry.configuration = JSON.stringify(configData);
									//SERVICE CALL FOR FETCHING INSTANCE ID
									var entity = "/PageChipInstances",
										data1 = {};
									data1.chipId = that.oEntry.tileViz;
									data1.configuration = "";
									data1.instanceId = "";
									data1.layoutData = "";
									data1.pageId = that.getView().getModel("detailModel").getData().pageId;
									data1.title = "";
									Service.createService(that.url, entity, data1,
										function(data) {
											that.chipId = data.chipId;
											that.instanceId = data.instanceId;
											that.pageId = data.pageId;
											that.scope = data.scope;
											var d = {
												"chipId":that.oEntry.tileViz,
												"configuration":that.oEntry.configuration,
												"instanceId":data.instanceId,
												"isReadOnly":"",
												"layoutData":"",
												"outdated":"",
												"pageId":data.pageId,
												"referenceChipInstanceId":"",
												"referencePageId":"",
												"remoteCatalogId":"",
												"scope":data.scope,
												"title":"",
												"updated":new Date()
											};
											var entity1 = "/PageChipInstances(pageId='" + data.pageId + "',instanceId='" + data.instanceId + "')";
											//SERVICE CALL FOR TILE CREATION
											Service.updateService(that.url, entity1, d,
												function(data) {
													///////////////BATCH CALL FOR display_title_text,display_subtitle_text,display_info_text AND display_search_keywords SAVE//////////
													var batchModel = new ODataModel("/sap/opu/odata/UI2/PAGE_BUILDER_CONF/"),
														oEntry2 = {
															bagId: "tileProperties",
															instanceId: that.instanceId,
															name: "display_title_text",
															pageId: that.pageId,
															translatable: "X",
															value: that.tileTitle
														},
														oEntry3 = {
															bagId: "tileProperties",
															instanceId: that.instanceId,
															name: "display_subtitle_text",
															pageId: that.pageId,
															translatable: "X",
															value: that.subTitle
														},
														oEntry4 = {
															bagId: "tileProperties",
															instanceId: that.instanceId,
															name: "display_info_text",
															pageId: that.pageId,
															translatable: "X",
															value: that.infoTitle
														},
														oEntry5 = {
															bagId: "tileProperties",
															instanceId: that.instanceId,
															name: "display_search_keywords",
															pageId: that.pageId,
															translatable: "X",
															value: that.search_keywords
														},
														batchPost = [];
													batchPost.push(batchModel.createBatchOperation("/ChipInstanceProperties", "POST", oEntry2));
													batchPost.push(batchModel.createBatchOperation("/ChipInstanceProperties", "POST", oEntry3));
													batchPost.push(batchModel.createBatchOperation("/ChipInstanceProperties", "POST", oEntry4));
													batchPost.push(batchModel.createBatchOperation("/ChipInstanceProperties", "POST", oEntry5));
													batchModel.addBatchChangeOperations(batchPost);
													batchModel.submitBatch(function(data) {
															MessageToast.show("'"+that.tileTitle+"' Created");
															that.setModels();
															that.getView().getModel("createModel").getData().queryid = that.queryID;   
															that.getView().getModel("createModel").updateBindings(true);
															onEventBus.publish("com.mindset.zbwquery_admin",
																"refreshMaster");
															that.getRouter().navTo("createback", {}, true);
															that.setDefaultFrag();
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
																			that.oEntry.configuration = JSON.parse(that.oEntry.configuration);
																			that.oEntry.configuration.tileConfiguration = JSON.parse(that.oEntry.configuration.tileConfiguration);
																		}
																	}
																});
														});
													///////////////END OF BATCH CALL///////////////////////
	
												},
												function(error) {
													that.setModels();
													that.getView().getModel("createModel").getData().queryid = that.queryID;   
													that.getView().getModel("createModel").updateBindings(true);
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
																	that.oEntry.configuration = JSON.parse(that.oEntry.configuration);
																	that.oEntry.configuration.tileConfiguration = JSON.parse(that.oEntry.configuration.tileConfiguration);
																}
															}
														});
												});
											//END OF SERVICE CALL FOR TILE CREATION
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
															that.oEntry.configuration = JSON.parse(that.oEntry.configuration);
															that.oEntry.configuration.tileConfiguration = JSON.parse(that.oEntry.configuration.tileConfiguration);
														}
													}
												});
										});
									//END OF SERVICE CALL FOR FETCHING INSTANCE ID
								}
							}
						});
					} else {
						MessageBox.show(
										"Validation Check Failed", {
											icon: sap.m.MessageBox.Icon.WARNING,
											title: "Warning",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {
												if (oAction === "OK") {
													//
												}
											}
										});
					}
				} else if(confType === "Target Mapping") {
					f = this.targetValidateField();
					if(f) {
						var mapSign = that.createMappingSignature();
						that.oEntry1 = {};
						that.oEntry1.configuration = that.oEntry.configuration;
						that.oEntry1.configuration.tileConfiguration.mapping_signature = mapSign;
						that.oEntry1.isReadOnly = that.oEntry.isReadOnly;
						that.oEntry1.layoutData = that.oEntry.layoutData;
						that.oEntry1.outdated = that.oEntry.outdated;
						that.oEntry1.referenceChipInstanceId = that.oEntry.referenceChipInstanceId;
						that.oEntry1.referencePageId = that.oEntry.referencePageId;
						that.oEntry1.remoteCatalogId = that.oEntry.remoteCatalogId;
						that.oEntry1.title = that.oEntry.title;
						that.oEntry1.updated = new Date();
	
						title = that.oEntry.configuration.tileConfiguration.display_title_text || "ACTION";
						conf = "Do you want Create Target Configuration for " + "'" + title + "'" + "?";
						MessageBox.show(conf, {
							icon: sap.m.MessageBox.Icon.QUESTION,
							title: "Confirmation",
							actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
							onClose: function(oAction) {
								if (oAction === "YES") {
									that.title = that.oEntry1.configuration.tileConfiguration.display_title_text;
									that.oEntry1.configuration.tileConfiguration = JSON.stringify(that.oEntry1.configuration.tileConfiguration);
									that.oEntry1.configuration = JSON.stringify(that.oEntry1.configuration);
									that.oEntry1.configuration = that.oEntry1.configuration.replace(/&amp;/g, '&');
									//SERVICE CALL FOR FETCHING INSTANCE ID
									var entity = "/PageChipInstances",
										data1 = {};
									data1.chipId = "X-SAP-UI2-CHIP:/UI2/ACTION";
									data1.configuration = "";
									data1.instanceId = "";
									data1.layoutData = "";
									data1.pageId = that.getView().getModel("detailModel").getData().pageId;
									data1.title = "";
									Service.createService(that.url, entity, data1,
										function(data) {
											that.oEntry1.chipId = data.chipId;
											that.oEntry1.instanceId = data.instanceId;
											that.oEntry1.pageId = data.pageId;
											that.oEntry1.scope = data.scope;
											var entity1 = "/PageChipInstances(pageId='" + data.pageId + "',instanceId='" + data.instanceId + "')";
											//SERVICE CALL FOR TILE CREATION
											Service.updateService(that.url, entity1, that.oEntry1,
												function(data) {
													//////////////////////BATCH CALL FOR display_title_text////////
														var oEntry2 = {
															bagId:"tileProperties",
															instanceId:that.oEntry1.instanceId,
															name:"display_title_text",
															pageId:that.oEntry1.pageId,
															translatable:"X",
															value:that.title
														};
														var batchModel = new ODataModel("/sap/opu/odata/UI2/PAGE_BUILDER_CONF/"),
														batchPost = [];
														batchPost.push(batchModel.createBatchOperation("/ChipInstanceProperties", "POST", oEntry2));
														batchModel.addBatchChangeOperations(batchPost);
														batchModel.submitBatch(
															function(data) {
																MessageToast.show("'"+that.title+"' Created");
																that.setModels();
																that.getView().getModel("createModel").getData().queryid = that.queryID;   
																that.getView().getModel("createModel").updateBindings(true);
																that.clearModels();
																onEventBus.publish("com.mindset.zbwquery_admin", "refreshMaster");
																that.getRouter().navTo("createback", {}, true);
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
																				that.oEntry1.configuration = JSON.parse(that.oEntry1.configuration);
																				that.oEntry1.configuration.tileConfiguration = JSON.parse(that.oEntry1.configuration.tileConfiguration);
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
																	that.oEntry1.configuration = JSON.parse(that.oEntry1.configuration);
																	that.oEntry1.configuration.tileConfiguration = JSON.parse(that.oEntry1.configuration.tileConfiguration);
																}
															}
														});
												});
											//END OF SERVICE CALL FOR TILE CREATION
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
															that.oEntry1.configuration = JSON.parse(that.oEntry1.configuration);
															that.oEntry1.configuration.tileConfiguration = JSON.parse(that.oEntry1.configuration.tileConfiguration);
														}
													}
												});
										});
									//END OF SERVICE CALL FOR FETCHING INSTANCE ID
								}
							}
						});
					} else {
						MessageBox.show(
										"Validation Check Failed", {
											icon: sap.m.MessageBox.Icon.WARNING,
											title: "Warning",
											actions: [sap.m.MessageBox.Action.OK],
											onClose: function(oAction) {
												if (oAction === "OK") {
													//
												}
											}
										});
					}
				}
			} else {
				onEventBus.publish("com.mindset.zbwquery_admin", "handleactionsettings");
			}

		},
		createMappingSignature: function() {
			var dimenData = this.getView().getModel("diamensionModel_2").getData(),
				mesData = this.getView().getModel("measureModel_2").getData(),
				filterData = this.getView().getModel("filterModel_2").getData(),
				detData = this.getView().getModel("createModel").getData(),
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
				detData.configuration.tileConfiguration.signature.parameters.Dimensions.defaultValue.value = "[" + arr.toString() + "]";                   
			}
			if(arr1.length) {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Dimensions.defaultValue.value = "[" + arr1.toString() + "]";                   
			}
			dimStr = arr.length ? "[Dimensions=" + encodeURIComponent("[" + arr.toString() + "]") + "]" : "[Dimensions='']";
			hide_dimStr = arr1.length ? "[Hide_Dimensions=" + encodeURIComponent("[" + arr1.toString() + "]") + "]" : "[Hide_Dimensions='']";
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
				detData.configuration.tileConfiguration.signature.parameters.Measures.defaultValue.value = "[" + arr.toString() + "]";                   
			}
			if(arr1.length) {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Measures.defaultValue.value = "[" + arr1.toString() + "]";                   
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
				detData.configuration.tileConfiguration.signature.parameters.Variables.defaultValue.value = "[" + arr.toString() + "]";                   
			}
			if(arr1.length) {
				detData.configuration.tileConfiguration.signature.parameters.Hide_Filters.defaultValue.value = "[" + arr1.toString() + "]";                   
			}
			if(arr2.length) {
				detData.configuration.tileConfiguration.signature.parameters.Lock_Filters.defaultValue.value = "[" + arr2.toString() + "]";                   
			}
			filtStr = arr.length ? "[Variables=" + encodeURIComponent("[" + arr.toString() + "]") + "]" : "[Variables=]";
			hide_filtStr = arr1.length ? "[Hide_Filters=" + encodeURIComponent("[" + arr1.toString() + "]") + "]" : "[Hide_Filters=]";
			lock_filtStr = arr2.length ? "[Lock_Filters=" + encodeURIComponent("[" + arr2.toString() + "]") + "]" : "[Lock_Filters=]";
			arr = [];
			arr1 = [];
			
			if(detData.queryid) {
				detData.configuration.tileConfiguration.signature.parameters.Query.defaultValue.value = '"' + detData.queryid + '"';
			}
			
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
				disVizTypeStr = "[disabledVizTypes=[" + disVizTypeStr + "]]";
			} else {
				disVizTypeStr = "[disabledVizTypes=]";
			}
			
			detData.configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue.value = '"' + detData.EnableExportTo.toString() + '"';
			detData.configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue.value = '"' + detData.ShowYAxisLabel.toString() + '"';
			detData.configuration.tileConfiguration.signature.parameters.UseTechnicalQueryNames.defaultValue.value = '"' + detData.UseTechnicalQueryNames.toString() + '"';
			detData.configuration.tileConfiguration.signature.parameters.PO_URL.defaultValue.value = '"' + detData.PO_URL + '"';
			detData.configuration.tileConfiguration.signature.parameters.VizType.defaultValue.value = '"' + detData.vizType + '"';
			
			EnableStr = "[EnableExportTo=" + '"' + detData.configuration.tileConfiguration.signature.parameters.EnableExportTo.defaultValue.value + '"' + "]";
			ShowYAxisStr = "[ShowYAxisLabel=" + '"' + detData.configuration.tileConfiguration.signature.parameters.ShowYAxisLabel.defaultValue.value + '"' + "]";
			queryStr = detData.queryid?"[Query=" + '"' + detData.queryid + '"' + "]":"[Query=]";
			PO_URL = detData.PO_URL?"[PO_URL=" + '"' + detData.PO_URL + '"' + "]":"[PO_URL=]";
			vizTypeStr = detData.vizType?
						"[VizType=" + '"' + detData.vizType + '"' + "]":
						"[VizType=]";
			techStr = detData.UseTechnicalQueryNames?"[UseTechnicalQueryNames=" + '"' + detData.UseTechnicalQueryNames + '"' + "]":"[UseTechnicalQueryNames=]";
			MeasureInDimensionsStr = MeasureInDimensions?"[MeasureInDimensions=" + "'" + MeasureInDimensions + "'" + "]":"[MeasureInDimensions=]";
			
			returnData = mesStr + '&' + dimStr + '&' + queryStr + '&' + EnableStr + '&' + ShowYAxisStr + '&' + PO_URL + '&' + hide_dimStr + '&' + hide_filtStr + '&' +
				lock_filtStr + '&' + hide_mesStr + '&' + filtStr + '&' + vizTypeStr + '&' + techStr + '&' + disVizTypeStr + "&" + MeasureInDimensionsStr + "&" + '*=*';
			returnData = returnData.replace(/[']/g, "%22");
			return (returnData);
		},
		querySelectionChane: function(oEvent) {
			this.clearValidation();
			var queryID = oEvent.sId?oEvent.getSource().getSelectedKey():oEvent;
			this.getModel("createModel").getData().configuration.tileConfiguration.display_title_text = oEvent.sId?oEvent.getSource().getSelectedItem().getText():"";
			this.getModel("createModel").updateBindings(true);
			this.submitBatch(queryID,"lstQuery");
		},
		submitBatch: function(queryID,queryType) {
			var batchModel = new ODataModel("/sap/opu/odata/MINDSET/FIORIBW_SRV/"),
				batchRead = [],
				oView = this.getView(),
				urlGenModel = this.getView().getModel("urlGenModel"),
				urlObj = {},
				that = this,
				oBusy1 = new sap.m.BusyDialog(),
				dimensionSet = "/DimensionSet?$skip=0&$top=100&$filter=CubeNam+eq+'" + queryID + "'",
				measuredSet = "/MeasureSet?$skip=0&$top=100&$filter=CubeNam+eq+'" + queryID + "'",
				filterSet = "/VariableSet?$filter=CubeNam+eq+'" + queryID + "'";
			batchRead.push(batchModel.createBatchOperation(dimensionSet, "GET"));
			batchRead.push(batchModel.createBatchOperation(measuredSet, "GET"));
			batchRead.push(batchModel.createBatchOperation(filterSet, "GET"));
			batchModel.addBatchReadOperations(batchRead);
			oBusy1.open();
			batchModel.submitBatch(
				function(data) {
					oBusy1.close();
					$.each(data.__batchResponses[0].data.results,
						function(ind, val) {
							val.visible = true;
							val.default = false;
						});
					$.each(data.__batchResponses[1].data.results,
						function(ind, val) {
							val.visible = true;
							val.default = false;
						});
					$.each(data.__batchResponses[2].data.results,
						function(ind, val) {
							val.visible = true;
							val.default = false;
							val.lock = false;
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
						oView.getModel("diamensionModel_2").setData(data.__batchResponses[0].data);
						oView.getModel("measureModel_2").setData(data.__batchResponses[1].data);
						oView.getModel("filterModel_2").setData(data.__batchResponses[2].data);
						oView.getModel("diamensionModel_2").updateBindings(true);
						oView.getModel("measureModel_2").updateBindings(true);
						oView.getModel("filterModel_2").updateBindings(true);
					}
						
					that.updateValueHelp();
				},
				function(error) {
					oBusy1.close();
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
		},
		_onTileChange: function(oEvent) {
			var oView = this.getView(),
				source = oEvent.getSource(),
				selectedValue = source.getSelectedKey();

			this.getView().getModel("helpCreateModel").setData("");
			this.getView().getModel("helpCreateModel").updateBindings(true);

			switch (selectedValue) {
				case "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER":
					this._showFormFragment("Create_Static");
					this.getView().getModel("tileTemp").getData().TileTem = "static";
					this.getView().getModel("commonModel").getData().createFragType = "statModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				case "X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER":
					this._showFormFragment("Create_Dynamic");
					this.getView().getModel("tileTemp").getData().TileTem = "dynamic";
					this.getView().getModel("commonModel").getData().createFragType = "dynamicModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/BULLET_CHART_TILE_CHIP":
					this._showFormFragment("Create_Bullet");
					this.getView().getModel("tileTemp").getData().TileTem = "bullet";
					this.getView().getModel("commonModel").getData().createFragType = "bulletModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/COLUMN_CHART_CHIP":
					this._showFormFragment("Create_Column");
					this.getView().getModel("tileTemp").getData().TileTem = "column";
					this.getView().getModel("commonModel").getData().createFragType = "columnModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/COMPARISON_CHART_CHIP":
					this._showFormFragment("Create_Comparison");
					this.getView().getModel("tileTemp").getData().TileTem = "comparison";
					this.getView().getModel("commonModel").getData().createFragType = "comparisonModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/HARVEY_BALL_CHART_CHIP":
					this._showFormFragment("Create_Harvey");
					this.getView().getModel("tileTemp").getData().TileTem = "harvey";
					this.getView().getModel("commonModel").getData().createFragType = "harveyModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				case "X-SAP-UI2-CHIP:/MINDSET/TREND_CHART_CHIP":
					this._showFormFragment("Create_Trend");
					this.getView().getModel("tileTemp").getData().TileTem = "trend";
					this.getView().getModel("commonModel").getData().createFragType = "trendModel";
					this.getView().getModel("commonModel").updateBindings(true);
					this.getView().getModel("tileTemp").updateBindings(true);
					break;
				default:
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
			var oTab = this.getView().byId("idIconTabBar1"),
				oTileTab = oTab.getItems()[1];

			oTileTab.removeAllContent();
			oTileTab.insertContent(this._getFormFragment(sFragmentName));
		},
		diamVizChange: function(oEvent) {
			var view = this.getView();
			var evt = oEvent;
			var state = oEvent.getParameters().state;
			var id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if (state === false) {
				view.getModel("diamensionModel_2").getData().results[id].default = false;
				evt.getSource().getParent().getCells()[3].setEnabled(false);
			} else {
				//view.getModel("createModel").getData().dimArray[id].default = false;
				evt.getSource().getParent().getCells()[3].setEnabled(true);
			}
			view.getModel("diamensionModel_2").updateBindings(true);
			this.getView().getModel("createModel").getData().MeasureInDimensions = "";
			this.getView().getModel("createModel").updateBindings(true);
			this.updateValueHelp();
		},
		updateValueHelp: function() {
			///Measure In Dimensions Value Help Filtering Data////////
			var dimData = this.getView().getModel("diamensionModel_2").getData().results,
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
		diamDefChange: function(oEvent) {
			var evt = oEvent;
			evt.getSource().getParent().getCells()[3].setEnabled(true);
		},
		mesVizChange: function(oEvent) {
			var view = this.getView();
			var evt = oEvent;
			var state = oEvent.getParameters().state;
			var id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if (state === false) {
				view.getModel("measureModel_2").getData().results[id].default = false;
				evt.getSource().getParent().getCells()[3].setEnabled(false);
			} else {
				//	view.getModel("createModel").getData().mesArray[id].default = false;
				evt.getSource().getParent().getCells()[3].setEnabled(true);
			}
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
				view.getModel("filterModel_2").getData().results[id].default = false;
				evt.getSource().getParent().getCells()[3].setEnabled(false);
			} else {
				//view.getModel("createModel").getData().filArray[id].default = false;
				evt.getSource().getParent().getCells()[3].setEnabled(true);
			}
		},
		filDefChange: function(oEvent) {
			var state = oEvent.getParameters().state,
				view = this.getView(),
				id = Number(oEvent.getParameters().id.substring(oEvent.getParameters().id.length - 1));
			if (state === false) {
				oEvent.getSource().getParent().getCells()[4].setEnabled(false);
				view.getModel("filterModel_2").getData().results[id].lock = false;
			} else {
				oEvent.getSource().getParent().getCells()[4].setEnabled(true);
			}
		},
		onRefreshPress: function(oEvent) {
			var detModel = this.getModel(this.getView().getModel("commonModel").getData().createFragType).getData(),
				url = detModel.tileConfiguration.service_url,
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
							that.getView().getModel("helpCreateModel").setData(data);
							that.getView().getModel("helpCreateModel").updateBindings(true);
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
			oDialog.setModel(this.getView().getModel("helpCreateModel"));
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
				this._urlDialog = sap.ui.xmlfragment("com.mindset.zbwquery_admin.Fragments.create_urlGenarator", this);
				this.getView().addDependent(this._urlDialog);
				this._urlDialog.open();
			}
			// this._urlDialog.setModel(this.getView().getModel("workbenchrequestmodel"), "workbenchrequestmodel");
			// this._urlDialog.setModel(this.getView().getModel("packagemodel"), "packagemodel");

			this._urlDialog.open();
		},
		urlQuerySelChange: function(oEvent) {
			var queryId = oEvent.getSource().getSelectedKey();
			this.submitBatch(queryId,"urlQuery");
		},
		handleConfirm: function(oEvent) {
			var selItems = oEvent.getParameter("filterItems"),
				query = this.getView().getModel("createModel").getData().queryid,
				curModel = this.getView().getModel("commonModel").getData().createFragType,
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
			this.getView().getModel(curModel).getData().tileConfiguration.service_url = decodedUrl;
			this.getView().getModel(curModel).updateBindings(true);
			
			oEvent.getSource().setSelectedPresetFilterItem("");
		},
		handleCancel: function(oEvent) {
			oEvent.getSource().setSelectedPresetFilterItem("");
		},
		addNewColumnData: function() {
			var itemData = this.getView().getModel("columnModel").getData(),
				obj = {
					"columnColor": "",
					"columnLabel": "",
					"columnValue": ""
				};
			if (itemData.tileConfiguration.columnChartData) {
				itemData.tileConfiguration.columnChartData.push(obj);
				this.getView().getModel("columnModel").setData(itemData);
				this.getView().getModel("columnModel").updateBindings(true);
			}
		},
		removeColumnData: function() {
			var oTable = sap.ui.getCore().byId("create_column_table1"),
				itemData = this.getView().getModel("columnModel").getData();
			if (itemData.tileConfiguration.columnChartData) {
				itemData.tileConfiguration.columnChartData.splice(oTable.getSelectedIndices()[0], 1);
				this.getView().getModel("columnModel").setData(itemData);
				this.getView().getModel("columnModel").updateBindings(true);
			}
		},
		addNewTrendRow: function() {
			var itemData = this.getView().getModel("trendModel").getData(),
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
			if (itemData.tileConfiguration.chartPoints) {
				itemData.tileConfiguration.chartPoints.push(obj);
				this.getView().getModel("trendModel").setData(itemData);
				this.getView().getModel("trendModel").updateBindings(true);
			}
		},
		remOneTrendRow: function() {
			var oTable = sap.ui.getCore().byId("create_trend_chartTable"),
				itemData = this.getView().getModel("trendModel").getData();
			if (itemData.tileConfiguration.chartPoints) {
				itemData.tileConfiguration.chartPoints.splice(oTable.getSelectedIndices()[0], 1);
				this.getView().getModel("trendModel").setData(itemData);
				this.getView().getModel("trendModel").updateBindings(true);
			}
		},
		vizSelChange: function(oEvent) {
			var vizEnabled = this.getView().getModel("vizEnableModel"),
				createModel = this.getView().getModel("createModel"),
				obj = {},
				selectedViz = oEvent.sId?oEvent.getSource().getSelectedKey():oEvent;
			switch (selectedViz) {
						case "column":
									 obj = {"col":false,"bar":true,"line":true,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizCol = false;
									 createModel.updateBindings(true);
									 break;
						case "bar":
									 obj = {"col":true,"bar":false,"line":true,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizBar = false;
									 createModel.updateBindings(true);
									 break;
						case "line":
							         obj = {"col":true,"bar":true,"line":false,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizLine = false;
									 createModel.updateBindings(true);
									 break;
						case "pie":
									 obj = {"col":true,"bar":true,"line":true,"pie":false,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizPie = false;
									 createModel.updateBindings(true);
									 break;
						case "heatmap":
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":false,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizHeat = false;
									 createModel.updateBindings(true);
									 break;
						case "combination":
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":true,"comp":false,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizComp = false;
									 createModel.updateBindings(true);
									 break;
						case "vertical_bullet":
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":true,"comp":true,"bullet":false};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.getData().vizBullet = false;
									 createModel.updateBindings(true);
									 break;
						default:
									 obj = {"col":true,"bar":true,"line":true,"pie":true,"heat":true,"comp":true,"bullet":true};
									 vizEnabled.setData(obj);
									 vizEnabled.updateBindings(true);
									 createModel.updateBindings(true);
									 break;
			}
		}
	});
});