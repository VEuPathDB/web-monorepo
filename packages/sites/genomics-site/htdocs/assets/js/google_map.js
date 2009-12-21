var map =null;
var geocoder = null;

function initialize() {
  if (GBrowserIsCompatible()) {
    if (document.getElementById("map_canvas") == null) {
      return;
    }
    map = new GMap2(document.getElementById("map_canvas"), { size: new GSize(720,380) } );
    map.setCenter(new GLatLng(10, 8), 2);
    map.addControl(new GLargeMapControl())

    geocoder = new GClientGeocoder();
    geocoder.setCache();
  }
}

jQuery.fn.slowEach = function( interval, callback ) {
  var array = this;
  if( ! array.length ) return;
  var i = 0;
  next();
  function next() {
    if( callback.call( array[i], i, array[i] ) !== false )
    if( ++i < array.length )
    setTimeout( next, interval );
  }
};

jQuery(document).ready(function(){
  initialize();

  var dd   = document.domain;
  var type = "&myMultiProp(type)=3kChip,HD_Array,Barcode,Sequencing Typed";
  if(dd.match('toxodb')) {
    type = "&myMultiProp(type)=RFLP Typed,Sequencing Typed";
  } else if(dd.match('plasmodb')) {
    type = "&myMultiProp(type)=3kChip,HD_Array,Barcode,Sequencing Typed";
  } else if(dd.match('giardiadb')) {
    type = '';
  } else if(dd.match('plasmodb')) {
    type = '';
  } else if(dd.match('cryptodb')) {
    type = '';
  } 

  jQuery.get("showRecord.do?name=IsolateRecordClasses.CountryCountClass&source_id=test",{},function(xml){
    jQuery('country',xml).slowEach(200, function(i) {
       name = jQuery(this).find("name").text();
       count = jQuery(this).find("count").text();
       createMarker(name, count, type);
    });
  }); 
});

function createMarker(country, total, type) {
  var marker = null;
  if(geocoder) {
    geocoder.getLatLng(
      country,
      function(point) {
        if(!point) {
        } else {
          marker = new GMarker(point);
          map.addOverlay(marker);
          GEvent.addListener(marker, "click", function() {
            marker.openInfoWindowHtml(country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=IsolateQuestions.IsolateByCountry&myMultiProp(country)="+country+type+"'> Click for Details</a>");
          });
        }
      }
    );
  }
}
