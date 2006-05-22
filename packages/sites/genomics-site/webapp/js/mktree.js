/*===================================================================
 Author: Matt Kruse
 
 View documentation, examples, and source code at:
     http://www.JavascriptToolbox.com/

 NOTICE: You may use this code for any purpose, commercial or
 private, without any further permission from the author. You may
 remove this notice from your final code if you wish, however it is
 appreciated by the author if at least the web site address is kept.

 This code may NOT be distributed for download from script sites, 
 open source CDs or sites, or any other distribution method. If you
 wish you share this code with others, please direct them to the 
 web site above.
 
 Pleae do not link directly to the .js files on the server above. Copy
 the files to your own server for use with your site or webapp.
 ===================================================================*/
addEvent(window,"load",convertTrees);
function addEvent(o,e,f){if(o.addEventListener){o.addEventListener(e,f,false);return true;}else if(o.attachEvent){return o.attachEvent("on"+e,f);}else{return false;}}
function setDefault(name,val){if(typeof(window[name])=="undefined" || window[name]==null){window[name]=val;}}
function expandTree(treeId){var ul = document.getElementById(treeId);if(ul == null){return false;}expandCollapseList(ul,nodeOpenClass);}
function collapseTree(treeId){var ul = document.getElementById(treeId);if(ul == null){return false;}expandCollapseList(ul,nodeClosedClass);}
function expandToItem(treeId,itemId){var ul = document.getElementById(treeId);if(ul == null){return false;}var ret = expandCollapseList(ul,nodeOpenClass,itemId);if(ret){var o = document.getElementById(itemId);if(o.scrollIntoView){o.scrollIntoView(false);}}}
function expandCollapseList(ul,cName,itemId){if(!ul.childNodes || ul.childNodes.length==0){return false;}for(var itemi=0;itemi<ul.childNodes.length;itemi++){var item = ul.childNodes[itemi];if(itemId!=null && item.id==itemId){return true;}if(item.nodeName == "LI"){var subLists = false;for(var sitemi=0;sitemi<item.childNodes.length;sitemi++){var sitem = item.childNodes[sitemi];if(sitem.nodeName=="UL"){subLists = true;var ret = expandCollapseList(sitem,cName,itemId);if(itemId!=null && ret){item.className=cName;return true;}}}if(subLists && itemId==null){item.className = cName;}}}}
function convertTrees(){setDefault("treeClass","mktree");setDefault("nodeClosedClass","liClosed");setDefault("nodeOpenClass","liOpen");setDefault("nodeBulletClass","liBullet");setDefault("nodeLinkClass","bullet");setDefault("preProcessTrees",true);if(preProcessTrees){if(!document.createElement){return;}uls = document.getElementsByTagName("ul");for(var uli=0;uli<uls.length;uli++){var ul=uls[uli];if(ul.nodeName=="UL" && ul.className==treeClass){processList(ul);}}}}
function processList(ul){if(!ul.childNodes || ul.childNodes.length==0){return;}for(var itemi=0;itemi<ul.childNodes.length;itemi++){var item = ul.childNodes[itemi];if(item.nodeName == "LI"){var subLists = false;for(var sitemi=0;sitemi<item.childNodes.length;sitemi++){var sitem = item.childNodes[sitemi];if(sitem.nodeName=="UL"){subLists = true;processList(sitem);}}var s= document.createElement("SPAN");var t= '\u00A0';s.className = nodeLinkClass;if(subLists){if(item.className==null || item.className==""){item.className = nodeClosedClass;}if(item.firstChild.nodeName=="#text"){t = t+item.firstChild.nodeValue;
item.removeChild(item.firstChild);}s.onclick = function(){this.parentNode.className =(this.parentNode.className==nodeOpenClass) ? nodeClosedClass : nodeOpenClass;return false;}}else{item.className = nodeBulletClass;
s.onclick = function(){return false;}}s.appendChild(document.createTextNode(t));item.insertBefore(s,item.firstChild);}}}

