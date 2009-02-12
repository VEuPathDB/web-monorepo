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
  jQuery.get("/country.xml",{},function(xml){
    jQuery('country',xml).slowEach(200, function(i) {
       name = jQuery(this).find("name").text();
       count = jQuery(this).find("count").text();
       createMarker(name, count);
    });
  }); 
});

function createMarker(country, total) {
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
            marker.openInfoWindowHtml(country + ' ' + total + ' isolates. <br />' + "<a href='showSummary.do?questionFullName=IsolateQuestions.IsolateByCountry&myProp(country)="+country+"' target='_blank'> Click for Details</a>");
          });
        }
      }
    );
  }
}
