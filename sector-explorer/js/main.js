

var app = {
  options:{},
  sectorTree: {name: 'Sectors', children:[]},
  threadsOutstanding: 0,

  // Run the app.
  start: function(options){
    var self = this;
    this.options = options;
    this.sectorTree= {name: 'Sectors', children:[]}

    if(options.filter){
      this.filter = options.filter;
    }

    this.filter.sg = '';
    this.getSectorData(this.filter, function(sectorResults){
      //Hold stats for entire query.
      var stats = sectorResults.stats;

      //Array of top sectors:
      var topSectors = sectorResults.items;
        self.sectorTree.children.push(self.createOtherObject(sectorResults));
      $.each(topSectors, function( index, value ) {
        self.sectorTree.children.push({name: value.source.name, children:[]});

        //set to filter to current sector:
        self.options.filter.sg = value.term;
        self.threadsOutstanding++;
          console.log(self.threadsOutstanding);
          self.getPurposeData(self.filter, function(purposeResults){
          self.parsePurposeResults(value, purposeResults);

          self.threadsOutstanding--;

          if(self.threadsOutstanding<=0){
            console.log(self.sectorTree);
            $('#sector-explorer').html('');
            startViz(self.sectorTree);
          }
        });
      });
    });
  },

  createOtherObject: function(response){
    var otherObj = {
      name: "Other",
      size: response.stats.total,
      count: response.stats.count
    };

    $.each(response.items, function( index, value ) {
      otherObj.size -= value.total;
      otherObj.count -= value.count;
    });
    return otherObj;
  },


  parsePurposeResults: function(parentSector, purposeResults){
    var self = this;
    //Get parent node in tree:
    var parentNode = $.grep(self.sectorTree.children, function(n, i){
      return n.name == parentSector.source.name;
    })[0];


    var topPurposes = purposeResults.items;
    $.each(topPurposes, function( index, value ) {
        //Find parent
        parentNode.children.push({
          name: value.source.name, 
          size: value.total,
          count: value.count
        });
        if(value.count != value.total_count){
          console.warn(value);
        }

    });
  },

  getSectorData: function(filter, callback){
    var self = this;

    $.ajax({
      type: 'GET',
      data: filter,
      url:  'http://api.adstg.org/aid/sector/3',
      success: function(response){

        // Print response for debugging.
        //console.log(response);
        //$('#sector-explorer').html("Done!");
        callback(response);

      },
      error: function(err){
        console.warn('Failed return.');
      }
    });
  },

  getPurposeData: function(filter, callback){
    var self = this;

    $.ajax({
      type: 'GET',
      data: filter,
      url:  'http://api.adstg.org/aid/sector/5',
      success: function(response){

        // Print response for debugging.
        //console.log(response);
        //$('#sector-explorer').html("Done!");
        callback(response);

      },
      error: function(err){
        console.warn('Failed return.');
      }
    });
  },
}
