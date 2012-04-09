var geocoder;
var map;

function initialize() {
  geocoder = new google.maps.Geocoder();

  var latlng = new google.maps.LatLng(8.897, 10.644);

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

  //$('#isolate-view tbody tr').map(function() {
  var locations = [];
  $('#isolate-view tbody tr').each(function() {
    // $(this) is used more than once; cache it for performance.
      var $row = $(this);
      
    // For each row that's "mapped", return an object that
    //  describes the first and second <td> in the row.
    var $name = $row.find(':nth-child(1)').text();
    var $count = $row.find(':nth-child(2)').text();
    var $type = $row.find(':nth-child(3)').text();
    var $lat = $row.find(':nth-child(4)').text();
    var $lng = $row.find(':nth-child(5)').text();

    locations.push([$name, $count, $type, $lat, $lng]);
  }).get();

  setMarkers(map, locations);

});

function setMarkers(map, locations) {

  var infoWindow = new google.maps.InfoWindow();
  var shadow = new google.maps.MarkerImage('/assets/images/isolate/mm_shadow.png');

  for (var i = 0; i < locations.length; i++ ) {
     var loc = locations[i];
     var latLng = new google.maps.LatLng(loc[3], loc[4]);
     var country = loc[0];
     var total = loc[1];
     var type = loc[2];
     var content = country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=IsolateQuestions.IsolateByCountry&array(country)="+country+type+"'> Click for Details</a>";
    
     var $icon; 
     if(total < 2) {
       $icon = '1.png';
     } else if(total < 5) {
       $icon = '3.png';
     } else if(total < 10) {
       $icon = '5.png';
     } else if(total < 20) {
       $icon = '7.png';
     } else if(total < 30) {
       $icon = '8.png';
     } else {
       $icon = '10.png';
     }

     var image = new google.maps.MarkerImage('/assets/images/isolate/' + $icon);

     var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        shadow: shadow,
        icon: image,
        title: country + total,
        tooltip: content,
        zIndx: i
      });

      google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(this.tooltip);
        infoWindow.open(map,this);
    });
  }
}

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
