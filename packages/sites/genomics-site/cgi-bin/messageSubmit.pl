#!/usr/bin/perl
 
use HTTP::Headers;
use CGI qw/fatalToBrowser/;
use DBI;
use warnings;
use strict;
    
# Print the content and no-cache headers
my $headers = HTTP::Headers->new(
	"Content-type" => "text/html",
	Expires => 0,
	Pragma => "no-cache",
	"Cache-Control" => "no-cache, must-revalidate");
print $headers->as_string() . "\n";

#Render a new message submission form
	print <<_END_OF_DATA_
<html>
<head>
<title>AMS ALPHA</title>
<h1 align="left">Message Submission</h1>
<!--Link to site style-->
<link href="/var/www/ryanthib.giardiadb.org/project_home/ApiCommonWebsite/Site/htdocs/include/messageStyles.css" rel="stylesheet" type="text/css" />
</head>
<body>
<div style="width: 450px; left: 10px; top: 10%; height: 640px; padding: 5px; background-color: #E0E2EB">
<form method="get" action="messageInsert.pl">
<p>Message Category:
<select name="messageCategory">
<option value ="1">General Annoucement</option>
<option value ="2">System Degraded</option>
<option value ="3">System Failure</option>
</select>
<p>Select affected systems:</p>
 <div style="width: 140px; height: 105px; padding: 5px; line-height: 1.3; background-color: #EDE6DE; border-style: ridge">
  <input type="checkbox" name="projects" value="1">CryptoDB<br>
  <input type="checkbox" name="projects" value="2">GiardiaDB<br>
  <input type="checkbox" name="projects" value="3">PlasmodDB<br>
  <input type="checkbox" name="projects" value="4">ToxoDB<br>
  <input type="checkbox" name="projects" value="5">TrichDB<br>
   </div>
<p>Enter Message Text:</p>
<p><TEXTAREA cols="60" rows="5" name="messageText"></textarea></p>
<p>Start date:
<input type="text" cols="10" name="startDate" id="startDate">
Start Time:
<input type="text" cols="5" name="startTime" id="startTime">
<input type="checkbox" name="startNow">Now</p>
<p>Stop date:
<input type="text" cols="10" name="stopDate">
Stop Time:
<input type="text" cols="5" name="stopTime"</p>
<p>Enter Additional Comments:</p>
<p><TEXTAREA cols="60" rows="5" name="adminComments"></textarea></p>
 <div style="margin: 0 auto ; width: 130px; height: 25px">
  <input type="submit" value="Submit New Message">
    </div>
</form>
</div>
</body>
</html>
_END_OF_DATA_
;


