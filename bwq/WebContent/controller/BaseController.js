/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History"
	], function (Controller, History) {
		"use strict";

		return Controller.extend("com.mindset.zbwquery_admin.controller.BaseController", {
			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},
			onNavBack: function() {
				this.getRouter().navTo("master");
			},
			
			getDefaultCreateModel: function() {
				var create = { 
								"configuration": {
									"tileConfiguration":{
										"semantic_object":"AnalyticQuery",
										"semantic_action":"",
										"display_title_text":"",
										"url":"/sap/bc/ui5_ui5/sap/zfioribw/",
										"ui5_component":"mindset.fiori.bw",
										"navigation_provider":"SAPUI5",
										"navigation_provider_role":"",
										"navigation_provider_instance":"",
										"target_application_id":"",
										"target_application_alias":"",
										"transaction":{
											"code":""	
										},
										"web_dynpro":{
											"application":"",
											"configuration":""
										},
										"target_system_alias":"",
										"display_info_text":"",
										"mapping_signature":"",
										"signature":{
											"additional_parameters":"allowed",
											"parameters":{
												"Dimensions":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"EnableExportTo":{
													"defaultValue":{
														"value":false
													},
													"required":false
												},
												"ShowYAxisLabel":{
													"defaultValue":{
														"value":false
													},
													"required":false
												},
												"Hide_Dimensions":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"Hide_Filters":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"Hide_Measures":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"Lock_Filters":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"Measures":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"PO_URL":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"Query":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"UseTechnicalQueryNames":{
													"defaultValue":{
														"value":false
													},
													"required":false
												},
												"Variables":{
													"defaultValue":{
														"value":""
													},
													"required":false
												},
												"VizType":{
													"defaultValue":{
														"value":""
													},
													"required":false
												}
											}
										}
									}		
								},
								"chipId":"",
								"instanceId":"",
								"isReadOnly":"",
								"layoutData":"",
								"outdated":"",
								"pageId":"",
								"referenceChipInstanceId":"",
								"referencePageId":"",
								"remoteCatalogId":"",
								"scope":"",
								"title":"",
								"updated":"",
								"nav_semObj":"AnalyticQuery",
								"semObj":"",
								"nav_semAct":"",
								"semAct":"",
								"queryid":"",
								"EnableExportTo":false,
								"ShowYAxisLabel":false,
								"PO_URL":"",
								"vizType":"",
								"tileViz":"X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER",
								"UseTechnicalQueryNames":false,
								"vizCol":false,
								"vizBar":false,
								"vizLine":false,
								"vizPie":false,
								"vizHeat":false,
								"vizComp":false,
								"vizBullet":false,
								"MeasureInDimensions":""
							 },
					oModel = new sap.ui.model.json.JSONModel(create);
					return oModel;
			},
			getTrendModel: function() {
				var trendData = {
				    				"tileConfiguration": {
											"chartPoints":[
															{
																"chartPointX":"",
																"chartPointY":"",
																"maxThresholdPointX":"",
																"maxThresholdPointY":"",
																"minThresholdPointX":"",
																"minThresholdPointY":"",
																"targetPointX":"",
																"targetPointY":""
															}
														],
										"display_icon_url":"",
										"display_info_text":"",
										"display_number_unit":"",
										"display_search_keywords":"",
										"display_subtitle_text":"",
										"display_title_text":"",
										"firstXLabel":"",
										"firstXLabelColor":"",
										"firstYLabel":"",
										"firstYLabelColor":"",
										"lastXLabel":"",
										"lastXLabelColor":"",
										"lastYLabel":"",
										"lastYLabelColor":"",
										"navigation_semantic_action":"",
										"navigation_semantic_object":"",
										"navigation_semantic_parameters":"",
										"navigation_target_url":"",
										"navigation_use_semantic_object":"",
										"service_refresh_interval":"",
										"service_url":""
				    			}
				},
				oModel = new sap.ui.model.json.JSONModel(trendData);
				return oModel;
			},
			
			getDynamicModel: function() {
			    var	dynamicData = {
				    				"tileConfiguration": {
				    					"display_icon_url":"",
				    					"display_number_unit":"",
				    					"display_search_keywords":"",
										"navigation_semantic_action":"",
										"navigation_semantic_object":"",
										"navigation_semantic_parameters":"",
										"navigation_target_url":"",
										"navigation_use_semantic_object":"",
										"service_refresh_interval":"",
										"service_url":"",
										"display_info_text":"",
										"display_subtitle_text":"",
										"display_title_text":""
									}
								},
					oModel = new sap.ui.model.json.JSONModel(dynamicData);
					return oModel;
			},
			getStatModel: function() {
			    var	statData = {
				    				"tileConfiguration": {
				    					"display_icon_url":"",
				    					"display_search_keywords":"",
				    					"navigation_semantic_action":"",
										"navigation_semantic_object":"",
										"navigation_semantic_parameters":"",
										"navigation_target_url":"",
										"navigation_use_semantic_object":"",
										"display_info_text":"",
										"display_subtitle_text":"",
										"display_title_text":""
									}
								},
					oModel = new sap.ui.model.json.JSONModel(statData);
					return oModel;
			},
			getColumnModel: function() {
					var columnData = {
					    				"tileConfiguration": {
												"columnChartData":[{
													"columnColor":"",
													"columnLabel":"",
													"columnValue":""
												}],
											"display_icon_url":"",
											"display_info_text":"",
											"display_number_unit":"",
											"display_search_keywords":"",
											"display_subtitle_text":"",
											"display_title_text":"",
											"navigation_semantic_action":"",
											"navigation_semantic_object":"",
											"navigation_semantic_parameters":"",
											"navigation_target_url":"",
											"navigation_use_semantic_object":"",
											"service_refresh_interval":"",
											"service_url":""
					    			}
					},
					oModel = new sap.ui.model.json.JSONModel(columnData);
					return oModel;
				},
			getBulletModel: function() {
				var bulletData = {
				    				"tileConfiguration": {
											"actualValue":"",
											"display_icon_url":"",
											"display_info_text":"",
											"display_number_unit":"",
											"display_search_keywords":"",
											"display_subtitle_text":"",
											"display_title_text":"",
											"forecastValue":"",
											"maxValue":"",
											"minValue":"",
											"navigation_semantic_action":"",
											"navigation_semantic_object":"",
											"navigation_semantic_parameters":"",
											"navigation_target_url":"",
											"navigation_use_semantic_object":"",
											"scale":"",
											"scalingFactor":"",
											"service_refresh_interval":"",
											"service_url":"",
											"targetValue":"",
											"thresholdHighValue":"",
											"thresholdLowValue":""
				    				}
								},
				oModel = new sap.ui.model.json.JSONModel(bulletData);
				return oModel;
			},
			getComarisonModel: function() {
				var comparisonData = {
				    				"tileConfiguration": {
											"display_icon_url":"",
											"display_info_text":"",
											"display_number_unit":"",
											"display_search_keywords":"",
											"display_subtitle_text":"",
											"display_title_text":"",
											"firstColor":"",
											"firstTitle":"",
											"firstValue":"",
											"navigation_semantic_action":"",
											"navigation_semantic_object":"",
											"navigation_semantic_parameters":"",
											"navigation_target_url":"",
											"navigation_use_semantic_object":"",
											"scale":"",
											"scalingFactor":"",
											"secondColor":"",
											"secondTitle":"",
											"secondValue":"",
											"service_refresh_interval":"",
											"service_url":"",
											"thirdColor":"",
											"thirdTitle":"",
											"thirdValue":""
				    				}
								},
				oModel = new sap.ui.model.json.JSONModel(comparisonData);
				return oModel;
			},
			getHarveyModel: function() {
				var harveyData = {
				    				"tileConfiguration": {
											"display_icon_url":"",
											"display_info_text":"",
											"display_number_unit":"",
											"display_search_keywords":"",
											"display_subtitle_text":"",
											"display_title_text":"",
											"fraction":"",
											"fractionScale":"",
											"navigation_semantic_action":"",
											"navigation_semantic_object":"",
											"navigation_semantic_parameters":"",
											"navigation_target_url":"",
											"navigation_use_semantic_object":"",
											"scalingFactor":"",
											"service_refresh_interval":"",
											"service_url":"",
											"total":"",
											"totalScale":""
				    				}
								},
				oModel = new sap.ui.model.json.JSONModel(harveyData);
				return oModel;
			}
			
		});

	}
);