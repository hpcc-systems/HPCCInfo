function Plugin(id, label, category) {
	this.id = id;
	this.label = label;
	this.category = category;
}
/*
	Function for inline editing of 'projecttitle' field.
*/
function editProjectTitleHandler() {
	var myDiv = document.getElementById('projecttitle');
	myDiv.addEventListener('dblclick', function (e) {
		e.stopPropagation();
		var currentElement = myDiv;
		var value = myDiv.innerHTML;
		updateVal(currentElement, value);
	});

	function updateVal(currentElement, value) {
		currentElement.innerHTML = '<input id="thVal" type="text" size="50" value="' + value + '" />';
		var newEle = document.getElementById('thVal');
		newEle.focus();
		newEle.addEventListener('keyup', function (e) {
			if (e.keyCode == 13) {
				currentElement.innerHTML = e.target.value;
			}
		});

		document.onclick = myClickHandler;
		function myClickHandler() {
			if (document.getElementById('thVal') != null) {
				var newEle = document.getElementById('thVal').value;
				currentElement.innerHTML = newEle;
				var infoBox = document.querySelector('#infobox');
				infoBox.properties.title = newEle;
			}
		}
	}
}

function workunitStatus(url, queryparam, hpccuser, password) {
	var promise = new Promise(function (resolve, reject) {
		$.ajax({
			url: url + "/WsWorkunits/WUInfo.json?" + queryparam,
			headers: { 'Access-Control-Allow-Origin': '*' },
			dataType: "JSONP",
			jsonp: 'jsonp',
			type: 'GET',
			headers: {
				"Authorization": "Basic " + btoa(hpccuser + ":" + password)
			},
			success: function (data) {

				var wuState = data.WUInfoResponse.Workunit.State;

				if (wuState === "submitted" || wuState === 'compiling' || wuState === 'running' || wuState === 'compiled' || wuState === 'blocked') {
					workunitStatus(url, queryparam, hpccuser, password).then(function (data) {
						resolve(data);
					})
				} else if (wuState === 'completed') {
					resolve(data.WUInfoResponse.Workunit.Wuid);
					// return;
				} else {
					var currentPage = document.querySelector("#pages").selectedItem;
					var grid = currentPage.querySelector(".projectworksheet");
					if (grid !== null) {
						var cols = grid.columns;
						for (; cols.length > 0;) {
							console.log(cols[0].name);
							grid.removeColumn(cols[0].name);
						}
					}
					grid.items = [];
					grid.addColumn({ name: "<b>Something went wrong while fetching the data, Please try again or check you filter query again!</b>" });
					reject('Something went wrong while fetching the data, Please try again or check you filter query again!');
				}
			}
		});
	});
	return promise;
}

function getFileListForSearch(url, pattern, hpccuser, password) {
	return $.ajax({
		//url : "http://10.240.33.54:8010/WsDfu/DFUQuery.json", 
		url: url + "/WsDfu/DFUQuery.json?LogicalName=" + pattern + '*',
		headers: { 'Access-Control-Allow-Origin': '*' },
		dataType: "JSONP",
		jsonp: 'jsonp',
		type: 'GET',
		async: 'false',
		headers: {
			"Authorization": "Basic " + btoa(hpccuser + ":" + password)
		}
	});
}

function loadGridwithEcl(QueryStr) {

	var infoBox = document.querySelector('#infobox');

	var eclIP = (infoBox.properties.isHpccSecured === "true" ? "https://" : "http://") +
		(infoBox.properties.username != '' ? infoBox.properties.username + ':' + infoBox.properties.password + '@' : '') +
		infoBox.properties.cluster_address +
		":" + infoBox.properties.port;

	var getFileData = new Promise(function (resolve, reject) {
		callAjaxForECL(eclIP, QueryStr, infoBox.properties.username, infoBox.properties.password).then(function (resData) {
			resolve(resData);
		});
	});

	getFileData.then(function (ajaxResp) {

		var currentPage = document.querySelector("#pages").selectedItem;

		var grid = currentPage.querySelector(".projectworksheet");


		var cols = grid.columns;
		var colArray = [];
		for (; cols.length > 0;) {
			console.log(cols[0].name);
			grid.removeColumn(cols[0].name);
		}

		grid.items = ajaxResp.Result.Row;
		if (ajaxResp.Result.Row.length === 0) {
			grid.addColumn({ name: "<b>There are no records for your Filter Query</b>" });
			return;
		}
		var obj = ajaxResp.Result.Row[0];
		var cnt = 0;

		var cols = grid.columns;
		var colArray = [];
		for (; cols.length > 0;) {
			console.log(cols[0].name);
			grid.removeColumn(cols[0].name);
		}

		var fieldnames = "";
		Object.keys(obj).forEach(function (key) {
			grid.addColumn({ name: key, resizable: true });
			if (fieldnames === "") {
				fieldnames += key;
			} else {
				fieldnames += "," + key;
			}
			colArray[cnt] = key;
			cnt++;
		});

		currentPage.editor.properties.displayFields = fieldnames;

		sessionStorage.setItem('gridColumns', colArray);
		// Add some example data as an array.

	});
	return;
}

function callAjaxForECL(url, eclCode, hpccuser, password) {
	var wuid = '';
	var promise = new Promise(
		function (resolve, reject) {

			$.ajax({
				url: url + "/WsWorkunits/WUCreateAndUpdate.json",
				data: { "QueryText": eclCode.replace(/\n/g, ''), "ResultLimit": 10000, "Jobname": "HPCCInfoRequest" },
				headers: { 'Access-Control-Allow-Origin': '*' },
				dataType: "JSONP",
				jsonp: 'jsonp',
				type: "POST",
				crossDomain: true,
				headers: {
					"Authorization": "Basic " + btoa(hpccuser + ":" + password)
				},
				success: function (data) {
					wuid = data.WUUpdateResponse.Workunit.Wuid;
					$.ajax({
						url: url + "/WsWorkunits/WUSubmit.json?Wuid=" + data.WUUpdateResponse.Workunit.Wuid + '&Cluster=hthor',
						headers: { 'Access-Control-Allow-Origin': '*' },
						dataType: "JSONP",
						jsonp: 'jsonp',
						type: 'GET',
						headers: {
							"Authorization": "Basic " + btoa(hpccuser + ":" + password)
						},
						success: function (data) {
							var wustatus = new Promise(function (res, rej) {
								workunitStatus(url, "Wuid=" + wuid + "&Cluster=hthor", hpccuser, password).then(function (data) {
									res(data);
								})
							});

							wustatus.then(function (result) {
								$.ajax({
									url: url + "/WsWorkunits/WUResult.json?Wuid=" + result + '&Cluster=hthor',
									headers: { 'Access-Control-Allow-Origin': '*' },
									dataType: "JSONP",
									jsonp: 'jsonp',
									type: 'GET',
									headers: {
										"Authorization": "Basic " + btoa(hpccuser + ":" + password)
									},
									success: function (data) {

										if (data.WUResultResponse.Name === "SUPERFILECONTENTS") {
											var newData = callForFileDetails(url, data.WUResultResponse.Result.Row[0].name, hpccuser, password);
											newData.then(
												function (val) {
													resolve(val);
												}
											);
										} else {
											resolve(data.WUResultResponse);
										}

									}
								});
							});
						}
					});
				}
			});
		}
	);

	return promise;
}
function callForFileDetails(url, filename, hpccuser, password) {
	var promise = new Promise(function (resolve, reject) {
		var wuid = '';
		$.ajax({
			url: url + "/WsDfu/DFUInfo.json?Name=" + '~' + filename,
			headers: { 'Access-Control-Allow-Origin': '*' },
			dataType: "JSONP",
			jsonp: 'jsonp',
			type: 'GET',
			headers: {
				"Authorization": "Basic " + btoa(hpccuser + ":" + password)
			},
			success: function (data) {
				console.log(data.DFUInfoResponse);

				var currentPage = document.querySelector("#pages").selectedItem;
				outputdsname = 'inputds' + '_' + Math.random().toString(36).substr(2, 4);

				if (data.DFUInfoResponse.FileDetail.isSuperfile) {
					var QueryStr = "IMPORT STD;OUTPUT(STD.FILE.SUPERFILECONTENTS('~" + filename + "', TRUE)[1], NAMED('SUPERFILECONTENTS'));"
				} else {
					var QueryStr1 = "#OPTION(\'OUTPUTLIMIT\',2000);\nrecLayout := " + data.DFUInfoResponse.FileDetail.Ecl + "\n" +
						outputdsname + " := DATASET(\'" + (filename.startsWith('~') ? '' : '~') + filename + "\'," + "recLayout, THOR);\n";
					var QueryStr = QueryStr1 + "Output(" + outputdsname + ");";
				}
				console.log(QueryStr);
				var callAjaxPromise = new Promise(function (rs, rj) {
					callAjaxForECL(url, QueryStr, hpccuser, password).then(function (data) {
						rs(data);
					})
				});

				callAjaxPromise.then(function (data) {
					data.outputdsname = outputdsname;
					data.querystr = QueryStr1 != undefined ? QueryStr1 : data.querystr;
					resolve(data);
				});

			}
		});
	});
	return promise;
}
