//Treemap with animation and interactivity

var startViz = function(root) {
// MC: The following line declares 5 variables. The 4th one creates an alias for a number formatting function. The 5th one has no value.
// MC: Strange that he's hardcoded the width and height in here since they also appear in the CSS.

var margin = {top: 25, right: 0, bottom: 0, left: 0},
    width = $('#sector-explorer').width(),
    height = $('#sector-explorer').height() - margin.top - margin.bottom,
    formatNumber = d3.format(",.0f"),   // MC: I want one decimal place. See https://github.com/mbostock/d3/wiki/Formatting#d3_format
    transitioning;

// MC: Here he creates the X and Y scales, which are 1:1 and linear, ie. no scaling applied.

var x = d3.scale.linear()
    .domain([0, width])
    .range([0, width]);

var y = d3.scale.linear()
    .domain([0, height])
    .range([0, height]);

// MC: Create the tree layout with built-in d3 methods.

var treemap = d3.layout.treemap()
    .children(function(d, depth) { return depth ? null : d._children; })  // Each node in the tree has a 'depth' property. 0 is the root. Not sure about the rest.
    .sort(function(a, b) { return a.size - b.size; }) // I think this forces sorting in ascending order. See https://github.com/mbostock/d3/wiki/Treemap-Layout
    .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))  // No idea what this does yet. Can't see any API doc on it so maybe a custom property.
    .round(false)  // No rounding to exact pixel boundaries for anti-aliasing. Perhaps try with this set to 'true'.
    .value(function(d) { return d.size; });

// MC: Create the canvas with the appropriate margins. Creates a top-level group inside the canvas to contain all the elements.
// MC: 'append' adds a new node as a child of the current node, just before the closing tag.

var svg = d3.select("#sector-explorer").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.bottom + margin.top)
    .style("margin-left", -margin.left + "px")
    .style("margin.right", -margin.right + "px")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style("shape-rendering", "crispEdges");  // MC: An SVG style property to make it look as nice as possible. See http://www.w3.org/TR/SVG/painting.html#ShapeRenderingProperty

// MC: Creates a 'g' for the header bar which contains the breadcrumbs and enables the user to go back.

var grandparent = svg.append("g")
    .attr("class", "grandparent");

// MC: Creates a 'rect' node inside the grandparent.

grandparent.append("rect")
    .attr("y", -margin.top) // -20px to force it to appear above the main plotting area.
    .attr("width", width)
    .attr("height", margin.top);

// MC: Creates a 'text' node inside the grandparent, after the 'rect' node. It's hardcoded 6 pixels down and 6 pixels across from the top left of the container.
// MC: 'dy' seems to be used to make sure the X and Y position - which aligns with the baseline of the text - is shifted to simulate an X and Y which refer to the top left corner instead.
// MC: 1em is the current font size, so in theory this shift works as the font gets larger / smaller.

grandparent.append("text")
    .attr("x", 6)
    .attr("y", 6 - margin.top)
    .attr("dy", ".75em");

// MC: Loads in the data from 'budget.json'. The call is asynchronous. Once the JSON has loaded, the next 40 or so lines run.

//d3.json("budget_amount.json", function(root) {    // Loads the JSON into memory as an object. The name 'root' is simply a reminder that the object is a hierarchical.
  initialize(root);
  accumulate(root);
  layout(root);
  display(root);

  function initialize(root) {
    root.x = root.y = 0;  // Root node is drawn in top-left corner...
    root.dx = width;      // ... and fills the SVG area...
    root.dy = height;
    root.depth = 0;
  }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation [MC: Why custom? Perhaps because it's interactive so not shwoing the full map.].
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  
  // MC: Just a fancy IF statement but not too sure what's going on yet. See https://github.com/mbostock/d3/wiki/Treemap-Layout#wiki-children. 'Reduce' is not a d3 method so assume it's a recursive function?
  
  function accumulate(d) {
    // console.log(d.name + ", " + d.value);
    console.log(d);
    return (d._children = d.children)
        ? d.size = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
        : d.size;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1*1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent's dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1*1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});    // Runs the treemap layout, returning the array of nodes associated with the specified root node. From: https://github.com/mbostock/d3/wiki/Treemap-Layout
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }


  function display(d) {
    grandparent
        .datum(d.parent)          // MC: Associate the top bar with the value of the parent of the current node? See https://github.com/mbostock/d3/wiki/Selections#wiki-datum
        .on("click", transition)  // MC: Adds an onclick('transition') listener to the grandparent
      .select("text")             // MC: Go to the TEXT element in the grandparent and...
        .text(name(d));           // MC: Call the name() function and change the text in the TEXT node to the returned value.

    var g1 = svg.insert("g", ".grandparent")  // MC: inserts a new 'g' before the node with class 'grandparent. Call it 'g1'.
        .datum(d)                             // MC: Still not sure here but something to do with copying the data from the JSON to the node
        .attr("class", "depth");              // MC: Add the attribute as follows: <g class="depth">...</g>

    var g = g1.selectAll("g")                 // MC: Confusingly defines a new collection 'g' which contains all the children in 'g1'.
        .data(d._children)                    // MC: Loads the data from the (copy of the) JSON file data.
      .enter().append("g");                   // MC: Creates a new 'g' node for each child.

    g.filter(function(d) { return d._children; })   // MC: Create a new collection, which is a subset of g. Not sure how this works yet but it's only the nodes with children.
        .classed("children", true)                  // MC: Assigns each of these node to class="children",
        .on("click", transition);                   // MC: and onclick('transition'), which is a function listed below. So only those with children are clickable?

    g.selectAll(".child")                                   // MC: Select all the children of 'g'.
        .data(function(d) { return d._children || [d]; })   // MC: || is logical OR
      .enter().append("rect")                               // MC: Create a RECT for each of the new nodes
        .attr("class", "child")                             // MC: Make <rect class="child">...</rect>

        .call(rect);                                        // MC: Call the rect function listed below. [Why not just write ".rect()" then?]

    g.append("rect")                                // MC: After all the children, create a rect with .parent
        .attr("class", "parent")                    // MC: It's at the end so that it's clickable and has the title displayed on hover
        .call(rect)
      .append("title")                // MC: SVG TITLE *element* is displayed as a tooltip on hover like the HTML title *attribute*
        .text(function(d) { return '$' + formatNumber(d.value); });  // MC: The value in this tag is the sum of the values of all the child nodes. Check rounding format if not showing up!

    g.append("text")
        .attr("dy", ".75em")
        .text(function(d) { return d.name; })   // MC: Each RECT (only some?) get the name written on top of it. The text is not nested in the RECT but that's how SVG works, unlike HTML.
        .call(text);
        
    g.append("text")        // MC: Here is my attempt to get the rounded dollar amount at the centre of each rect.
        .classed("overlaidText",true)
        .text(function(d) { return '$'+ intToWord(d.value)})
        .call(middletext);

    function transition(d) {
      if (transitioning || !d) return;    // MC: I think this prevents further transitioning if you're in the middle of a transition.
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll("text").call(text).style("fill-opacity", 0);
      t2.selectAll("text").call(text).style("fill-opacity", 1);
      t2.selectAll(".overlaidText").call(middletext).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    return g;
  }

  d3.selectAll("input").on("change", function change() {
    var value = this.value === "count"
        ? function(d) { return d.count; }
        : function(d) { return d.size; };

    console.log(treemap.value);

    node
        .data(treemap.value(value).nodes)
      .transition()
        .duration(1500)
        .call(position);
  });

  function text(text) {
    text.attr("x", function(d) { return x(d.x) + 6; })
        .attr("y", function(d) { return y(d.y) + 6; });
  }

  function middletext(text) {
    text.attr("x", function(d) { return x(d.x + d.dx / 2); })
        .attr("y", function(d) { return y(d.y + d.dy / 2) + 16; });
  }

  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x); })
        .attr("y", function(d) { return y(d.y); })
        .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
        .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
        .attr("rx","5px");
  }

  function name(d) {
    return d.parent ? name(d.parent) + " / " + d.name : d.name;   // MC: Recursive. If there is no parent just return the name attribute of this node, otherwise return the name of the parent node followed by '/' and the name attribute of this node
  }

  function intToWord(number) {

        // options is an optional object, this falls back to defaults.
        var options = {decimals: 1};

        number = parseInt(number);
        if (number < 1000000) {
            return intcomma(number, 0);
        } else if (number < 1000000000) {
            return intcomma(number / 1000000.0, options.decimals) + " million";
        } else if (number < 1000000000000) { //senseless on a 32 bit system probably.
            return intcomma(number / 1000000000.0, options.decimals) + " billion";
        } else if (number < 1000000000000000) {
            return intcomma(number / 1000000000000.0, options.decimals) + " trillion";
        }
        return "" + number; // too big or NaN
  }
  function  intcomma (number, decimals) {
        decimals = decimals === undefined ? 0 : decimals;
        return number_format(number, decimals, '.', ',');
  }

  function  number_format (number, decimals, dec_point, thousands_sep) {
        var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 2 : decimals;
        var d = dec_point == undefined ? "," : dec_point;
        var t = thousands_sep == undefined ? "." : thousands_sep, s = n < 0 ? "-" : "";
        var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  }
};

