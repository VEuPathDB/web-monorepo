var geocoder;
var map;

function initialize() {
  geocoder = new google.maps.Geocoder();

  var latlng = new google.maps.LatLng(8.597, 10.644);

  var myOptions = {
    zoom: 2,
    center: latlng, 
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

jQuery(document).ready(function(){
  initialize();

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

  $('#isolate-view tbody tr').map(function() {
    // $(this) is used more than once; cache it for performance.
      var $row = $(this);
      
    // For each row that's "mapped", return an object that
    //  describes the first and second <td> in the row.
    var $name = $row.find(':nth-child(1)').text();
    var $count = $row.find(':nth-child(2)').text();
    var $type = $row.find(':nth-child(3)').text();

      setTimeout( function() {  createMarker($name, $count, $type);}, 200);
  }).get();

});

function createMarker(country, total, type) {
  geocoder.geocode( {'address': country}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      //map.setCenter(results[0].geometry.location);

      var marker = new google.maps.Marker({
         map: map,
         position: results[0].geometry.location
      });

      google.maps.event.addListener(marker, 'click', function() {
         
        var infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=IsolateQuestions.IsolateByCountry&array(country)="+country+type+"'> Click for Details</a>");
        infoWindow.open(map,marker);
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}
