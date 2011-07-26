function exportBasket(targetProject, rcName) {
    var url = "exportBasket.do?target=" + targetProject + "&recordClass=" + rcName;
    
	$.ajax({
		url: url,
		type: "get",
		dataType: "html",
		beforeSend:function(){
			$("body").block();
		},
		success: function(data){
			var count = parseInt(data);
			
			var message = count + " records exported to " + targetProject
			    + ".\nNow if you go to " + targetProject + " and login with "
				+ "the same account, you will be able to find these records "
				+ "in your basket there.\n"
				+ "Do you want to go to " + targetProject + " now?";
			var result = confirm(message);
			$("body").unblock();
			if (result == true) {
			    window.location = "http://www." + targetProject.toLowerCase() + ".org";
			}
		},
		error: function(data,msg,e){
			alert("Error occured when exporting basket!\n" + msg + "\n" + e);
			$("body").unblock();
		}
	});

}
