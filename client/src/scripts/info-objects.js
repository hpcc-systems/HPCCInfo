function Plugin(id, label, category) {
	this.id = id;
	this.label = label;
	this.category = category;
}

function hostReachable(eclIP, hpccuser, password) {
	var promise = new Promise(function (resolve, reject) {
		$.ajax({
			url: "/clusterDetails/checkConnection",
			contentType: "application/json",
			type: 'POST',
			data: JSON.stringify({ "password": btoa(hpccuser + ":" + password), "url": eclIP }),
			success: function (data) {
				resolve(data);
			},
			error: function (request, status, error) {
				reject(error);
			}
		});
	});
	return promise;
}

// function workunitStatus(url, queryparam, hpccuser, password) {
// 	var promise = new Promise(function (resolve, reject) {
// 		$.ajax({
// 			url: url + "/WsWorkunits/WUInfo.json?" + queryparam,
// 			headers: { 'Access-Control-Allow-Origin': '*' },
// 			dataType: "JSONP",
// 			jsonp: 'jsonp',
// 			type: 'GET',
// 			headers: {
// 				"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 			},
// 			success: function (data) {

// 				var wuState = data.WUInfoResponse.Workunit.State;

// 				if (wuState === "submitted" || wuState === 'compiling' || wuState === 'running' || wuState === 'compiled' || wuState === 'blocked') {
// 					workunitStatus(url, queryparam, hpccuser, password).then(function (data) {
// 						resolve(data);
// 					})
// 				} else if (wuState === 'completed') {
// 					resolve(data.WUInfoResponse.Workunit.Wuid);
// 					// return;
// 				} else {
// 					//var currentPage = document.querySelector("#pages").selectedItem;
// 					var currentPage = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('#infobox').shadowRoot.querySelector('#pages').selectedItem;
// 					var grid = currentPage.shadowRoot.querySelector(".projectworksheet");
// 					if (grid !== null) {
// 						var cols = grid.columns;
// 						for (; cols.length > 0;) {
// 							console.log(cols[0].name);
// 							grid.removeColumn(cols[0].name);
// 						}


// 						currentPage.loading = false;
// 						grid.items = [];
// 						grid.addColumn({ name: "<b>Something went wrong while fetching the data, Please try again or check you filter query again!</b>" });
// 					}
// 					reject('Something went wrong while fetching the data, Please try again or check you filter query again!');
// 				}

// 			}
// 		});
// 	});
// 	return promise;
// }

// function getFileListForSearch(url, pattern, hpccuser, password, nodegroup, contentType) {
// 	return $.ajax({
// 		//url : "http://10.240.33.54:8010/WsDfu/DFUQuery.json", 
// 		url: url + "/WsDfu/DFUQuery.json?LogicalName=" + pattern + '*' + '&ContentType=' + contentType,
// 		headers: { 'Access-Control-Allow-Origin': '*' },
// 		dataType: "JSONP",
// 		jsonp: 'jsonp',
// 		type: 'GET',
// 		async: 'false',
// 		error: function (data) { alert(''); },
// 		headers: {
// 			"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 		}
// 	});


// }

// function getThorList(url, hpccuser, password) {
// 	return $.ajax({
// 		//url : "http://10.240.33.54:8010/WsDfu/DFUQuery.json", 
// 		url: url + "/WsTopology/TpListTargetClusters.json",
// 		headers: { 'Access-Control-Allow-Origin': '*' },
// 		dataType: "JSONP",
// 		jsonp: 'jsonp',
// 		type: 'GET',
// 		async: 'false',
// 		headers: {
// 			"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 		}
// 	});
// }

function loadGridwithEcl(QueryStr, recLimit, extenderQueryStr = "") {
	var infoBox = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('#infobox');
	var currentPage = infoBox.shadowRoot.querySelector('#pages').selectedItem;

	//Set paper-progress when the grid is being loaded
	currentPage.loading = true;

	var eclIP = (infoBox.isHpccSecured === "true" ? "https://" : "http://") +
		// (infoBox.properties.username != '' ? infoBox.properties.username + ':' + infoBox.properties.password + '@' : '') +
		infoBox.cluster_address +
		":" + infoBox.port;

	var getFileData = new Promise(function (resolve, reject) {
		infoBox.callAjaxForECL(eclIP, QueryStr, infoBox.username, infoBox.password, recLimit).then(function (resData) {
			resolve(resData);
		});
	});

	getFileData.then(function (ajaxResp) {

		var currentPage = infoBox.shadowRoot.querySelector('#pages').selectedItem;
		var grid;
		if (currentPage.shadowRoot.querySelector(".projectworksheet") != null) {
			grid = currentPage.shadowRoot.querySelector(".projectworksheet");
			grid.innerHTML = "";
			if (ajaxResp.Result.Row.length == 0) {
				var headerTemplate = document.createElement('template');
				headerTemplate.classList.add('header');
				headerTemplate.innerHTML = "<b>There are no records for your Filter Query</b>";
				var bodyTemplate = document.createElement('template');
				bodyTemplate.innerHTML = "<b>There are no records for your Filter Query</b>";
				var column = document.createElement('vaadin-grid-column');
				column.appendChild(headerTemplate);
				column.appendChild(bodyTemplate);
				grid.appendChild(column);
				grid.items = ajaxResp.Result.Row;
				currentPage.loading = false;
				return;
			}
			var obj = ajaxResp.Result.Row[0];
			var resobj = ajaxResp.Result.Row[0];
			var cnt = 0;
			var colArray = [];
			var fieldnames = "";
			var xfieldnames = "";
			var yfieldnames = "";

			Object.keys(obj).forEach(function (key) {
				//grid.addColumn({ name: key, resizable: true });
				if (fieldnames === "") {
					fieldnames += key;
				} else {
					fieldnames += "," + key;
				}
				colArray[cnt] = key;
				cnt++;
			});
			for (var i = 0; i < cnt; i++) {
				var headername = colArray[i];
				headername = headername != null ? headername : "";
				headername = headername.replace("_", " ");
				var headerTemplate = document.createElement('template');
				headerTemplate.classList.add('header');
				headerTemplate.innerHTML = headername;

				var body = "[[item." + colArray[i] + "]]";
				var bodyTemplate = document.createElement('template');
				bodyTemplate.innerHTML = body;
				var column = document.createElement('vaadin-grid-column');
				column.appendChild(headerTemplate);
				column.appendChild(bodyTemplate);
				grid.appendChild(column);
				var validatedfields = colArray[i];

				if (isNaN(resobj[validatedfields])) {
					if (xfieldnames === "") {
						xfieldnames += validatedfields;
					} else {
						xfieldnames += "," + validatedfields;
					}
				}
				else {
					if (yfieldnames === "") {
						yfieldnames += validatedfields;
					} else {
						yfieldnames += "," + validatedfields;
					}
				}
			}
			grid.items = ajaxResp.Result.Row;

			currentPage.editor.displayFields = fieldnames;
			currentPage.editor.xdisplayFields = xfieldnames;
			currentPage.editor.ydisplayFields = yfieldnames;
			sessionStorage.setItem('gridColumns', colArray);
			// Add some example data as an array.
			currentPage.loading = false;
		}
		else {
			currentPage.loading = false;
			var ChildChartIds = sessionStorage.getItem('ChildChartIds');
			var ChildChartId = [];
			if (ChildChartIds != "" && ChildChartIds != null)
				ChildChartId = ChildChartIds.split(',');
			if (ChildChartId.length > 0) {
				for (var i = 0; i < ChildChartId.length; i++) {
					sessionStorage.setItem('ChartId', ChildChartId[i]);
					for (var j = 0; j < currentPage.editor.interactionDetails.length; j++) {
						interaction = currentPage.editor.interactionDetails[j];
						if (interaction.ChildChartId == ChildChartId[i]) {
							currentPage.chartTitle = interaction.ChildChartTitle.replace(/ *\([^)]*\) */g, "") + " (Filtered by " + interaction.InteractionFieldvalue.replace(/%20/g, " ") + ")";;
							currentPage.selectedchartyype = interaction.ChildChartType;
							currentPage.selectedxcoordinate = interaction.childchartxcoordinate;
							currentPage.selectedycoordinate = interaction.childchartycoordinate;
							initchart(ajaxResp.Result.Row, currentPage.chartTitle, currentPage.selectedchartyype, currentPage.selectedxcoordinate, currentPage.selectedycoordinate, ChildChartId[i]);
							break;
						}
					}
				}
				sessionStorage.setItem('ChildChartIds', "");
			}
			else {
				//var ChartId = sessionStorage.getItem('ChartId');
				initchart(ajaxResp.Result.Row, currentPage.chartTitle, currentPage.selectedchartyype, currentPage.selectedxcoordinate, currentPage.selectedycoordinate, "");
			}
		}
	});
	return;
}

// function callAjaxForECL(url, eclCode, hpccuser, password, recLimit) {
// 	var wuid = '';
// 	//var infoBox = document.querySelector('#infobox')
// 	var infoBox = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('#infobox');
// 	var clusterid = infoBox.clusterid === '' || infoBox.clusterid === undefined || infoBox.clusterid === 'undefined' ? 'hthor' : infoBox.clusterid;
// 	var promise = new Promise(
// 		function (resolve, reject) {

// 			$.ajax({
// 				url: url + "/WsWorkunits/WUCreateAndUpdate.json",
// 				data: { "QueryText": eclCode.replace(/\n/g, ''), "ResultLimit": recLimit, "Jobname": "HPCCInfoRequest" },
// 				headers: { 'Access-Control-Allow-Origin': '*' },
// 				dataType: "JSONP",
// 				jsonp: 'jsonp',
// 				type: "POST",
// 				crossDomain: true,
// 				headers: {
// 					"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 				},
// 				success: function (data) {
// 					wuid = data.WUUpdateResponse.Workunit.Wuid;
// 					$.ajax({
// 						url: url + "/WsWorkunits/WUSubmit.json?Wuid=" + data.WUUpdateResponse.Workunit.Wuid + '&Cluster=' + clusterid,
// 						headers: { 'Access-Control-Allow-Origin': '*' },
// 						dataType: "JSONP",
// 						jsonp: 'jsonp',
// 						type: 'GET',
// 						headers: {
// 							"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 						},
// 						success: function (data) {
// 							var wustatus = new Promise(function (res, rej) {
// 								workunitStatus(url, "Wuid=" + wuid + "&Cluster=" + clusterid, hpccuser, password).then(function (data) {
// 									res(data);
// 								})
// 							});

// 							wustatus.then(function (result) {
// 								$.ajax({
// 									url: url + "/WsWorkunits/WUResult.json?Wuid=" + result + '&Cluster=' + clusterid + '&Count=' + recLimit,
// 									headers: { 'Access-Control-Allow-Origin': '*' },
// 									dataType: "JSONP",
// 									jsonp: 'jsonp',
// 									type: 'GET',
// 									headers: {
// 										"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 									},
// 									success: function (data) {

// 										if (data.WUResultResponse.Name === "SUPERFILECONTENTS") {
// 											var newData = callForFileDetails(url, data.WUResultResponse.Result.Row[0].super, data.WUResultResponse.Result.Row[0].name, hpccuser, password);
// 											newData.then(
// 												function (val) {
// 													resolve(val);
// 												}
// 											);
// 										} else {
// 											resolve(data.WUResultResponse);
// 										}

// 									}
// 								});
// 							});
// 						}
// 					});
// 				}
// 			});
// 		}
// 	);

// 	return promise;
// }
// function callForFileDetails(url, filename, subfilename, hpccuser, password, recLimit) {
// 	//var infoBox = document.querySelector('#infobox');
// 	var infoBox = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('#infobox');
// 	var promise = new Promise(function (resolve, reject) {
// 		var wuid = '';
// 		$.ajax({
// 			url: url + "/WsDfu/DFUInfo.json?Name=" + (subfilename.startsWith('~') === false ? '~' : '') + subfilename,
// 			headers: { 'Access-Control-Allow-Origin': '*' },
// 			dataType: "JSONP",
// 			jsonp: 'jsonp',
// 			type: 'GET',
// 			headers: {
// 				"Authorization": "Basic " + btoa(hpccuser + ":" + password)
// 			},
// 			success: function (data) {
// 				console.log(data.DFUInfoResponse);

// 				//var currentPage = document.querySelector("#pages").selectedItem;
// 				var currentPage = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('#infobox').shadowRoot.querySelector('#pages').selectedItem;
// 				outputdsname = 'inputds' + '_' + Math.random().toString(36).substr(2, 4);

// 				if (data.DFUInfoResponse.FileDetail.isSuperfile) {
// 					var QueryStr = "IMPORT STD;NOTHOR(OUTPUT(DATASET([{NOTHOR(std.file.SUPERFILECONTENTS('~" + filename + "', TRUE)[1].NAME), '~" + filename + "'}], {STRING NAME, STRING SUPER}), NAMED('SUPERFILECONTENTS')));";

// 					// OUTPUT(STD.FILE.SUPERFILECONTENTS('~" + filename + "', TRUE)[1], NAMED('SUPERFILECONTENTS'));"
// 				} else {
// 					var QueryStr1 = "#OPTION(\'OUTPUTLIMIT\',2000);\nrecLayout := " + data.DFUInfoResponse.FileDetail.Ecl + "\n" +
// 						outputdsname + " := DATASET(\'" + (filename.startsWith('~') ? '' : '~') + filename + "\'," + "recLayout, THOR);\n";

// 					var recLayout = data.DFUInfoResponse.FileDetail.Ecl.replace("RECORD", "");

// 					str = recLayout.replace("[{}]", "").replace(",", ";").trim();

// 					// HashMap<String, String> fielddts = new HashMap<String, String>();
// 					var fields = str.split(";");

// 					var fielddts = new Map();

// 					var recordStartEnd = ["RECORD", "END"];

// 					for (var cnt = 0; cnt < fields.length; cnt++) {
// 						var singlePart = fields[cnt].trim();
// 						if (!recordStartEnd.includes(singlePart.trim())) {
// 							var twoParts = (singlePart.endsWith(";") ? singlePart.substring(0, singlePart.length() - 1) : singlePart).trim().split(" ");
// 							fielddts.set(twoParts[1], twoParts[0]);
// 						}
// 					}

// 					infoBox.fieldDtls = fielddts;

// 					var strFields = ["STRING", "UNICODE"];

// 					console.log("Field====>Type ======> IsStringType\n===============================================\n\n");

// 					// for(Map.Entry<String, String> maps : fielddts.entrySet()){
// 					// 	System.out.println(maps.getKey() + "===>" + maps.getValue() + "==>" + 
// 					// 			strtypes.includes(maps.getValue().toUpperCase().replace("[^a-zA-Z]", "")));
// 					// }


// 					for (var i in fielddts) {
// 						console.log('Key is: ' + i + '. Value is: ' + fielddts[i]);
// 					}
// 					var QueryStr = QueryStr1 + "Output(" + outputdsname + ");";
// 				}
// 				console.log(QueryStr);
// 				var callAjaxPromise = new Promise(function (rs, rj) {
// 					callAjaxForECL(url, QueryStr, hpccuser, password, recLimit).then(function (data) {
// 						rs(data);
// 					})
// 				});

// 				callAjaxPromise.then(function (data) {
// 					data.outputdsname = outputdsname;
// 					data.querystr = QueryStr1 != undefined ? QueryStr1 : data.querystr;
// 					resolve(data);
// 				});

// 			}
// 		});
// 	});
// 	return promise;
// }
var chartData = [];
function initchart(griditems, chartTitle, charttype, xcoordinate, ycoordinate, Id) {
	var charttype = charttype;
	var xcoordinatefield = xcoordinate;
	var ycoordinatefield = ycoordinate;
	var infoBox = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('#infobox');
	var currentPage = infoBox.shadowRoot.querySelector('#pages').selectedItem;
	//var salesdata = [];
	legendarray = [];
	var yAxisarray = [];
	var myArray = griditems;
	var subtotal;
	var groups = {};
	for (var i = 0; i < griditems.length; i++) {
		var rows = griditems[i];
		var groupName = rows[xcoordinatefield];
		if (!groups[groupName]) {
			groups[groupName] = [];
		}
		groups[groupName].push(rows[ycoordinatefield]);

	}
	myArray = [];

	for (var groupName in groups) {
		var yaxisdata = groups[groupName];
		var yaxistotal = 0;
		for (var j = 0; j < yaxisdata.length; j++) {
			yaxistotal = +yaxistotal + +yaxisdata[j];
		}
		myArray.push({ "name": groupName, "value": yaxistotal });
		legendarray.push(groupName);
	}
	var graphId = sessionStorage.getItem("ChartId");
	if (graphId == "") {
		var divChart = document.createElement("div");
		var randomNumber;
		if (Id == "")
			randomNumber = Math.random().toString(36).substr(2, 9);
		else
			randomNumber = Id.replace('Chart', '');
		var divId = 'divChart' + randomNumber;
		divChart.id = divId;
		divChart.classList.add('divChart');
		Polymer.dom(currentPage.shadowRoot.querySelector('#divDashboard')).appendChild(divChart);

		var divColumn = document.createElement("div");
		var divColumnId = 'divColumn' + randomNumber;
		divColumn.id = divColumnId;
		divColumn.classList.add('divColumn');
		divColumn.style = "height:400px;";

		Polymer.dom(currentPage.shadowRoot.querySelector('#' + divId)).appendChild(divColumn);

		var chartDiv = document.createElement("div");
		var chartId = 'Chart' + randomNumber;
		chartDiv.id = chartId;
		chartDiv.classList.add('chartDiv');
		chartDiv.style = "width:850px;height:400px;float:left;";
		if ($(window).width() < 1600) { chartDiv.style = "width:650px;height:400px;float:left;" };
		if ($(window).width() < 1400) { chartDiv.style = "width:555px;height:400px;float:left;" };
		if ($(window).width() < 1200) { chartDiv.style = "width:460px;height:400px;float:left;" };
		if ($(window).width() < 1024) { chartDiv.style = "width:830px;height:400px;float:left;" };
		if ($(window).width() < 992) { chartDiv.style = "width:690px;height:400px;float:left;" };
		if ($(window).width() < 768) { chartDiv.style = "width:550px;height:400px;float:left;" };
		if ($(window).width() < 640) { chartDiv.style = "width:380px;height:400px;float:left;" };
		Polymer.dom(currentPage.shadowRoot.querySelector('#' + divId).querySelector('#' + divColumnId)).appendChild(chartDiv);

		var editButton = document.createElement("paper-icon-button");
		editButton.classList.add('chartEdit');
		editButton.id = "edit" + randomNumber;
		editButton.icon = "create"
		editButton.addEventListener('tap', (e) => currentPage.editChart(e));
		Polymer.dom(currentPage.shadowRoot.querySelector("#" + divId).querySelector('#' + divColumnId)).appendChild(editButton);

		var deleteButton = document.createElement("paper-icon-button");
		deleteButton.classList.add('chartEdit');
		deleteButton.id = "delete" + randomNumber;
		deleteButton.icon = "delete"
		deleteButton.addEventListener('tap', (e) => currentPage.deleteChart(e));
		Polymer.dom(currentPage.shadowRoot.querySelector("#" + divId).querySelector('#' + divColumnId)).appendChild(deleteButton);
		if (Id == "")
			currentPage.editor.chartDetails.push({ "ChartId": chartId, "ChartType": charttype, "xcoordinate": xcoordinate, "ycoordinate": ycoordinate, "chartTitle": chartTitle });
		this.myChart = echarts.init(currentPage.shadowRoot.querySelector("#" + divId).querySelector('#' + divColumnId).querySelector("#" + chartId));
	}
	else {
		if (Id == "") {
			var divId = 'divChart' + graphId.replace('Chart', '');
			var divColumnId = 'divColumn' + graphId.replace('Chart', '');
			for (var i = 0; i < currentPage.editor.chartDetails.length; i++) {
				var chart = currentPage.editor.chartDetails[i];
				if (chart.ChartId == graphId) {
					chart.chartTitle = chartTitle;
					chart.ChartType = charttype;
					chart.xcoordinate = xcoordinate;
					chart.ycoordinate = ycoordinate;
					break;
				}
			}
		}
		else {
			var divId = 'divChart' + graphId.replace('Chart', '');;
			var divColumnId = 'divColumn' + graphId.replace('Chart', '');;
			if (currentPage.shadowRoot.querySelector("#" + divId) == null) {
				var divChart = document.createElement("div");
				divChart.id = divId;
				divChart.classList.add('divChart');
				Polymer.dom(currentPage.shadowRoot.querySelector('#divDashboard')).appendChild(divChart);

				var divColumn = document.createElement("div");

				divColumn.id = divColumnId;
				divColumn.classList.add('divColumn');
				divColumn.style = "height:400px;";

				Polymer.dom(currentPage.shadowRoot.querySelector('#' + divId)).appendChild(divColumn);
			}



			var chartDiv = document.createElement("div");
			var divId = 'divChart' + graphId.replace('Chart', '');

			if (currentPage.shadowRoot.querySelector("#" + graphId) != null)
				currentPage.shadowRoot.querySelector('#' + divId).querySelector("#" + divColumnId).removeChild(currentPage.shadowRoot.querySelector("#" + graphId));
			if (currentPage.shadowRoot.querySelector("#edit" + graphId.replace('Chart', '')) != null)
				currentPage.shadowRoot.querySelector('#' + divId).querySelector("#" + divColumnId).removeChild(currentPage.shadowRoot.querySelector("#edit" + graphId.replace('Chart', '')));
			if (currentPage.shadowRoot.querySelector("#delete" + graphId.replace('Chart', '')) != null)
				currentPage.shadowRoot.querySelector('#' + divId).querySelector("#" + divColumnId).removeChild(currentPage.shadowRoot.querySelector("#delete" + graphId.replace('Chart', '')));

			chartDiv.id = graphId;
			chartDiv.classList.add('chartDiv');
			chartDiv.style = "width:850px;height:400px;float:left;";
			if ($(window).width() < 1600) { chartDiv.style = "width:650px;height:400px;float:left;" };
			if ($(window).width() < 1400) { chartDiv.style = "width:555px;height:400px;float:left;" };
			if ($(window).width() < 1200) { chartDiv.style = "width:460px;height:400px;float:left;" };
			if ($(window).width() < 1024) { chartDiv.style = "width:830px;height:400px;float:left;" };
			if ($(window).width() < 992) { chartDiv.style = "width:690px;height:400px;float:left;" };
			if ($(window).width() < 768) { chartDiv.style = "width:550px;height:400px;float:left;" };
			if ($(window).width() < 640) { chartDiv.style = "width:380px;height:400px;float:left;" };
			Polymer.dom(currentPage.shadowRoot.querySelector('#' + divId).querySelector('#' + divColumnId)).appendChild(chartDiv);

			var editButton = document.createElement("paper-icon-button");
			editButton.classList.add('chartEdit');
			editButton.id = "edit" + graphId.replace('Chart', '');
			editButton.icon = "create"
			editButton.addEventListener('tap', (e) => currentPage.editChart(e));
			Polymer.dom(currentPage.shadowRoot.querySelector("#" + divId).querySelector('#' + divColumnId)).appendChild(editButton);

			var deleteButton = document.createElement("paper-icon-button");
			deleteButton.classList.add('chartEdit');
			deleteButton.id = "delete" + graphId.replace('Chart', '');
			deleteButton.icon = "delete"
			deleteButton.addEventListener('tap', (e) => currentPage.deleteChart(e));
			Polymer.dom(currentPage.shadowRoot.querySelector("#" + divId).querySelector('#' + divColumnId)).appendChild(deleteButton);

		}

		this.myChart = echarts.init(currentPage.shadowRoot.querySelector("#" + divId).querySelector('#' + divColumnId).querySelector("#" + graphId));
	}



	//For echarts styling   http://echarts.baidu.com/echarts2/doc/example/bar.html
	// specify chart configuration item and data
	if (charttype == 'pie') {
		// option for pie chart
		var option = {
			title: {
				text: chartTitle,
				subtext: xcoordinatefield + " - " + ycoordinatefield + " Chart",
				x: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c} ({d}%)"
			},
			legend: {
				orient: 'vertical',
				x: 'left',
				data: legendarray
			},
			xAxis: { show: false },
			yAxis: { show: false },
			toolbox: {
				show: true,
				feature: {
					magicType: {
						show: false
					},
					restore: {
						show: false,
						title: 'Restore'
					},
					saveAsImage: {
						show: true,
						title: 'Save'
					}
				}
			},
			calculable: true,
			series: [
				{
					name: 'Sales',
					itemStyle: {
						emphasis: {
							barBorderColor: 'red',
							color: 'green'
						}
					},
					type: charttype,
					radius: '55%',
					center: ['50%', '60%'],
					data: myArray
				}
			]
		};
	}
	else if (charttype == 'bar' || charttype == 'line') {
		// option for bar chart
		var option = {
			title: {
				text: chartTitle,
				subtext: xcoordinatefield + " - " + ycoordinatefield + " Chart",
				x: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: "{a} <br/>{b} : {c}"
			},
			legend: {
				orient: 'vertical',
				x: 'left',
				data: ['Sales']
			},
			xAxis: {
				show: true,
				type: 'category',
				axisTick: {
					show: true,
					interval: 0
					//alignWithLabel: true
				},
				axisLabel: {
					show: true,
					interval: 0
				},
				data: legendarray
			},
			yAxis: {
				show: true,
				type: 'value'
			},
			toolbox: {
				show: true,
				feature: {
					magicType: {
						show: true,
						type: ['line', 'bar'],
						title: {
							line: 'line',
							bar: 'bar'
						}
					},
					restore: {
						show: true,
						title: 'Restore'
					},
					saveAsImage: {
						show: true,
						title: 'Save'
					}
				}
			},
			calculable: true,
			series: [{
				name: 'Sales',
				itemStyle: {
					normal: {
						barBorderColor: 'tomato',
						color: 'gray'
					},
					emphasis: {
						barBorderColor: 'red',
						color: 'brown'
					}
				},
				type: charttype,
				data: myArray
			}]
		};
	}
	// use configuration item and data specified to show chart
	this.myChart.setOption(option);

	this.myChart.on('click', function (params) {
		var childCharts = "";
		var interaction = "";
		var interactionstatus = false;
		var parentChartId = event.currentTarget.offsetParent.id;
		var parentchartfieldvalue = encodeURIComponent(params.name);
		var parentChartInteraction=""
		if (currentPage.editor.interactionDetails != null && currentPage.editor.interactionDetails.length > 0) {
			for (var i = 0; i < currentPage.editor.interactionDetails.length; i++) {
				interaction = currentPage.editor.interactionDetails[i];
				if (interaction.ParentChartId == parentChartId) {
					parentChartInteraction=interaction;
					interactionstatus = true;
					interaction.InteractionFieldvalue = parentchartfieldvalue;
					childCharts = childCharts + interaction.ChildChartId;
					if (i != currentPage.editor.interactionDetails.length - 1)
						childCharts += ",";
				}
			}
			sessionStorage.setItem('ChildChartIds', childCharts);
			if (interactionstatus)
				ApplyInteractions(parentChartInteraction);
		}
	});
}
function ApplyInteractions(interaction) {
	var currentPage = document.querySelector('my-app').shadowRoot.querySelector('hpcc-info-app').shadowRoot.querySelector('info-box').shadowRoot.querySelector("#pages").selectedItem;
	currentPage.outputdsname = 'filterdsName' + '_' + Math.random().toString(36).substr(2, 4);
	currentPage.editor.outputdsname = currentPage.outputdsname;
	var filterformula = interaction.FilteringField + ' = \'' + interaction.InteractionFieldvalue.replace(/%20/g, " ") + '\'';
	var QueryStr1 = currentPage.editor.inputeclcode + "\n" + currentPage.outputdsname + " := " +
		currentPage.editor.inputdsname + "(" +
		filterformula + ")" + " : PERSIST(\'" + currentPage.outputdsname + "_persist\', EXPIRE(1));";
	currentPage.editor.expression = filterformula;
	var QueryStr = QueryStr1 + "\n OUTPUT(" + currentPage.editor.outputdsname + ");";
	currentPage.eclcode = QueryStr1;
	currentPage.editor.eclcode = QueryStr1;
	loadGridwithEcl(QueryStr, 10000);
}