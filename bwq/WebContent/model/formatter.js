sap.ui.define([
	], function () {
		"use strict";

		return {
			/**
			 * Rounds the currency value to 2 digits
			 *
			 * @public
			 * @param {string} sValue value to be formatted
			 * @returns {string} formatted currency value with 2 digits
			 */
			currencyValue : function (sValue) {
				if (!sValue) {
					return "";
				}

				return parseFloat(sValue).toFixed(2);
			},
			handleicontabbarvisible:function(sValue){
				if(sValue==="Target Mapping"){
					return false;
				}else{
					return true;
				}
			},
			handletiletargetradiobutton:function(sValue){
				if(sValue==="Tile"){
					return "0";
				}else{
					return "1";
				}
			},
			handleicontabbarvisiblefrtitle:function(sValue){
				if(sValue==="Tile"){
					return false;
				}else{
					return true;
				}
			},
			handlemasterstatus:function(sValue){
				
			if(sValue && sValue==="X-SAP-UI2-CHIP:/UI2/ACTION"){
				return "Target Mapping";
			}else{
					return "Tile";
			}
			},
			labaleDisplay: function(lbl,status) {
				if(status === "Target Mapping") {
					return lbl;
				} else {
					return "";
				}
			},
			handlemastertitle:function(title,title_text){
				if(title===""){
					return title_text;
				}else{
					return title;
				}
			},
			handletiletemplate:function(sValue){
				if(sValue==="Target Mapping"){
					return false;
				}else{
					return true;
				}
			},
			handleSemObj: function(sem1,sem2) {
				if(sem1) {
					return sem1;
				}
				else {
					return sem2;
				}
			},
			handleSemAct: function(sem1,sem2) {
				if(sem1) {
					return sem1;
				}
				else {
					return sem2;
				}
			},
			enableSwitch : function(val){
				if (val === false) {
					return false;
				}else{
					return true;
				}
			},
			queryConvert: function(query1) {
				if(query1) {
					return query1.replace(/"/g,'');
				}
			},
			measureInDim: function(measurDim) {
				if(measurDim) {
					return measurDim.replace(/"/g,'');
				}
			},
			defaultVizTypes: function(str, val) {
				if(str.indexOf(val) > 0) {
					return true;
				}
			},
			dimensionState: function(state,dimension) {
				if(state && dimension) {
					var states = state.split("Hide_Dimensions")[1]?
																state.split("Hide_Dimensions")[1].split("&")[0].replace(/[.=*+?^${}()|[\]\\]/g, ""):
																state.split("Hide_Dimensions")[1],
						M = dimension.replace(/[.*+?^${}()|[\]\\]/g, ""),
						rtn = true,
						val = "";
					if(states && states !== "undefined") {
						states = states.split("%2C");
						for(var i=0;i<states.length;i++) {
							val = decodeURIComponent(states[i]).replace(/[.=*"+?^${}()|[\]\\]/g, ""); 
							if(val === M) {
								rtn = false;
							}
						}
					}
					return rtn;
				}
				else {
					return  true;
				}
			},
			dimensionDefault: function(defaultState,dimension) {
				if(defaultState && dimension) {
					var M = dimension.replace(/[.*+?^${}()|[\]\\]/g, ""),
						states = defaultState.split("[Dimensions=")[1]?
																	defaultState.split("[Dimensions=")[1].split("&")[0].split("%22"):
																	defaultState.split("[Dimensions=")[1],
						rtn = false,
						val = "";
						if(states && states !== "undefined") {
							for(var i=0;i<states.length;i++) {
								val = states[i].replace("%5B","").replace("%5D","");
								if(val === M) {
									rtn = true;
								}
							}
						}
						return rtn;
				}
				else {
					return  false;
				}
			},
			measuresState: function(state,measure) {
				if(state && measure) {
					var states = state.split("Hide_Measures")[1]?
																state.split("Hide_Measures")[1].split("&")[0].split("%22"):
																state.split("Hide_Measures")[1],
						M = measure.replace(/[.*+?^${}()|[\]\\]/g, "").split("Measures")[1],
						rtn = true,
						val = "";
					if(states && states !== "undefined") {
						for(var i=0;i<states.length;i++) {
							states[i] = decodeURIComponent(states[i]);
							val = states[i].split(".")[1]?states[i].split(".")[1].replace(/[.*+?^${}()|[\]\\]/g, ""):"";
							if(val === M) {
								rtn = false;
							}
						}
					}
					return rtn;
				}
				else {
					return  true;
				}
			},
			measuresDefault: function(defaultState,measure) {
				if(defaultState && measure) {
					var M = measure.replace(/[.*+?^${}()|[\]\\]/g, "").split("Measures")[1],
						states = defaultState.split("[Measures=")[1]?
																	defaultState.split("[Measures=")[1].split("&")[0].split("%22"):
																	defaultState.split("[Measures=")[1],
						rtn = false,
						val = "";
						if(states && states !== "undefined") {
							for(var i=0;i<states.length;i++) {
								states[i] = decodeURIComponent(states[i]);
								val = states[i].split(".")[1]?states[i].split(".")[1].replace(/[.*+?^${}()|[\]\\]/g, ""):"";
								if(val === M) {
									rtn = true;
								}
							}
						}
						return rtn;
				}
				else {
					return  false;
				}
			},
			filterState: function(state,filter) {
				if(state && filter) {
					var states = state.split("Hide_Filters")[1]?
																state.split("Hide_Filters")[1].split("&")[0].replace(/[.=*+?^${}()|[\]\\]/g, ""):
																state.split("Hide_Filters")[1],
						M = filter.replace(/[.*+?^${}()|[\]\\]/g, ""),
						rtn = true,
						val = "";
					if(states && states !== "undefined") {
						states = states.split("%2C");
						for(var i=0;i<states.length;i++) {
							val = decodeURIComponent(states[i]).replace(/[.=*"+?^${}()|[\]\\]/g, "");
							if(val === M) {
								rtn = false;
							}
						}
					}
					return rtn;
				}
				else {
					return  true;
				}
			},
			filtersDefault: function(defaultState,dimension) {
				if(defaultState && dimension) {
					var M = dimension.replace(/[.*+?^${}()|[\]\\]/g, ""),
						states = defaultState.split("Variables=")[1]?
																	defaultState.split("Variables=")[1].split("&")[0].replace(/[.*+?^${}()|[\]\\]/g, ""):
																	defaultState.split("Variables=")[1],
						rtn = false,
						val = "";
						if(states && states !== "undefined") {
							states = states.split("%2C");
							for(var i=0;i<states.length;i++) {
								val = decodeURIComponent(states[i]).replace(/[.=*"+?^${}()|[\]\\]/g, "");
								if(val === M) {
									rtn = true;
								}
							}
						}
						return rtn;
				}
				else {
					return  false;
				}
			},
			filterLock: function(defaultEnable,state,lock) {
				if(state && lock) {
					var states = state.split("Lock_Filters")[1]?
																state.split("Lock_Filters")[1].split("&")[0].replace(/[.=*+?^${}()|[\]\\]/g, ""):
																state.split("Lock_Filters")[1],
						M = lock.replace(/[.*+?^${}()|[\]\\]/g, ""),
						rtn = false,
						val = "";
					if(states && states !== "undefined") {
						states = states.split("%2C");
						for(var i=0;i<states.length;i++) {
							val = decodeURIComponent(states[i]).replace(/[.=*"+?^${}()|[\]\\]/g, "");
							if(val === M && defaultEnable) {
								rtn = true;
							}
						}
					}
					return rtn;
				}
				else {
					return  false;
				}
			},
			EnableExportTo: function(expTo) {
				if(expTo) {
					if(expTo === "true" || expTo === '"true"' || expTo === true) {
						return true;
					}
					else if(expTo === "false" || expTo === '"false"' || expTo === false) {
						return false;
					}
				}
			},
			ShowYAxisLabel: function(yAxis) {
				if(yAxis) {
					if(yAxis === "true" || yAxis === '"true"' || yAxis === true) {
						return true;
					}
					else if(yAxis === "false" || yAxis === '"false"' || yAxis === false) {
						return false;
					}
				}
			},
			punchUrl: function(url) {
				return url.replace(/"/g,'');
			},
			useTchQuery: function(query) {
				if(query) {
					if(query === "true" || query === '"true"' || query === true) {
						return true;
					}
					else if(query === "false" || query === '"false"' || query === false) {
						return false;
					}
				}
			},
			optinViz: function(viz) {
				if(viz) {
					return viz.replace(/"/g,'');
				}
			}
		};
	}
);