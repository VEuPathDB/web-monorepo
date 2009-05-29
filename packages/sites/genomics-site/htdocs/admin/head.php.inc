<head>
    <title><? print $_SERVER['HTTP_HOST'] ?> site info</title>
    <meta http-equiv="content-type" content="text/html; charset=iso-8859-1" />

    <script type='text/javascript' src='/a/js/overlib.js'></script>
    <script type='text/javascript' src='/a/js/prototype.js'></script>
    <script type='text/javascript' src='/a/js/scriptaculous.js'></script>

    <script type="text/javascript">
      var ol_textcolor = "#003366";
      var ol_fgcolor = "#ffffff";
      var ol_bgcolor = "#003366";
      var ol_texsize = "11px";
      var ol_cellpad = "5";
      var ol_height = -1;
      var ol_vpos = ABOVE;
    </script>

    <style type="text/css">
    body {
        margin: 20px;
        padding: 0px;
        background: #DDDDDD;
        font: 16px arial, sans-serif;
    }

    #tabmenu {
        color: #000;
        border-bottom: 1px solid black;
        margin: 12px 0px 0px 0px;
        padding: 0px;
        z-index: 1;
        padding-left: 10px
    }

    #tabmenu li {
        display: inline;
        overflow: hidden;
        list-style-type: none;
    }

    #tabmenu a, a.active {
        color: #000000;
        background: #cccccc;
        font: bold 1em "Trebuchet MS", Arial, sans-serif;
        border: 1px solid black;
        padding: 2px 5px 0px 5px;
        margin: 0;
        text-decoration: none;
    }

    #tabmenu a.active {
        background: #FFFFFF;
        border-bottom: 1px solid #FFFFFF;
    }

    #tabmenu a:hover {
        color: #000;
        background: #fff;
    }

    #tabmenu a:visited {
        color: #000;
    }

    #tabmenu a.active:hover {
        background: #fff;
        color: #00000;
    }

    #content {
        font: 12px Verdana, Arial, Helvetica, sans-serif;
        text-align: justify;
        background: #ffffff;
        padding: 20px;
        border: 1px solid black;
        border-top: none;
        z-index: 2;
    }

   /** ############# **/
    
    a { color: #2F4F4F }
    
    h2 {
       border-width:2px 0;
       border-style:solid;
       border-color:#C28547;
       padding-left: 5px;
    }
       
     h3.banner {
        background: #336699;
        color: white;
        cursor: pointer;
        font-family: Arial, Helvetica, sans-serif;
        margin: 0 0 5px 0;
        padding: 5px;
        font-size: 14px;
    }
    
     h3.banner a { 
            color: white;
         }
    
    p {
        font-size: 12px;
        margin: 12px 8px;
    }
    
    table.p {
        font-size: 12px;
        margin: 12px 8px;
    }
    
    td.p {
        padding-left: 10px; 
    }
    
    tr.rowMedium {
        background-color: #C4CFCB;
        color: black;
        font-family: arial;
        font-size: 10pt;
    }
    tr.rowMedium td {
        padding-left:   5px;
        padding-top:    1px;
        padding-bottom: 1px;
    }
    tr.rowLight {
        background-color: #FFFFFF;
        color: black;
        font-family: arial;
        font-size: 10pt;
    }
    tr.rowLight td {
        padding-left:   5px;
        padding-top:    1px;
        padding-bottom: 1px;
    }    
    
    tr.headerRow {
        background: #EFEFEF;
    }
    tr.headerRow  td,th {
       border-width:2px 0;
       border-style:solid;
       border-color:#336699;
       padding-left: 5px;
    }

    div.related_siteinfo_links {
      float: right;
      width: 27em;
      padding: 0.5em;
      margin: 0 0em 0 0;
      color: black;
      background: #dee2ed;
      border-left: 1px solid #C28547;
      border-top: 1px solid #C28547;
      }
</style>



</head>
