function getTrackedListItems(selector) {
  var listItems = new Array();

  for (i = 0;  i < $(selector).length; i++) {
    li = $(selector)[i];
    if (li.id == null || li.id.length == 0) continue;
    listItems[i] = li.id;
  }
  return listItems;
}

function getUserUnReadItems() {
  var value = {};
  var read = {};
  var cookie = getCookie('read');
  
  if (cookie != null) value = cookie.split(',');
  
  for (i = 0; i < value.length; i++) {
    read[value[i]] = 1;
  }
  
  selector = 'ul#communityEventList li';
  var listItems = getTrackedListItems(selector);

  if (listItems != null && listItems.length > 0) {
    var lp = document.createElement('p');
    var label = document.createTextNode(
          "expand for " + listItems.length + " new item" + 
          ((listItems.length > 1) ? "s" : "")
        );
    lp.appendChild(label);
    lp.id = 'unreadlabel';
    $('#menu_lefttop a.heading:eq(1)').css({'padding-bottom' : '8px'});
    $('a#community').append(lp);

    for (i = 0;  i < listItems.length; i++) {
      if (read[listItems[i]]) continue;
      document.getElementById(listItems[i]).style.backgroundColor='yellow';
      document.getElementById(listItems[i]).style.margin='2px';
      document.getElementById(listItems[i]).style.paddingLeft='1px';
    }
  }

}

function updateUserReadItems(readlist) {
  var expiresDate = new Date((new Date()).getTime() + 1000 * 60 * 60 * 24 * 365);
//  storeIntelligentCookie('read', readlist, expiresDate)
}
