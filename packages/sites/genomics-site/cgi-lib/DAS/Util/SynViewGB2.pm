package DAS::Util::SynViewGB2;

sub postgrid {
  my ($gd, $panel) = @_;
  $gd->alphaBlending(0);
  $gd->saveAlpha(1);
  #$panel->boxes();    # causes the layout to be calculated
  use Tie::IxHash;
  use Data::Dumper;
  my %orthologs;
  my %location;
  my %drawn;
  my %newdrawn;
  my @group;
  my %seen;
  foreach my $box (@{$panel->boxes}) {
      my ($f, $x1, $y1, $x2, $y2) = @$box;
      $location{$f->name} = [$x1, $y1, $x2, $y2];
      next unless $f->isa("Bio::SeqFeatureI");
      next if $f->isa("Bio::Das::Feature");
      my $gene = $f->name;
      my $type = $f->type;
      last unless $type =~ /synteny/i;
      my @og = ();
      if(!exists $seen{$gene}) {
        $seen{$gene}++;
        my @orthologs = $f->get_tag_values("Ortholog");
        next unless @orthologs;
        foreach (@orthologs) {
          my $g = @$_->[0];
          $seen{$g}++;
          push @og, $g;
        }
        push @og, $gene;
        push @group, \@og;
      }
  }
  foreach my $g (@group) {
    my @new;
    foreach (@$g) {
      push @new, $location{$_} if (exists $location{$_});
    }
    my @sorted = sort { $a->[1] <=> $b->[1] } @new;
    my $size = @sorted;
    #warn "size: $size";
    for(my $i=0; $i< $size-1; $i++) {
      my ($x1, $y1, $x2, $y2) = @{$sorted[$i]};
      my ($ox1, $oy1, $ox2, $oy2) = @{$sorted[$i+1]};
      #warn "sorted: $x1, $y1, $ox1, $oy1";
      my $polygon = GD::Polygon->new();
      $polygon->addPt($x1, $y2);
      $polygon->addPt($x2, $y2);
      $polygon->addPt($ox2, $oy1+10);
      $polygon->addPt($ox1, $oy1+10);
      $gd->filledPolygon($polygon, $gd->colorAllocateAlpha($panel->color_name_to_rgb("darkgray"), 100));
      $gd->line($x1, $y2, $ox1, $oy1+10, $panel->translate_color("lightsteelblue"));
      $gd->line($x2, $y2, $ox2, $oy1+10, $panel->translate_color("lightsteelblue"));
    }
  }
}

1;
