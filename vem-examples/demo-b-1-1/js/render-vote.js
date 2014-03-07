/* 
 * Renders the voting view using one table
 * 
 * Copyright(c) Veespo LTD
 */


(function(){

  var loader;        // html element containing spinner gif
  var tbody_anchor;  // anchor used to append the updated tag averages
  
  
  /* This function is called only once (at page load)
   * It sets up references and static HTML in summary page
   */
  var init = function(){
    console.log("vote.init()");
    loader = $("<img class='vem-spinner' style='cursor:pointer; height:200px; padding-left:180px;' src='../../vem-core/vem/img/veespo-spinning.gif' />");
  };
  
  /*
   *  This function is called once each time the vote mode is selected
   */
  var pre = function(){
    console.log("vote.pre()");
    var id = vem.info.db[vem.api.target.id()][0];
    
    $('#vem-rate-item-1').html(vem.api.target.name());                // target name
    $('#vem-rate-item-2').html(vem.info.db[vem.api.target.id()][1]);  // target description
    $('#vem-rate-item-3').html(vem.config.max_tags);                  // max tags
    $('#vem-rate-logo').attr('src', "images/logos/vote/logo-" + id + ".png");
    
    $('#vem-rate-users').html(vem.api.target.users());                // number of users who voted
    $('#vem-rate-overall').html('?');                                 // average vote for target
    
    $("#vem-vote-anchor").empty().append(loader);                     // display spinning gif
    loader.unbind('click').bind('click', function(){
      console.log("revealing...");
      render(true);
    }); 
  };
  
  /* 
   * This function replaces the spinning gif with a table which displays the average for each tag
   */
  var reveal_html = function(){
    console.log('vote.reveal_html()');
    var html = "";
    html += "<table class='table vem-vote-table'>";
    html +=   "<thead>";
    html +=     "<tr>";
    html +=       "<th>Tag</th>";
    html +=       "<th>Average</th>";
    html +=     "</tr>";
    html +=   "</thead>";
    html +=   "<tbody/>";
    html += "</table>";
    $("#vem-vote-anchor").empty().html(html);
    tbody_anchor = $("#vem-vote-anchor").find("tbody");
  };

  /*
   * This is function responsible for rendering the dynamic voting results for a spcific target
   * When in vote mode, it is called every time VEM vote updates are downloaded
   */
  var render = function(reveal){
    
    console.log("vote.render()");
    $("#vem-rate-users").text(vem.api.target.users());
    
    if (reveal && !vem.vote_reveal){
      reveal_html();
      vem.vote_reveal = true;
    }
  
    if (vem.vote_reveal){
      
      tbody_anchor.empty();
      vem.api.iterate.vote(function(item){
        var html = "";
        html += "<tr>";
        html +=   "<td>" + item.label + "</td>";
        html +=   "<td>";
        html +=     "<div class='progress'>";
        html +=        "<div class='progress-bar' role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width: " + (item.mean * 20)+ "%;'>";
        html +=          "<span>" + item.mean + "</span>";
        html +=        "</div>";
        html +=     "</div>";
        html +=   "</td>";
        html += "</tr>";
        tbody_anchor.append(html);
      }, {dp:1});
      $('#vem-rate-overall').text(vem.api.target.average());
    }
  };

  var post = function(){
    vem.callbacks.vote.render(true);
    console.log('vote.post()');
  };
  
  vem.callbacks.vote = {
    init:   init,
    pre:    pre,
    render: render,
    post:   post  
  };
  
}());

