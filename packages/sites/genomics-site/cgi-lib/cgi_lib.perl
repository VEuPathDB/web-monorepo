#! /usr/bin/perl 
##############################################################################################################
#                                                                                                            #
#     This package is registered under the Gnu Public License(GPL). For details please read LICENSE.txt.     #
#                                                                                                            #
##############################################################################################################
##############################################################################################################
######################                                                                  ######################
######################                        cgi_lib.perl				######################
######################                                                                  ######################
##############################################################################################################
# The CGI_HANDLERS deal with basic CGI POST or GET method request
# elements such as those delivered by an HTTPD form, i.e. a url
# encoded line of "=" separated key=value pairs separated by &'s

# Routines:
# get_request:  reads the request and returns both the raw and
#               processed version.
# url_decode:   URL decodes a string or array of strings
# html_header:  Transmits a HTML header back to the caller
# html_trailer: Transmits a HTML trailer back to the caller

# Usage:
#
#       &get_request;    will get the request and decode it into an
#                        indexed array %rqpairs, the raw request is in
#                        $request
#
#       ... = &url_decode(LIST); will return a URL decoded version of
#                                the contents of LIST
#
#       &html_header(TITLE);    will write to standard output an HTML
#                               header (including the content-type
#                               field) giving the document the title
#                               specified by TITLE.
#
#       &html_trailer;          Writes a trailer to the html document
#                               with the name of the script generating
#                               it and the date (in UT).

sub get_request {

    # Subroutine get_request reads the POST or GET form request from STDIN
    # into the variable  $request, and then splits it into its
    # name=value pairs in the associative array %rqpairs.
    # The number of bytes is given in the environment variable
    # CONTENT_LENGTH which is automatically set by the request generator.

    # Encoded HEX values and spaces are decoded in the values at this
    # stage.

    # $request will contain the RAW request. N.B. spaces and other
    # special characters are not handler in the name field.

    if ($ENV{'REQUEST_METHOD'} eq "POST") {
        read(STDIN, $request, $ENV{'CONTENT_LENGTH'});
    } elsif ($ENV{'REQUEST_METHOD'} eq "GET" ) {
        $request = $ENV{'QUERY_STRING'};
    }

    %rqpairs = &url_decode(split(/[&=]/, $request));
}

sub get_mult_request {

    # Subroutine get_request reads the POST or GET form request from STDIN
    # into the variable  $request, and then splits it into its
    # name=value pairs in the associative array %rqpairs.
    # The number of bytes is given in the environment variable
    # CONTENT_LENGTH which is automatically set by the request generator.

    # Encoded HEX values and spaces are decoded in the values at this
    # stage.

    # $request will contain the RAW request. N.B. spaces and other
    # special characters are not handler in the name field.

    if ($ENV{'REQUEST_METHOD'} eq "POST") {
        read(STDIN, $request, $ENV{'CONTENT_LENGTH'});
    } elsif ($ENV{'REQUEST_METHOD'} eq "GET" ) {
        $request = $ENV{'QUERY_STRING'};
    }

    @rqpairs = &url_decode(split('&', $request));
				foreach $req (@rqpairs){
								($key, $value) = split('=', $req);
								if ($rqpairs{$key}){
											$rqpairs{$key} .= ", $value";
								}else{
											$rqpairs{$key} = $value;
								}
				}
}

sub url_decode {

#       Decode a URL encoded string or array of strings 
#               + -> space
#               %xx -> character xx

    foreach (@_) {
        tr/+/ /;
        s/%(..)/pack("c",hex($1))/ge;
    }
    @_;
}

sub html_header {

    # Subroutine html_header sends to Standard Output the necessary
    # material to form an HHTML header for the document to be
    # returned, the single argument is the TITLE field.

    local($title) = @_;

    print "Content-type: text/html\n\n";
    print "<html><head>\n";
    print "<title>$title</title>\n";
    print "<h2>$title</h2>\n";
    print "<hr>\n";
    print "</head>\n<body>\n"; #bgcolor="000000">\n";
}

sub html_trailer {

    # subroutine html_trailer sends the trailing material to the HTML
    # on STDOUT.

    local($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst)
        = localtime;

    local($mname) = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
                     "Aug", "Sep", "Oct", "Nov", "Dec")[$mon];
    local($dname) = ("Sun", "Mon", "Tue", "Wed", "Thu", "Fri",
                     "Sat")[$wday]; 
    $year += 1900;
    print "<hr><p>";
    print "Date: $hour:$min:$sec  on $dname $mday $mname $year.<p>\n";
    print "</body></html>\n";
}

sub get_date{
    # subroutine to print the date!
    # on STDOUT.

    local($sec, $min, $hour, $mday, $mon, $year, $wday, $yday, $isdst)
        = localtime;
	local($mname) = ("01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12")[$mon];

	if ($mday < 10){
		$day = "0$mday";
	}else{
		$day = $mday;
	}
	$year += 1900;
	$date = "$mname/$day/$year";
	$time_date = "$hour:$min:$sec, $mname/$day/19$year";
	return $date;
	return $time_date;
}

1;


