package  DAS::GUS::QueryLogger;

use Time::HiRes qw ( time );
use Fcntl qw(:flock SEEK_END);
use File::Path;

# Log gbrowse queries.
# file locking is commented out, as it is probably overkill and a bit dangerous.
my $LOG10 = log(10);

#####################################################
# hard coded configuration
#####################################################
# treat sub-floor ranges like the floor
my $RANGE_FLOOR = 50000;

# slowness factors (in seconds) (these get scaled by a function of range)
my $SLIGHT = 0.05;
my $MEDIUM = 0.5;
my $VERY =   2.0;

# max log sizes (megabytes) (shared equally among the three logs).
my $LOGSIZES = {'w1' => 250, 'q1' => 25, 'b1' => 25,
		'w2' => 250, 'q2' => 25, 'b2' => 25,
		'dev' => 1};
#####################################################
#####################################################

sub new {
    my ($class, $logFileDirectory, $site) = @_;
    my $self = {};

    if ($logFileDirectory) {
      $self->{logFileDir} = $logFileDirectory;
      mkpath($logFileDirectory);
      my @siteparts = split(/\./, $site);

      my $slowFile = "$logFileDirectory/very_slow.log";
      &rotateLog($logFileDirectory, 'very_slow', $siteparts[0]);
      open($self->{verySlowHandle},">> $slowFile") ||
	die "Can't open gbrowse log file '$slowFile'\n";

      my $medFile = "$logFileDirectory/medium_slow.log";
      &rotateLog($logFileDirectory, 'medium_slow', $siteparts[0]);
      open($self->{mediumSlowHandle},">> $medFile") ||
	die "Can't open gbrowse log file '$medFile'\n";

      my $slightFile = "$logFileDirectory/slightly_slow.log";
      &rotateLog($logFileDirectory, 'slightly_slow', $siteparts[0]);
      open($self->{slightlySlowHandle},">> $slightFile") ||
	die "Can't open gbrowse log file '$slightFile'\n";
    }
    bless($self,$class);
    return $self;
}

# execute a query, and log if we have a handle
sub execute {
    my ($self, $sth, $sql, $moduleName, $queryName, $range, $inGenePage) = @_;
    my $start_time = time();
    my $status = $sth->execute();

    if ($self->{logFileDir}) {
      my $elapsed_time = time() - $start_time;

      my $reportedRange = $range? $range : "n/a";
      my $r = ($range && $range >= $RANGE_FLOOR)? $range : $RANGE_FLOOR;

      # scaling here so that 50k = 1, 1m = 5 and 5m = 9
      # in other words, an approx 10 fold difference in speed allowed
      # across typical smallest window (gene page) and largest (chromosome)
      my $scaledRange = &log10($r/5000) ** 2;
      $slightlySlow = $scaledRange * $SLIGHT;
      $mediumSlow = $scaledRange * $MEDIUM;
      $verySlow = $scaledRange * $VERY;

      my $fh;
      my $howSlow;
      if ($elapsed_time > $verySlow) {
	$fh = $self->{verySlowHandle};
	$howSlow = 'v';
      } elsif ($elapsed_time > $mediumSlow) {
	$fh = $self->{mediumSlowHandle};
	$howSlow = 'm';
      } elsif ($elapsed_time > $slightlySlow) {
	$fh = $self->{slightlySlowHandle};
	$howSlow = 's';
      }
      if ($fh) {
#        lock($fh);
	print $fh "============================================================================\n";
	print $fh "QUERYTIME\t" . localtime() . "\t" . time() . "\t$howSlow\t$moduleName\t" . sprintf("%.2f", $elapsed_time) . "\t$reportedRange\t$queryName\n";
	print $fh "============================================================================\n";
	print $fh "$sql\n\n";
#	unlock($fh);
      }
    }
    return $status;
}

sub lock {
  my ($fh) = @_;
  flock($fh, LOCK_EX) or die "Cannot lock gbrowse log - $!\n";

  # and, in case someone appended while we were waiting...
  seek($fh, 0, SEEK_END) or die "Cannot seek - $!\n";
}

sub unlock {
  my ($fh) = @_;
  flock($fh, LOCK_UN) or die "Cannot unlock gbrowse log - $!\n";
}

sub log10 {
  my $n = shift;
  return log($n)/$LOG10;
}

sub rotateLog {
  my ($logFileDir, $file_base_name, $sitetype) = @_;

  my $maxsize = $LOGSIZES->{$sitetype};
  $maxsize = $LOGSIZES->{dev} unless $maxsize;
  $maxsize = $maxsize * 1000000 / 3;

  my $logFile = "$logFileDir/$file_base_name.log";
  my $rotatedLogFile = "$logFileDir/$file_base_name.1.log";
  my $tmpLogFile = "$rotatedLogFile.tmp";

  # see if we have a log that is too big
  if (-s $logFile > $maxsize) {
    rename($logFile, $tmpLogFile);
  }

  # see if we have a tmp file older than 5 minutes
  elsif (-e $tmpLogFile && (-M $tmpLogFile) * 24 * 60 > 5) {
    rename($tmpLogFile, $rotatedLogFile);
    exec("gzip $rotatedLogFile");
  }

}

1;
