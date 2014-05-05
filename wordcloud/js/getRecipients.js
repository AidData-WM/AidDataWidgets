// Use 'paDestination' for destinations of flows (flows include foreign direct investment, not just aid).
// Gets a list of all recipients
var getRecipients = function(justAid, callback){
    var aidDestinationURL = "http://api.aiddata.org/data/destination/organizations";
    var flowsDestinationURL = "http://api.aiddata.org/data/paDestination/organizations";
    
    var filter = {
      order: 'name',
      sort:1
    };

    $.ajax({
      type: 'GET',
      async: true,
      url:  (justAid ? aidDestinationURL : flowsDestinationURL),
      data: filter,
      success: function(response){
        callback(response.hits);
      },
      error: function(err){
        console.warn('Could not load recipients');
      }
    });
};
