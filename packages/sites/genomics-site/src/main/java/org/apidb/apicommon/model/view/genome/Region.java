package org.apidb.apicommon.model.view.genome;

import java.util.ArrayList;
import java.util.List;

public class Region {

  private final boolean forward;
  private final List<Feature> features;
  private double percentLength;
  private double percentStart;

  public Region(boolean forward) {
    this.forward = forward;
    this.features = new ArrayList<>();
  }

  public boolean isForward() {
    return forward;
  }

  public String getStrand() {
    return forward ? "forward" : "reversed";
  }

  public String getSourceId() {
    return features.get(0).getSequenceId() + "-" + getStart() ;
  }

  public void addFeature(Feature feature) throws GenomeViewException {
    // make sure the feature is on the same strand as the region
    if (feature.isForward() != forward)
      throw new GenomeViewException(
          "The feature has to be on the same strand as the region. The region is on " + getStrand() +
              " strand, while feature " + feature.getSourceId() + " is on " + feature.getStrand() +
              " strand.");

    features.add(feature);
  }

  public List<Feature> getFeatures() {
    return new ArrayList<>(features);
  }

  public int getFeatureCount() {
    return features.size();
  }

  public long getStart() {
    return getLocation()[0];
  }

  public long getEnd() {
    return getLocation()[1];
  }

  public long getLength() {
    long[] location = getLocation();
    return (location[1] - location[0] + 1);
  }

  private long[] getLocation() {
    if (features.isEmpty())
      return new long[] { 0, 0 };
    long start = Long.MAX_VALUE, end = Long.MIN_VALUE;
    for (Feature feature : features) {
      if (feature.getStart() < start)
        start = feature.getStart();
      if (feature.getEnd() > end)
        end = feature.getEnd();
    }
    return new long[] { start, end };
  }

  public String getEndFormatted() {
    return GenomeViewHandler.FORMAT.format(getEnd());
  }

  public String getStartFormatted() {
    return GenomeViewHandler.FORMAT.format(getStart());
  }

  /**
   * @return the percentLength
   */
  public double getPercentLength() {
    return percentLength;
  }

  /**
   * @return the percentStart
   */
  public double getPercentStart() {
    return percentStart;
  }

  public void computePercentSize(long maxLength) {
    long[] location = getLocation();
    // compute the percent size of the region relative to the sequence
    percentStart = GenomeViewHandler.round(location[0] * 100D / (maxLength));
    percentLength = GenomeViewHandler.round((location[1] - location[0] + 1) * 100D/ maxLength);
    
    // also compute the percent size of each feature relative to the region.
    computeFeaturesPercentSize(location);
  }

  private void computeFeaturesPercentSize(long[] location) {
    long length = location[1] - location[0] + 1;
    for (Feature feature : features) {
      feature.setPercentStart(GenomeViewHandler.round((feature.getStart() - location[0]) * 100D / length));
      feature.setPercentLength(GenomeViewHandler.round(feature.getLength() * 100D / length));
    }
  }

  @Override
  public String toString() {
    return "Region on " + features.get(0).getSequenceId() 
           + " (" + getStartFormatted() + " - " + getEndFormatted() + ") " 
           + getStrand() + " strand";
  }
}
