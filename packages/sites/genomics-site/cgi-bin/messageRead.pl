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
my $startDate;
my $stopDate;

#Get and format current time
my $currentTime=ctime();
my $formatTime=ParseDate($currentTime);
my $datestr= UnixDate($formatTime, "%m-%d-%Y %H:%M");
print "Date::Manip gives $datestr\n";

###Begin DB Transaction###
my $sql=q(SELECT message_text FROM MESSAGES 
          WHERE TO_CHAR(CURRENT_TIMESTAMP, 'mm-dd-yyyy') 
          BETWEEN TO_CHAR(START_DATE, 'mm-dd-yyyy') 
          AND TO_CHAR(STOP_DATE, 'mm-dd-yyyy') 
          AND TO_CHAR(CURRENT_TIMESTAMP, 'hh24:mi') 
          BETWEEN TO_CHAR(START_TIME, 'hh24:mi') 
          AND TO_CHAR(STOP_TIME, 'hh24:mi'));

my $sth=$dbh->prepare($sql);
     die "Could not prepare query. Check SQL syntax."
        unless defined $sql;
$sth->execute();

my @row;
while(@row=$sth->fetchrow_array()){
 my $messageText=$row[0];
 print "\n\n<b>$messageText</b>\n";
}
        
###End DB Transaction### 

#Finsh and close DB connection  
$dbh->disconnect();






