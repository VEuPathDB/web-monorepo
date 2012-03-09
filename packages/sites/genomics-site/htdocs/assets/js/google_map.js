var map =null;
var geocoder = null;
var locations = new Array();

function initialize() {
  if (GBrowserIsCompatible()) {
    if (document.getElementById("map_canvas") == null) {
      return;
    }
    map = new GMap2(document.getElementById("map_canvas"), { size: new GSize(1280,420) } );
    map.setCenter(new GLatLng(12, 8), 2);
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

  var dd   = document.domain;
  var type = "&array(type)=3kChip,HD_Array,Barcode,Sequencing Typed";
  if(dd.match('toxodb')) {
    type = "&array(type)=RFLP Typed,Sequencing Typed";
  } else if(dd.match('plasmodb')) {
    type = "&array(type)=3kChip,HD_Array,Barcode,Sequencing Typed";
  } else if(dd.match('giardiadb')) {
    type = '';
  } else if(dd.match('plasmodb')) {
    type = '';
  } else if(dd.match('cryptodb')) {
    type = '';
  } 

  collectData();
  initialize();

  setTimeout(function() {
    setMarkers(locations);
  }, 1000);
});


function collectData() {
    jQuery.get("showRecord.do?name=IsolateRecordClasses.CountryCountClass&source_id=test",{},function(xml){
      jQuery('country',xml).each(function(i) {
         name = jQuery(this).find("name").text();
         count = jQuery(this).find("count").text();
         locations.push(name);
      });
    }); 
}

function setMarkers(locations) {
  var marker = null;

  for (var i = 0; i < locations.length; i++) {
    var country = locations[i];
    if(geocoder) {
      geocoder.getLatLng(
        country,
        function(point) {
          if(!point) {
          } else {
            marker = new GMarker(point);
            map.addOverlay(marker);
            GEvent.addListener(marker, "click", function() {
              marker.openInfoWindowHtml(country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=IsolateQuestions.IsolateByCountry&array(country)="+country+type+"'> Click for Details</a>");
            });
          }
        }
      );
    }
  }
}


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
            marker.openInfoWindowHtml(country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=IsolateQuestions.IsolateByCountry&array(country)="+country+type+"'> Click for Details</a>");
          });
        }
      }
    );
  }
}
