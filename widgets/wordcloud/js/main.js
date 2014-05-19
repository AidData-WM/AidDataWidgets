

var app = {
  options:{},

  // Run the app.
  start: function(filter, options){
    this.options = options;
    AidData.getProjects(filter, options.NUM_PROJECTS , this.processProjects);
  },

  processProjects: function(projects){
    console.log('projects ',projects);
    var str = app.buildSuperString(projects);
    var wordCounts = app.buildWordCounts(str);
    var maxValue = 0;
    wordCounts.sort(function(a, b){ maxValue = Math.max(maxValue,a.value); return b.value-a.value});
    wordCounts = wordCounts.slice(0, app.options.NUM_WORDS_TO_DRAW);

    app.generateViz(wordCounts,maxValue);

  },

  buildSuperString: function(projects){
    var lng = projects.length;
    var str = '';

    for(var i=0;i<lng;i++){
      str += ' ' + projects[i].title;
      if(app.USE_DESCRIPTION){
        str += ' ' + projects[i].long_description;
      }
    }

    return str;
  },

  buildWordCounts: function(text){
    var unicodePunctuationRe = " !-#%-*,-/:;?@\\//";
    // From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
    var stopWords = /^(undefined|du|au|la|le|et|de|des|en|i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
        punctuation = new RegExp("[" + unicodePunctuationRe + "]", "g"),
        wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g;
    var maxLength = 20;
    var tags = {};
    var cases = {};
    text.split(wordSeparators).forEach(function(word) {
      word = word.replace(punctuation, "");
      if (stopWords.test(word.toLowerCase())) return;
      if (word.trim()=='') return;
      word = word.substr(0, maxLength);
      cases[word.toLowerCase()] = word;
      tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;
    });
    tags = d3.entries(tags).sort(function(a, b) { return b.value - a.value; });
    tags.forEach(function(d) { d.key = cases[d.key]; });
        
    return tags;
  },



  generateViz: function(words, maxValue){

    var fill = d3.scale.category20();
    var width = $('#word-cloud').width();
    var height = $('#word-cloud').height();

    d3.layout.cloud().size([width, height])
        .words(words.map(function(d) {
          console.log(d.key + '  -  '+d.value);
          return {text: d.key, size: (d.value*(width/10)/maxValue)};
        }))
        .padding(3)
        .rotate(function() { return ~~(Math.random() * 3) * 0 - 0; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();

    function draw(words) {

      $("#word-cloud").html('');
      d3.select("#word-cloud").append("svg")
          .attr("width", width)
          .attr("height", height)
        .append("g")
          .attr("transform", "translate("+width/2+","+height/2+")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Impact")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
    }
  }
}
