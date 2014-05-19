// AidData API Documentation: 
// http://aiddata.org/use-aiddatas-api


// This example shows more complicated filters.
// Filter to projects from all sources from 2005-2010, where Malawi is the recipient
var malawiFilters = {
	src:'1,2,3,4,5,6,7,3249668',        // Use all sources
	ro:110593668,                       // Recipient Org is Malawi
	y:'2005,2006,2007,2008,2009,2010',  // Years 2005-2010
	t:1,                                // Transaction type Commitments
	from:0,                             // Result position to start at
	size:50                             // Number of results to return
};

	$.ajax({
	type: 'GET',
	url:  'http://api.aiddata.org/aid/project',
	data: malawiFilters,
	success:function(response){
	  console.log(response);
	}
});
