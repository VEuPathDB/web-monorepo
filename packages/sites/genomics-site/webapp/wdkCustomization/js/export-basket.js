function exportBasket(rcName) {
    var targetProject = $("#export-basket #to-project").val();
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
            $("body").unblock();
            
            if (count > 0) {
                var message = count + " records exported to " + targetProject
                    + ".\n\nNow if you go to " + targetProject + " and login with "
                    + "the same account, \nyou will be able to find these records "
                    + "in your basket there.\n\n"
                    + "Do you want to go to " + targetProject + " now?";
                var result = confirm(message);
                if (result == true) {
                    window.location = "http://www." + targetProject.toLowerCase() + ".org";
                }
            } else {
                var message = "No record is exported to " + targetProject + ".\n"
                    + "You don't have any record of the selected type in your baskets,\n"
                    + "or the records already exist in the basket of the selected website,\n"
                    + "or the records are not compatible with the selected website.";
                alert(message);
            }
        },
        error: function(data,msg,e){
            alert("Error occured when exporting basket!\n" + msg + "\n" + e);
            $("body").unblock();
        }
    });

}
