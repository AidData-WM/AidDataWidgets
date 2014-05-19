

var app = {
  options:{},
  sectorTree: {},

  // Run the app.
  start: function(options){
    this.options = options;
    this.getSectorCodes();
    this.getPurposeCodes();
    console.log('sectorTree',this.sectorTree);
    this.getActivityCodes();
    console.log('sectorTree',this.sectorTree);
  },

  getSectorCodes: function(){
    var self = this;

    $.ajax({
      type: 'GET',
      async: false,
      url:  'http://api.aiddata.org/data/sectors/3',
      success: function(response){

        // Print response for debugging.
        console.log(response);
        response = response.hits;
        var length = response.length;
        for(var i=0; i<length; i++){
          self.sectorTree[response[i].code] = {};
          self.sectorTree[response[i].code].code = response[i].code;
          self.sectorTree[response[i].code].name = response[i].name;
          self.sectorTree[response[i].code].purposeCodes = {};
        }

      },
      error: function(err){
        console.warn('Failed return.');
      }
    });
  },

  getPurposeCodes: function(){
    var self = this;

    $.ajax({
      type: 'GET',
      async: false,
      url:  'http://api.aiddata.org/data/sectors/5',
      success: function(response){

        // Print response for debugging.
        console.log(response);
        response = response.hits;
        var length = response.length;
        var prefix = '';
        var purposeCode = {code:'', name:'', activitCodes:{}};

        for(var i=0; i<length; i++){
          purposeCode = {
            code:response[i].code, 
            name:response[i].name, 
            activitCodes:[]
          };

          if(response[i].code){
            prefix = response[i].code.substring(0,3);
            self.sectorTree[prefix].purposeCodes[purposeCode.code] = purposeCode;
          } else{
            console.warn('response[i]' , response[i]);
          }
        }

      },
      error: function(err){
        console.warn('Failed return.');
      }
    });
  },

  getActivityCodes: function(){
    var self = this;

    $.ajax({
      type: 'GET',
      async: false,
      url:  'http://api.aiddata.org/data/sectors/7',
      success: function(response){

        // Print response for debugging.
        console.log(response);
        response = response.hits;
        var length = response.length;
        var prefix3 = '';
        var prefix5 = '';
        var activityCode = {code:'', name:''};

        for(var i=0; i<length; i++){
          activityCode = {
            code:response[i].code, 
            name:response[i].name
          };

          if(response[i].code){
            prefix3 = response[i].code.substring(0,3);
            prefix5 = response[i].code.substring(0,5);
            self.sectorTree[prefix3].purposeCodes[prefix5].activitCodes[activityCode.code] = activityCode;
          } else{
            console.warn('response[i]' , response[i]);
          }
        }

      },
      error: function(err){
        console.warn('Failed return.');
      }
    });
  }

}
