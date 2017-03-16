var geocoder;
var map;

function initialize() {
  geocoder = new google.maps.Geocoder();

  var latlng = new google.maps.LatLng(8.897, 10.644);

  var myOptions = {
    zoom: 2,
    maxZoom: 5,
    minZoom: 2,
    center: latlng, 
    mapTypeId: google.maps.MapTypeId.TERRAIN
  }
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  //$('#isolate-view tbody tr').map(function() {
  var locations = [];
  $('#isolate-view tbody tr').each(function() {
    // $(this) is used more than once; cache it for performance.
    var $row = $(this);
      
    // For each row that's "mapped", return an object that
    //  describes the first and second <td> in the row.
    var $name = $row.find(':nth-child(1)').text();
    var $count = $row.find(':nth-child(2)').text();
    var $lat = $row.find(':nth-child(3)').text();
    var $lng = $row.find(':nth-child(4)').text();
    var $gaz = $row.find(':nth-child(5)').text();

    locations.push([$name, $count, $lat, $lng, $gaz]);
  }).get();

  setMarkers(map, locations);

}

function setMarkers(map, locations) {

  var infoWindow = new google.maps.InfoWindow();
  var shadow = new google.maps.MarkerImage(wdk.assetsUrl('images/isolate/mm_shadow.png'));

  for (var i = 0; i < locations.length; i++ ) {
     var loc = locations[i];
     var latLng = new google.maps.LatLng(loc[2], loc[3]);
     var country = loc[0];
     var total = loc[1];
     var gaz = loc[4];
     var content = country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=PopsetQuestions.PopsetByCountry&array(country)="+gaz+"'> Click to find all isolates in this country</a>";
    
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

     var image = new google.maps.MarkerImage(wdk.assetsUrl('images/isolate/' + $icon));

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
        infoWindow.setContent(country + ' ' + total + ' isolates. <br />' + "<a href='processQuestion.do?questionFullName=PopsetQuestions.PopsetByCountry&array(country)="+country+type+"'> Click for Details</a>");
        infoWindow.open(map,marker);
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}
