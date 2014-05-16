var AidData = {

	// Use 'paDestination' for destinations of flows (flows include foreign direct investment, not just aid).
	// Gets a list of all recipients
	getRecipients: function(onlyAidMoney, callback){
	    var aidDestinationURL = "http://api.aiddata.org/data/destination/organizations";
	    var flowsDestinationURL = "http://api.aiddata.org/data/paDestination/organizations";
	    
	    var filter = {
	      order: 'name',
	      sort:1
	    };

	    $.ajax({
	      type: 'GET',
	      async: true,
	      url:  (onlyAidMoney ? aidDestinationURL : flowsDestinationURL),
	      data: filter,
	      success: function(response){
	        callback(response.hits);
	      },
	      error: function(err){
	        console.warn('Could not load recipients');
	      }
	    });
	},


	//TODO parallel version that calls callback as soon as each call returns.
	//TODO write  a version that gets a random sample
	//TODO write a version that gets all projects. (This version might need to run syncronyslouly)
	//Gets projects then returns full list to callback
	getProjects: function(filter, numResults, callback){
	  var pagesReturned = 0;    // Number of pages returned so far.
	  var allProjects = [];     // Array of projects returned.
	  var resultsPerPage = 50;  // Number of projects per a page
	  var targetNumOfPages = Math.ceil(numResults/resultsPerPage); // This will yield us numResults projects. rounded up to nearest 50
	  
	  filter.size = resultsPerPage;

	  // Loop through targetNumOfPages making requests to the api.
	  for(var currentPage = 0; currentPage < targetNumOfPages; currentPage++){

	    // Update the filter to start from the last project we got.
	    filter.from = (currentPage * resultsPerPage);

	    $.ajax({
	      type: 'GET',
	      async: true,
	      url:  'http://api.aiddata.org/aid/project',
	      data: filter,
	      success: function(response){

	        // Print response for debugging.
	        //console.log(response);

	        // Merge latest results into out array
	        allProjects = allProjects.concat(response.items);

	        // Check if we have all requests returned
	        pagesReturned++;
	        if(pagesReturned == targetNumOfPages){
	          console.info(allProjects.length + ' projects that match our filters:');
	          //console.log(allProjects);
	          callback(allProjects);
	        }
	      },
	      error: function(err){
	        pagesReturned++;
	          console.warn('Failed return.');
	        if(pagesReturned == targetNumOfPages){
	          console.warn(allProjects.length + ' pojects that match our filters. Some failed.');
	          //console.log(allProjects);
	          callback(allProjects);
	        }
	      }
	    });
		}
	},

	// codeLength: 3, 5, or 7, corresponding to sector, purpose, or activity code respectively.
	getSectors: function(codeType, callback){
	    // Check to make sure it's a valid codeType
	    if(codeType == 3 || codeType == 5 || codeType == 7){
	      $.ajax({
	        type: 'GET',
	        url:  'http://api.aiddata.org/data/sectors/' + codeType,
	        data: filter,
	        success: function(response){
	          callback(response.hits);
	        },
	        error: function(err){
	          console.error('Could not load recipients');
	        }
	      });
	    } else{
	      console.error("Invalide sector code type: ", codeType);
	    }
	}
};
