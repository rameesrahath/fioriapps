sap.ui.define([
			"sap/ui/model/json/JSONModel",
			"sap/ui/model/odata/ODataModel"
	], function (JSONModel, oDataModel, Device) {
		"use strict";
		return {
							callService:function(service,entityName,s,e)
										{
											 var oModel = new oDataModel(service);
											 oModel.read(entityName,
													 	 {
										   					urlParameters:false,
															context:false,
															async:true,
															success:function(data)
																	{
																		s(data);
																	},
															error:function(error)
																  {
																		e(error);
																  }
													 	 });
										},
							createService:function(service,entityName,d,s,e)
										  {
											 var oModel = new oDataModel(service);
											 oModel.create(entityName,d,null,
																 	 function(data)
																	 {
																		s(data);
																	 },
																	 function(error)
																	 {
																		e(error);
																	 }
													 	 );
										  },
							updateService:function(service,entityName,d,s,e)
										  {
											 var oModel = new oDataModel(service);
											 oModel.update(entityName,d,null,
																 	 function(data)
																	 {
																		s(data);
																	 },
																	 function(error)
																	 {
																		e(error);
																	 }
													 	 );
										  },
							deleteService:function(service,entityName,s,e)
										   {
												 var oModel = new oDataModel(service);
												 oModel.remove(entityName,
														 	  {
												   					urlParameters:false,
																	context:false,
																	async:true,
																	success:function(data)
																			{
																				s(data);
																			},
																	error:function(error)
																		  {
																				e(error);
																		  }
														 	  });
										   }
				     };
	});