<style>
  #spanLogicParams, #spanLogicGraphics {
    float:left;
    margin:5px;
  }

  #spanLogicParams fieldset, #spanLogicGraphics {
    float:left;
    border:1px solid gray;
  }
 
  #spanLogicParams fieldset:first-of-type {
    margin-bottom: 5px;
  }

  .invisible {
    visibility: hidden;
  }  

  .roundLabel {
    float:left;
    height: 3em;
    margin: 7px;
    width: 3em;
    text-align:center;
    border: 2px solid black;
    -moz-border-radius: 1.7em; /* Not sure why this doesn't work @ 1.5em */
  }

  .roundLabel span {
    font-size:2em;
    line-height: 1.5;
  }
</style>

<form>
  <div id="spanLogicParams">
    <div class="roundLabel"><span>A</span></div>
    <fieldset id="setAFields">
      <table id="offsetOptions" cellpadding="2">
        <tr>
          <td>begin</td>
          <td align="left">
            <select name="upstreamAnchor">
              <option value="Start" selected>Start</option>
              <option value="CodeStart">translation start (ATG)</option>
              <option value="CodeEnd">translation stop codon</option>
              <option value="End">Stop</option>
            </select>
          </td>
          <td align="left">
            <select name="upstreamSign">
              <option value="plus" selected>+</option>
              <option value="minus">-</option>
            </select>
	  </td>
          <td align="left">
            <input id="upstreamOffset" name="upstreamOffset" value="0" size="6"/> nucleotides
          </td>
        </tr>
        <tr>
          <td>end</td>
          <td align="left">
            <select name="downstreamAnchor">
              <option value="Start">Start</option>
              <option value="CodeStart">translation start (ATG)</option>
              <option value="CodeEnd">translation stop codon</option>
              <option value="End" selected>Stop</option>
            </select>
          </td>
          <td align="left">
            <select name="downstreamSign">
              <option value="plus" selected>+</option>
              <option value="minus">-</option>
            </select>
          </td>
          <td align="left">
            <input id="downstreamOffset" name="downstreamOffset" value="0" size="6"> nucleotides
          </td>
        </tr>
      </table>
    </fieldset>
    <ul class="clear">
      <li style="float:left;margin-bottom:5px;"><input type="radio" name="relationship" value="overlaps">Overlaps with</input></li>
      <li style="float:left;"><input type="radio" name="relationship" value="contains">Containing</input></li>
      <li style="float:left;"><input type="radio" name="relationship" value="contained">Contained within</input></li>
    </ul>
    <div class="roundLabel clear"><span>B</span></div>
    <fieldset id="setBFields">
      <table id="offsetOptions" cellpadding="2">
        <tr>
          <td>begin</td>
          <td align="left">
            <select name="upstreamAnchor">
              <option value="Start" selected>Start</option>
              <option value="CodeStart">translation start (ATG)</option>
              <option value="CodeEnd">translation stop codon</option>
              <option value="End">Stop</option>
            </select>
          </td>
          <td align="left">
            <select name="upstreamSign">
              <option value="plus" selected>+</option>
              <option value="minus">-</option>
            </select>
	  </td>
          <td align="left">
            <input id="upstreamOffset" name="upstreamOffset" value="0" size="6"/> nucleotides
          </td>
        </tr>
        <tr>
          <td>end</td>
          <td align="left">
            <select name="downstreamAnchor">
              <option value="Start">Start</option>
              <option value="CodeStart">translation start (ATG)</option>
              <option value="CodeEnd">translation stop codon</option>
              <option value="End" selected>Stop</option>
            </select>
          </td>
          <td align="left">
            <select name="downstreamSign">
              <option value="plus" selected>+</option>
              <option value="minus">-</option>
            </select>
          </td>
          <td align="left">
            <input id="downstreamOffset" name="downstreamOffset" value="0" size="6"> nucleotides
          </td>
        </tr>
      </table>
    </fieldset>
  </div>
  <div id="spanLogicGraphics">&nbsp;</div>
  <hr class="clear" />
  <ul>
    <li style="float:left;line-height:1.5">Select Strand:&nbsp;</li>
    <li style="float:left;margin-bottom:5px;"><input type="radio" name="strand" value="either">Either</input></li>
    <li style="float:left;"><input type="radio" name="strand" value="both">Both</input></li>
    <li style="float:left;"><input type="radio" name="strand" value="same">Same</input></li>
  </ul>
  <ul class="clear">
    <li style="float:left;line-height:1.5">Select Output Set:&nbsp;</li>
    <li style="float:left;"><input type="radio" name="output" value="A">Set A</input></li>
    <li style="float:left;"><input type="radio" name="output" value="B">Set B</input></li>
  </ul>
  <hr class="clear invisible" />
</form>
