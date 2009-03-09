/******************************************************************************
 * functions to flag sidebar list items that have been added since client's
 * last visit. State is maintained in a cookie.
 ******************************************************************************/
var readListCookieName = 'sb_read';
var oldHeadingPadBot;

/*
 *  return associative array where key = list IDs of read items
 */
function getReadFromCookie() {
  var readMap = {};
  var cookie = getCookie(readListCookieName);

  if (cookie == null) return readMap;
  
  $(cookie.split(',')).each(function(i, val){
    readMap[val] = 1;
  });

  return readMap;
}

/*
 *  For each sidebar <li> item, background color those that are not in the 
 *  cookie.
 *  Expected minimal DOM branch:
 *     <a class="heading" href="#">
 *       <div class="menu_lefttop_drop">
 *         <ul id='?'>
 *           <li id='?'></li>
 *         </ul>
 *       </div>
 */
function flagUnreadListItems() {
  var readMap = getReadFromCookie();
  var listItems = new Array();
  var totalUnreadCount = 0;
  
  $('a.heading').each(function(j){
    
    var sectUnreadCount = 0
    
    $(this).next('div.menu_lefttop_drop:first').
      children('ul').children('li[@id]').each(function(k){
        
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
        "<p class='unreadlabel'>expand for " + 
            sectUnreadCount + " new item" +
          ((listItems.length > 1) ? "s" : "") + "</p>"
      );
      oldHeadingPadBot = $(this).css('padding-bottom');
      $(this).css({'padding-bottom' : '8px'});
    }
  });
  //console.log('totalUnreadCount ' + totalUnreadCount);
}

/*
 *  To be called when clicking <a class="heading"> to expand a specific
 *  subsection.
 *  Create a new cookie having the list from the original cookie
 *  plus all the <li> items in the specific <div class="menu_lefttop_drop">.
 *  See flagUnreadListItems() for expected DOM structure.
 *  Give the cookie to the client.
 */
function putReadInCookie(headernode) {
  var newCookieVal = new Array();
  var readMap = getReadFromCookie();
  $(headernode).next('div.menu_lefttop_drop:first').
    children('ul').children('li[@id]').each(function(k){
       readMap[this.id] = 1;
  });
  
  for(key in readMap) {
      if (key == null) continue;
      newCookieVal.push(key);
  }
  
  $(headernode).children('p:first').remove();
  $(headernode).css({'padding-bottom' : oldHeadingPadBot})

  var expiresDate = new Date((new Date()).getTime() + 1000 * 60 * 60 * 24 * 365);
  storeIntelligentCookie(readListCookieName, newCookieVal, expiresDate);
}