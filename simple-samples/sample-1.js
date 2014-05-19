// AidData API Documentation: 
// http://aiddata.org/use-aiddatas-api


// Most AidData API calls accept the 'term' parameter to do a string match.
// Here we are using it to find the destination entity for Malawi
// Call http://api.aiddata.org/data/destination/organizations?term=Malawi
$.ajax({
    type: 'GET',
    url:  'http://api.aiddata.org/data/destination/organizations',
    data: {term:'Malawi'},
    success:function(response){
      console.log(response);
      console.log("Malawi's id: " + response.hits[0].id);
    }
  });
