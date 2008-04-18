#!/usr/bin/perl

###
# messageRead.pl  
#
# Insert a new user specified message into the DB
#
# Author: Ryan Thibodeau
#
###

use DBI;
use lib $ENV{GUS_HOME};
use CGI qw/:standard/;
use strict;
use warnings;
use CGI::Carp qw(fatalsToBrowser);
use DBI qw(:sql_types);
use ApiCommonWebsite::Model::CommentConfig;
use Time::localtime;
use Date::Manip qw(ParseDate UnixDate);
use HTTP::Headers;

# Print the content and no-cache headers
my $headers = HTTP::Headers->new(
        "Content-type" => "text/html",
        Expires => 0,
        Pragma => "no-cache",
        "Cache-Control" => "no-cache, must-revalidate");
print $headers->as_string() . "\n";


#Create DB connection
my $model="GiardiaDB";
my $dbconnect=new ApiCommonWebsite::Model::CommentConfig($model);

my $dbh = DBI->connect(
    $dbconnect->{dbiDsn},
    $dbconnect->{login},
    $dbconnect->{password},
    { PrintError => 1,
      RaiseError => 1,
      AutoCommit => 1
    }
) or die "Can't connect to the database: $DBI::errstr\n";;

my $messageText;
my $messageCategory;

#Query params passed via tag
my $query=new CGI();
 $messageCategory=$query->param("messageCategory");
my $project=$query->param("project");

#Get and format current time
my $currentTime=ctime();
my $formatTime=ParseDate($currentTime);
my $datestr= UnixDate($formatTime, "%m-%d-%Y %H:%M");
print "Date::Manip gives $datestr\n";


my $sql=q(SELECT m.message_text, c.category_name 
            FROM messages m, category c, projects p, message_projects mp 
            WHERE p.project_name = ? 
            AND p.project_id = mp.project_id 
            AND mp.message_id = m.message_id 
            AND m.message_category  =  c.category_name 
            AND TO_CHAR(CURRENT_TIMESTAMP, 'mm-dd-yyyy hh24:mi:ss') 
            BETWEEN TO_CHAR(START_DATE, 'mm-dd-yyyy hh24:mi:ss') 
            AND TO_CHAR(STOP_DATE, 'mm-dd-yyyy hh24:mi:ss') 
            AND m.message_category = ? );


my $sth=$dbh->prepare($sql) or
     die "Could not prepare query. Check SQL syntax.";
     
$sth->execute($project, $messageCategory) or die "Can't excecute SQL";

my @row;
 while (@row=$sth->fetchrow_array()){
  $messageText=$row[0];
  print "$messageText";
  }
 
#Finsh and close DB connection  
$dbh->disconnect();






