// AidData API Documentation: 
// http://aiddata.org/use-aiddatas-api


// The API returns a max of 50 results for certain queries.
// This example shows how to retreive more than 50 projects
// Using the 'from' and 'size' params you can iterate to return more results.
// This example will get 200 projects for a given query.
var pagesReturned = 0;    // Number of pages returned so far.
var allProjects = [];     // Array of projects returned.
var resultsPerPage = 50;  // Number of projects per a page
var targetNumOfPages = 4; // This will yield us 200 projects. (4 pages of 50 projects each)
var malawiFilters = {
  src: '1,2,3,4,5,6,7,3249668',        // Use all sources
  ro: 110593668,                       // Recipient Org is Malawi
  y: '2005,2006,2007,2008,2009,2010',  // Years 2005-2010
  t: 1,                                // Transaction type comittments.
  size: resultsPerPage
};

// Loop through targetNumOfPages making requests to the api.
for(var currentPage = 0; currentPage < targetNumOfPages; currentPage++){

  // Update the filter to start from the last project we got.
  malawiFilters.from = (currentPage * resultsPerPage);

  $.ajax({
    type: 'GET',
    async: true,
    url:  'http://api.aiddata.org/aid/project',
    data: malawiFilters,
    success: function(response){

      // Print response for debugging.
      console.log(response);

      // Merge latest results into out array
      allProjects = allProjects.concat(response.items);

      // Check if we have all requests returned
      pagesReturned++;
      if(pagesReturned == targetNumOfPages){
        console.log('The first 200 projects that match our filters:');
        console.log(allProjects);
      }
    },
    error: function(err){
      console.warn(err);
      pagesReturned++;  
      if(pagesReturned == targetNumOfPages){
        console.warn('All requests returned, but we had errors.');
        console.log(allProjects);
      }      
    }
  });
}
