


   var inputUrl = jQuery('#myURL');
   var senti = {};

   senti.Start = function(url) {
    
        var capi_base = "https://content.guardianapis.com";
        var capi_fields = "show-fields=body,shortUrl";
        var capi_key = "api-key=gnm-hackday";


        var full_url = capi_base + url + "&" + capi_fields + "&" + capi_key;

        alert(full_url);
   };


jQuery(document).ready(function() {

  inputUrl.on("change", function() { senti.Start(this.value); });

});