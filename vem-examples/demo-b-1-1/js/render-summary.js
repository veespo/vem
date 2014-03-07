/*
 * Renders the summary in one table, in which targets (subjects) are divided into groups (see info.js)
 * Initial display order is hard-coded (see info.js)
 * As votes come in, the table order will change to reflect the average scores
 * See base/force below to manage the table ordering
 *
 * Copyright(c) Veespo LTD
 */

(function(){
  
  var anchor = null;  
  var tbody  = null;
  var logos = {};     
  
  /* This function is called only once (at page load)
   * It sets up references and static HTML in summary page
   * In this example we have two tables for the summary, but there could be more or less
   * For this reason, the validity of the HTML ids are checked here, and not at the framework level
   */
  var init = function(){
    console.log("summary.init()");
    
    anchor = $("#vem-summary-table");
    
    var vote = function(event){
      var elem = $(event.target);
      if (elem.attr('vem-target')){
        vem.api.mode.vote(elem.attr('vem-target'));
      }
    };
    
    var render_titles = function(){
      var html = "";
      html += "<thead>";
      html += "<tr class='hidden-xs'>";
      html += "<th>Pos</th>";
      html += "<th colspan='2'>Subject</th>"; 
      html += "<th>Voters</th>";
      html += "<th>Average</th>";
      html += "</tr>";
      html += "</thead>";
      html += "<tbody/>";
      anchor.append(html);
    };
    
    // Check anchor
    if (anchor.length != 1){
      vem.cp.error("Problem with summary anchor");
    }
    
    render_titles();
    tbody  = anchor.find("tbody");
    tbody.click(vote);
    
    // Logos
    // These image elements are not created on the fly in render() because this causes flickering in webkit browsers 
    for (var target in vem.info.db){
      var id = vem.info.db[target][0];
      logos[target] = $("<img style='width:36px' class='' src='images/logos/summary/logo-" + id + ".png'</img>");
    }
    
  };
  
  /*
   *  This function is called once each time the summary mode is selected
   */
  var pre = function(){
    console.log("summary.pre()");
  };
  
  /*
   * This is function responsible for rendering the dynamic summary results
   * When in summary mode, it is called every time VEM summary updates are downloaded
   */
  var render = function(){
    
    console.log("summary.render()");
    
    tbody.empty();
  
    vem.api.iterate.summary(function(item){
      var id = vem.info.db[item.target][0];
      
      var html = "";    
      
      html += "<tr>";
      
      html +=   "<td><span class='label label-default'>" + item.pos + "</span></td>";  
      html +=   "<td class='vem-thumbnail-logo'></td>";
      html +=   "<td style ='cursor:pointer' vem-target='" + item.target + "'>" + item.name + "</td>";  
      html +=   "<td>" + item.users + "</td>";
      
      html +=   "<td>"; 
      html +=     "<div class='progress'>";
      html +=       "<div class='progress-bar' role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width:" + (item.mean * 20) + "%;'>";
      html +=          "<span>" + item.mean + "</span>";
      html +=       "</div>";
      html +=     "</div>";
      html +=   "</td>";
      
      html += "</tr>";
      
      var row = $(html);
      row.find('td.vem-thumbnail-logo').append(logos[item.target]);
      tbody.append(row);
    },{ base:vem.info.display_order, dp:1});  // change 'base' to 'force' to keep display order regardless of score
  };
  
  /*
   *  This function is called after VEM stops downloading summary updates
   */
  var post = function(){
    console.log('summary.post()');
  };
  
  vem.callbacks.summary = {
    init:   init,
    pre:    pre,
    render: render,
    post:   post  
  };
  
}());



