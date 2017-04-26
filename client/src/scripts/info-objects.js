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
	myDiv.addEventListener('dblclick', function(e){
		e.stopPropagation();
	    var currentElement = myDiv;
	    var value = myDiv.innerHTML;
	    updateVal(currentElement, value);
	});

	function updateVal(currentElement, value) {
		currentElement.innerHTML = '<input id="thVal" type="text" size="50" value="'+ value + '" />';
	  	var newEle = document.getElementById('thVal');
	  	newEle.focus();
	  	newEle.addEventListener('keyup', function(e) {
	  		if(e.keyCode == 13) {
	  			currentElement.innerHTML = e.target.value;
	  		}
	  	});
	  
	  	document.onclick = myClickHandler;
		function myClickHandler() {
		  	if(document.getElementById('thVal') !== null) {
		  		var newEle = document.getElementById('thVal').value;
		  		currentElement.innerHTML = newEle;
		  	}
		} 
	}
}

