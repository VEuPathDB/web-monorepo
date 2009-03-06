var readListCookieName = 'sb_read';
var oldHeadingPadBot;

function getReadFromCookie() {
  var readMap = {};
  var cookie = getCookie(readListCookieName);

  if (cookie == null) return readMap;
  
  var value = cookie.split(',');
  
  $(value).each(function(i, val){
    readMap[val] = 1;
  });

  return readMap;
}

function flagUnreadListItems() {
  var readMap = getReadFromCookie();
  var listItems = new Array();
  var totalUnreadCount = 0;
  
  $('a.heading').each(function(j){
    
    var sectUnreadCount = 0
    
    $(this).next('div.menu_lefttop_drop:first').
      children('ul:first').children('li[@id]').each(function(k){
        
        listItems.push(this.id);
                  
        if ( ! readMap[this.id]) {
          this.style.backgroundColor='yellow';
          this.style.margin='2px';
          this.style.paddingLeft='1px';
          sectUnreadCount++;
          totalUnreadCount++;
        }
    });
    if (sectUnreadCount > 0) {
      $(this).append(
        "<p class='unreadlabel'>expand for " + sectUnreadCount + " unread items</p>"
      );
      oldHeadingPadBot = $(this).css('padding-bottom');
      $(this).css({'padding-bottom' : '8px'});
    }
  });
  //console.log('totalUnreadCount ' + totalUnreadCount);
}

function putReadInCookie(headernode) {
  var newCookieVal = new Array();
  var readMap = getReadFromCookie();
  $(headernode).next('div.menu_lefttop_drop:first').
    children('ul:first').children('li[@id]').each(function(k){
       readMap[this.id] = 1;
  });
  
  for(key in readMap) {
      if (key == null) continue;
      newCookieVal.push(key);
  }
  
  $(headernode).children('p:first').remove();
  $(headernode).css({'padding-bottom' : oldHeadingPadBot})

  var expiresDate = new Date((new Date()).getTime() + 1000 * 60 * 60 * 24 * 365);
//  storeIntelligentCookie(readListCookieName, newCookieVal, expiresDate);
}