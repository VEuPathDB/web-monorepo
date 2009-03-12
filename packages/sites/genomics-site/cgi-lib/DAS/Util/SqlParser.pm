package DAS::Util::SqlParser;

=head1 NAME

DAS::Util - A simple XML sql parser

=head1 SYNOPSIS

		my $parser = DAS::Util::SqlParser->new(SQLFILE);
		my $query = $parser->getSQL("GUS.pm", "get_feature_by_name");
		$query =~ s/(\$\w+)/eval $1/eg;
=cut

=head1 AUTHOR

Name:  Haiming Wang
Email: hwang@uga.edu

=cut

use strict;
use XML::Simple;
use Data::Dumper;

sub new {
	my $class = shift;
	my $self = {};
	my @file = @_;

	my $xsl = XML::Simple->new();
	my $tree = $xsl->XMLin(@file, Cache => 'memshare') or die "cannot open the sql file\n";

	$self->{tree} = $tree;

	bless( $self, $class );
	return $self;

}

sub setProjectId {$_[0]->{projectId} = $_[1]}
sub getProjectId {
  my ($self) = @_;

  my $projectId = $self->{projectId};

  unless($projectId) {
    die "Project Id was not set!";
  }
  return $projectId;
}

sub getSQL {
	my $self = shift;
	my ($modulename, $key) = @_;

	my $obj = $self->{tree}->{module}->{$modulename}->{sqlQuery};

        return $obj->{sql} if (exists $obj->{sql});
        my $sqlObj = $obj->{$key}->{sql};

        return $self->_getSQL($sqlObj, $key);
}


sub print {
	my $self = shift;
	print Dumper($self);
}

sub _getSQL {
  my ($self, $sqlObj, $key) = @_;

  my $projectId = $self->getProjectId();

  my $rv;
  my $sqlCount = 0;

  # If there is only one but it has an includeProjects attribute force it onto an array
  if(ref($sqlObj) eq 'HASH') {
    $sqlObj = [$sqlObj];
  }

  if(ref($sqlObj) eq 'ARRAY') {
    my $alreadyIncluded;

    foreach my $sql (@$sqlObj) {
      if(ref($sql) eq 'HASH') {
        next if($sql->{excludeProjects} && $sql->{excludeProjects} =~ /$projectId/);

        if($sql->{includeProjects} && $sql->{includeProjects} =~ /$projectId/) {
          $rv = $sql->{content};
          $alreadyIncluded = 1;
          $sqlCount++;
        }
        if($sql->{excludeProjects} && $sql->{excludeProjects} !~ /$projectId/) {
          $rv = $sql->{content} unless($alreadyIncluded);
          $sqlCount++;
        }
      }
      else {
        $rv = $sql unless($alreadyIncluded);
        $sqlCount++;
      }
    }
  }
  else {
    $rv = $sqlObj;
    $sqlCount++;
  }

  unless($sqlCount == 1) {
    die "Multiple SQL statements found for $key" . Dumper $rv;
  }

  return $rv;

}

1;
