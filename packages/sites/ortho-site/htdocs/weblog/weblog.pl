############################################
##                                        ##
##                 WebLog                 ##
##           by Darryl Burgdorf           ##
##       (e-mail burgdorf@awsd.com)       ##
##                                        ##
##             version:  2.54             ##
##       license modified:  4/13/06       ##
##         last modified:  4/1/06         ##
##           copyright (c) 2006           ##
##                                        ##
##    latest version is available from    ##
##        http://awsd.com/scripts/        ##
##                                        ##
############################################

# COPYRIGHT NOTICE:
#
# Copyright 2006 Darryl C. Burgdorf.
# Copyright 2007 Stefan Lemcke
#
# This program is free software.  You can redistribute it and/or 
# modify it under the terms of either:
#
# a) the GNU General Public License as published by the Free Software 
# Foundation, either version 1 or (at your option) any later version, 
#
# or 
#
# b) the "Artistic License" which comes with this program. 
#
# You should have received a copy of the Artistic License with this 
# module, in the file artistic.txt.  If you did not, I'll be glad to
# provide one. 
#
# You should have received a copy of the GNU General Public License 
# along with this program.  If you did not, write to the Free Software 
# Foundation, Inc., 59 Temple Place, Suite 330, Boston MA 02111-1307.
#
# This program is distributed "as is" and without warranty of any
# kind, either express or implied.  (Some states do not allow the
# limitation or exclusion of liability for incidental or consequential
# damages, so this notice may not apply to you.)  In no event shall
# the liability of Darryl C. Burgdorf and/or Affordable Web Space
# Design for any damages, losses and/or causes of action exceed the
# total amount paid by the user for this software.

# VERSION HISTORY:
#
# 2.54  04/01/06  Subdivided "Spider/Robot" category in agents list
#                 Added Firefox and Safari to agents list
#                 Added Navigator 8 to agents list
#                 Stripped "gibberish" characters from keywords
#                 Set agents list to log 403 accesses as spiders
#                 Set refs list and sessions count to ignore 403s
#                 Improved "access summary" info to isolate 403s
# 2.53  12/31/02  Added entrance/exit page lists
#                 Split Navigator 6 & 7 in agents list
#                 Trapped for a few new "link checkers"
#                 Stripped HTML tags from keywords
# 2.52  08/28/02  Fixed parsing of Win 2000 vs. Win XP
#                 Updated top-level domains list
#                 $IncludeQuery now recognizes WebBBS "SEF" URLs
#                 Squashed small bug in EOM $time setting
# 2.51  09/15/01  Added "About" to keywords list
#                 Improved HotBot/Lycos differentiation
#                 Added Windows XP to platform breakdown
#                 Separated OpenVMS from "Unix/Linux" category
#                 Fixed reading of user IDs from MS log files
#                 Closed rare "div by 0" error in session counting
# 2.50  07/05/01  Updated spider/robot filter lists
#                 Eliminated reading of details report into memory
#                 Allowed details report to keep summaries longer
#                 Corrected "Navigator v5" to "Navigator v6"
#                 Allowed "full" lists to be put in separate report
#                 Lowered referrers/keywords "filter" thresholds
#                 Added "master list" of recognized search engines
#                 Eliminated use of "file list filter" with top 404
#                 Made "details filter" apply to error URLs
#                 Fixed $IncludeOnlyDomain handling of domain names
#                 Log file name wildcards now only match at end
#                 Allowed for "foreign" characters in keywords
#                 Squashed "top 404 to files" bug reading old report
#                 Fixed unclosed <BLOCKQUOTE> tag in details report
# 2.41  02/21/01  Replaced @Accesses & @Sessions with temp files
#                 Squashed minor bug in summary "spider count"
# 2.40  02/07/01  Added support for old MS-IIS log file format
#                 Allowed for MS extended logs with multiple headers
#                 DoW & hourly reports now average, not cumulative
#                 Allowed for "summary only" details report
#                 Added "spider count" to details summary
#                 Eliminated $TotalReset flag
#                 Set script to automatically use best available DBM
#                 Allowed keywords report without refs report
#                 Added $TopNKeywords option
#                 Replaced $RefsMinHits with $RefsFilterLists
#                 Added "Direct Hit" and "FAST" to keywords list
#                 Correctly separated Google and Yahoo
#                 Updated "Snap!" to NBCi
#                 Made other minor adjustments to keyword parsing
# 2.30  12/25/00  NOW REQUIRES PERL 5!
#                 Added Windows 2000 and CE to platform breakdown
#                 Removed offline browsers, etc. from spiders list
#                 Otherwise expanded agents and platform lists
#                 Added "master list" of recognized agents/platforms
#                 Made maintenance of full agents list optional
#                 Revised graph bars to use fewer image calls
#                 Added "Courier" font specifications to <PRE>s
#                 Trapped for invalid resolved domain names
#                 Empty keywords report no longer created w/o refs
#                 Allowed inclusion/exclusion of unresolvable IPs
#                 Made various minor tweaks
# 2.20  11/08/99  Added support for MS extended log format
#                 Added errors to "details" report
#                 "Trimmed" IPs/domains to improve visitor count
#                   (This also makes the IP database smaller!)
#                 Added agent/platform info to details report
#                 "Singularized" all agent/platform list entries
#                 Fixed recognition of newer versions of Opera
#                 Split robots and harvesters in platform list
#                 Trapped for obviously corrupted agent names
#                 Updated and greatly expanded keywords parsing
#                 Squashed bug in "Top Referers" calculation
#                 Improved EOM File creation criteria
#                 Added $TotalReset flag
# 2.12  05/13/99  Corrected minor bug in $DefaultPageName def
#                 "Single-Quoted" several variable definitions
#                 Allowed for possibility of spaces in user IDs
#                 Added "Non-Standard Domain" to top domains list
#                 Added $bodyspec, $headerfile and $footerfile
#                 Fixed bug preventing re-gzipping of files
# 2.11  04/20/99  Put IP resolution back into main processing loop
# 2.10  03/30/99  Replaced resolved IPs list with DBM file
#                 Removed IP resolution from main processing loop
#                 Eliminated copying of @Accesses array
#                 Improved "memory management" of disabled options
#                 Added stripping of "/../" from file names
#                 Expanded "Verbose" notifications
#                 Took care of a few minor "format bug" fixes
#                 Added "E-Mail Harvesters" to agents list
#                 Corrected counting of some AOL as MSIE
#                 Corrected "Netscape" to "Netscape Navigator"
#                 Improved parsing of "ambiguous" Win platforms
#                 Added MSN to search engines in keywords list
#                 Removed final spaces from keywords lists
#                 Allowed *all* ref domains to be "lower-cased"
#                 Various other minor tweaks
# 2.03  07/04/98  Added "top referers" list
#                 Added Windows 98 to platform list
#                 Allowed for better EOM processing
#                 Fixed handling of "mixed" type log files
#                 Added date to details report listings
#                 Improved second-level parsing of non-US domains
#                 Allowed for NT-style "\" file path delimiters
# 2.02  05/02/98  Trapped "run on" URLs
#                 Added $HourOffset configuration variable
#                 Added "$Verbose" flag
# 2.01  04/06/98  Fixed path bug in "wildcarded" file names
#                 Fixed bug in unzipping of multiple zipped files
#                 Fixed bug preventing print of "null" reports
#                 Fixed bug in hourly visit & page view counting
#                 Corrected multi-file reset of %agentcounter
#                 Added "Snap!" to keywords breakdown
#                 Separated "Excite" and "Netfind" in breakdown
# 2.00  03/09/98  Incorporated referer & agent logging
#                 Added "search keywords" logging
#                 Added resolution of IP numbers
#                 Added ability to "wildcard" log file name
#                 Added "page views" logging to main report
#                 Allowed user selection of info to be graphed
#                 Fixed bug causing graphs to flake with large logs
#                 Simplified configuration of file locations
#                 Eliminated need to "pre-create" report files
#                 Eliminated separate "country codes" file
#                 Allowed "autodetection" of log file type
#                 Set $NoSessions to disable *all* sessions logging
#                 Expanded list to include all HTTP/1.1 status codes
#                 Script now re-compresses gzip'd log files
#                 Made the usual collection of minor format tweaks
# 1.12  01/01/98  Added tracking of user IDs and associated domains
#                 Made complete file listing optional
#                 Cleaned up minor glitch in EOM listings
#                 Adjusted regex to allow single-digit log file dates
# 1.11  08/06/97  Fixed minor bug in $EndDate calculation
# 1.10  08/04/97  Finally eliminated "one day's log per day" limit
#                 Added "log only new" option
#                 Improved handling of various server error codes
#                 Removed unnecessary "summary" report
#                 Fixed minor bug in session counting
# 1.05  05/24/97  Added comma delineation to all numbers
#                 Added "record book" report
#                 Fixed new bug in "top" domain logging
# 1.04  05/03/97  Changed month/day logs from domains to sessions
#                 Added sessions to day-of-week log
#                 Allowed disabling of above sessions logging
#                 Allowed "details" log of only one day's accesses
#                 Enabled "top" domain logging even if domains off
#                 Added ability to log "second level" domains
#                 Fixed display bugs if no accesses on first day
#                 The typical selection of minor bug fixes
# 1.03  02/02/97  Added support for combined log files
#                 Added option to include file query information
#                 Corrected handling of zipped files
#                 Corrected bug in EOM report wrapping (Dec/Jan)
# 1.02  12/11/96  Added "running total" of user sessions
# 1.01  12/08/96  Added "user sessions" to details report
#                 Corrected day counting in details report
# 1.00  12/02/96  Initial "public" release

sub MainProg {
	use Fcntl;
	BEGIN { @AnyDBM_File::ISA = qw (DB_File GDBM_File SDBM_File ODBM_File NDBM_File) }
	use AnyDBM_File;
	if ($Verbose) { print "Log Analysis for $SystemName\n"; }
	&Initialize;
	if ($PrintFullAgentLists) { &PrintFullAgentLists; }
	if ($LogFile =~ /\*/) {
		if ($LogFile =~ /(.*)[\/\\]([^\/\\]+)/) {
			$dir = $1;
			$LogFile = $2;
		}
		else {
			$dir = "";
		}
		$LogFile =~ s/(\W)/\\$1/g;
		$LogFile =~ s/\\\*/\.\*/g;
		$LogFile =~ s/^/\^/g;
		opendir (DIR,$dir) || die "  Error: Unable to read log files directory\n";
		@files = readdir (DIR);
		closedir (DIR);
		foreach $file (@files) {
			if ($file =~ $LogFile) {
				if ($dir) { $fullfile = $dir."/".$file; }
				else { $fullfile = $file; }
				push (@LogFiles,$fullfile);
			}
		}
	}
	else {
		push (@LogFiles,$LogFile);
	}
	foreach $LogFile (sort @LogFiles) {
		$LogFile =~ s/.gz$//;
		if (-e "$LogFile.gz") {
			$ZipLock = 1;
			system ("gunzip -q $LogFile");
		}
		$OldFile = $ReportFile;
		$time = time;
		$RealDate = (localtime($time+($HourOffset*3600)))[3];
		$time = (stat("$LogFile"))[9];
		($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =
		  localtime($time+($HourOffset*3600));
		$year += 1900;
		if ($EOMFile && (($mday==1) || ($RealDate < $mday))) {
			$ReportFile = $EOMFile;
			if ($mday == 1) {
				($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =
				  localtime($time-86400+($HourOffset*3600));
				$year += 1900;
			}
			$sec = 59;
			$min = 59;
			$hour = 23;
			$eom = $mon+1;
			if (length($eom) == 1) { $eom = "0".$eom; }
			$EOMDate="$year $eom $mday 23 59 59";
			&ResetVars;
			&ReadOldFile;
			&ReadLog;
			if ($LogLineCount || ($EndDate gt $InitialEndDate)) {
				unless ($NoSessions) { &GetSessions; }
				if ($Verbose) { print "  Generating EOM Report\n"; }
				&PrintReport;
			}
			$ReportFile = $OldFile;
			$EOMDate = "";
			$time = (stat("$LogFile"))[9];
			($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) =
			  localtime($time+($HourOffset*3600));
			$year += 1900;
		}
		&ResetVars;
		&ReadOldFile;
		&ReadLog;
		if ($LogLineCount || ($EndDate gt $InitialEndDate)) {
			if ($AgentsFile) { &PrintAgentsReport; }
			if ($RefsFile) { &PrintRefsReport; }
			if ($KeywordsFile) { &PrintKeywordsReport; }
			unless ($NoSessions) { &GetSessions; }
			if ($Verbose) { print "  Generating Main Report\n"; }
			&PrintReport;
			if ($DetailsFile) { &PrintHostDetailsReport; }
		}
		if ($ZipLock) {
			system ("gzip $LogFile");
			$ZipLock = 0;
		}
	}
	unlink "$FileDir/tempaccesses.txt";
	unlink "$FileDir/tempsessions.txt";
	if ($Verbose) { print "Report Complete\n"; }
}

sub Initialize {
	$version = "2.54";
	@months=('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	%MonthToNumber=
	  ('Jan','01','Feb','02','Mar','03',
	  'Apr','04','May','05','Jun','06',
	  'Jul','07','Aug','08','Sep','09',
	  'Oct','10','Nov','11','Dec','12');
	%NumberToMonth=
	  ('01','Jan','02','Feb','03','Mar',
	  '04','Apr','05','May','06','Jun',
	  '07','Jul','08','Aug','09','Sep',
	  '10','Oct','11','Nov','12','Dec');
	%DoWCounter=
	  (1,'Sun',2,'Mon',3,'Tue',4,'Wed',5,'Thu',6,'Fri',7,'Sat');
	$DefaultPageName = '(index\.(((s|p)*html*|cgi))|welcome\.(((s|p)*html*|cgi)))';
	if ($NoSessions) {
		$DetailsFile = "";
		if ($GraphBase eq "visits") {
			$GraphBase = "";
		}
	}
	if (($DetailsDays<1) && ($DetailsSummaryDays<1)) {
		$DetailsFile = "";
	}
	if ($DetailsFile) {
		if ($DetailsDays>36) { $DetailsDays=36; }
		if ($DetailsSummaryOnly) {
			if ($DetailsSummaryDays<1) {
				$DetailsSummaryDays = $DetailsDays;
			}
			$DetailsDays = 0;
		}
		if ($DetailsDays == 0) { $DetailsSummaryOnly = 1; }
		if ($DetailsSummaryDays < $DetailsDays) {
			$DetailsSummaryDays = $DetailsDays;
		}
		if ($DetailsSummaryOnly) {
			$HRFlag = 1;
			$AccessDetailsReport = "Access Summary Report";
		}
		else {
			$AccessDetailsReport = "Access Details Report";
		}
	}
	if ($NoResolve) { $IPLog = ""; }
	%RespCodes = (
	  '100','Code 100 Continue',
	  '101','Code 101 Switching Protocols',
	  '200','Code 200 OK',
	  '201','Code 201 Created',
	  '202','Code 202 Accepted',
	  '203','Code 203 Non-Authoritative Information',
	  '204','Code 204 No Content',
	  '205','Code 205 Reset Content',
	  '206','Code 206 Partial Content',
	  '300','Code 300 Multiple Choices',
	  '301','Code 301 Moved Permanently',
	  '302','Code 302 Moved Temporarily',
	  '303','Code 303 See Other',
	  '304','Code 304 Not Modified',
	  '305','Code 305 Use Proxy',
	  '400','Code 400 Bad Request',
	  '401','Code 401 Unauthorized',
	  '402','Code 402 Payment Required',
	  '403','Code 403 Forbidden',
	  '404','Code 404 Not Found',
	  '405','Code 405 Method Not Allowed',
	  '406','Code 406 Not Acceptable',
	  '407','Code 407 Proxy Authentication Required',
	  '408','Code 408 Request Time-Out',
	  '409','Code 409 Conflict',
	  '410','Code 410 Gone',
	  '411','Code 411 Length Required',
	  '412','Code 412 Precondition Failed',
	  '413','Code 413 Request Entity Too Large',
	  '414','Code 414 Request-URI Too Large',
	  '415','Code 415 Unsupported Media Type',
	  '500','Code 500 Internal Server Error',
	  '501','Code 501 Not Implemented',
	  '502','Code 502 Bad Gateway',
	  '503','Code 503 Service Unavailable',
	  '504','Code 504 Gateway Time-Out',
	  '505','Code 505 HTTP Version Not Supported'
	  );
	%CountryCodes = (
	  'ac','Ascension Island',
	  'ad','Andorra',
	  'ae','United Arab Emirates',
	  'af','Afghanistan',
	  'ag','Antigua and Barbuda',
	  'ai','Anguilla',
	  'al','Albania',
	  'am','Armenia',
	  'an','Netherlands Antilles',
	  'ao','Angola',
	  'aq','Antarctica',
	  'ar','Argentina',
	  'as','American Samoa',
	  'at','Austria',
	  'au','Australia',
	  'aw','Aruba',
	  'az','Azerbaijan',
	  'ba','Bosnia and Herzegovina',
	  'bb','Barbados',
	  'bd','Bangladesh',
	  'be','Belgium',
	  'bf','Burkina Faso',
	  'bg','Bulgaria',
	  'bh','Bahrain',
	  'bi','Burundi',
	  'bj','Benin',
	  'bm','Bermuda',
	  'bn','Brunei Darussalam',
	  'bo','Bolivia',
	  'br','Brazil',
	  'bs','Bahamas',
	  'bt','Bhutan',
	  'bv','Bouvet Island',
	  'bw','Botswana',
	  'by','Belarus',
	  'bz','Belize',
	  'ca','Canada',
	  'cc','Cocos (Keeling) Islands',
	  'cd','Congo (formerly Zaire)',
	  'cf','Central African Republic',
	  'cg','Congo',
	  'ch','Switzerland',
	  'ci','Cote dIvoire (Ivory Coast)',
	  'ck','Cook Islands',
	  'cl','Chile',
	  'cm','Cameroon',
	  'cn','China',
	  'co','Colombia',
	  'cr','Costa Rica',
	  'cs','Czechoslovakia (Former)',
	  'cu','Cuba',
	  'cv','Cape Verde',
	  'cx','Christmas Island',
	  'cy','Cyprus',
	  'cz','Czech Republic',
	  'de','Germany',
	  'dj','Djibouti',
	  'dk','Denmark',
	  'dm','Dominica',
	  'do','Dominican Republic',
	  'dz','Algeria',
	  'ec','Ecuador',
	  'ee','Estonia',
	  'eg','Egypt',
	  'eh','Western Sahara',
	  'er','Eritrea',
	  'es','Spain',
	  'et','Ethiopia',
	  'eu','Europe',
	  'fi','Finland',
	  'fj','Fiji',
	  'fk','Falkland Islands (Malvinas)',
	  'fm','Micronesia',
	  'fo','Faroe Islands',
	  'fr','France',
	  'fx','France (Metropolitan)',
	  'ga','Gabon',
	  'gb','Great Britain (UK)',
	  'gd','Grenada',
	  'ge','Georgia',
	  'gf','French Guiana',
	  'gg','British Channel Islands (Guernsey)',
	  'gh','Ghana',
	  'gi','Gibraltar',
	  'gl','Greenland',
	  'gm','Gambia',
	  'gn','Guinea',
	  'gp','Guadeloupe',
	  'gq','Equatorial Guinea',
	  'gr','Greece',
	  'gs','S. Georgia and S. Sandwich Islands',
	  'gt','Guatemala',
	  'gu','Guam',
	  'gw','Guinea-Bissau',
	  'gy','Guyana',
	  'hk','Hong Kong',
	  'hm','Heard and McDonald Islands',
	  'hn','Honduras',
	  'hr','Croatia (Hrvatska)',
	  'ht','Haiti',
	  'hu','Hungary',
	  'id','Indonesia',
	  'ie','Ireland',
	  'il','Israel',
	  'im','Isle of Man',
	  'in','India',
	  'io','British Indian Ocean Territory',
	  'iq','Iraq',
	  'ir','Iran',
	  'is','Iceland',
	  'it','Italy',
	  'je','British Channel Islands (Jersey)',
	  'jm','Jamaica',
	  'jo','Jordan',
	  'jp','Japan',
	  'ke','Kenya',
	  'kg','Kyrgyzstan',
	  'kh','Cambodia',
	  'ki','Kiribati',
	  'km','Comoros',
	  'kn','Saint Kitts and Nevis',
	  'kp','North Korea',
	  'kr','South Korea',
	  'kw','Kuwait',
	  'ky','Cayman Islands',
	  'kz','Kazakhstan',
	  'la','Laos',
	  'lb','Lebanon',
	  'lc','Saint Lucia',
	  'li','Liechtenstein',
	  'lk','Sri Lanka',
	  'lr','Liberia',
	  'ls','Lesotho',
	  'lt','Lithuania',
	  'lu','Luxembourg',
	  'lv','Latvia',
	  'ly','Libya',
	  'ma','Morocco',
	  'mc','Monaco',
	  'md','Moldova',
	  'mg','Madagascar',
	  'mh','Marshall Islands',
	  'mk','Macedonia',
	  'ml','Mali',
	  'mm','Myanmar',
	  'mn','Mongolia',
	  'mo','Macau',
	  'mp','Northern Mariana Islands',
	  'mq','Martinique',
	  'mr','Mauritania',
	  'ms','Montserrat',
	  'mt','Malta',
	  'mu','Mauritius',
	  'mv','Maldives',
	  'mw','Malawi',
	  'mx','Mexico',
	  'my','Malaysia',
	  'mz','Mozambique',
	  'na','Namibia',
	  'nc','New Caledonia',
	  'ne','Niger',
	  'nf','Norfolk Island',
	  'ng','Nigeria',
	  'ni','Nicaragua',
	  'nl','Netherlands',
	  'no','Norway',
	  'np','Nepal',
	  'nr','Nauru',
	  'nt','Neutral Zone',
	  'nu','Niue',
	  'nz','New Zealand (Aotearoa)',
	  'om','Oman',
	  'pa','Panama',
	  'pe','Peru',
	  'pf','French Polynesia',
	  'pg','Papua New Guinea',
	  'ph','Philippines',
	  'pk','Pakistan',
	  'pl','Poland',
	  'pm','St. Pierre and Miquelon',
	  'pn','Pitcairn',
	  'pr','Puerto Rico',
	  'ps','Palestinian Authority',
	  'pt','Portugal',
	  'pw','Palau',
	  'py','Paraguay',
	  'qa','Qatar',
	  're','Reunion',
	  'ro','Romania',
	  'ru','Russian Federation',
	  'rw','Rwanda',
	  'sa','Saudi Arabia',
	  'sb','Solomon Islands',
	  'sc','Seychelles',
	  'sd','Sudan',
	  'se','Sweden',
	  'sg','Singapore',
	  'sh','St. Helena',
	  'si','Slovenia',
	  'sj','Svalbard and Jan Mayen Islands',
	  'sk','Slovak Republic',
	  'sl','Sierra Leone',
	  'sm','San Marino',
	  'sn','Senegal',
	  'so','Somalia',
	  'sr','Suriname',
	  'st','Sao Tome and Principe',
	  'su','USSR (Former)',
	  'sv','El Salvador',
	  'sy','Syria',
	  'sz','Swaziland',
	  'tc','Turks and Caicos Islands',
	  'td','Chad',
	  'tf','French Southern Territories',
	  'tg','Togo',
	  'th','Thailand',
	  'tj','Tajikistan',
	  'tk','Tokelau',
	  'tm','Turkmenistan',
	  'tn','Tunisia',
	  'to','Tonga',
	  'tp','East Timor',
	  'tr','Turkey',
	  'tt','Trinidad and Tobago',
	  'tv','Tuvalu',
	  'tw','Taiwan',
	  'tz','Tanzania',
	  'ua','Ukraine',
	  'ug','Uganda',
	  'uk','United Kingdom',
	  'um','US Minor Outlying Islands',
	  'us','United States',
	  'uy','Uruguay',
	  'uz','Uzbekistan',
	  'va','Vatican City State (Holy See)',
	  'vc','Saint Vincent and the Grenadines',
	  've','Venezuela',
	  'vg','Virgin Islands (British)',
	  'vi','Virgin Islands (US)',
	  'vn','Viet Nam',
	  'vu','Vanuatu',
	  'wf','Wallis and Futuna Islands',
	  'ws','Samoa',
	  'ye','Yemen',
	  'yt','Mayotte',
	  'yu','Yugoslavia',
	  'za','South Africa',
	  'zm','Zambia',
	  'zr','Zaire',
	  'zw','Zimbabwe',
	  'aero','Dot-Aero',
	  'arpa','Old-Style Arpanet',
	  'biz','Dot-Biz',
	  'com','US Commercial',
	  'coop','Dot-Coop',
	  'edu','US Educational',
	  'gov','US Government',
	  'info','Dot-Info',
	  'int','International',
	  'mil','US Military',
	  'museum','Dot-Museum',
	  'nato','NATO Field',
	  'name','Dot-Name',
	  'net','US Network',
	  'org','US Organization',
	  'pro','Dot-Pro',
	  'xxx','Unresolved Domain',
	  'ooo','Unrecognized Domain'
	  );
	$harvester_list = 'bullseye|cherrypicker|crescent|emailcollector|emailsiphon|emailwolf|extractor|microsoft url|mozilla/3.mozilla/2.01|newt|nicerspro|webbandit|brutus';
	$download_list = 'da \d|dnload|download|fetch|flashget|ftp|getright|gozilla|jetcar|leach|leech';
	$linkchecker_list = 'analyze|check|internetseer|link|netmechanic|netmind|powermarks|redalert|tooter|validat|verif|walk|webhostingratings';
	$offline_list = 'avantgo|batch|copier|httrack|msiecrawler|msproxy|netattache|netscape-proxy|offline|spacebison|teleport|webcapture|webzip';
	$spider_list = 'aport|archive|ask jeeves|behold|borg|bot|catch|crawl|digger|elitesys|enfish|esense|euroseek|ferret|grab|griffon|gulliver|harvest|htdig|hubat|hunt|infoseek|java|leia|lwp-|lwp:|mantraagent|mapper|mata hari|mercator|netants|perl|quest|reader|reaper|roamer|rover|scooter|search|slurp|snatch|spider|spinne|spyder|sweep|t-h-u-n-d-e-r-s-t-o-n-e|ultraseek|url|utopy|webcollage|webster pro|webwhacker|wfarc|wget|whatuseek';
}

sub ResetVars {
	&date_to_count(($mon+1),$mday,($year-1900));
	$DayBreak = $perp_days;
	$CurrDate="$mday $months[$mon] $year";
	$CurrMonth="$months[$mon]";
	$CurrYear="$year";
	$InitialEndDate="0000 00 00 00 00 00";
	$EndDate="0000 00 00 00 00 00";
	$FileEndDate="0000 00 00 00 00 00";
	$FileStartDate="9999 99 99 99 99 99";
	$AveragePages = 0;
	$DailyTotalBytesCounter = 0;
	$DailyTotalHitsCounter = 0;
	$DailyTotalPViewsCounter = 0;
	$DailyTotalVisitsCounter = 0;
	$GoDaily = 0;
	$GoMonthly = 0;
	$HourlyTotalBytesCounter = 0;
	$HourlyTotalHitsCounter = 0;
	$HourlyTotalPViewsCounter = 0;
	$HourlyTotalVisitsCounter = 0;
	$LocalPercent = 0;
	$MonthlyTotalBytesCounter = 0;
	$MonthlyTotalHitsCounter = 0;
	$MonthlyTotalPViewsCounter = 0;
	$MonthlyTotalVisitsCounter = 0;
	$OutsidePercent = 0;
	$TodayBanned = 0;
	$TodayBytes = 0;
	$TodayErrors = 0;
	$TodayHits = 0;
	$TodayHosts = 0;
	$TodayKB = 0;
	$TodayLocal = 0;
	$TodayMB = 0;
	$TodayOutside = 0;
	$TodayPagesErrors = 0;
	$TodayPagesHits = 0;
	$TodayPagesTotal = 0;
	$TopDomain = "";
	$endhour = 0;
	$logsegment = "";
	$refscounter = 0;
	$sessionstime = 0;
	$usersessions = 0;
	%BytesDay = ();
	%BytesFileCounter = ();
	%BytesHour = ();
	%BytesUserIDCounter = ();
	%DayFilesCounter = ();
	%DomainsBytesCounter = ();
	%DomainsDay = ();
	%DomainsFilesCounter = ();
	%HitsFileCounter = ();
	%HitsUserIDCounter = ();
	%HourFilesCounter = ();
	%LastAccessDomain = ();
	%LastAccessFile = ();
	%LastAccessUserID = ();
	%MonthlyBytesCounter = ();
	%MonthlyCounter = ();
	%MonthlyFilesCounter = ();
	%MonthlyPViewsCounter = ();
	%MonthlySessionsCounter = ();
	%PViewsDay = ();
	%PViewsHour = ();
	%Resolved = ();
	%TargetCounter = ();
	%TodayDomains = ();
	%TodayHosts = ();
	%TopDomainAccess = ();
	%TopDomainBytesCounter = ();
	%TopDomainFilesCounter = ();
	%VisitsHour = ();
	%WhichDayCounter = ();
	%WhichDayFiles = ();
	%WhichDayBytes = ();
	%WhichDayDomains = ();
	%WhichDayPViews = ();
	%aboutcom = ();
	%agentcounter = ();
	%agentreport = ();
	%altavista = ();
	%askjeeves = ();
	%cnet = ();
	%combinedreport = ();
	%dates = ();
	%day_counts = ();
	%dayusersessions = ();
	%directhit = ();
	%dogpile = ();
	%excite = ();
	%euroferret = ();
	%euroseek = ();
	%fast = ();
	%firstpages = ();
	%fnfBytesFileCounter = ();
	%fnfHitsFileCounter = ();
	%fnfLastAccessFile = ();
	%google = ();
	%goto = ();
	%hostlist = ();
	%hotbot = ();
	%hourusersessions = ();
	%infoseek = ();
	%lastpages = ();
	%looksmart = ();
	%lycos = ();
	%magellan = ();
	%mamma = ();
	%metacrawler = ();
	%monthusersessions = ();
	%msn = ();
	%netfind = ();
	%netscape = ();
	%northernlight = ();
	%othersearch = ();
	%planetsearch = ();
	%platformreport = ();
	%prevday = ();
	%previouspage = ();
	%prevvisit = ();
	%refdomain = ();
	%savvysearch = ();
	%snap = ();
	%topkeywords = ();
	%webcrawler = ();
	%yahoo = ();
	@files = ();
	@hosts = ();
}

sub ReadOldFile {
	if ($Verbose) { print "  Reading Old Report File: $OldFile\n"; }
	return unless (-e "$FileDir/$OldFile");
	open (OLD,"$FileDir/$OldFile") || die "  Error Opening File: $OldFile\n";
	while (<OLD>) {
		chomp;
		unless ($endhour || $logsegment) {
			($endhour,$endminute,$endsec,
			  $endday,$endmonth,$endyear) =
			  m#^.*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d)#o;
			if ($endhour) {
				$EndDate=
				  "$endyear $MonthToNumber{$endmonth} $endday $endhour $endminute $endsec";
				$InitialEndDate = $EndDate;
			}
		}
		if (/<A NAME="([^"]*)">/oi) {
			$logsegment=$1;
			if ($logsegment ne 'records') { <OLD>; <OLD>; <OLD>; }
			next;
		}
		next unless ($logsegment);
		if ($logsegment eq "monthly") {
			($Accesses,$Bytes,$Domains,$PViews,$Month) = 
			  m#^\s*([\d,]+)\s+([\d,]+)\s+([\d,]+|-)\s+([\d,]+)\s+(\w.{7})#o;
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$Domains =~ s/,//g;
			$PViews =~ s/,//g;
			$MonthlyFilesCounter{$Month}=$Accesses;
			$MonthlyBytesCounter{$Month}=$Bytes;
			$MonthlySessionsCounter{$Month}=$Domains;
			$MonthlyPViewsCounter{$Month}=$PViews;
			$MonthlyTotalBytesCounter+=$Bytes;
			$MonthlyTotalHitsCounter+=$Accesses;
			$MonthlyTotalVisitsCounter+=$Domains;
			$MonthlyTotalPViewsCounter+=$PViews;
			next;
		}
		elsif ($logsegment eq "daily") {
			($Accesses,$Bytes,$Domains,$PViews,$Day,$Month) =
			  m#^\s*([\d,]+)\s+([\d,]+)\s+([\d,]+|-)\s+([\d,]+)\s+(\d\d)\s+(\w\w\w)#o;
			if ($Month) {
				$Accesses =~ s/,//g;
				$Bytes =~ s/,//g;
				$Domains =~ s/,//g;
				$PViews =~ s/,//g;
				$Year=$CurrYear;
				if (($Month =~ "(Nov|Dec)") &&
				  ($CurrMonth =~ "(Jan|Feb)")) {
					$Year=$Year-1;
				}
				$Today="$Year $MonthToNumber{$Month} $Day";
				$DayFilesCounter{$Today}=$Accesses;
				$BytesDay{$Today}=$Bytes;
				$DomainsDay{$Today}=$Domains;
				$PViewsDay{$Today}=$PViews;
				&date_to_count(int($MonthToNumber{$Month}),$Day,($Year-1900));
				if ($DayBreak-$perp_days < 36) {
					$DailyTotalBytesCounter+=$Bytes;
					$DailyTotalHitsCounter+=$Accesses;
					$DailyTotalVisitsCounter+=$Domains;
					$DailyTotalPViewsCounter+=$PViews;
				}
				$Today="$Today 00 00 00";
				$EndDate=$Today if ($Today gt $EndDate);
			}
			next;
		}
		elsif ($logsegment eq "houraverage") {
			($Accesses,$Bytes,$Sessions,$PViews,$Hour) =
			  m#^\s*([\d,]+)\s+([\d,]+)\s+([\d,]+|-)\s+([\d,]+)\s+(\d\d)#o;
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$Sessions =~ s/,//g;
			$PViews =~ s/,//g;
			$HourFilesCounter{$Hour}=($Accesses*3);
			$BytesHour{$Hour}=($Bytes*3);
			unless ($NoSessions) { $VisitsHour{$Hour}=($Sessions*3); }
			$PViewsHour{$Hour}=($PViews*3);
			unless ($HourFilesCounter{$Hour} < 1) { $HourlyDayCounter{$Hour} = 3; }
			next;
		}
		elsif ($logsegment eq "records") {
			$line=$_;
			if ($line =~ m#Most Hits#o) {
				($RecordHits,$RecordHitsDate) =
				$line=~m#([\d,]*)\s\(([^)]*)\)#o;
				$RecordHits =~ s/,//g;
			}
			elsif ($line =~ m#Most Bytes#o) {
				($RecordBytes,$RecordBytesDate) =
				$line=~m#([\d,]*)\s\(([^)]*)\)#o;
				$RecordBytes =~ s/,//g;
			}
			elsif ($line =~ m#Most Visits#o) {
				($RecordVisits,$RecordVisitsDate) =
				$line=~m#([\d,]*)\s\(([^)]*)\)#o;
				$RecordVisits =~ s/,//g;
			}
			elsif ($line =~ m#Most PViews#o) {
				($RecordPViews,$RecordPViewsDate) =
				$line=~m#([\d,]*)\s\(([^)]*)\)#o;
				$RecordPViews =~ s/,//g;
			}
			next;
		}
		elsif ($logsegment eq "files") {
			($Hour,$Minute,$Second,$Day,$Month,$Year,
			  $Accesses,$Bytes,$FileName)=
			  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
			next unless ($Month =~ /$CurrMonth/);
			next if ($FileName =~ /\/[^\/]*\/\.\.\//);
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$HitsFileCounter{$FileName}=$Accesses;
			$BytesFileCounter{$FileName}=$Bytes;
			$LastAccessFile{$FileName}=
			  "$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
			next;
		}
		elsif ($logsegment eq "404") {
			($Hour,$Minute,$Second,$Day,$Month,$Year,
			  $Accesses,$Bytes,$FileName)=
			  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
			next unless ($Month =~ /$CurrMonth/);
			next if ($FileName =~ /\/[^\/]*\/\.\.\//);
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$fnfHitsFileCounter{$FileName}=$Accesses;
			$fnfBytesFileCounter{$FileName}=$Bytes;
			$fnfLastAccessFile{$FileName}="$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
			next;
		}
		elsif ($logsegment eq "entrancepages") {
			($Accesses,$FileName)= m#^\s*([\d,]+)\s+(\S.*)#o;
			$Accesses =~ s/,//g;
			$firstpages{$FileName} = $Accesses;
			next;
		}
		elsif ($logsegment eq "exitpages") {
			($Accesses,$FileName)= m#^\s*([\d,]+)\s+(\S.*)#o;
			$Accesses =~ s/,//g;
			$lastpages{$FileName} = $Accesses;
			next;
		}
		elsif ($logsegment eq "userids") {
			($Hour,$Minute,$Second,$Day,$Month,$Year,
			  $Accesses,$Bytes,$UserID)=
			  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
			next unless ($Month =~ /$CurrMonth/);
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$HitsUserIDCounter{$UserID}=$Accesses;
			$BytesUserIDCounter{$UserID}=$Bytes;
			$LastAccessUserID{$UserID}=
			  "$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
			next;
		}
		elsif ($logsegment eq "topleveldomain") {
			($Hour,$Minute,$Second,$Day,$Month,$Year,
			  $Accesses,$Bytes,$TopDomain)=
			  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\w+)\s+=\s+#o;
			next unless ($Month =~ /$CurrMonth/);
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$TopDomainFilesCounter{$TopDomain}=$Accesses;
			$TopDomainBytesCounter{$TopDomain}=$Bytes;
			$TopDomainAccess{$TopDomain}="$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
			next;
		}
		elsif ($logsegment eq "domains") {
			($Hour,$Minute,$Second,$Day,$Month,$Year,
			  $Accesses,$Bytes,$Domain)=
			  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
			next unless ($Month =~ /$CurrMonth/);
			$Accesses =~ s/,//g;
			$Bytes =~ s/,//g;
			$DomainsFilesCounter{$Domain}=$Accesses;
			$DomainsBytesCounter{$Domain}=$Bytes;
			$LastAccessDomain{$Domain}="$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
			next;
		}
	}
	close (OLD);
	if ($FullListFile) {
		if ($Verbose) { print "  Reading Old \"Full List\" File: $FullListFile\n"; }
		return unless (-e "$FileDir/$FullListFile");
		open (OLD,"$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
		while (<OLD>) {
			chomp;
			if (/<A NAME="([^"]*)">/oi) {
				$logsegment=$1;
				<OLD>; <OLD>; <OLD>;
				next;
			}
			next unless ($logsegment);
			if ($logsegment eq "files") {
				($Hour,$Minute,$Second,$Day,$Month,$Year,
				  $Accesses,$Bytes,$FileName)=
				  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
				next unless ($Month =~ /$CurrMonth/);
				next if ($FileName =~ /\/[^\/]*\/\.\.\//);
				$Accesses =~ s/,//g;
				$Bytes =~ s/,//g;
				$HitsFileCounter{$FileName}=$Accesses;
				$BytesFileCounter{$FileName}=$Bytes;
				$LastAccessFile{$FileName}=
				  "$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
				next;
			}
			elsif ($logsegment eq "404") {
				($Hour,$Minute,$Second,$Day,$Month,$Year,
				  $Accesses,$Bytes,$FileName)=
				  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
				next unless ($Month =~ /$CurrMonth/);
				next if ($FileName =~ /\/[^\/]*\/\.\.\//);
				$Accesses =~ s/,//g;
				$Bytes =~ s/,//g;
				$fnfHitsFileCounter{$FileName}=$Accesses;
				$fnfBytesFileCounter{$FileName}=$Bytes;
				$fnfLastAccessFile{$FileName}="$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
				next;
			}
			elsif ($logsegment eq "entrancepages") {
				($Accesses,$FileName)= m#^\s*([\d,]+)\s+(\S.*)#o;
				$Accesses =~ s/,//g;
				$firstpages{$FileName} = $Accesses;
				next;
			}
			elsif ($logsegment eq "exitpages") {
				($Accesses,$FileName)= m#^\s*([\d,]+)\s+(\S.*)#o;
				$Accesses =~ s/,//g;
				$lastpages{$FileName} = $Accesses;
				next;
			}
			elsif ($logsegment eq "userids") {
				($Hour,$Minute,$Second,$Day,$Month,$Year,
				  $Accesses,$Bytes,$UserID)=
				  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
				next unless ($Month =~ /$CurrMonth/);
				$Accesses =~ s/,//g;
				$Bytes =~ s/,//g;
				$HitsUserIDCounter{$UserID}=$Accesses;
				$BytesUserIDCounter{$UserID}=$Bytes;
				$LastAccessUserID{$UserID}=
				  "$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
				next;
			}
			elsif ($logsegment eq "domains") {
				($Hour,$Minute,$Second,$Day,$Month,$Year,
				  $Accesses,$Bytes,$Domain)=
				  m#^\s*(\d\d):(\d\d):(\d\d) (\d\d) (\w\w\w)\w* (\d\d\d\d) \s*([\d,]+)\s+([\d,]+)\s+(\S.*)#o;
				next unless ($Month =~ /$CurrMonth/);
				$Accesses =~ s/,//g;
				$Bytes =~ s/,//g;
				$DomainsFilesCounter{$Domain}=$Accesses;
				$DomainsBytesCounter{$Domain}=$Bytes;
				$LastAccessDomain{$Domain}="$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
				next;
			}
		}
		close (OLD);
	}
}

sub ReadLog {
	if ($Verbose) { print "  Reading Log File: $LogFile\n"; }
	if ($IPLog) {
		if ($DBMType==1) {
			tie (%Resolved,'AnyDBM_File',"$IPLog",O_RDWR|O_CREAT,0666,$DB_HASH);
		}
		elsif ($DBMType==2) {
			dbmopen(%Resolved,"$IPLog",0666);
		}
		else {
			tie (%Resolved,'AnyDBM_File',"$IPLog",O_RDWR|O_CREAT,0666);
		}
	}
	open (LOGFILE,"$LogFile") || die "  Error Opening File: $LogFile\n";
	$LogLineTotal = 0;
	$LogLineCount = 0;
	$ResolutionCount = 0;
	$logtype = "";
	open (TEMPACCESSES,">$FileDir/tempaccesses.txt");
	while(<LOGFILE>) {
		$LogLineTotal++;
		chomp;
		s/\s+/ /go;
		next if m/format\=\%/i;
		if (m/^#fields:/i) {
			$logtype = "microsoft";
			@logtype = split(/\s/,$_);
			foreach $field (1..(@logtype-1)) {
				if ($logtype[$field] eq "date") { $MSdate = $field-1; }
				if ($logtype[$field] eq "time") { $MStime = $field-1; }
				if ($logtype[$field] eq "c-ip") { $MSdomain = $field-1; }
				if ($logtype[$field] eq "cs-method") { $MSrequest1 = $field-1; }
				if ($logtype[$field] eq "cs-uri-stem") { $MSrequest2 = $field-1; }
				if ($logtype[$field] eq "cs-uri-query") { $MSrequest3 = $field-1; }
				if ($logtype[$field] eq "sc-status") { $MSstatus = $field-1; }
				if ($logtype[$field] eq "sc-bytes") { $MSbytes = $field-1; }
				if ($logtype[$field] eq "cs(User-Agent)") { $MSagent = $field-1; }
				if ($logtype[$field] eq "cs(Referer)") { $MSreferer = $field-1; }
				if ($logtype[$field] eq "cs-username") { $MSusername = $field-1; }
			}
			if ($MSrequest1 && $MSrequest2 && $MSstatus) {
				unless ($MSagent) { $AgentsFile = ""; }
				unless ($MSreferer) { $RefsFile = ""; $KeywordsFile = ""; }
			}
		}
		next if m/^#/;
		$referer = "";
		$Agent = "";
		if ($logtype eq "microsoft") {
			@elements = split(/\s/,$_);
			($Year,$Month,$Day) = $elements[$MSdate] =~ m/^(\d+)-(\d+)-(\d+)/o;
			$Time = $elements[$MStime];
			$TimeDate = "$Day/$NumberToMonth{$Month}/$Year:$Time ";
			$Domain = $elements[$MSdomain];
			if ($MSrequest1) { $Request = $elements[$MSrequest1]; }
			else { $Request = "GET"; }
			$Request .= " $elements[$MSrequest2]";
			if ($MSrequest3) {
				if (length($elements[$MSrequest3]) > 1) {
					$Request .= "?$elements[$MSrequest3]";
				}
			}
			$Request .= " HTTP/1.0";
			$Status = $elements[$MSstatus];
			$Bytes = $elements[$MSbytes];
			if ($MSagent) {
				$Agent = $elements[$MSagent];
				$Agent =~ s/\+/ /g;
				if (length($Agent) < 5) { $Agent = ""; }
			}
			if ($MSreferer) {
				$referer = $elements[$MSreferer];
				if (length($referer) < 5) { $referer = ""; }
			}
			$rfc931 = "-";
			if ($MSusername) { $authuser = $elements[$MSusername]; }
			else { $authuser = "-"; }
		}
		elsif (($Domain,$rfc931,$authuser,$TimeDate,$Request,$Status,$Bytes,$referer,$Agent) =
		  /^(\S+) (\S+) (.+) \[(.+)\] \"(.+)\" (\S+) (\S+) \"(.*)\" \"(.*)\"/o) {
			$logtype = "combined";
			if (length($referer) < 5) { $referer = ""; }
			if (length($Agent) < 5) { $Agent = ""; }
		}
		elsif (($Domain,$rfc931,$authuser,$TimeDate,$Request,$Status,$Bytes) =
		  /^(\S+) (\S+) (.+) \[(.+)\] \"(.+)\" (\S+) (\S+)/o) {
			unless ($logtype) { $logtype = "standard"; }
		}
		elsif (($Domain,$xx,$date,$time,$xx,$xx,$xx,$xx,$xx,$Bytes,$Status,$xx,$Request,$file) =
		  /^([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+),\s*([^\s,]+)/o) {
			unless ($logtype) { $logtype = "standard"; }
			($Month,$Day,$Year) = $date =~ m/^(\d+)\/(\d+)\/(\d+)/o;
			if ($Year > 50) { $Year += 1900; }
			else { $Year += 2000; }
			if (($time < 10) && (length($time) < 8)) { $time = "0".$time; }
			$TimeDate = "$Day/$NumberToMonth{$Month}/$Year:$time ";
			$Request .= " $file HTTP/1.0";
			$rfc931 = "-";
			$authuser = "-";
		}
		else {
			next;
		}
		unless ($Agent =~ /^\w/) { $Agent = ""; }
		if ($Status==403) {
			$Agent = "BannedAccess";	
			$referer = "";
		}
		if ($Status==404) {
			$Agent = "";	
		}
		next if (!($Domain && $rfc931 && $authuser && $TimeDate && $Request && $Status));
		($Day,$Month,$Year,$Hour,$Minute,$Second)=$TimeDate=~
		  m#^(\d+)/(\w\w\w)/(\d\d\d\d):(\d\d):(\d\d):(\d\d) #o;
		if ($HourOffset) {
			&date_to_count(int($MonthToNumber{$Month}),int($Day),($Year-1900));
			$Hour += $HourOffset;
			if ($Hour < 0) {
				$Hour += 24;
				$perp_days -= 1;
				&count_to_date($perp_days);
				$Year = $perp_year+1900;
				$Month = $perp_mon;
				if (length($Month) == 1) { $Month = "0".$Month; }
				$Month = $NumberToMonth{$Month};
				$Day = $perp_day;
			}
			if ($Hour > 23) {
				$Hour -= 24;
				$perp_days += 1;
				&count_to_date($perp_days);
				$Year = $perp_year+1900;
				$Month = $perp_mon;
				if (length($Month) == 1) { $Month = "0".$Month; }
				$Month = $NumberToMonth{$Month};
				$Day = $perp_day;
			}
		}
		if (length($Hour) == 1) { $Hour = "0".$Hour; }
		if (length($Day) == 1) { $Day = "0".$Day; }
		$Today="$Year $MonthToNumber{$Month} $Day $Hour $Minute $Second";
		next if ($EOMDate && ($Today gt $EOMDate));
		$EndDate=$Today if ($Today gt $EndDate);
		$FileEndDate=$Today if ($Today gt $FileEndDate);
		$FileStartDate=$Today if ($Today lt $FileStartDate);
		next unless (!$LogOnlyNew || ($Today gt $InitialEndDate));
		($Method,$FileName,$Protocol)=split(/\s/,$Request,3);
		$FileName=~ s/\%7[eE]/~/o;
		$FileName=~ s#//#/#go;
		$FileName=~ s#\.((s|p)*html*)/.*$#\.$1#o;
		unless ($IncludeQuery) {
			$FileName=~ s#\.(cgi)/.*$#\.$1#o;
			$FileName=~ s#\.(pl)/.*$#\.$1#o;
		}
		$FileName=~ s#^ *$#/#o;
		$FileName=~ s/#.+$//o;
		while ($FileName =~ /\/[^\/]*\/\.\.\//) {
			$FileName =~ s/\/[^\/]*\/\.\.\//\//;
		}
		$target = $FileName;
		unless ($IncludeQuery) {
			$FileName=~s#\?.*$##o;
		}
		$FileName=~ s/${DefaultPageName}$//oi;
		next if (($IncludeOnlyRefsTo)
		  && !($FileName=~m#$IncludeOnlyRefsTo#o));
		next if (($ExcludeRefsTo)
		  && ($FileName=~m#$ExcludeRefsTo#o));
		$FileName=~s#&#\&amp\;#go;
		$FileName=~s#<#\&lt\;#go;
		$FileName=~s#>#\&gt\;#go;
		$FileName=~s#"#\&quot;#go;
		$TrimmedDomain = $Domain;
		$IOD_flag = 0;
		if (($IncludeOnlyDomain) && ($Domain=~m#$IncludeOnlyDomain#o)) {
			$IOD_flag = 1;
		}
		next if (($ExcludeDomain) && ($Domain=~m#$ExcludeDomain#o));
		if (($Domain =~ /\d+\.\d+\.\d+\.\d+/) && !($NoResolve)) {
			$TrimmedDomain =~ s/(\d+\.\d+\.\d+)\.\d+/$1\.XXX/;
			if ($Resolved{$TrimmedDomain}) {
				$Domain = $Resolved{$TrimmedDomain};
			}
			else {
				$ResolutionCount++;
				@bytes = split(/\./, $Domain);
				$packaddr = pack("C4",@bytes);
				$Resolved{$TrimmedDomain} = (gethostbyaddr($packaddr, 2))[0];
				unless ($Resolved{$TrimmedDomain} =~
				  /^[a-zA-Z0-9\-\.]+\.([a-zA-Z]{2,3}|[0-9]{1,3})$/) {
					$Resolved{$TrimmedDomain} = "";
				}
				$Resolved{$TrimmedDomain} = &TrimDomain($Resolved{$TrimmedDomain});
				unless ($Resolved{$TrimmedDomain}) {
					$Resolved{$TrimmedDomain} = "unresolved";
				}
				$Domain = $Resolved{$TrimmedDomain};
			}
			$TrimmedDomain = "$Domain ($TrimmedDomain)";
		}
		else {
			if ($Domain =~ /\d$/) {
				$TrimmedDomain =~ s/(\d+\.\d+\.\d+)\.\d+/$1\.XXX/;
				$Domain = "unresolved";
				$TrimmedDomain = "$Domain ($TrimmedDomain)";
			}
			else {
				$TrimmedDomain = $Domain;
				if ($PrintDomains eq "2") {
					$Domain = &TrimDomain($Domain);
					$TrimmedDomain = "$Domain ($TrimmedDomain)";
				}
			}
		}
		if (($IncludeOnlyDomain) && ($Domain=~m#$IncludeOnlyDomain#o)) {
			$IOD_flag = 1;
		}
		next if (($IncludeOnlyDomain) && !($IOD_flag));
		next if (($ExcludeDomain) && ($Domain=~m#$ExcludeDomain#o));
		$PViewFilter = 0;
		if ((($Status>199)&&($Status<300))||($Status==304)) {
			unless ($DetailsFilter  && ($FileName=~m#$DetailsFilter#oi)) {
				$PViewFilter = 1;
			}
		}
		$Domain=~tr/A-Z/a-z/;
		$TrimmedDomain=~tr/A-Z/a-z/;
		if ($PrintUserIDs && (length($authuser) > 1)) {
			$UserID = $authuser." (".$Domain.")";
		}
		if (!($EOMDate) && $referer && ($RefsFile || $KeywordsFile)) {
			$target=~ s/\?.*$//o;
			$target=~ s/${DefaultPageName}$//oi;
			$target = &Simplify($target);
			$referer=~ s/\%7[eE]/~/o;
			$referer=~ s#^(http://[^/]+):80/#$1/#o;
			$refdomain = "";
			$refquery = "";
			if ($referer =~ m#srd\.yahoo\.com/goo/([^/]+)/\d+/#oi) {
				$refquery = $1;
			}
			elsif ($referer =~ m#srd\.yahoo\.com/[d|s]rst/\d+/([^/]+)/\d+/#oi) {
				$refquery = $1;
			}
			elsif ($referer =~ m#\?(.+)#o) {
				$refquery = $1;
			}
			$referer=~ s/#.*$//o;
			$referer=~ s/\?.*$//o;
			$referer=~ s/\*.*$//o;
			$referer=~ s/${DefaultPageName}$//oi;
			$referer = &Simplify($referer);
			unless (($refsexcludefrom && ($referer =~ m#$refsexcludefrom#oi))
			  || ($refsexcludeto && ($target =~ m#$refsexcludeto#oi))) {
				$keyform=$target.' '.$referer;
				$keyform=~ s#\&#\&amp\;#og;
				$keyform=~ s#<#\&lt\;#og;
				$keyform=~ s#>#\&gt\;#og;
				$keyform=~ s#"#\&quot\;#og;
				$referer=~ s#\&#\&amp\;#og;
				$referer=~ s#<#\&lt\;#og;
				$referer=~ s#>#\&gt\;#og;
				$referer=~ s#"#\&quot\;#og;
				$TargetCounter{$keyform}++;
			}
			else {
				$referer = "";
			}
			if ($referer =~ m#^.+//([\w|\.|-]+)#o) {
				$refdomain = $1;
			}
			unless ($refdomain =~ /\d$/) {
				if ($refdomain =~ /([^.]*\.[^.]{3,})$/) {
					$refdomain{$1}++;
				}
				elsif ($refdomain =~ /([^.]*\.[^.]{1,3}\.[^.]*)$/) {
					$refdomain{$1}++;
				}
				elsif ($refdomain =~ /([^.]*\.[^.]*)$/) {
					$refdomain{$1}++;
				}
			}
			if ($referer && $refquery) {
				$refquery =~ tr/A-Z/a-z/;
				$refquery =~ s/\%25/\%/g;
				$refquery =~ s/%([0-7][a-fA-F0-9])/pack("C", hex($1))/eg;
				$refquery =~ s/%([a-fA-F8-9][a-fA-F0-9])/ /eg;
				$refquery =~ s/<([^>]|\n)*(>|$)/ /g;
				$refquery =~ s/"//gi;
				$refquery =~ s/\+/ /g;
				$refquery =~ s/\-/ /g;
				$refquery =~ s/\s+/ /g;
				$refquery =~ s/\s$//g;
				$refquery =~ s/\s&/&/g;
				$refquery =~ s/\s;/;/g;
				$refquery =~ s/xspc/ /g;
				if (($refdomain =~ /about\.com/i) && ($refquery =~ /terms=\s*([^&;]+)/i)) {
					$aboutcom{$1}++;
					$topkeywords{$1}++;
				}
				elsif ($refdomain =~ /altavista/i) {
					if (($refquery =~ /\&q=\s*([^&;]+)/i)
					  || ($refquery =~ /^q=\s*([^&;]+)/i)) {
						$altavista{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /alltheweb/i) && ($refquery =~ /query=\s*([^&;]+)/i)) {
					$fast{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /directhit/i) && ($refquery =~ /qry=\s*([^&;]+)/i)) {
					$directhit{$1}++;
					$topkeywords{$1}++;
				}
				elsif ($refdomain =~ /\.aol\./i) {
					if (($refquery =~ /search=\s*([^&;]+)/i)
					  || ($refquery =~ /\&s=\s*([^&;]+)/i)
					  || ($refquery =~ /^s=\s*([^&;]+)/i)
					  || ($refquery =~ /\query=\s*([^&;]+)/i)) {
						$netfind{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /aj\.com/i) || ($refdomain =~ /ask\.com/i)
				  || ($refdomain =~ /askjeeves/i)) {
					if (($refquery =~ /ask=\s*([^&;]+)/i)
					  || ($refquery =~ / qry (.*) rnk /i)) {
						$askjeeves{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /cnet/i) || ($refdomain =~ /search\.com/i)) {
					if (($refquery =~ /query=\s*([^&;]+)/i)
					  || ($refquery =~ /\&q=\s*([^&;]+)/i)
					  || ($refquery =~ /^q=\s*([^&;]+)/i)) {
						$cnet{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /dogpile/i) && ($refquery =~ /q=\s*([^&;]+)/i)) {
					$dogpile{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /euroferret/i) && ($refquery =~ /p=\s*([^&;]+)/i)) {
					$euroferret{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /euroseek/i) && ($refquery =~ /query=\s*([^&;]+)/i)) {
					$euroseek{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /magellan/i) || ($refdomain =~ /mckinley/i)) {
					if (($refquery =~ /search=\s*([^&;]+)/i)
					  || ($refquery =~ /\&s=\s*([^&;]+)/i)
					  || ($refquery =~ /^s=\s*([^&;]+)/i)) {
						$magellan{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif ($refdomain =~ /excite/i) {
					if (($refquery =~ /search=\s*([^&;]+)/i)
					  || ($refquery =~ /\&s=\s*([^&;]+)/i)
					  || ($refquery =~ /^s=\s*([^&;]+)/i)) {
						$excite{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /google/i) && ($refdomain !~ /yahoo/i)) {
					if (($refquery =~ /q=\s*([^&;]+)/i)
					  || ($refquery =~ /query=\s*([^&;]+)/i)) {
					  	unless (($1 =~ /^cache:/) || (length($1) < 3)) {
							$google{$1}++;
							$topkeywords{$1}++;
						}
					}
				}
				elsif (($refdomain =~ /goto/i) && ($refquery =~ /keywords=\s*([^&;]+)/i)) {
					$goto{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /hotbot/i)
				  && (($refquery =~ /mt=\s*([^&;]+)/i)
				  || ($refquery =~ /query=\s*([^&;]+)/i))) {
					$hotbot{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /lycos/i)
				  && (($refquery =~ /mt=\s*([^&;]+)/i)
				  || ($refquery =~ /query=\s*([^&;]+)/i))) {
					$lycos{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /infoseek/i)
				  || ($refdomain =~ /^go\.com/i) || ($refdomain =~ /\.go\.com/i)) {
					$iseek = "";
					if ($refquery =~ /qt=\s*([^&;]+)/i) { $iseek .= $1; }
					if ($refquery =~ /oq=\s*([^&;]+)/i) { $iseek .= " ".$1; }
					$iseek =~ s/^\s+//g;
					$iseek =~ s/\s+/ /g;
					if ($iseek) {
						$infoseek{$iseek}++;
						$topkeywords{$iseek}++;
					}
				}
				elsif (($refdomain =~ /looksmart/i) && ($refquery =~ /key=\s*([^&;]+)/i)) {
					$looksmart{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /mamma/i) && ($refquery =~ /query=\s*([^&;]+)/i)) {
					$mamma{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /metacrawler/i) || ($refdomain =~ /go2net/i)) {
					if ($refquery =~ /general=\s*([^&;]+)/i) {
						$metacrawler{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif ($refdomain =~ /msn/i) {
					if (($refquery =~ /mt=\s*([^&;]+)/i)
					  || ($refquery =~ /\&q=\s*([^&;]+)/i)
					  || ($refquery =~ /^q=\s*([^&;]+)/i)) {
						$msn{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /netscape/i) && ($refquery =~ /search=\s*([^&;]+)/i)) {
					$netscape{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /northernlight/i) && ($refquery =~ /qr=\s*([^&;]+)/i)) {
					$northernlight{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /planetsearch/i) && ($refquery =~ /text=\s*([^&;]+)/i)) {
					$planetsearch{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /savvysearch/i) && ($refquery =~ /q=\s*([^&;]+)/i)) {
					$savvysearch{$1}++;
					$topkeywords{$1}++;
				}
				elsif (($refdomain =~ /snap/i) || ($refdomain =~ /nbci/i)) {
					if (($refquery =~ /keyword=\s*([^&;]+)/i)
					 || ($refquery =~ /k=\s*([^&;]+)/i)) {
						$snap{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif ($refdomain =~ /webcrawler/i) {
					if (($refquery =~ /search=\s*([^&;]+)/i)
					  || ($refquery =~ /searchtext=\s*([^&;]+)/i)
					  || ($refquery =~ /text=\s*([^&;]+)/i)) {
						$webcrawler{$1}++;
						$topkeywords{$1}++;
					}
				}
				elsif (($refdomain =~ /yahoo/i) && ($refquery =~ /p=\s*([^&;]+)/i)) {
					$yahoo{$1}++;
					$topkeywords{$1}++;
				}
				elsif ($refdomain =~ /srd.yahoo/i) {
					$yahoo{$refquery}++;
					$topkeywords{$refquery}++;
				}
				elsif (($refquery =~ /general=\s*([^&;]+)/i)
				  || ($refquery =~ /key=\s*([^&;]+)/i)
				  || ($refquery =~ /keyword=\s*([^&;]+)/i)
				  || ($refquery =~ /keywords=\s*([^&;]+)/i)
				  || ($refquery =~ /mt=\s*([^&;]+)/i)
				  || ($refquery =~ /\&q=\s*([^&;]+)/i)
				  || ($refquery =~ /^q=\s*([^&;]+)/i)
				  || ($refquery =~ /qry=\s*([^&;]+)/i)
				  || ($refquery =~ /query=\s*([^&;]+)/i)
				  || ($refquery =~ /search=\s*([^&;]+)/i)
				  || ($refquery =~ /searchfor=\s*([^&;]+)/i)
				  || ($refquery =~ /string=\s*([^&;]+)/i)
				  || ($refquery =~ /term=\s*([^&;]+)/i)
				  || ($refquery =~ /terms=\s*([^&;]+)/i)
				  || ($refquery =~ /text=\s*([^&;]+)/i)
				  || ($refquery =~ /topic=\s*([^&;]+)/i)) {
				  	unless ($1 =~ /^[\d\.]*$/) {
					  	unless (($1 =~ /^cache:/) || (length($1) < 3)) {
							$othersearch{$1}++;
							$topkeywords{$1}++;
						}
					}
				}
			}
		}
		if ($Agent) {
			$Agent =~ s/\&/\&amp\;/go;
			$Agent =~ s/"/\&quot\;/go;
			$Agent =~ s/</\&lt\;/go;
			$Agent =~ s/>/\&gt\;/go;
			($mainagent,$other) = split(/ [ \n]/,$Agent,2);
			if (!($EOMDate) && $AgentsFile) {
				unless ($AgentsIgnore && ($FileName=~m#$AgentsIgnore#oi)) {
					$refscounter++;
					$agentcounter{$mainagent}++;
				}
			}
		}
		else { $mainagent = "-"; }
		if ($Bytes eq "-") { $Bytes = 0; }
		if ($Status<400) { $Bytes+=250; }
		else { $Bytes+=500; }
		$HourFilesCounter{$Hour}++;
		if ($BytesHour{$Hour}) { $BytesHour{$Hour}+=$Bytes; }
		else { $BytesHour{$Hour} = $Bytes; }
		&date_to_count(int($MonthToNumber{$Month}),$Day,($Year-1900));
		$MonthlyFilesCounter{"$Month $Year"}++;
		if ($MonthlyBytesCounter{"$Month $Year"}) { $MonthlyBytesCounter{"$Month $Year"}+=$Bytes; }
		else { $MonthlyBytesCounter{"$Month $Year"} = $Bytes; }
		$Today="$Year $MonthToNumber{$Month} $Day";
		$DayFilesCounter{$Today}++;
		if ($BytesDay{$Today}) { $BytesDay{$Today}+=$Bytes; }
		else { $BytesDay{$Today} = $Bytes; }
		if ($PViewFilter) {
			$MonthlyPViewsCounter{"$Month $Year"}++;
			$MonthlyTotalPViewsCounter++;
			$PViewsDay{$Today}++;
			$PViewsHour{$Hour}++;
		}
		$Today="$Today $Hour $Minute $Second";
		$TopDomain=&GetTopDomain($Domain);
		if ($Month =~ /$CurrMonth/) {
			if ($PrintDomains) {
				$DomainsFilesCounter{$Domain}++;
				if ($DomainsBytesCounter{$Domain}) { $DomainsBytesCounter{$Domain}+=$Bytes; }
				else { $DomainsBytesCounter{$Domain} = $Bytes; }
				unless ($LastAccessDomain{$Domain}) { $LastAccessDomain{$Domain} = 0; }
				if ($LastAccessDomain{$Domain} lt $Today) {
					$LastAccessDomain{$Domain}=$Today;
				}
			}
			$TopDomainFilesCounter{$TopDomain}++;
			if ($TopDomainBytesCounter{$TopDomain}) { $TopDomainBytesCounter{$TopDomain}+=$Bytes; }
			else { $TopDomainBytesCounter{$TopDomain} = $Bytes; }
			if ($TopDomainAccess{$TopDomain} lt $Today) {
				$TopDomainAccess{$TopDomain} = $Today;
			}
		}
		$MonthlyTotalBytesCounter+=$Bytes;
		$MonthlyTotalHitsCounter++;
		if ($DayBreak-$perp_days < 36) {
			$DailyTotalBytesCounter+=$Bytes;
			$DailyTotalHitsCounter++;
			if ($PViewFilter) {
				$DailyTotalPViewsCounter++;
			}
		}
		$TodayBytes+=$Bytes;
		if ($PrintUserIDs && (length($authuser) > 1)) {
			if ($Month =~ /$CurrMonth/) {
				if ($PrintUserIDs) {
					$HitsUserIDCounter{$UserID}++;
					if ($BytesUserIDCounter{$UserID}) { $BytesUserIDCounter{$UserID}+=$Bytes; }
					else { $BytesUserIDCounter{$UserID} = $Bytes; }
					if ($LastAccessUserID{$UserID} lt $Today) {
						$LastAccessUserID{$UserID}=$Today;
					}
				}
			}
		}
		if ($Status==404) {
			if ($Month =~ /$CurrMonth/) {
				if ($Print404) {
					$fnfHitsFileCounter{$FileName}++;
					if ($fnfBytesFileCounter{$FileName}) { $fnfBytesFileCounter{$FileName}+=$Bytes; }
					else { $fnfBytesFileCounter{$FileName} = $Bytes; }
					if ($fnfLastAccessFile{$FileName} lt $Today) {
						$fnfLastAccessFile{$FileName}=$Today;
					}
				}
			}
		}
		unless ((($Status>199)&&($Status<300))||($Status==304)) {
			$ErrorName = $FileName;
			$FileName = $RespCodes{$Status};
		}
		if ($Month =~ /$CurrMonth/) {
			if ($PrintFiles) {
				$HitsFileCounter{$FileName}++;
				if ($BytesFileCounter{$FileName}) { $BytesFileCounter{$FileName}+=$Bytes; }
				else { $BytesFileCounter{$FileName} = $Bytes; }
				if ($LastAccessFile{$FileName} lt $Today) {
					$LastAccessFile{$FileName}=$Today;
				}
			}
		}
		unless ($RefsFile) { $referer = "-"; }
		unless ($referer) { $referer = "-"; }
		unless ($AgentPlatform{$mainagent}) {
			if ($mainagent eq "-") {
				$AgentPlatform{$mainagent} = "Other Agent (Unknown Platform)";
			}
			else {
				$agent = $mainagent;
				&Identify_Agent;
				&Identify_Platform;
				$AgentPlatform{$mainagent} = "$longagent";
				if ($shortplatform) { $AgentPlatform{$mainagent} .= " ($shortplatform)"; }
			}
		}
		unless ((($Status>199)&&($Status<300))||($Status==304)) {
			if (($Status>299)&&($Status<400)) { $TodayHits++; }
			elsif ($Status==403) { $TodayBanned++; }
			else { $TodayErrors++; }
			unless ($Status==403) {
				unless ($DetailsFilter  && ($ErrorName=~m#$DetailsFilter#oi)) {
					$TodayPagesErrors++;
					unless ($NoSessions) {
						$ErrorName =~ s/`//;
						print TEMPACCESSES "$Day`$Month`$perp_days`$Hour`$Minute`$Second`$TrimmedDomain`$FileName = $ErrorName`$referer`$AgentPlatform{$mainagent}\n";
					}
				}
			}
		}
		else {
			$TodayHits++;
			if ($PViewFilter) {
				if ($OrgDomain && ($Domain !~ /nresolve/)) {
					if (($Domain !~ /\./) || ($Domain =~ /.*$OrgDomain/)) {
						$TodayLocal++;
					}
				}
				$TodayPagesHits++;
				$TodayDomains{$TopDomain}++;
				$TodayHosts{$TrimmedDomain}++;
				unless ($NoSessions) {
					print TEMPACCESSES "$Day`$Month`$perp_days`$Hour`$Minute`$Second`$TrimmedDomain`$FileName`$referer`$AgentPlatform{$mainagent}\n";
				}
			}
		}
		$LogLineCount++;
	}
	close (TEMPACCESSES);
	close (LOGFILE);
	if ($IPLog) {
		if ($DBMType==2) { dbmclose (%Resolved); }
		else { untie %Resolved; }
	}
	unless (($logtype eq "combined") || ($logtype eq "microsoft")) {
		unless ($logtype eq "standard") {
			if ($Verbose) { print "    Error: Empty log file or unrecognized log format\n"; }
			return;
		}
		$RefsFile = "";
		$KeywordsFile = "";
		$AgentsFile = "";
	}
	if ($Verbose) { print "    ",&commas($LogLineCount)," of ",&commas($LogLineTotal)," log entries processed\n"; }
	if ($Verbose) { print "    ",&commas($ResolutionCount)," IP addresses resolved\n"; }
}

sub GetTopDomain {
	local($domname) = $_[0];
	($TopDomain)=($domname=~m#\.(\w+)$#o);
	$TopDomain=~tr/A-Z/a-z/;
	$TopDomain=~s/\d//g;
	$TopDomain="xxx" if ($TopDomain eq "");
	unless ($CountryCodes{$TopDomain}) { $TopDomain = "ooo"; }
	return $TopDomain;
}

sub TrimDomain {
	local($trimresult) = $_[0];
	$trimresult =~ s/[^\.]*\.(.*)/$1/;
	if ($PrintDomains eq "2") {
		if ($trimresult =~ /([^.]*\.[^.]{3,})$/) {
			$trimresult = $1;
		}
		elsif ($trimresult =~ /([^.]*\.[^.]{1,3}\.[^.]*)$/) {
			$trimresult = $1;
		}
		elsif ($trimresult =~ /([^.]*\.[^.]*)$/) {
			$trimresult = $1;
		}
	}
	return $trimresult;
}

sub PrintReport {
	open (REPORT,">$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	print REPORT "<HTML><HEAD><TITLE>Overall Activity Report: $SystemName</TITLE></HEAD>";
	print REPORT "<BODY $bodyspec>\n";
	if ($headerfile) { &Header; }
	print REPORT "<H1 ALIGN=CENTER>Overall Activity Report:<BR>$SystemName</H1>\n";
	unless ($EndDate eq "0000 00 00 00 00 00") {
		print REPORT "<P ALIGN=CENTER><STRONG>(Accesses Through ";
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$EndDate);
		print REPORT "$Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year)</STRONG></P>\n";
	}
	if ($FullListFile && ($PrintFiles || $Print404 || $PrintUserIDs || $PrintDomains)) {
		close (REPORT);
		open (REPORT,">$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
		print REPORT "<HTML><HEAD><TITLE>Overall Activity Report (Full Lists): $SystemName</TITLE></HEAD>";
		print REPORT "<BODY $bodyspec>\n";
		if ($headerfile) { &Header; }
		print REPORT "<H1 ALIGN=CENTER>Overall Activity Report (Full Lists):<BR>$SystemName</H1>\n";
		unless ($EndDate eq "0000 00 00 00 00 00") {
			print REPORT "<P ALIGN=CENTER><STRONG>(Accesses Through ";
			($Year,$Month,$Day,$Hour,$Minute,$Second)=
			  split(/ /,$EndDate);
			print REPORT "$Hour:$Minute:$Second $Day ";
			print REPORT "$NumberToMonth{$Month} $Year)</STRONG></P>\n";
		}
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
	if (!($EOMDate) && ($DetailsFile || $RefsFile || $KeywordsFile || $AgentsFile)) {
		print REPORT "<P ALIGN=CENTER>|";
		if ($DetailsFile) {
			print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
		}
		if ($RefsFile) {
			print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
		}
		if ($KeywordsFile) {
			print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
		}
		if ($AgentsFile) {
			print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
		}
		print REPORT "</P>\n";
	}
	print REPORT "<A NAME=\"index\"><HR></A>\n";
	print REPORT "<H2 ALIGN=CENTER>Index</H2>\n";
	print REPORT "<P><CENTER><TABLE><TR>\n";
	print REPORT "<TD VALIGN=TOP>\n";
	print REPORT "<P ALIGN=CENTER><STRONG>Long-Term Statistics:</STRONG></P><P><UL>\n";
	print REPORT "<LI><A HREF=\"#monthly\">Monthly Statistics</A>\n";
	print REPORT "<LI><A HREF=\"#daily\">Daily Statistics (Past Five Weeks)</A>\n";
	print REPORT "<LI><A HREF=\"#dayofweek\">Day of Week Averages</A>\n";
	print REPORT "<LI><A HREF=\"#houraverage\">Hourly Averages</A>\n";
	print REPORT "<P><LI><A HREF=\"#records\">&quot;Record Book&quot;</A>\n";
	print REPORT "</UL></P></TD><TD><P>&nbsp; &nbsp; &nbsp</P>";
	print REPORT "</TD><TD VALIGN=TOP>\n";
	print REPORT "<P ALIGN=CENTER><STRONG>Statistics for the Current Month ($CurrMonth $CurrYear):</STRONG></P><P><UL>\n";
	if ($PrintFiles) {
		if ($PrintTopNFiles) {
			print REPORT "<LI><A HREF=\"#topnfilesbyhits\">Top $PrintTopNFiles Files by Number of Hits</A>\n";
			print REPORT "<LI><A HREF=\"#topnfilesbyvolume\">Top $PrintTopNFiles Files by Volume</A>\n";
		}
		print REPORT "<LI><A HREF=\"$FullListFile";
		print REPORT "#files\">Complete File Statistics</A><P>\n";
	}
	if ($Print404) {
		if ($PrintTopNFiles) {
			print REPORT "<LI><A HREF=\"#topn404\">Top $PrintTopNFiles Most Frequently Requested 404 Files</A>\n";
		}
		print REPORT "<LI><A HREF=\"$FullListFile";
		print REPORT "#404\">Complete 404 File Not Found Statistics</A><P>\n";
	}
	if ($PrintFiles) {
		if ($PrintTopNFiles) {
			print REPORT "<LI><A HREF=\"#topentrance\">Top $PrintTopNFiles &quot;Entrance&quot; Pages</A>\n";
		}
		print REPORT "<LI><A HREF=\"$FullListFile";
		print REPORT "#entrancepages\">Complete &quot;Entrance&quot; Page List</A>\n";
		if ($PrintTopNFiles) {
			print REPORT "<LI><A HREF=\"#topexit\">Top $PrintTopNFiles &quot;Exit&quot; Pages</A>\n";
		}
		print REPORT "<LI><A HREF=\"$FullListFile";
		print REPORT "#exitpages\">Complete &quot;Exit&quot; Page List</A><P>\n";
	}
	if ($PrintUserIDs) {
		print REPORT "<LI><A HREF=\"$FullListFile";
		print REPORT "#userids\">User ID Statistics</A><P>\n";
	}
	print REPORT "<LI><A HREF=\"#topleveldomain\">\"Top Level\" Domains</A>\n";
	if ($PrintDomains) {
		if ($PrintTopNDomains) {
			print REPORT "<LI><A HREF=\"#topnsitesbyhits\">Top $PrintTopNDomains Domains by Number of Hits</A>\n";
			print REPORT "<LI><A HREF=\"#topnsitesbyvolume\">Top $PrintTopNDomains Domains by Volume</A>\n";
		}
		print REPORT "<LI><A HREF=\"$FullListFile";
		print REPORT "#domains\">Complete Domain Statistics</A>\n";
	}
	print REPORT "</UL></P></TD></TR></TABLE></CENTER></P>\n";
	print REPORT "<P><CENTER><TABLE BORDER CELLPADDING=6><TR>\n";
	print REPORT "<TD><P ALIGN=CENTER><BIG><STRONG>Key Terms:</STRONG></BIG>\n";
	print REPORT "<P ALIGN=CENTER><STRONG>Hits:</STRONG> The total number of files requested from the server.\n";
	print REPORT "<BR><STRONG>Bytes:</STRONG> The amount of information transferred in filling those requests.\n";
	print REPORT "<BR><STRONG>Visits:</STRONG> The (approximate) number of actual individual visitors.\n";
	print REPORT "<BR><STRONG>PViews:</STRONG> The number of Web pages viewed by those visitors.\n";
	print REPORT "<P ALIGN=CENTER>The bar graphs below are based upon ";
	if ($GraphBase eq "hits") { print REPORT "number of hits"; }
	elsif ($GraphBase eq "visits") { print REPORT "number of visitors"; }
	elsif ($GraphBase eq "pviews") { print REPORT "page views"; }
	else { print REPORT "bytes transferred"; }
	print REPORT ".</P></TD>\n";
	print REPORT "</TR></TABLE></CENTER></P>\n";
	&PrintMonthlyReport;
	&PrintDailyReport;
	&PrintDayofWeekReport;
	&PrintHourlyReport;
	&PrintRecords;
	if ($PrintFiles) {
		if ($PrintTopNFiles) {
			&PrintTopNFilesByHitsReport;
			&PrintTopNFilesByVolumeReport;
		}
		&PrintFilesReport;
	}
	if ($Print404) {
		if ($PrintTopNFiles) {
			&PrintTopN404Report;
		}
		&Print404Report;
	}
	if ($PrintFiles) {
		if ($PrintTopNFiles) {
			&PrintTopNEntranceReport;
		}
		&PrintEntranceReport;
		if ($PrintTopNFiles) {
			&PrintTopNExitReport;
		}
		&PrintExitReport;
	}
	if ($PrintUserIDs) {
		&PrintUserIDsReport;
	}
	&PrintTopLevelDomainsReport;
	if ($PrintDomains) {
		if ($PrintTopNDomains) {
			&PrintTopNDomainsByHitsReport;
			&PrintTopNDomainsByVolumeReport;
		}
		&PrintReversedDomainsReport;
	}
	print REPORT "<HR>\n";
	if (!($EOMDate) && ($DetailsFile || $RefsFile || $KeywordsFile || $AgentsFile)) {
		print REPORT "<P ALIGN=CENTER>|";
		if ($DetailsFile) {
			print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
		}
		if ($RefsFile) {
			print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
		}
		if ($KeywordsFile) {
			print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
		}
		if ($AgentsFile) {
			print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
		}
		print REPORT "</P>\n";
	}
	print REPORT "<P ALIGN=CENTER>";
	print REPORT "<SMALL>This report was generated with ";
	print REPORT "<STRONG><A HREF=";
	print REPORT "\"http://awsd.com/scripts/weblog/\">";
	print REPORT "WebLog $version</A></STRONG></SMALL></P>\n";
	if ($footerfile) { &Footer; }
	print REPORT "</BODY></HTML>\n";
	close (REPORT);
	if ($FullListFile && ($PrintFiles || $Print404 || $PrintUserIDs || $PrintDomains)) {
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
		print REPORT "<HR>\n<P ALIGN=CENTER>";
		print REPORT "<SMALL>This report was generated with ";
		print REPORT "<STRONG><A HREF=";
		print REPORT "\"http://awsd.com/scripts/weblog/\">";
		print REPORT "WebLog $version</A></STRONG></SMALL></P>\n";
		if ($footerfile) { &Footer; }
		print REPORT "</BODY></HTML>\n";
		close (REPORT);
	}
}

sub PrintMonthlyReport {
	print REPORT "<A NAME=\"monthly\"><HR></A><H2 ALIGN=CENTER>Monthly Statistics</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "        Hits               Bytes      Visits      PViews      Month\n\n";
	($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$EndDate);
	&date_to_count(int($Month),$Day,($Year-1900));
	$MonthlyCounter{$perp_mons}="$Month $Year";
	$MonthCounter = $perp_mons;
	foreach $key (1..$perp_mons) {
		&count_to_mon($key);
		if (length($perp_mon) == 1) { $perp_mon = "0".$perp_mon; }
		$perp_year = $perp_year + 1900;
		$MonthlyCounter{$key}="$NumberToMonth{$perp_mon} $perp_year";
		unless ($MonthlySessionsCounter{$MonthlyCounter{$key}}) {
			$MonthlySessionsCounter{$MonthlyCounter{$key}} = 0;
		}
		unless ($monthusersessions{$key}) { $monthusersessions{$key} = 0; }
		$MonthlySessionsCounter{$MonthlyCounter{$key}} +=
		  $monthusersessions{$key};
		$MonthlyTotalVisitsCounter += $monthusersessions{$key};
	}
	foreach $key (1..$perp_mons) {
		&count_to_mon($key);
		if (length($perp_mon) == 1) { $perp_mon = "0".$perp_mon; }
		$perp_year = $perp_year + 1900;
		$MonthlyCounter{$key}="$NumberToMonth{$perp_mon} $perp_year";
		unless ($MonthlyBytesCounter{$MonthlyCounter{$key}}) {
			unless ($GoMonthly) {
				$MonthCounter--;
				next;
			}
			$MonthlyFilesCounter{$MonthlyCounter{$key}} = 0;
			$MonthlyBytesCounter{$MonthlyCounter{$key}} = 0;
			$MonthlySessionsCounter{$MonthlyCounter{$key}} = 0;
			$MonthlyPViewsCounter{$MonthlyCounter{$key}} = 0;
		}
		unless ($MonthlyPViewsCounter{$MonthlyCounter{$key}}) {
			$MonthlyPViewsCounter{$MonthlyCounter{$key}} = 0;
		}
		$GoMonthly = 1;
		if ($NoSessions) { $MonthlySessionsCounter{$MonthlyCounter{$key}} = "-"; }
		printf REPORT "%12s%20s%12s%12s%13s",&commas($MonthlyFilesCounter{$MonthlyCounter{$key}}),
		  &commas($MonthlyBytesCounter{$MonthlyCounter{$key}}),&commas($MonthlySessionsCounter{$MonthlyCounter{$key}}),&commas($MonthlyPViewsCounter{$MonthlyCounter{$key}}),
		  " $MonthlyCounter{$key}  ";
		if ($GraphBase eq "hits") {
			if ($MonthlyTotalHitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($MonthlyFilesCounter{$MonthlyCounter{$key}}/$MonthlyTotalHitsCounter)*($MonthCounter*10))+.5);
			}
		}
		elsif ($GraphBase eq "visits") {
			if ($MonthlyTotalVisitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($MonthlySessionsCounter{$MonthlyCounter{$key}}/$MonthlyTotalVisitsCounter)*($MonthCounter*10))+.5);
			}
		}
		elsif ($GraphBase eq "pviews") {
			if ($MonthlyTotalPViewsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($MonthlyPViewsCounter{$MonthlyCounter{$key}}/$MonthlyTotalPViewsCounter)*($MonthCounter*10))+.5);
			}
		}
		else {
			if ($MonthlyTotalBytesCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($MonthlyBytesCounter{$MonthlyCounter{$key}}/$MonthlyTotalBytesCounter)*($MonthCounter*10))+.5);
			}
		}
		&PrintBarGraph;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub PrintBarGraph {
	if ($GraphURL) {
		unless ($Percent<8) {
			print REPORT "<IMG SRC=\"$GraphURL/bar1.gif\" HEIGHT=7 WIDTH=32 ALT=\"\">";
			$Percent=$Percent-8;
		}
		unless ($Percent<6) {
			print REPORT "<IMG SRC=\"$GraphURL/bar2.gif\" HEIGHT=7 WIDTH=24 ALT=\"\">";
			$Percent=$Percent-6;
		}
		unless ($Percent<4) {
			print REPORT "<IMG SRC=\"$GraphURL/bar3.gif\" HEIGHT=7 WIDTH=16 ALT=\"\">";
			$Percent=$Percent-4;
		}
		unless ($Percent<2) {
			print REPORT "<IMG SRC=\"$GraphURL/bar4.gif\" HEIGHT=7 WIDTH=8 ALT=\"\">";
			$Percent=$Percent-2;
		}
		unless ($Percent == 0) {
			print REPORT "<IMG SRC=\"$GraphURL/bar5.gif\" HEIGHT=7 WIDTH=",4*$Percent," ALT=\"\">";
		}
	}
	print REPORT "\n";
}

sub PrintDailyReport {
	print REPORT "<A NAME=\"daily\"><HR></A><H2 ALIGN=CENTER>Daily Statistics (Past Five Weeks)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "        Hits               Bytes      Visits      PViews       Date\n\n";
	$DayCount=36;
	($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$EndDate);
	&date_to_count(int($Month),$Day,($Year-1900));
	$FinalDay = $perp_days;
	$FinalDayOK = 0;
	if ($Hour>12) { $FinalDayOK = 1; }
	$DayCount = $DayCount-($DayBreak-$FinalDay);
	foreach $key (($DayBreak-35)..$FinalDay) {
		&count_to_date($key);
		$Year = $perp_year+1900;
		$Month = $perp_mon;
		if (length($Month) == 1) { $Month = "0".$Month; }
		$Day = $perp_day;
		if (length($Day) == 1) { $Day = "0".$Day; }
		$Today="$Year $Month $Day";
		unless ($DomainsDay{$Today}) { $DomainsDay{$Today} = 0; }
		unless ($dayusersessions{$key}) { $dayusersessions{$key} = 0; }
		$DomainsDay{$Today} += $dayusersessions{$key};
		$DailyTotalVisitsCounter += $dayusersessions{$key};
	}
	foreach $key (($DayBreak-35)..$FinalDay) {
		&count_to_date($key);
		$Year = $perp_year+1900;
		$Month = $perp_mon;
		if (length($Month) == 1) { $Month = "0".$Month; }
		$Day = $perp_day;
		if (length($Day) == 1) { $Day = "0".$Day; }
		$Today="$Year $Month $Day";
		unless ($BytesDay{$Today}) {
			unless ($GoDaily) {
				$DayCount--;
				next;
			}
			$DayFilesCounter{$Today} = 0;
			$BytesDay{$Today} = 0;
			$DomainsDay{$Today} = 0;
			$PViewsDay{$Today} = 0;
		}
		unless ($PViewsDay{$Today}) {
			$PViewsDay{$Today} = 0;
		}
		$GoDaily = 1;
		$WhichDay = ($key-(int($key/7)*7));
		if ($WhichDay > 2) { $WhichDay -= 2; }
		else { $WhichDay += 5; }
		if ($WhichDay==1) { print REPORT "\n"; }
		$RecordDate = "$NumberToMonth{$Month} $Day, $Year";
		if ($DayFilesCounter{$Today} > $RecordHits) {
			$RecordHits = $DayFilesCounter{$Today};
			$RecordHitsDate = $RecordDate;
		}
		if ($BytesDay{$Today} > $RecordBytes) {
			$RecordBytes = $BytesDay{$Today};
			$RecordBytesDate = $RecordDate;
		}
		if ($DomainsDay{$Today} > $RecordVisits) {
			$RecordVisits = $DomainsDay{$Today};
			$RecordVisitsDate = $RecordDate;
		}
		if ($PViewsDay{$Today} > $RecordPViews) {
			$RecordPViews = $PViewsDay{$Today};
			$RecordPViewsDate = $RecordDate;
		}
		if ($NoSessions) { $DomainsDay{$Today} = "-"; }
		unless (($key == $FinalDay) && ($FinalDayOK < 1)) {
			$WhichDayCounter{$WhichDay} ++;
			$WhichDayFiles{$WhichDay} += $DayFilesCounter{$Today};
			$WhichDayBytes{$WhichDay} += $BytesDay{$Today};
			$WhichDayPViews{$WhichDay} += $PViewsDay{$Today};
			unless ($NoSessions) { $WhichDayDomains{$WhichDay} += $DomainsDay{$Today}; }
		}
		printf REPORT "%12s%20s%12s%12s%13s",&commas($DayFilesCounter{$Today}),&commas($BytesDay{$Today}),&commas($DomainsDay{$Today}),&commas($PViewsDay{$Today}),
		  "$Day $NumberToMonth{$Month}  ";
		if ($GraphBase eq "hits") {
			if ($DailyTotalHitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($DayFilesCounter{$Today}/$DailyTotalHitsCounter)*($DayCount*10))+.5);
			}
		}
		elsif ($GraphBase eq "visits") {
			if ($DailyTotalVisitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($DomainsDay{$Today}/$DailyTotalVisitsCounter)*($DayCount*10))+.5);
			}
		}
		elsif ($GraphBase eq "pviews") {
			if ($DailyTotalPViewsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($PViewsDay{$Today}/$DailyTotalPViewsCounter)*($DayCount*10))+.5);
			}
		}
		else {
			if ($DailyTotalBytesCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($BytesDay{$Today}/$DailyTotalBytesCounter)*($DayCount*10))+.5);
			}
		}
		&PrintBarGraph;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub PrintDayofWeekReport {
	print REPORT "<A NAME=\"dayofweek\"><HR></A><H2 ALIGN=CENTER>Day of Week Averages</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "        Hits               Bytes      Visits      PViews        Day\n\n";
	$DoWTotalHitsCounter=$DoWTotalBytesCounter=$DoWTotalVisitsCounter=$DoWTotalPViewsCounter=0;
	foreach $key (1..7) {
		unless ($WhichDayCounter{$key} < 1) {
			$DoWFilesCounter{$DoWCounter{$key}} = int(($WhichDayFiles{$key}/$WhichDayCounter{$key})+.5);
			$DoWBytesCounter{$DoWCounter{$key}} = int(($WhichDayBytes{$key}/$WhichDayCounter{$key})+.5);
			$DoWPViewsCounter{$DoWCounter{$key}} = int(($WhichDayPViews{$key}/$WhichDayCounter{$key})+.5);
			unless ($NoSessions) { $DoWSessionsCounter{$DoWCounter{$key}} = int(($WhichDayDomains{$key}/$WhichDayCounter{$key})+.5); }
			$DoWTotalHitsCounter += $DoWFilesCounter{$DoWCounter{$key}};
			$DoWTotalBytesCounter += $DoWBytesCounter{$DoWCounter{$key}};
			$DoWTotalPViewsCounter += $DoWPViewsCounter{$DoWCounter{$key}};
			$DoWTotalVisitsCounter += $DoWSessionsCounter{$DoWCounter{$key}};
		}
	}
	foreach $key (1..7) {
		if ($DoWBytesCounter{$DoWCounter{$key}} < 1) {
			$DoWFilesCounter{$DoWCounter{$key}} = 0;
			$DoWBytesCounter{$DoWCounter{$key}} = 0;
			$DoWSessionsCounter{$DoWCounter{$key}} = 0;
			$DoWPViewsCounter{$DoWCounter{$key}} = 0;
		}
		unless ($DoWPViewsCounter{$DoWCounter{$key}}) {
			$DoWPViewsCounter{$DoWCounter{$key}} = 0;
		}
		if ($NoSessions) { $DoWSessionsCounter{$DoWCounter{$key}} = "-"; }
		printf REPORT "%12s%20s%12s%12s%13s",&commas($DoWFilesCounter{$DoWCounter{$key}}),
		  &commas($DoWBytesCounter{$DoWCounter{$key}}),
		  &commas($DoWSessionsCounter{$DoWCounter{$key}}),
		  &commas($DoWPViewsCounter{$DoWCounter{$key}}),"      $DoWCounter{$key}  ";
		if ($GraphBase eq "hits") {
			if ($DoWTotalHitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($DoWFilesCounter{$DoWCounter{$key}}/$DoWTotalHitsCounter)*70)+.5);
			}
		}
		elsif ($GraphBase eq "visits") {
			if ($DoWTotalVisitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($DoWSessionsCounter{$DoWCounter{$key}}/$DoWTotalVisitsCounter)*70)+.5);
			}
		}
		elsif ($GraphBase eq "pviews") {
			if ($DoWTotalPViewsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($DoWPViewsCounter{$DoWCounter{$key}}/$DoWTotalPViewsCounter)*70)+.5);
			}
		}
		else {
			if ($DoWTotalBytesCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($DoWBytesCounter{$DoWCounter{$key}}/$DoWTotalBytesCounter)*70)+.5);
			}
		}
		&PrintBarGraph;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub PrintHourlyReport {
	print REPORT "<A NAME=\"houraverage\"><HR></A><H2 ALIGN=CENTER>Hourly Averages</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "        Hits               Bytes      Visits      PViews       Hour\n\n";
	if ($FileStartDate > $InitialEndDate) {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$FileStartDate);
	}
	else {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$InitialEndDate);
	}
	&date_to_count(int($Month),$Day,($Year-1900));
	$StartDay = $perp_days;
	$StartHour = int($Hour);
	if ($Minute > 30) { $StartHour ++; }
	if ($StartHour > 23) { $StartHour = 0; $StartDay ++; }
	($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$FileEndDate);
	&date_to_count(int($Month),$Day,($Year-1900));
	$EndDay = $perp_days;
	$EndHour = int($Hour);
	if ($Minute < 30) { $EndHour --; }
	if ($EndHour < 0) { $EndHour = 23; $EndDay --; }
	foreach $day ($StartDay..$EndDay) {
		foreach $hour (00..23) {
			next if (($day == $StartDay) && ($hour < $StartHour));
			next if (($day == $EndDay) && ($hour > $EndHour));
			if (length($hour) == 1) { $hour="0".$hour; }
			$HourlyDayCounter{$hour} ++;
		}
	}
	foreach $key (00..23) {
		if (length($key) == 1) { $key="0".$key; }
		if ($NoSessions) { $VisitsHour{$key} = "-"; }
		else { $VisitsHour{$key} += $hourusersessions{$key}; }
		if ($HourlyDayCounter{$key} > 0) {
			$BytesHour{$key} = int(($BytesHour{$key}/$HourlyDayCounter{$key})+.5);
			$HourFilesCounter{$key} = int(($HourFilesCounter{$key}/$HourlyDayCounter{$key})+.5);
			$PViewsHour{$key} = int(($PViewsHour{$key}/$HourlyDayCounter{$key})+.5);
			unless ($NoSessions) { $VisitsHour{$key} = int(($VisitsHour{$key}/$HourlyDayCounter{$key})+.5); }
		}
		$HourlyTotalBytesCounter+=$BytesHour{$key};
		$HourlyTotalHitsCounter+=$HourFilesCounter{$key};
		$HourlyTotalPViewsCounter+=$PViewsHour{$key};
		unless ($NoSessions) { $HourlyTotalVisitsCounter+=$VisitsHour{$key}; }
	}
	foreach $key (00..23) {
		if (length($key) == 1) { $key="0".$key; }
		unless ($HourFilesCounter{$key}) { $HourFilesCounter{$key} = 0; }
		unless ($BytesHour{$key}) { $BytesHour{$key} = 0; }
		unless ($VisitsHour{$key}) { $VisitsHour{$key} = 0; }
		unless ($PViewsHour{$key}) { $PViewsHour{$key} = 0; }
		printf REPORT "%12s%20s%12s%12s%13s",&commas($HourFilesCounter{$key}),
		  &commas($BytesHour{$key}),&commas($VisitsHour{$key}),
		  &commas($PViewsHour{$key}),"      $key  ";
		if ($GraphBase eq "hits") {
			if ($HourlyTotalHitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($HourFilesCounter{$key}/$HourlyTotalHitsCounter)*240)+.5);
			}
		}
		elsif ($GraphBase eq "visits") {
			if ($HourlyTotalVisitsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($VisitsHour{$key}/$HourlyTotalVisitsCounter)*240)+.5);
			}
		}
		elsif ($GraphBase eq "pviews") {
			if ($HourlyTotalPViewsCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($PViewsHour{$key}/$HourlyTotalPViewsCounter)*240)+.5);
			}
		}
		else {
			if ($HourlyTotalBytesCounter < 1.0) { $Percent=0; }
			else {
				$Percent=int((($BytesHour{$key}/$HourlyTotalBytesCounter)*240)+.5);
			}
		}
		&PrintBarGraph;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub PrintRecords {
	print REPORT "<A NAME=\"records\"><HR></A><H2 ALIGN=CENTER>&quot;Record Book&quot;</H2>\n";
	print REPORT "<P><STRONG>Most Hits:</STRONG> ";
	print REPORT &commas($RecordHits)," ($RecordHitsDate)\n";
	print REPORT "<P><STRONG>Most Bytes:</STRONG> ";
	print REPORT &commas($RecordBytes)," ($RecordBytesDate)\n";
	unless ($NoSessions) {
		print REPORT "<P><STRONG>Most Visits:</STRONG> ";
		print REPORT &commas($RecordVisits)," ($RecordVisitsDate)\n";
	}
	print REPORT "<P><STRONG>Most PViews:</STRONG> ";
	print REPORT &commas($RecordPViews)," ($RecordPViewsDate)\n";
	print REPORT "<P ALIGN=CENTER><SMALL>[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub commas {
	local($_)=@_;
	1 while s/(.*\d)(\d\d\d)/$1,$2/;
	$_;
}

sub PrintTopNFilesByHitsReport {
	print REPORT "<A NAME=\"topnfilesbyhits\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNFiles Files ";
	print REPORT "by Number of Hits ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   File\n\n";
	$Counter=1;
	foreach $key (sort ByHitsFiles keys(%HitsFileCounter)) {
		last if ($Counter > $PrintTopNFiles);
		next if ($TopFileListFilter && ($key=~m#$TopFileListFilter#oi));
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessFile{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($HitsFileCounter{$key}),&commas($BytesFileCounter{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#files\">Complete File Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByHitsFiles {
	$HitsFileCounter{$b}<=>$HitsFileCounter{$a};
}

sub PrintTopNFilesByVolumeReport {
	print REPORT "<A NAME=\"topnfilesbyvolume\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNFiles Files ";
	print REPORT "by Volume ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   File\n\n";
	$Counter=1;
	foreach $key (sort ByVolumeFiles keys(%HitsFileCounter)) {
		last if ($Counter > $PrintTopNFiles);
		next if ($TopFileListFilter && ($key=~m#$TopFileListFilter#oi));
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessFile{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($HitsFileCounter{$key}),&commas($BytesFileCounter{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#files\">Complete File Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByVolumeFiles {
	$BytesFileCounter{$b}<=>$BytesFileCounter{$a};
}

sub PrintFilesReport {
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
	}
	print REPORT "<A NAME=\"files\"><HR></A><H2 ALIGN=CENTER>Complete File Statistics ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   File\n\n";
	foreach $key (sort keys(%HitsFileCounter)) {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessFile{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($HitsFileCounter{$key}),&commas($BytesFileCounter{$key}),$key;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"";
	if ($FullListFile && !($EOMDate)) { print REPORT "$ReportFile"; }
	print REPORT "#index\">Return to Index</A> ]</SMALL></P>\n\n";
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
}

sub PrintTopN404Report {
	print REPORT "<A NAME=\"topn404\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNFiles Most Frequently Requested ";
	print REPORT "404 Files ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   File\n\n";
	$Counter=1;
	foreach $key (sort ByfnfHitsFiles keys(%fnfHitsFileCounter)) {
		last if ($Counter > $PrintTopNFiles);
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$fnfLastAccessFile{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($fnfHitsFileCounter{$key}),&commas($fnfBytesFileCounter{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#404\">Complete 404 File Not Found Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByfnfHitsFiles {
	$fnfHitsFileCounter{$b}<=>$fnfHitsFileCounter{$a};
}

sub Print404Report {
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
	}
	print REPORT "<A NAME=\"404\"><HR></A><H2 ALIGN=CENTER>Complete 404 File Not Found Statistics ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   File\n\n";
	foreach $key (sort keys(%fnfHitsFileCounter)) {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$fnfLastAccessFile{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($fnfHitsFileCounter{$key}),&commas($fnfBytesFileCounter{$key}),$key;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"";
	if ($FullListFile && !($EOMDate)) { print REPORT "$ReportFile"; }
	print REPORT "#index\">Return to Index</A> ]</SMALL></P>\n\n";
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
}

sub PrintTopNEntranceReport {
	print REPORT "<A NAME=\"topentrance\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNFiles ";
	print REPORT "&quot;Entrance&quot; Pages ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "                            Hits                   File\n\n";
	$Counter=1;
	foreach $key (sort ByEntranceCount keys(%firstpages)) {
		last if ($Counter > $PrintTopNFiles);
		next if ($TopFileListFilter && ($key=~m#$TopFileListFilter#oi));
		printf REPORT "%32s                   %-s\n",&commas($firstpages{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#entrancepages\">Complete File Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByEntranceCount {
	$firstpages{$b}<=>$firstpages{$a};
}

sub PrintEntranceReport {
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
	}
	print REPORT "<A NAME=\"entrancepages\"><HR></A><H2 ALIGN=CENTER>Complete &quot;Entrance&quot; ";
	print REPORT "Page List ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "                            Hits                   File\n\n";
	foreach $key (sort keys(%firstpages)) {
		printf REPORT "%32s                   %-s\n",&commas($firstpages{$key}),$key;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"";
	if ($FullListFile && !($EOMDate)) { print REPORT "$ReportFile"; }
	print REPORT "#index\">Return to Index</A> ]</SMALL></P>\n\n";
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
}

sub PrintTopNExitReport {
	print REPORT "<A NAME=\"topexit\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNFiles ";
	print REPORT "&quot;Exit&quot; Pages ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "                            Hits                   File\n\n";
	$Counter=1;
	foreach $key (sort ByExitCount keys(%lastpages)) {
		last if ($Counter > $PrintTopNFiles);
		next if ($TopFileListFilter && ($key=~m#$TopFileListFilter#oi));
		printf REPORT "%32s                   %-s\n",&commas($lastpages{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#exitpages\">Complete File Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByExitCount {
	$lastpages{$b}<=>$lastpages{$a};
}

sub PrintExitReport {
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
	}
	print REPORT "<A NAME=\"exitpages\"><HR></A><H2 ALIGN=CENTER>Complete &quot;Exit&quot; ";
	print REPORT "Page List ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "                            Hits                   File\n\n";
	foreach $key (sort keys(%lastpages)) {
		printf REPORT "%32s                   %-s\n",&commas($lastpages{$key}),$key;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"";
	if ($FullListFile && !($EOMDate)) { print REPORT "$ReportFile"; }
	print REPORT "#index\">Return to Index</A> ]</SMALL></P>\n\n";
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
}

sub PrintUserIDsReport {
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
	}
	print REPORT "<A NAME=\"userids\"><HR></A><H2 ALIGN=CENTER>User ID Statistics ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   User ID (Domain)\n\n";
	foreach $key (sort keys(%HitsUserIDCounter)) {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessUserID{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($HitsUserIDCounter{$key}),&commas($BytesUserIDCounter{$key}),$key;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"";
	if ($FullListFile && !($EOMDate)) { print REPORT "$ReportFile"; }
	print REPORT "#index\">Return to Index</A> ]</SMALL></P>\n\n";
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
}

sub PrintTopLevelDomainsReport {
	print REPORT "<A NAME=\"topleveldomain\"><HR></A><H2 ALIGN=CENTER>\"Top Level\" Domains ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Accessed               Hits           Bytes   \"Top Level\" Domain\n\n";
	foreach $TopDomain (sort ByTopDomain keys(%TopDomainBytesCounter)) {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$TopDomainAccess{$TopDomain});
		$Month=$NumberToMonth{$Month};
		unless ($TopDomainFilesCounter{$TopDomain}<1) {
			printf REPORT "%-21s%11s%16s   %-4s = %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
			  &commas($TopDomainFilesCounter{$TopDomain}),
			  &commas($TopDomainBytesCounter{$TopDomain}),$TopDomain,$CountryCodes{$TopDomain};
		}
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByTopDomain {
	$TopDomainBytesCounter{$b}<=>$TopDomainBytesCounter{$a};
}

sub PrintTopNDomainsByHitsReport {
	print REPORT "<A NAME=\"topnsitesbyhits\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNDomains Domains ";
	print REPORT "by Number of Hits ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Access                 Hits           Bytes   Domain\n\n";
	$Counter=1;
	foreach $key (sort ByNDomains keys(%DomainsFilesCounter)) {
		last if ($Counter > $PrintTopNDomains);
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessDomain{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($DomainsFilesCounter{$key}),&commas($DomainsBytesCounter{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#domains\">Complete Domain Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByNDomains {
	$DomainsFilesCounter{$b}<=>$DomainsFilesCounter{$a};
}

sub PrintTopNDomainsByVolumeReport {
	print REPORT "<A NAME=\"topnsitesbyvolume\"><HR></A><H2 ALIGN=CENTER>Top $PrintTopNDomains Domains ";
	print REPORT "by Volume ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Access                 Hits           Bytes   Domain\n\n";
	$Counter=1;
	foreach $key (sort ByVolumeDomains keys(%DomainsFilesCounter)) {
		last if ($Counter > $PrintTopNDomains);
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessDomain{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($DomainsFilesCounter{$key}),&commas($DomainsBytesCounter{$key}),$key;
		$Counter++;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>";
	if ($FullListFile) {
		print REPORT "[ <A HREF=\"$FullListFile";
		print REPORT "#domains\">Complete Domain Statistics</A> ]\n<BR>";
	}
	print REPORT "[ <A HREF=\"#index\">Return to Index</A> ]</SMALL></P>\n\n";
}

sub ByVolumeDomains {
	$DomainsBytesCounter{$b}<=>$DomainsBytesCounter{$a};
}

sub PrintReversedDomainsReport {
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$FullListFile") || die "  Error Opening File: $FullListFile\n";
	}
	print REPORT "<A NAME=\"domains\"><HR></A><H2 ALIGN=CENTER>Complete Domain Statistics ($CurrMonth $CurrYear)</H2>\n";
	print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
	print REPORT "Last Access                 Hits           Bytes   Domain\n\n";
	foreach $key (sort ByReversedSubDomain keys(%DomainsFilesCounter)) {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=split(/ /,$LastAccessDomain{$key});
		$Month=$NumberToMonth{$Month};
		printf REPORT "%-21s%11s%16s   %-s\n","$Hour:$Minute:$Second $Day $Month $Year",
		  &commas($DomainsFilesCounter{$key}),&commas($DomainsBytesCounter{$key}),$key;
	}
	print REPORT "</PRE></FONT>\n<P ALIGN=CENTER><SMALL>[ <A HREF=\"";
	if ($FullListFile && !($EOMDate)) { print REPORT "$ReportFile"; }
	print REPORT "#index\">Return to Index</A> ]</SMALL></P>\n\n";
	if ($FullListFile && !($EOMDate)) {
		close (REPORT);
		open (REPORT,">>$FileDir/$ReportFile") || die "  Error Opening File: $ReportFile\n";
	}
}

sub ByReversedSubDomain {
	local(@adomains,@bdomains,$aisIP,$bisIP,$counter,$acounter,$bcounter,$result);
	$result=0;
	(@adomains)=split(/\./,$a);
	(@bdomains)=split(/\./,$b);
	$aisIP=$a=~m#^\d+\.\d+\.\d+\.\d+$#o;
	$bisIP=$b=~m#^\d+\.\d+\.\d+\.\d+$#o;
	if ($aisIP && (!$bisIP)) {
		$result=-1;
	}
	elsif ((!$aisIP) && $bisIP) {
		$result=1;
	}
	elsif ($aisIP && $bisIP) {
		$counter=0;
		while ((!$result) && ($counter < 4)) {
			$result=$adomains[$counter] <=> $bdomains[$counter];
			$counter++;
		}
	}
	elsif ((!$aisIP) && (!$bisIP)) {
		$acounter=$#adomains;
		$bcounter=$#bdomains;
		while ((!$result) && ($acounter>=0) && ($bcounter>=0)) {
			$result=$adomains[$acounter] cmp $bdomains[$bcounter];
			$acounter--;
			$bcounter--;
		}
		if (!$result) {
			$result=1 if ($acounter>=0);
			$result=-1 if ($bcounter>=0);
		}
	}
	$result;
}

sub GetSessions {
	if (!$TodayHits) { $TodayHits=0; }
	if (!$TodayErrors) { $TodayErrors=0; }
	$TodaySpider=0;
	unless (($TodayPagesHits < 1 ) && ($TodayPagesErrors < 1 )) {
		open (TEMPACCESSES,"$FileDir/tempaccesses.txt");
		if (!($EOMDate) && !($DetailsSummaryOnly) && $DetailsFile) {
			open (TEMPSESSIONS,">$FileDir/tempsessions.txt");
		}
		while (<TEMPACCESSES>) {
			chomp;
			($day,$month,$daycount,$hour,$minute,$second,$remote,$page,$referer,$Agent)=split("`",$_);
			if (($Agent eq "E-Mail Harvester") || ($Agent eq "Download Manager")
			  || ($Agent eq "Link Checker") || ($Agent eq "Offline Browser")
			  || ($Agent =~ m#Spider/Robot#oi)) {
				unless ($page =~ /^Code \d+/) {
					$TodaySpider++;
				}
			}
			$visit=(($hour*3600)+($minute*60)+$second);
			$duration=-.5;
			if ($prevvisit{"$remote $Agent"}) {
				$duration=($visit-$prevvisit{"$remote $Agent"});
			}
			$prevvisit{"$remote $Agent"}=$visit;
			if (($duration < -.5)
			  && (($daycount-$prevday{"$remote $Agent"})<2)) {
				$duration=$duration+86400;
			}
			elsif (($duration > -.5)
			  && ($prevday{"$remote $Agent"} ne $daycount)) {
				$duration=-.5;
			}
			$prevday{"$remote $Agent"} = $daycount;
			if ($duration > 1800) { $duration=-.5; }
			if ($duration < .0) {
				$usersessions++;
				$sessionstime=$sessionstime+30;
				$dayusersessions{$daycount}++;
				&count_to_date($daycount);
				&date_to_count($perp_mon,$perp_day,$perp_year);
				$monthusersessions{$perp_mons}++;
				$hourusersessions{$hour}++;
				if ($previouspage{"$remote $Agent"}) {
					if ($lastpages{$previouspage{"$remote $Agent"}}) {
						$lastpages{$previouspage{"$remote $Agent"}}++;
					}
					else {
						$lastpages{$previouspage{"$remote $Agent"}} = 1;
					}
				}
				if ($firstpages{$page}) {
					$firstpages{$page}++; 
				}
				else {
					$firstpages{$page} = 1;
				}
			}
			else {
				$sessionstime=$sessionstime+$duration;
			}
			$previouspage{"$remote $Agent"} = $page;
			$durminute=int($duration/60);
			$dursecond=$duration-($durminute*60);
			if (length($durminute) == 1) { $durminute="0".$durminute; }
			if (length($dursecond) == 1) { $dursecond="0".$dursecond; }
			unless ($AgentsFile) { $Agent = "-"; }
			if (!($EOMDate) && !($DetailsSummaryOnly) && $DetailsFile) {
				print TEMPSESSIONS "$day`$month`$hour`$minute`$second`$durminute`$dursecond`$remote`$Agent`$page`$referer\n";
			}
		}
		close (TEMPACCESSES);
		foreach $key (keys(%previouspage)) {
			if ($lastpages{$previouspage{$key}}) {
				$lastpages{$previouspage{$key}}++;
			}
			else {
				$lastpages{$previouspage{$key}} = 1;
			}
		}
		if (!($EOMDate) && !($DetailsSummaryOnly) && $DetailsFile) {
			close (TEMPSESSIONS);
		}
	}
}

sub PrintHostDetailsReport {
	if ($Verbose) { print "  Generating Details Report\n"; }
	rename ("$FileDir/$DetailsFile","$FileDir/tempdetails.txt");
	open (REPORT,">$FileDir/$DetailsFile") || die "  Error Opening File: $DetailsFile\n";
	print REPORT "<HTML><HEAD><TITLE>$AccessDetailsReport: $SystemName</TITLE></HEAD>";
	print REPORT "<BODY $bodyspec>\n";
	if ($headerfile) { &Header; }
	print REPORT "<H1 ALIGN=CENTER>Access ";
	if ($DetailsSummaryOnly) { print REPORT "Summary:"; }
	else { print REPORT "Details:"; }
	print REPORT "<BR>$SystemName</H1>\n";
	unless ($EndDate eq "0000 00 00 00 00 00") {
		print REPORT "<P ALIGN=CENTER><STRONG>(Accesses Through ";
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$EndDate);
		print REPORT "$Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year)</STRONG></P>\n";
	}
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($RefsFile) {
		print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
	}
	if ($KeywordsFile) {
		print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
	}
	if ($AgentsFile) {
		print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
	}
	print REPORT "</P><HR>\n";
	unless ($DetailsSummaryOnly) {
		print REPORT "<P>This report keeps track of &quot;user sessions,&quot; ";
		print REPORT "showing the paths taken through the site by its visitors. ";
		print REPORT "It also provides an estimate of how many unique visitors ";
		print REPORT "the site has had and how long they've stayed. ";
		print REPORT "Please note, however, that precise tracking of ";
		print REPORT "the number of visitors is impossible; the information ";
		print REPORT "in this report is at best a reasonably close approximation ";
		print REPORT "based on the information in the server access log.\n";
		print REPORT "</P><HR>\n";
	}
	unless ((($TodayPagesHits < 1 ) && ($TodayPagesErrors < 1 )) || ($usersessions < 1)) {
		$TodayPagesTotal=$TodayPagesHits+$TodayPagesErrors;
		$TodayOutside=$TodayPagesTotal-$TodayLocal-$TodaySpider;
		$LocalPercent=int(($TodayLocal/$TodayPagesTotal)*1000+.5)/10;
		$OutsidePercent=int(($TodayOutside/$TodayPagesTotal)*1000+.5)/10;
		$SpiderPercent=int(($TodaySpider/$TodayPagesTotal)*1000+.5)/10;
		$TodayHosts=keys(%TodayHosts);
		$TodayKB=int(($TodayBytes/1024)+.5);
		$TodayMB=int(($TodayKB/1024)+.5);
		$AveragePages=sprintf("%3.1f",$TodayPagesHits/$usersessions);
		open (TEMPSESSIONS,"$FileDir/tempsessions.txt");
		while (<TEMPSESSIONS>) {
			chomp;
			($day,$month,$hour,$minute,$second,$durminute,$dursecond,$remote,$Agent,$page,$referer)=split("`",$_);
			$duration=$durminute.":".$dursecond;
			if ($duration =~ /-/) {
				$duration="     ";
			}
			$timestring=$day." ".$month." -- ".$hour.":".$minute.":".$second;
			if ($FirstHalf{"$Agent`$remote"}) {
				$hostlist{"$Agent`$remote"} .= $FirstHalf{"$Agent`$remote"}.$duration.$SecondHalf{"$Agent`$remote"};
			}
			unless ($hostlist{"$Agent`$remote"}) { $hostlist{"$Agent`$remote"} = ""; }
			$FirstHalf{"$Agent`$remote"} = "";
			if ($referer ne "-") {
				$FirstHalf{"$Agent`$remote"} = "   <EM>".$referer."</EM>\n";
			}
			$FirstHalf{"$Agent`$remote"} .= "      ".$timestring." -- ";
			$SecondHalf{"$Agent`$remote"} = " -- ".$page."\n";
		}
		close (TEMPSESSIONS);
		$averagesession=$sessionstime/$usersessions;
		$averageminute=int(($averagesession/60)+.5);
		if ($averageminute == 0) { $averagesession="less than a minute"; }
		elsif ($averageminute == 1) { $averagesession="1 minute"; }
		else { $averagesession=$averageminute." minutes"; }
	}
	if ($DetailsSummaryOnly) {
		print REPORT "<H2 ALIGN=CENTER>Access Summary</H2>\n";
	}
	else {
		print REPORT "<H2 ALIGN=CENTER>Detailed Access List</H2>\n";
	}
	print REPORT "<!--DATESTAMP=\"999999999\"-->\n";
	unless ($DetailsSummaryOnly) {
		print REPORT "</P><HR><BLOCKQUOTE>\n";
	}
	print REPORT "<P><STRONG>Log Analyzed on $CurrDate</STRONG>";
	unless ($FileEndDate eq "0000 00 00 00 00 00") {
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$FileStartDate);
		print REPORT " ($Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year to ";
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$FileEndDate);
		print REPORT "$Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year)";
	}
	print REPORT ":\n";
	if ($TodayPagesTotal < 1 ) {
		print REPORT "<BR><EM>There were no accesses.</EM>\n";
		unless ($DetailsSummaryOnly) { print REPORT "</BLOCKQUOTE>\n"; }
	}
	else {
		print REPORT "<BR><EM>A total of <STRONG>",&commas($TodayPagesTotal),"</STRONG> pages were requested ";
		print REPORT "(<STRONG>",&commas($TodayPagesHits),"</STRONG> successfully and <STRONG>",&commas($TodayPagesErrors),"</STRONG> unsuccessfully) ";
		print REPORT "by <STRONG>",&commas($TodayHosts),"</STRONG> unique hosts. ";
		print REPORT "Of those pages, ";
		if ($OrgDomain) {
			print REPORT "<STRONG>",&commas($TodayLocal)," ";
			printf REPORT ("(%.4g%%)",$LocalPercent);
			print REPORT "</STRONG> were ";
			if ($OrgName) {
				print REPORT "requested by $OrgName, ";
			}
			else {
				print REPORT "requested internally, ";
			}
		}
		print REPORT "<STRONG>",&commas($TodaySpider)," ";
		printf REPORT ("(%.4g%%)",$SpiderPercent);
		print REPORT "</STRONG> were requested by &quot;spiders,&quot; ";
		print REPORT "and <STRONG>",&commas($TodayOutside)," ";
		printf REPORT ("(%.4g%%)",$OutsidePercent);
		print REPORT "</STRONG> were requested by (presumably) human visitors. ";
		print REPORT "There were approximately <STRONG>";
		print REPORT &commas($usersessions),"</STRONG> distinct visits; ";
		print REPORT "the typical visitor seems to have spent about <STRONG>";
		print REPORT "$averagesession</STRONG> at the site and to have ";
		print REPORT "successfully viewed some <STRONG>$AveragePages</STRONG> pages. ";
		print REPORT "There were a total of <STRONG>";
		print REPORT &commas($TodayHits),"</STRONG> hits and ";
		print REPORT "<STRONG>",&commas($TodayErrors),"</STRONG> errors ";
		print REPORT "related to $SystemName. ";
		if ($TodayBanned>0) {
			if ($TodayBanned<2) {
				print REPORT "A single additional access attempt was blocked. ";
			}
			else {
				print REPORT "An additional <STRONG>",&commas($TodayBanned),"</STRONG> access attempts were blocked. ";
			}
		}
		print REPORT "Total bandwidth usage was approximately <STRONG>";
		print REPORT &commas($TodayMB),"</STRONG> megabytes.</EM>\n";
		unless ($DetailsSummaryOnly) {
			print REPORT "</BLOCKQUOTE>\n";
			@hosts=sort byDomain (keys %hostlist);
			$prevTD="###";
			print REPORT "<P><FONT FACE=\"Courier\"><PRE>";
			foreach $host (@hosts) {
				($hostagent,$hostremote) = split("`",$host);
				$hostdomain = $hostremote;
				$hostdomain =~ s/([^\s]*).*/$1/;
				$TopDomain=&GetTopDomain($hostdomain);
				if ($TopDomain ne $prevTD) {
					$prevTD = $TopDomain;
					print REPORT "\n<STRONG>$CountryCodes{$TopDomain}:";
					print REPORT "</STRONG>\n";
				}
				print REPORT "\n$hostremote";
				if ($AgentsFile) {
					print REPORT " - $hostagent";
				}
				print REPORT "\n";
				print REPORT "$hostlist{$host}";
				print REPORT "$FirstHalf{$host}";
				print REPORT "     ";
				print REPORT "$SecondHalf{$host}";
			}
			print REPORT "</PRE></FONT>\n";
		}
	}
	$datestamp = 0;
	if (-e "$FileDir/tempdetails.txt") {
		open (FILE,"$FileDir/tempdetails.txt");
		while (<FILE>) {
			if (m#DATESTAMP=\"(\d+)#o) {
				$datestamp = $1;
				$DetailsDays--;
				$DetailsSummaryDays--;
			}
			if ($datestamp > 0) {
				if ($DetailsDays > 0) {
					print REPORT $_;
				}
				elsif ($DetailsSummaryDays > 0) {
					if (m#</BLOCKQUOTE>#o) {
						$datestamp = 0;
					}
					else {
						unless (m#</P><HR>#o) {
							unless ($HRFlag) {
								$HRFlag = 1;
								print REPORT "</P><HR>\n";
							}
							print REPORT $_;
						}
					}
				}
			}
		}
		close (FILE);
		unlink "$FileDir/tempdetails.txt";
	}
	print REPORT "<!--DATESTAMP=\"000000000\"-->\n";
	print REPORT "</P><HR>\n";
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($RefsFile) {
		print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
	}
	if ($KeywordsFile) {
		print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
	}
	if ($AgentsFile) {
		print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
	}
	print REPORT "</P>\n";
	print REPORT "<P ALIGN=CENTER>";
	print REPORT "<SMALL>This report was generated with ";
	print REPORT "<STRONG><A HREF=";
	print REPORT "\"http://awsd.com/scripts/weblog/\">";
	print REPORT "WebLog $version</A></STRONG></SMALL></P>\n";
	if ($footerfile) { &Footer; }
	print REPORT "</BODY></HTML>\n";
	close (REPORT);
}

sub byDomain {
	local($aHost) = "";
	local($bHost) = "";
	local($aIP) = "";
	local($bIP) = "";
	local(@aTemp,@bTemp)=();
	$aHost = $a;
	$bHost = $b;
	$aHost =~ s/[^`]*`([^\s]*)(.*)/$1/;
	$aIP = $2;
	$bHost =~ s/[^`]*`([^\s]*)(.*)/$1/;
	$bIP = $2;
	if ($aHost =~ /[^0-9].*\.[^0-9].*/) {
		@aTemp=reverse split(/\./, $aHost);
		$aHost = "";
		foreach (@aTemp) { $aHost .= $_ };
	}
	else { $aHost="zzzzzzz".$aHost; }
	$aHost .= $aIP;
	if ($bHost =~ /[^0-9].*\.[^0-9].*/) {
		@bTemp=reverse split(/\./, $bHost);
		$bHost = "";
		foreach (@bTemp) { $bHost .= $_ };
	}
	else { $bHost="zzzzzzz".$bHost; }
	$bHost .= $bIP;
	return ($aHost cmp $bHost);
}

sub PrintRefsReport {
	if ($Verbose) { print "  Generating Referring URLs Report\n"; }
	if (-e "$FileDir/$RefsFile") {
		open (OLDLOG,"$FileDir/$RefsFile") || die "  Error Opening File: $RefsFile\n";
		while (<OLDLOG>) {
			chomp;
			if (m#listed pages, since <STRONG>(.*)</STRONG>.#o) { $refsstartdate = $1; }
			if (m#^<P><DT><STRONG>(.*)</STRONG></DT>#o) {
				$target = &Simplify($1);
				next;
			}
			next if (! $target);
			if (m#^<DD><A HREF=\"([^"]*)\">.*</A> \(([\d,]+) reference#o) {
				$refurl = $1;
				$count = $2;
				$count =~ s/,//g;
				$url = &Simplify($refurl);
				if ($TargetCounter{"$target $url"}) { $TargetCounter{"$target $url"} += $count; }
				else { $TargetCounter{"$target $url"} = $count; }
				$refdomain = "";
				if ($url =~ m#^.+//([\w|\.|-]+)#o) {
					$refdomain = $1;
				}
				unless ($refdomain =~ /\d$/) {
					if ($refdomain =~ /([^.]*\.[^.]{3,})$/) {
						$refdomain{$1} += $count;
					}
					elsif ($refdomain =~ /([^.]*\.[^.]{1,3}\.[^.]*)$/) {
						$refdomain{$1} += $count;
					}
					elsif ($refdomain =~ /([^.]*\.[^.]*)$/) {
						$refdomain{$1} += $count;
					}
				}
			}
		}
		close (OLDLOG);
	}
	foreach $key (keys (%TargetCounter)) {
		($target,$referer)=split(/ /,$key,2);
		if ($TargetCounter{"$target/ $referer"} && $TargetCounter{"$target $referer"}) {
			$TargetCounter{$key}=-1;
		}
	}
	open (REPORT,">$FileDir/$RefsFile") || die "  Error Opening File: $RefsFile\n";
	print REPORT "<HTML><HEAD><TITLE>Referring URLs Report: $SystemName</TITLE></HEAD>";
	print REPORT "<BODY $bodyspec>\n";
	if ($headerfile) { &Header; }
	print REPORT "<H1 ALIGN=CENTER>Referring URLs:<BR>$SystemName</H1>\n";
	unless ($EndDate eq "0000 00 00 00 00 00") {
		print REPORT "<P ALIGN=CENTER><STRONG>(Accesses Through ";
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$EndDate);
		print REPORT "$Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year)</STRONG></P>\n";
	}
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($DetailsFile) {
		print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
	}
	if ($KeywordsFile) {
		print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
	}
	if ($AgentsFile) {
		print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
	}
	print REPORT "</P><HR>\n";
	unless ($refsstartdate) {
		($Year,$Month,$Day,$Hour,$Minute,$Second) = split(/ /,$FileStartDate);
		$Day = int($Day);
		$refsstartdate = "$Day $NumberToMonth{$Month} $Year";
	}
	print REPORT "<P>This report logs the URLs reported by browsers as ";
	print REPORT "the &quot;referers&quot; directing them to the various ";
	print REPORT "listed pages, since <STRONG>$refsstartdate</STRONG>. (This ";
	print REPORT "information is far from perfect. Many browsers do not provide ";
	print REPORT "any information on the referring page, and even those that do ";
	print REPORT "can at times provide false or misleading data. The ";
	print REPORT "fact that a page is listed as the referer to a given ";
	print REPORT "page does <EM>not</EM> always mean that it ";
	print REPORT "actually contains a link to that page.) ";
	print REPORT "</P><HR>\n";
	if ($TopNRefDoms) {
		print REPORT "<H2 ALIGN=CENTER>Top $TopNRefDoms ";
		print REPORT "Referring Domains</H2>\n";
		print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
		print REPORT "                         Referrals     Domain\n\n";
		$Counter=1;
		foreach $key (sort ByRefCount keys(%refdomain)) {
			last if ($Counter > $TopNRefDoms);
			printf REPORT "%32s%-s\n",&commas($refdomain{$key}),"       $key";
			$Counter++;
		}
		print REPORT "</PRE></FONT><HR>\n\n";
	}
	$RefsMinHits = 0;
	if ($RefsFilterLists) {
		$Counter=0;
		foreach $key (sort ByRefCount keys(%refdomain)) {
			$Counter++;
			$RefsMinHits += $refdomain{$key};
			last if ($Counter > 24);
		}
		if ($Counter == 0) { $RefsMinHits = 0; }
		else { $RefsMinHits = (($RefsMinHits/$Counter)/250); }
	}
	print REPORT "<H2 ALIGN=CENTER>Web Pages and Referring URLs</H2>\n";
	print REPORT "<DL>\n";
	$LastWebPage = '';
	foreach $key (sort bytargetthenhits keys(%TargetCounter)) {
		unless ($TargetCounter{$key} < $RefsMinHits) {
			($target,$referer) = split(/ /,$key,2);
			if ("$target" ne "$LastWebPage") {
				print REPORT "<P><DT><STRONG>$target</STRONG></DT>\n";
			}
			print REPORT "<DD><A HREF=\"$referer\">$referer</A> ";
			print REPORT "(",&commas($TargetCounter{$key})," reference";
			if ($TargetCounter{$key} > 1) { print REPORT "s"; }
			print REPORT ")</DD>\n";
			$LastWebPage = $target;
		}
	}
	print REPORT "</P></DL><HR>\n";
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($DetailsFile) {
		print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
	}
	if ($KeywordsFile) {
		print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
	}
	if ($AgentsFile) {
		print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
	}
	print REPORT "</P>\n";
	print REPORT "<P ALIGN=CENTER>";
	print REPORT "<SMALL>This report was generated with ";
	print REPORT "<STRONG><A HREF=";
	print REPORT "\"http://awsd.com/scripts/weblog/\">";
	print REPORT "WebLog $version</A></STRONG></SMALL></P>\n";
	if ($footerfile) { &Footer; }
	print REPORT "</BODY></HTML>\n";
	close (REPORT);
}

sub Simplify {
	$url = $_[0];
	$url =~ s/ //g;
	if ($url =~ m#(^.+)//([\w|\.|-]+)/(.+)#o) {
		$url_prefix = $1;
		$url_domain = $2;
		$url_path = $3;
		$url_domain = "\L$url_domain";
		if ($RefsStripWWW) {
			$url_domain =~ s/^www\.//i;
		}
		return $url_prefix."//".$url_domain."/".$url_path;
	}
	elsif ($url =~ m#(^.+)//([\w|\.|-]+)#o) {
		$url_prefix = $1;
		$url_domain = $2;
		$url_domain = "\L$url_domain";
		if ($RefsStripWWW) {
			$url_domain =~ s/^www\.//i;
		}
		return $url_prefix."//".$url_domain;
	}
	else {
		return $url;
	}
}

sub ByRefCount {
	$refdomain{$b}<=>$refdomain{$a};
}

sub bytargetthenhits {
	($targeta)=($a=~m#^(.+)\s#o);
	($targetb)=($b=~m#^(.+)\s#o);
	$inequality=($targeta cmp $targetb);
	if ($inequality) {
		$inequality;
	}
	else {
		$TargetCounter{$b}<=>$TargetCounter{$a};
	}
}

sub PrintKeywordsReport {
	if ($Verbose) { print "  Generating Keywords Report\n"; }
	if (-e "$FileDir/$KeywordsFile") {
		open (OLDLOG,"$FileDir/$KeywordsFile") || die "  Error Opening File: $KeywordsFile\n";
		while (<OLDLOG>) {
			chomp;
			if (m#and directories, since <STRONG>(.*)</STRONG>.#o) { $keysstartdate = $1; }
			if (m#<P><STRONG><A HREF=[^>]*>(.*)</A></STRONG>#o) {
				$SearchEngine = $1;
			}
			elsif (m#<P><STRONG>(.*)</STRONG>#o) {
				$SearchEngine = $1;
			}
			if (m#\s*([\d,]+)     (.*)$#o ) {
				$count = $1;
				$phrase = $2;
				$count =~ s/,//g;
				if ($SearchEngine eq "About:") {
					if ($aboutcom{$phrase}) { $aboutcom{$phrase} += $count; }
					else { $aboutcom{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "AltaVista:") {
					if ($altavista{$phrase}) { $altavista{$phrase} += $count; }
					else { $altavista{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "AOL Netfind:") {
					if ($netfind{$phrase}) { $netfind{$phrase} += $count; }
					else { $netfind{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Ask Jeeves:") {
					if ($askjeeves{$phrase}) { $askjeeves{$phrase} += $count; }
					else { $askjeeves{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "c|net search.com:") {
					if ($cnet{$phrase}) { $cnet{$phrase} += $count; }
					else { $cnet{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Direct Hit:") {
					if ($directhit{$phrase}) { $directhit{$phrase} += $count; }
					else { $directhit{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Dogpile:") {
					if ($dogpile{$phrase}) { $dogpile{$phrase} += $count; }
					else { $dogpile{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "EuroFerret:") {
					if ($euroferret{$phrase}) { $euroferret{$phrase} += $count; }
					else { $euroferret{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "EuroSeek:") {
					if ($euroseek{$phrase}) { $euroseek{$phrase} += $count; }
					else { $euroseek{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine =~ /Excite/) {
					if ($excite{$phrase}) { $excite{$phrase} += $count; }
					else { $excite{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine =~ /FAST/) {
					if ($fast{$phrase}) { $fast{$phrase} += $count; }
					else { $fast{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Google:") {
					if ($google{$phrase}) { $google{$phrase} += $count; }
					else { $google{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "GoTo:") {
					if ($goto{$phrase}) { $goto{$phrase} += $count; }
					else { $goto{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "HotBot:") {
					if ($hotbot{$phrase}) { $hotbot{$phrase} += $count; }
					else { $hotbot{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine =~ /Infoseek/) {
					if ($infoseek{$phrase}) { $infoseek{$phrase} += $count; }
					else { $infoseek{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "LookSmart:") {
					if ($looksmart{$phrase}) { $looksmart{$phrase} += $count; }
					else { $looksmart{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Lycos:") {
					if ($lycos{$phrase}) { $lycos{$phrase} += $count; }
					else { $lycos{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Magellan:") {
					if ($magellan{$phrase}) { $magellan{$phrase} += $count; }
					else { $magellan{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Mamma:") {
					if ($mamma{$phrase}) { $mamma{$phrase} += $count; }
					else { $mamma{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine =~ /Metacrawler/i) {
					if ($metacrawler{$phrase}) { $metacrawler{$phrase} += $count; }
					else { $metacrawler{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine =~ /MSN/) {
					if ($msn{$phrase}) { $msn{$phrase} += $count; }
					else { $msn{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Netscape Search:") {
					if ($netscape{$phrase}) { $netscape{$phrase} += $count; }
					else { $netscape{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Northern Light:") {
					if ($northernlight{$phrase}) { $northernlight{$phrase} += $count; }
					else { $northernlight{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "PlanetSearch:") {
					if ($planetsearch{$phrase}) { $planetsearch{$phrase} += $count; }
					else { $planetsearch{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "SavvySearch:") {
					if ($savvysearch{$phrase}) { $savvysearch{$phrase} += $count; }
					else { $savvysearch{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif (($SearchEngine eq "Snap:") || ($SearchEngine eq "NBCi:")) {
					if ($snap{$phrase}) { $snap{$phrase} += $count; }
					else { $snap{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "WebCrawler:") {
					if ($webcrawler{$phrase}) { $webcrawler{$phrase} += $count; }
					else { $webcrawler{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Yahoo:") {
					if ($yahoo{$phrase}) { $yahoo{$phrase} += $count; }
					else { $yahoo{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
				elsif ($SearchEngine eq "Other Search Engines:") {
					if ($othersearch{$phrase}) { $othersearch{$phrase} += $count; }
					else { $othersearch{$phrase} = $count; }
					if ($topkeywords{$phrase}) { $topkeywords{$phrase} += $count; }
					else { $topkeywords{$phrase} = $count; }
				}
			}
		}
		close (OLDLOG);
	}
	open (REPORT,">$FileDir/$KeywordsFile") || die "  Error Opening File: $KeywordsFile\n";
	print REPORT "<HTML><HEAD><TITLE>Keywords Report: $SystemName</TITLE></HEAD>";
	print REPORT "<BODY $bodyspec>\n";
	if ($headerfile) { &Header; }
	print REPORT "<H1 ALIGN=CENTER>Referring Keywords:<BR>$SystemName</H1>\n";
	unless ($EndDate eq "0000 00 00 00 00 00") {
		print REPORT "<P ALIGN=CENTER><STRONG>(Accesses Through ";
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$EndDate);
		print REPORT "$Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year)</STRONG></P>\n";
	}
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($DetailsFile) {
		print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
	}
	if ($RefsFile) {
		print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
	}
	if ($AgentsFile) {
		print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
	}
	print REPORT "</P><HR>\n";
	unless ($keysstartdate) {
		($Year,$Month,$Day,$Hour,$Minute,$Second) = split(/ /,$FileStartDate);
		$Day = int($Day);
		$keysstartdate = "$Day $NumberToMonth{$Month} $Year";
	}
	print REPORT "<P>This report logs the keywords used by visitors to find ";
	print REPORT "this site in the various Internet search engines and directories, ";
	print REPORT "since <STRONG>$keysstartdate</STRONG>. The major search engines ";
	print REPORT "are each listed individually.\n";
	print REPORT "</P><HR>\n";
	if ($TopNKeywords) {
		print REPORT "<H2 ALIGN=CENTER>Top $TopNKeywords Keywords</H2>\n";
		print REPORT "<FONT FACE=\"Courier\"><PRE>\n";
		$Counter=1;
		foreach $key (sort ByKeyCount keys(%topkeywords)) {
			last if ($Counter > $TopNKeywords);
			printf REPORT "%32s%-s\n",&commas($topkeywords{$key}),"       $key";
			$Counter++;
		}
		print REPORT "</PRE></FONT></P><HR>\n\n";
	}
	$RefsMinHits = 0;
	if ($RefsFilterLists) {
		$Counter=0;
		foreach $key (sort ByKeyCount keys(%topkeywords)) {
			$Counter++;
			$RefsMinHits += $topkeywords{$key};
			last if ($Counter > 24);
		}
		if ($Counter == 0) { $RefsMinHits = 0; }
		else { $RefsMinHits = (($RefsMinHits/$Counter)/25); }
	}
	print REPORT "<H2 ALIGN=CENTER>Referring Keywords</H2>\n";
	if (%aboutcom) { &PrintSearchPhrases("About","www.about.com",%aboutcom); }
	if (%altavista) { &PrintSearchPhrases("AltaVista","www.altavista.com",%altavista); }
	if (%netfind) {&PrintSearchPhrases("AOL Netfind","search.aol.com",%netfind); }
	if (%askjeeves) {&PrintSearchPhrases("Ask Jeeves","www.askjeeves.com",%askjeeves); }
	if (%cnet) {&PrintSearchPhrases("c|net search.com","www.search.com",%cnet); }
	if (%directhit) {&PrintSearchPhrases("Direct Hit","www.directhit.com",%directhit); }
	if (%dogpile) {&PrintSearchPhrases("Dogpile","www.dogpile.com",%dogpile); }
	if (%euroferret) {&PrintSearchPhrases("EuroFerret","www.euroferret.com",%euroferret); }
	if (%euroseek) {&PrintSearchPhrases("EuroSeek","www.euroseek.net",%euroseek); }
	if (%excite) {&PrintSearchPhrases("Excite","www.excite.com",%excite); }
	if (%fast) {&PrintSearchPhrases("FAST (All the Web, All the Time)","www.alltheweb.com",%fast); }
	if (%hotbot) {&PrintSearchPhrases("HotBot","www.hotbot.com",%hotbot); }
	if (%google) {&PrintSearchPhrases("Google","www.google.com",%google); }
	if (%goto) {&PrintSearchPhrases("GoTo","www.goto.com",%goto); }
	if (%infoseek) {&PrintSearchPhrases("Infoseek (Go Network)","www.go.com",%infoseek); }
	if (%looksmart) {&PrintSearchPhrases("LookSmart","www.looksmart.com",%looksmart); }
	if (%lycos) {&PrintSearchPhrases("Lycos","www.lycos.com",%lycos); }
	if (%magellan) {&PrintSearchPhrases("Magellan","magellan.excite.com",%magellan); }
	if (%mamma) {&PrintSearchPhrases("Mamma","www.mamma.com",%mamma); }
	if (%metacrawler) {&PrintSearchPhrases("MetaCrawler (Go2Net)","www.go2net.com",%metacrawler); }
	if (%msn) {&PrintSearchPhrases("MSN (Microsoft Network)","search.msn.com",%msn); }
	if (%snap) {&PrintSearchPhrases("NBCi","www.nbci.com",%snap); }
	if (%netscape) {&PrintSearchPhrases("Netscape Search","search.netscape.com",%netscape); }
	if (%northernlight) {&PrintSearchPhrases("Northern Light","www.northernlight.com",%northernlight); }
	if (%planetsearch) {&PrintSearchPhrases("PlanetSearch","www.planetsearch.com",%planetsearch); }
	if (%savvysearch) {&PrintSearchPhrases("SavvySearch","www.savvysearch.com",%savvysearch); }
	if (%webcrawler) {&PrintSearchPhrases("WebCrawler","www.webcrawler.com",%webcrawler); }
	if (%yahoo) {&PrintSearchPhrases("Yahoo","www.yahoo.com",%yahoo); }
	if (%othersearch) {&PrintSearchPhrases("Other Search Engines","x",%othersearch); }
	print REPORT "<HR>\n";
	&PrintKeywordsListKey;
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($DetailsFile) {
		print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
	}
	if ($RefsFile) {
		print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
	}
	if ($AgentsFile) {
		print REPORT " <STRONG><A HREF=\"$AgentsFile\">Agents/Platforms Report</A></STRONG> |";
	}
	print REPORT "</P>\n";
	print REPORT "<P ALIGN=CENTER>";
	print REPORT "<SMALL>This report was generated with ";
	print REPORT "<STRONG><A HREF=";
	print REPORT "\"http://awsd.com/scripts/weblog/\">";
	print REPORT "WebLog $version</A></STRONG></SMALL></P>\n";
	if ($footerfile) { &Footer; }
	print REPORT "</BODY></HTML>\n";
	close (REPORT);
}

sub ByKeyCount {
	$topkeywords{$b}<=>$topkeywords{$a};
}

sub PrintSearchPhrases {
	local ($title,$url,%keyphrases) = @_;
	foreach $phrase (sort PhrasesByHits keys(%keyphrases)) {
		last unless ($keyphrases{$phrase} < $RefsMinHits);
		return;
	}
	print REPORT "<P><STRONG>";
	unless ($url eq "x") { print REPORT "<A HREF=\"http://$url/\">"; }
	print REPORT "$title:";
	unless ($url eq "x") { print REPORT "</A>"; }
	print REPORT "</STRONG>\n";
	print REPORT "<P><FONT FACE=\"Courier\"><PRE>";
	foreach $phrase (sort PhrasesByHits keys(%keyphrases)) {
		last if ($keyphrases{$phrase} < $RefsMinHits);
		print REPORT "  ";
		printf REPORT "%10s",&commas($keyphrases{$phrase});
		print REPORT "     $phrase\n";
	}
	print REPORT "</PRE></FONT></P>\n";
}

sub PhrasesByHits {
	$ahits=$keyphrases{$a};
	$bhits=$keyphrases{$b};
	$bhits<=>$ahits;
}

sub PrintAgentsReport {
	if ($Verbose) { print "  Generating Agents/Platforms Report\n"; }
	if (-e "$FileDir/$AgentsFile") {
		open (OLDLOG,"$FileDir/$AgentsFile") || die "  Error Opening File: $AgentsFile\n";
		while (<OLDLOG>) {
			chomp;
			if (m#recorded and analyzed since <STRONG>(.*)</STRONG>.</P>#o) { $agentstartdate = $1; }
			if (m#The fourth report is a complete and#o) { $OldStyle = 1; }
			unless ($OldStyle) {
				if (m#by Agent#o) { $agentsect = "agent"; }
				if (m#by Platform#o) { $agentsect = "platform"; }
				if (m#by Agent and Platform#o) { $agentsect = "combined"; }
				if (m#\s*([\d,]+)\s+\S+     (.*)$#o) {
					$count = $1;
					$agent = $2;
					$count =~ s/,//g;
					if ($agentsect eq "agent") {
						if ($agentreport{$agent}) { $agentreport{$agent} += $count; }
						else { $agentreport{$agent} = $count; }
						$refscounter += $count;
					}
					elsif ($agentsect eq "platform") {
						if ($platformreport{$agent}) { $platformreport{$agent} += $count; }
						else { $platformreport{$agent} = $count; }
					}
					else {
						if ($combinedreport{$agent}) { $combinedreport{$agent} += $count; }
						else { $combinedreport{$agent} = $count; }
					}
				}
			}
			if ($OldStyle && (m#\s*([\d,]+)                 (.*)$#o)) {
				$count = $1;
				$agent = $2;
				$count =~ s/,//g;
				if ($agentcounter{$agent}) { $agentcounter{$agent} += $count; }
				else { $agentcounter{$agent} = $count; }
				$refscounter += $count;
			}
		}
		close (OLDLOG);
	}
	foreach $agent (keys %agentcounter) {
		&Identify_Agent;
		&Identify_Platform;
		unless ($agentreport{$longagent}) {
			$agentreport{$longagent} = 0;
		}
		unless ($platformreport{$longplatform}) {
			$platformreport{$longplatform} = 0;
		}
		$agentreport{$longagent} += $agentcounter{$agent};
		$platformreport{$longplatform} += $agentcounter{$agent};
		if ($shortplatform) {
			unless ($combinedreport{"$longagent ($shortplatform)"}) {
				$combinedreport{"$longagent ($shortplatform)"} = 0;
			}
			$combinedreport{"$longagent ($shortplatform)"} += $agentcounter{$agent};
			$AgentPlatform{$agent} = "$longagent ($shortplatform)";
		}
		else {
			unless ($combinedreport{"$longagent"}) {
				$combinedreport{"$longagent"} = 0;
			}
			$combinedreport{"$longagent"} += $agentcounter{$agent};
			$AgentPlatform{$agent} = "$longagent";
		}
	}
	open (REPORT,">$FileDir/$AgentsFile") || die "  Error Opening File: $AgentsFile\n";
	print REPORT "<HTML><HEAD><TITLE>Agents/Platforms Report: $SystemName</TITLE></HEAD>";
	print REPORT "<BODY $bodyspec>\n";
	if ($headerfile) { &Header; }
	print REPORT "<H1 ALIGN=CENTER>Agents/Platforms:<BR>$SystemName</H1>\n";
	unless ($EndDate eq "0000 00 00 00 00 00") {
		print REPORT "<P ALIGN=CENTER><STRONG>(Accesses Through ";
		($Year,$Month,$Day,$Hour,$Minute,$Second)=
		  split(/ /,$EndDate);
		print REPORT "$Hour:$Minute:$Second $Day ";
		print REPORT "$NumberToMonth{$Month} $Year)</STRONG></P>\n";
	}
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($DetailsFile) {
		print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
	}
	if ($RefsFile) {
		print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
	}
	if ($KeywordsFile) {
		print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
	}
	unless ($agentstartdate) {
		($Year,$Month,$Day,$Hour,$Minute,$Second) = split(/ /,$FileStartDate);
		$Day = int($Day);
		$agentstartdate = "$Day $NumberToMonth{$Month} $Year";
	}
	print REPORT "</P><HR>\n";
	print REPORT "<P>Listed below are the agents (browsers) and ";
	print REPORT "platforms (operating systems) utilized by visitors to ";
	print REPORT "these pages. The first list details the agents utilized; the ";
	print REPORT "second, the platforms. The third combines the ";
	print REPORT "data from the first two. ";
	print REPORT "A total of <STRONG>",&commas($refscounter),"</STRONG> ";
	print REPORT "&quot;hits&quot; have been recorded and ";
	print REPORT "analyzed since <STRONG>$agentstartdate</STRONG>.</P><HR>\n";
	print REPORT "<H2 ALIGN=CENTER>Summary List<BR>(by Agent)</H2>\n";
	print REPORT "<P><FONT FACE=\"Courier\"><PRE>        Hits     Percent     Agent\n\n";
	foreach $key (sort AgentByHits keys(%agentreport)) {
		$percentage=(100*$agentreport{$key}/$refscounter)+0.0051;
		if ($percentage < 10) {
			print REPORT "  ";
			printf REPORT "%10s",&commas($agentreport{$key});
			$percentage=~s/(....).*/$1/;
			print REPORT "       ${percentage}%     ";
			print REPORT $key,"\n";
		}
		else {
			print REPORT "  ";
			printf REPORT "%10s",&commas($agentreport{$key});
			$percentage=~s/(.....).*/$1/;
			print REPORT "      ${percentage}%     ";
			print REPORT $key,"\n";
		}
	}
	print REPORT "</PRE></FONT></P><HR>\n";
	print REPORT "<H2 ALIGN=CENTER>Summary List<BR>(by Platform)</H2>\n";
	print REPORT "<P><FONT FACE=\"Courier\"><PRE>        Hits     Percent     Platform\n\n";
	foreach $key (sort PlatformByHits keys(%platformreport)) {
		$percentage=(100*$platformreport{$key}/$refscounter)+0.0051;
		if ($percentage < 10) {
			print REPORT "  ";
			printf REPORT "%10s",&commas($platformreport{$key});
			$percentage=~s/(....).*/$1/;
			print REPORT "       ${percentage}%     ";
			print REPORT $key,"\n";
		}
		else {
			print REPORT "  ";
			printf REPORT "%10s",&commas($platformreport{$key});
			$percentage=~s/(.....).*/$1/;
			print REPORT "      ${percentage}%     ";
			print REPORT $key,"\n";
		}
	}
	print REPORT "</PRE></FONT></P><HR>\n";
	print REPORT "<H2 ALIGN=CENTER>Summary List<BR>(by Agent and Platform)</H2>\n";
	print REPORT "<P><FONT FACE=\"Courier\"><PRE>        Hits     Percent     Agent (Platform)\n\n";
	foreach $key (sort CombinedByHits keys(%combinedreport)) {
		$percentage=(100*$combinedreport{$key}/$refscounter)+0.0051;
		if ($percentage < 10) {
			print REPORT "  ";
			printf REPORT "%10s",&commas($combinedreport{$key});
			$percentage=~s/(....).*/$1/;
			print REPORT "       ${percentage}%     ";
			print REPORT $key,"\n";
		}
		else {
			print REPORT "  ";
			printf REPORT "%10s",&commas($combinedreport{$key});
			$percentage=~s/(.....).*/$1/;
			print REPORT "      ${percentage}%     ";
			print REPORT $key,"\n";
		}
	}
	print REPORT "</PRE></FONT></P><HR>\n";
	&PrintAgentListKey;
	if ($AgentListFile) {
		if ($DBMType==1) {
			tie (%FullAgentList,'AnyDBM_File',"$AgentListFile",O_RDWR|O_CREAT,0666,$DB_HASH);
		}
		elsif ($DBMType==2) {
			dbmopen(%FullAgentList,"$AgentListFile",0666);
		}
		else {
			tie (%FullAgentList,'AnyDBM_File',"$AgentListFile",O_RDWR|O_CREAT,0666);
		}
		foreach $key (keys(%agentcounter)) { $FullAgentList{$key} += $agentcounter{$key}; }
		if ($DBMType==2) { dbmclose (%FullAgentList); }
		else { untie %FullAgentList; }
	}
	print REPORT "<P ALIGN=CENTER>| <STRONG><A HREF=\"$ReportFile\">Overall Activity Report</A></STRONG> |";
	if ($DetailsFile) {
		print REPORT " <STRONG><A HREF=\"$DetailsFile\">$AccessDetailsReport</A></STRONG> |";
	}
	if ($RefsFile) {
		print REPORT " <STRONG><A HREF=\"$RefsFile\">Referring URLs Report</A></STRONG> |";
	}
	if ($KeywordsFile) {
		print REPORT " <STRONG><A HREF=\"$KeywordsFile\">Keywords Report</A></STRONG> |";
	}
	print REPORT "</P>\n";
	print REPORT "<P ALIGN=CENTER>";
	print REPORT "<SMALL>This report was generated with ";
	print REPORT "<STRONG><A HREF=";
	print REPORT "\"http://awsd.com/scripts/weblog/\">";
	print REPORT "WebLog $version</A></STRONG></SMALL></P>\n";
	if ($footerfile) { &Footer; }
	print REPORT "</BODY></HTML>\n";
	close (REPORT);
}

sub PrintFullAgentLists {
	if ($DBMType==1) {
		tie (%FullAgentList,'AnyDBM_File',"$AgentListFile",O_RDWR|O_CREAT,0666,$DB_HASH);
	}
	elsif ($DBMType==2) {
		dbmopen(%FullAgentList,"$AgentListFile",0666);
	}
	else {
		tie (%FullAgentList,'AnyDBM_File',"$AgentListFile",O_RDWR|O_CREAT,0666);
	}
	foreach $agent (keys %FullAgentList) {
		$grandtotal += $FullAgentList{$agent};
		&Identify_Agent;
		&Identify_Platform;
		$line = " ";
		if ($FullAgentList{$agent} < 100000) { $line .= " "; }
		if ($FullAgentList{$agent} < 10000) { $line .= " "; }
		if ($FullAgentList{$agent} < 1000) { $line .= " "; }
		if ($FullAgentList{$agent} < 100) { $line .= " "; }
		if ($FullAgentList{$agent} < 10) { $line .= " "; }
		$line .= $FullAgentList{$agent};
		$line .= "  $agent\n";
		$agentlist{$longagent} .= $line;
		$AgentCount{$longagent} += $FullAgentList{$agent};
		unless ($longplatform eq $longagent) {
			$platformlist{$longplatform} .= $line;
			$PlatformCount{$longplatform} += $FullAgentList{$agent};
		}
	}
	if ($DBMType==2) { dbmclose (%FullAgentList); }
	else { untie %FullAgentList; }
	open (AGENTS,">agentcheck_agents.txt");
	print AGENTS "Total Hits Counted: $grandtotal\n\n";
	foreach $agent (keys %agentlist) {
		@list = ();
		@list = split (/\n/,$agentlist{$agent});
		print AGENTS "$agent ($AgentCount{$agent}):\n\n";
		foreach $line (sort {$b<=>$a} @list) {
			print AGENTS "$line\n";
		}
		print AGENTS "\n";
	}
	close (AGENTS);
	open (PLATFORMS,">agentcheck_platforms.txt");
	print PLATFORMS "Total Hits Counted: $grandtotal\n\n";
	foreach $platform (keys %platformlist) {
		@list = ();
		@list = split (/\n/,$platformlist{$platform});
		print PLATFORMS "$platform ($PlatformCount{$platform}):\n\n";
		foreach $line (sort {$b<=>$a} @list) {
			print PLATFORMS "$line\n";
		}
		print PLATFORMS "\n";
	}
	close (PLATFORMS);
	if ($Verbose) {
		print "Full Agent and Platform Lists Complete\n";
		print "Normal Reports NOT Generated\n";
	}
	exit;
}

sub Identify_Agent {
	if ($agent =~ m#BannedAccess#oi) {
		$longagent = "Spider/Robot (Banned Access)";
	}
	elsif ($agent =~ m#$harvester_list#oi) {
		$longagent = "E-Mail Harvester";
	}
	elsif ($agent =~ m#$download_list#oi) {
		$longagent = "Download Manager";
	}
	elsif ($agent =~ m#$linkchecker_list#oi) {
		$longagent = "Link Checker";
	}
	elsif ($agent =~ m#$offline_list#oi) {
		$longagent = "Offline Browser";
	}
	elsif ($agent =~ m#$spider_list#oi && $agent !~ m#robotics#oi) {
		$longagent = "Spider/Robot";
		if ($agent =~ m#hotjava#oi) {
			$longagent = "HotJava";
		}
		elsif ($agent =~ m#msnbot#oi) {
			$longagent = "Spider/Robot (MSN)";
		}
		elsif ($agent =~ m#googlebot#oi) {
			$longagent = "Spider/Robot (Google)";
		}
		elsif ($agent =~ m#slurp#oi) {
			$longagent = "Spider/Robot (Yahoo)";
		}
		else {
			$longagent = "Spider/Robot (Unknown)";
		}
	}
	elsif ($agent =~ m#opera/(\d)#oi
	  || $agent =~ m#opera (\d)#oi) {
		$longagent = "Opera";
	}
	elsif ($agent =~ m#mozilla#oi) {
		$mozillaversion = 3;
		if ($agent =~ m#mozilla/(\d)#oi) {
			$mozillaversion = $1;
		}
		if ($mozillaversion > 6) {
			$longagent = "Other Agent";
		}
		elsif ($agent =~ m#compatible#oi) {
			if ($agent =~ m#webtv#oi) {
				$longagent = "WebTV";
			}
			elsif ($agent =~ m#aol (\d)#oi) {
				$longagent = "AOL's Browser v$1";
			}
			elsif ($agent =~ m#iweng (\d)#oi) {
				$longagent = "AOL's Browser v$1";
			}
			elsif ($agent =~ m#omniweb#oi) {
				$longagent = "OmniWeb";
			}
			elsif ($agent =~ m#icab#oi) {
				$longagent = "iCab";
			}
			elsif ($agent =~ m#msie.(\d)#oi) {
				$longagent = "MS Internet Explorer v$1";
			}
			elsif ($agent =~ m#msie#oi) {
				$longagent = "MS Internet Explorer v3";
			}
			elsif ($agent =~ m#frontpage#oi) {
				$longagent = "MS FrontPage";
			}
			elsif ($agent =~ m#quarterdeck#oi) {
				$longagent = "Quarterdeck Mosaic";
			}
			elsif ($agent =~ m#ncbrowser#oi) {
				$longagent = "NC Browser";
			}
			elsif ($agent =~ m#net\.box#oi || $agent =~ m#netbox#oi
			  || $agent =~ m#neos#oi) {
				$longagent = "Net.Box";
			}
			elsif ($agent =~ m#qnx voyager#oi) {
				$longagent = "QNX Voyager";
			}
			elsif ($agent =~ m#staroffice#oi) {
				$longagent = "StarOffice";
			}
			elsif ($agent =~ m#amigavoyager#oi) {
				$longagent = "Amiga Voyager";
			}
			elsif ($agent =~ m#netpositive#oi) {
				$longagent = "NetPositive";
			}
			else {
				$longagent = "Other Agent";
			}
		}
		elsif ($agent =~ m#msie (\d)#oi) {
			$longagent = "MS Internet Explorer v$1";
		}
		elsif ($agent =~ m#msie#oi) {
			$longagent = "MS Internet Explorer v3";
		}
		elsif ($agent =~ m#firefox#oi) {
			$longagent = "Mozilla Firefox";
		}
		elsif ($agent =~ m#safari#oi) {
			$longagent = "Safari";
		}
		else {
			if ($agent =~ m#netscape/7#oi) {
				$mozillaversion = 7;
			}
			elsif ($agent =~ m#netscape/8#oi) {
				$mozillaversion = 8;
			}
			elsif ($agent =~ m#gecko#oi || $agent =~ m#netscape6#oi) {
				$mozillaversion = 6;
			}
			$longagent = "Netscape Navigator v$mozillaversion";
		}
	}
	elsif ($agent =~ m#iweng/(\d)#oi) {
		$longagent = "AOL's Browser v$1";
	}
	elsif ($agent =~ m#aolbrowser/(\d)#oi) {
		$longagent = "AOL's Browser v$1";
	}
	elsif ($agent =~ m#microsoft internet explorer/(\d)#oi) {
		$longagent = "MS Internet Explorer v$1";
	}
	elsif ($agent =~ m#icab#oi) {
		$longagent = "iCab";
	}
	elsif ($agent =~ m#lynx#oi) {
		$longagent = "Lynx";
	}
	elsif ($agent =~ m#frontpage#oi) {
		$longagent = "MS FrontPage";
	}
	elsif ($agent =~ m#quarterdeck#oi) {
		$longagent = "Quarterdeck Mosaic";
	}
	elsif ($agent =~ m#spry_mosaic#oi) {
		$longagent = "Spry Mosaic";
	}
	elsif ($agent =~ m#spyglass_mosaic#oi) {
		$longagent = "Spyglass Mosaic";
	}
	elsif ($agent =~ m#mosaic#oi) {
		$longagent = "NCSA Mosaic";
	}
	elsif ($agent =~ m#lotus-notes#oi) {
		$longagent = "Lotus Notes";
	}
	elsif ($agent =~ m#ibrowse#oi) {
		$longagent = "IBrowse";
	}
	elsif ($agent =~ m#cyberdog#oi) {
		$longagent = "Cyberdog";
	}
	elsif ($agent =~ m#webexplorer#oi) {
		$longagent = "IBM Webexplorer";
	}
	elsif ($agent =~ m#amiga#oi && $agent =~ m#aweb#oi) {
		$longagent = "Amiga AWeb";
	}
	elsif ($agent =~ m#netpositive#oi) {
		$longagent = "NetPositive";
	}
	elsif ($agent =~ m#omniweb#oi) {
		$longagent = "OmniWeb";
	}
	else {
		$longagent = "Other Agent";
	}
}

sub Identify_Platform {
	if ($longagent eq "E-Mail Harvester") {
		$shortplatform = "";
		$longplatform = "E-Mail Harvester";
	}
	elsif ($longagent eq "Download Manager") {
		$shortplatform = "";
		$longplatform = "Download Manager";
	}
	elsif ($longagent eq "Link Checker") {
		$shortplatform = "";
		$longplatform = "Link Checker";
	}
	elsif ($longagent eq "Offline Browser") {
		$shortplatform = "";
		$longplatform = "Offline Browser";
	}
	elsif ($longagent =~ m#Spider/Robot#oi) {
		$shortplatform = "";
		$longplatform = $longagent;
	}
	elsif ($agent =~ m#win#oi) {
		$shortplatform = "Windows";
		if ($agent =~ m#/nt#oi) {
			if ($agent =~ "Windows NT 5.0") { $longplatform = "Windows 2000"; }
			elsif ($agent =~ "Windows NT 5") { $longplatform = "Windows XP"; }
			elsif ($agent =~ "Windows NT") { $longplatform = "Windows NT"; }
			elsif ($agent =~ "Windows 98") { $longplatform = "Windows 98"; }
			else { $longplatform = "Windows 95"; }
		}
		elsif ($agent =~ m#wince#oi || $agent =~ m#windows ce#oi) {
			$longplatform = "Windows CE";
		}
		elsif ($agent =~ m#win95#oi || $agent =~ m#windows 95#oi) {
			$longplatform = "Windows 95";
		}
		elsif ($agent =~ m#win98#oi || $agent =~ m#windows 98#oi) {
			$longplatform = "Windows 98";
		}
		elsif ($agent =~ m#win2k#oi || $agent =~ m#windows 20#oi
		  || $agent =~ m#NT 5.0#oi) {
			$longplatform = "Windows 2000";
		}
		elsif ($agent =~ m#windows xp#oi || $agent =~ m#winxp#oi
		  || $agent =~ m#NT 5#oi) {
			$longplatform = "Windows XP";
		}
		elsif ($agent =~ m#winNT#oi || $agent =~ m#windows nt#oi) {
			$longplatform = "Windows NT";
		}
		elsif ($agent =~ m#windows 3#oi || $agent =~ m#win16#oi) {
			$longplatform = "Windows 3.1";
		}
		elsif ($agent =~ m#winweb#oi || $agent =~ m#windows#oi
		  || $agent =~ m#win32#oi) {
			$longplatform = "Windows 95/98/NT (unspecified)";
		}
		elsif ($agent =~ m#linux#oi) {
			$shortplatform = "Unix/Linux";
			$longplatform = "Linux";
		}
		elsif ($agent =~ m#window#oi || $agent =~ m#xwin#oi) {
			$shortplatform = "Unix/Linux";
			$longplatform = "Unix/Linux (unspecified)";
		}
		else {
			$longplatform = "Windows 95/98/NT (unspecified)";
		}
	}
	elsif ($agent =~ m#mac#oi) {
		$shortplatform = "MacOS";
		if ($agent =~ m#ppc#oi || $agent =~ m#powerpc#oi) {
			$longplatform = "MacOS (PowerPC)";
		}
		elsif ($agent =~ m#machine#oi) {
			$shortplatform = "Unknown Platform";
			$longplatform = "Unknown Platform";
		}
		else {
			$longplatform = "MacOS (68K)";
		}
	}
	elsif ($agent =~ m#omniweb#oi) {
		$shortplatform = "MacOS";
		$longplatform = "MacOS (68K)";
	}
	elsif ($agent =~ m#amiga#oi) {
		$shortplatform = "Amiga OS";
		$longplatform = "Amiga OS";
	}
	elsif ($agent =~ m#os/2#oi || $agent =~ m#webexplorer#oi) {
		$shortplatform = "OS/2";
		$longplatform = "OS/2";
	}
	elsif ($agent =~ m#x11#oi) {
		$shortplatform = "Unix/Linux";
		if ($agent =~ m#hp-ux#oi) {
			$longplatform = "HP-UX";
		}
		elsif ($agent =~ m#linux#oi || $agent =~ m#konqueror#oi) {
			$longplatform = "Linux";
		}
		elsif ($agent =~ m#sunos 5#oi) {
			$longplatform = "Solaris";
		}
		elsif ($agent =~ m#sunos#oi) {
			$longplatform = "SunOS";
		}
		elsif ($agent =~ m#freebsd#oi) {
			$longplatform = "FreeBSD";
		}
		elsif ($agent =~ m#openbsd#oi) {
			$longplatform = "OpenBSD";
		}
		elsif ($agent =~ m#bsd#oi) {
			$longplatform = "NetBSD";
		}
		elsif ($agent =~ m#aix#oi) {
			$longplatform = "AIX";
		}
		elsif ($agent =~ m#osf#oi) {
			$longplatform = "OSF/1";
		}
		elsif ($agent =~ m#irix#oi) {
			$longplatform = "IRIX";
		}
		elsif ($agent =~ m#unixware#oi) {
			$longplatform = "UnixWare";
		}
		elsif ($agent =~ m#sco#oi) {
			$longplatform = "SCO";
		}
		elsif ($agent =~ m#openvms#oi) {
			$shortplatform = "OpenVMS";
			$longplatform = "OpenVMS";
		}
		else {
			$longplatform = "Unix/Linux (unspecified)";
		}
	}
	elsif ($agent =~ m#iweng#oi || $agent =~ m#frontpage#oi) {
		$shortplatform = "Windows";
		$longplatform = "Windows 95/98/NT (unspecified)";
	}
	elsif ($agent =~ m#webtv#oi) {
		$shortplatform = "";
		$longplatform = "WebTV";
	}
	elsif ($agent =~ m#linux#oi || $agent =~ m#konqueror#oi) {
		$shortplatform = "Unix/Linux";
		$longplatform = "Linux";
	}
	elsif ($agent =~ m#lynx#oi) {
		$shortplatform = "Unix/Linux";
		$longplatform = "Unix/Linux (unspecified)";
	}
	elsif ($agent =~ m#nc os#oi) {
		$shortplatform = "NC OS";
		$longplatform = "NC OS";
	}
	elsif ($agent =~ m#ultrix#oi) {
		$shortplatform = "Ultrix";
		$longplatform = "Ultrix";
	}
	elsif ($agent =~ m#sega saturn#oi) {
		$shortplatform = "Sega Saturn";
		$longplatform = "Sega Saturn";
	}
	elsif ($agent =~ m#photon#oi) {
		$shortplatform = "Photon";
		$longplatform = "Photon (QNX)";
	}
	elsif ($agent =~ m#risc os#oi) {
		$shortplatform = "RISC OS";
		$longplatform = "RISC OS";
	}
	elsif ($agent =~ m#epoc#oi) {
		$shortplatform = "EPOC";
		$longplatform = "EPOC";
	}
	elsif ($agent =~ m#geos#oi) {
		$shortplatform = "GEOS";
		$longplatform = "GEOS";
	}
	elsif ($agent =~ m#neos#oi) {
		$shortplatform = "NEOS";
		$longplatform = "NEOS (Net.Box)";
	}
	elsif ($agent =~ m#netpositive#oi || $agent =~ m#beos#oi) {
		$shortplatform = "BeOS";
		$longplatform = "BeOS";
	}
	else {
		$shortplatform = "Unknown Platform";
		$longplatform = "Unknown Platform";
	}
}

sub AgentByHits {
	$ahits=$agentreport{$a};
	$bhits=$agentreport{$b};
	$bhits<=>$ahits;
}

sub PlatformByHits {
	$ahits=$platformreport{$a};
	$bhits=$platformreport{$b};
	$bhits<=>$ahits;
}

sub CombinedByHits {
	$ahits=$combinedreport{$a};
	$bhits=$combinedreport{$b};
	$bhits<=>$ahits;
}

sub date_to_count {
	($perp_mon,$perp_day,$perp_year) = @_;
	%day_counts =
	  (1,0,2,31,3,59,4,90,5,120,6,151,7,181,
	  8,212,9,243,10,273,11,304,12,334);
	%dates =
	  (0,'Thu',1,'Fri',2,'Sat',3,'Sun',4,'Mon',5,'Tue',6,'Wed');
	$perp_days = (($perp_year-93)*365)+(int(($perp_year-93)/4));
	$perp_mons = (($perp_year-93)*12);
	$perp_days = $perp_days + $day_counts{$perp_mon};
	$perp_mons = $perp_mons + $perp_mon;
	if ((int(($perp_year-92)/4) eq (($perp_year-92)/4)) && ($perp_mon>2)) {
		$perp_days++;
	}
	$perp_days = $perp_days + $perp_day;
	$perp_date = $perp_days-(int($perp_days/7)*7);
	$perp_date = $dates{$perp_date};
}

sub count_to_mon {
	local($perp_mons) = @_;
	$perp_year = 93+(int(($perp_mons-1)/12));
	$perp_mon = $perp_mons-(int(($perp_mons-1)/12)*12);
}

sub count_to_date {
	local($perp_days) = @_;
	%day_counts =
	  (1,0,2,31,3,59,4,90,5,120,6,151,
	  7,181,8,212,9,243,10,273,11,304,12,334);
	$perp_year = (int(($perp_days-1)/1461))*4;
	$perp_days = $perp_days-(int(($perp_days-1)/1461)*1461);
	if ($perp_days == 1461) {
		$perp_year = 93+$perp_year+3;
		$perp_days = $perp_days-1095;
	}
	else {
		$perp_year = 93+$perp_year+(int(($perp_days-1)/365));
		$perp_days = $perp_days-(int(($perp_days-1)/365)*365);
	}
		foreach $key (sort {$a <=> $b} keys %day_counts) {
		$perp_count = $day_counts{$key};
		if ((int(($perp_year-92)/4) eq (($perp_year-92)/4)) && ($key>2)) {
			$perp_count++;
		}
		if ($perp_days > $perp_count) {
			$perp_mon = $key;
			$perp_subtract = $perp_count;
		}
	}
	$perp_day = $perp_days-$perp_subtract;
}

sub PrintAgentListKey {
print REPORT qq!
<P><TABLE CELLPADDING=3><TR>
<TD COLSPAN=3>Specific agents (Web browsers) recognized by WebLog include:</TD>
</TR><TR>
<TD VALIGN=TOP NOWRAP><SMALL><UL>
<LI><STRONG>Amiga Voyager</STRONG><LI><STRONG>AOL's Browser</STRONG>
<LI><STRONG>AWeb</STRONG><LI><STRONG>Cyberdog</STRONG>
<LI><STRONG>HotJava</STRONG><LI><STRONG>IBM Webexplorer</STRONG>
<LI><STRONG>IBrowse</STRONG><LI><STRONG>iCab</STRONG>
<LI><STRONG>Lotus Notes</STRONG><LI><STRONG>Lynx</STRONG>
<LI><STRONG>MS FrontPage</STRONG><LI><STRONG>MS Internet Explorer</STRONG>
<LI><STRONG>Mozilla Firefox</STRONG><LI><STRONG>NC Browser</STRONG>
<LI><STRONG>NCSA Mosaic</STRONG><LI><STRONG>Net.Box</STRONG>
<LI><STRONG>NetPositive</STRONG><LI><STRONG>Netscape Navigator</STRONG>
<LI><STRONG>OmniWeb</STRONG><LI><STRONG>Opera</STRONG>
<LI><STRONG>QNX Voyager</STRONG><LI><STRONG>Quarterdeck Mosaic</STRONG>
<LI><STRONG>Safari</STRONG><LI><STRONG>Spry Mosaic</STRONG><LI><STRONG>Spyglass Mosaic</STRONG>
<LI><STRONG>StarOffice</STRONG><LI><STRONG>WebTV</STRONG>
</UL></SMALL></TD>
<TD>&nbsp;</TD>
<TD VALIGN=TOP><SMALL><UL>
<LI>The <STRONG>Spider/Robot</STRONG> category includes accesses by search engine &quot;spiders&quot; and other automated programs which roam the Web. <STRONG>Offline Browsers</STRONG> are similar to the search engine robots, but are sent by specific individuals interested in viewing content off-line. <STRONG>Download Managers</STRONG> include FTP clients and &quot;download accelerators.&quot; <STRONG>Link Checkers</STRONG> are, self-evidently, automated link monitoring and &quot;uptime monitoring&quot; tools. The <STRONG>E-Mail Harvester</STRONG> category reflects accesses by robots specifically searching for e-mail addresses, usually for the purpose of adding them to &quot;spam&quot; mailing lists. Finally, the <STRONG>Other Agent</STRONG> category, of course, includes everything which can't, for whatever reason, be identified as belonging to one of the other categories.
</UL></SMALL></TD>
</TR></TABLE>
<P><TABLE CELLPADDING=3><TR>
<TD COLSPAN=5>Recognized platforms (operating systems) include:</TD>
</TR><TR>
<TD VALIGN=TOP NOWRAP><SMALL><UL>
<LI><STRONG>Windows</STRONG>
<UL><LI>Windows 3.1<LI>Windows 95<LI>Windows 98<LI>Windows NT<LI>Windows 2000<LI>Windows CE<LI>Windows XP</UL>
<LI><STRONG>Amiga OS</STRONG><LI><STRONG>BeOS</STRONG>
<LI><STRONG>EPOC</STRONG><LI><STRONG>GEOS</STRONG>
<LI><STRONG>MacOS</STRONG>
<UL><LI>MacOS (68k)<LI>MacOS (PowerPC)</UL>
<LI><STRONG>NC OS</STRONG><LI><STRONG>NEOS</STRONG>
<LI><STRONG>OpenVMS</STRONG><LI><STRONG>OS/2</STRONG>
</UL></SMALL></TD>
<TD>&nbsp;</TD>
<TD VALIGN=TOP NOWRAP><SMALL><UL>
<LI><STRONG>Photon</STRONG><LI><STRONG>RISC OS</STRONG><LI><STRONG>Sega Saturn</STRONG>
<LI><STRONG>Ultrix</STRONG><LI><STRONG>Unix/Linux</STRONG>
<UL><LI>AIX<LI>FreeBSD<LI>HP-UX<LI>IRIX<LI>Linux<LI>NetBSD<LI>OpenBSD<LI>OSF/1<LI>SCO<LI>Solaris<LI>SunOS<LI>UnixWare</UL>
<LI><STRONG>WebTV</STRONG>
</UL></SMALL></TD>
<TD>&nbsp;</TD>
<TD VALIGN=TOP><SMALL><UL>
<LI>The various &quot;robot&quot; categories mean precisely the same thing in the &quot;Platforms&quot; list as they do in the &quot;Agents&quot; list. The <STRONG>Unknown Platform</STRONG> category, of course, includes accesses for which no platform could be determined, as well as any from platforms not included in the above breakdown.
</UL></SMALL></TD>
</TR></TABLE>
<HR>
!;
}

sub PrintKeywordsListKey {
print REPORT qq!
<P>The specific search engines and directories included in the above report are <STRONG><A HREF="http://www.about.com/">About</A></STRONG>, <STRONG><A HREF="http://www.altavista.com/">AltaVista</A></STRONG>, <STRONG><A HREF="http://search.aol.com/">AOL Netfind</A></STRONG>, <STRONG><A HREF="http://www.askjeeves.com/">Ask Jeeves</A></STRONG>, <STRONG><A HREF="http://www.search.com/">c|net search.com</A></STRONG>, <STRONG><A HREF="http://www.directhit.com/">Direct Hit</A></STRONG>, <STRONG><A HREF="http://www.dogpile.com/">Dogpile</A></STRONG>, <STRONG><A HREF="http://www.euroferret.com/">EuroFerret</A></STRONG>, <STRONG><A HREF="http://www.euroseek.net/">EuroSeek</A></STRONG>, <STRONG><A HREF="http://www.excite.com/">Excite</A></STRONG>, <STRONG><A HREF="http://www.alltheweb.com/">FAST (All the Web, All the Time)</A></STRONG>, <STRONG><A HREF="http://www.hotbot.com/">HotBot</A></STRONG>, <STRONG><A HREF="http://www.google.com/">Google</A></STRONG>, <STRONG><A HREF="http://www.goto.com/">GoTo</A></STRONG>, <STRONG><A HREF="http://www.go.com/">Infoseek (Go Network)</A></STRONG>, <STRONG><A HREF="http://www.looksmart.com/">LookSmart</A></STRONG>, <STRONG><A HREF="http://www.lycos.com/">Lycos</A></STRONG>, <STRONG><A HREF="http://magellan.excite.com/">Magellan</A></STRONG>, <STRONG><A HREF="http://www.mamma.com/">Mamma</A></STRONG>, <STRONG><A HREF="http://www.go2net.com/">MetaCrawler (Go2Net)</A></STRONG>, <STRONG><A HREF="http://search.msn.com/">MSN (Microsoft Network)</A></STRONG>, <STRONG><A HREF="http://www.nbci.com/">NBCi</A></STRONG> (formerly Snap), <STRONG><A HREF="http://search.netscape.com/">Netscape Search</A></STRONG>, <STRONG><A HREF="http://www.northernlight.com/">Northern Light</A></STRONG>, <STRONG><A HREF="http://www.planetsearch.com/">PlanetSearch</A></STRONG>, <STRONG><A HREF="http://www.savvysearch.com/">SavvySearch</A></STRONG>, <STRONG><A HREF="http://www.webcrawler.com/">WebCrawler</A></STRONG> and <STRONG><A HREF="http://www.yahoo.com/">Yahoo</A></STRONG>.</P>
<HR>
!;
}

sub Header {
	open (HEADER,"$headerfile");
	@header = <HEADER>;
	close (HEADER);
	foreach $line (@header) { print REPORT "$line"; }
}

sub Footer {
	open (FOOTER,"$footerfile");
	@footer = <FOOTER>;
	close (FOOTER);
	foreach $line (@footer) { print REPORT "$line"; }
}

1;
