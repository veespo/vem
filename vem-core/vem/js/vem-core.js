/* 
 * Version 0.0
 * 
 */


if (!window.vem || !window.vem.config) {
  alert("vem.settings not found");	
}

if (!window.$ || !window.$.ajax){
  alert("jquery not found");		
}

(function(){
  
  var mode = null; // SUMMARY | VOTE
  
  var data = {
    cat:         null,  
    target:      null,  
    targets:     {},
    targets_az:  [],
    tags:        {},
    tags_az:     [],
    rank:        {},
    averages:    {}
  };
  
  var events = {
    summary: 0,
    vote:    0
  };

  var url = function(path){
    return "http://" + vem.veespo.host + ":" + vem.veespo.port + path + '?token=' + vem.cp.token();
  };
  
  var init = function(){
    
    console.log("Global init....");
    
    vem.anchors.back.css('cursor','pointer').click(function(){
      if (mode == 'VOTE'){
        summary();
      }
    });
   
    $.ajax({
      url:   url("/utils/multiget"),
      data: { lang:   vem.config.lang,
              cat:    vem.config.category,
              calls:  JSON.stringify( { cat:     {path: "/v1/info/category/:cat"  },
                                        tags:    {path: "/v1/info/category/:cat/tags"  },
                                        targets: {path: "/v1/info/category/:cat/targets" } }
                                      ),                                                    
            },
      success: function(reply){
        if (reply.error){
          vem.cp.error('init', reply.error.ruby_msg);
        }
        vem.cp.status('green');
        
        data.cat = reply.data.cat;
        
        for (var i=0; i<reply.data.targets.length; i++){
          data.targets_az.push(reply.data.targets[i].target);
          data.targets[reply.data.targets[i].target] = reply.data.targets[i];
        }
        
        for (var i=0; i<reply.data.tags.length; i++){
          data.tags_az.push(reply.data.tags[i].tag);
          data.tags[reply.data.tags[i].tag] = reply.data.tags[i];
        }
        
        if (vem.callbacks.init){
          vem.callbacks.init(); 
        }
      },
      error:    vem.cp.ajax_error,
      dataType: 'jsonp'
    });
  };
  
  
  var check_labels = function(labels){
	for (var tag in labels){
      if (!data.tags[tag]){
    	console.log("New Tag", labels[tag].label);
    	data.tags[tag] = labels[tag];
	    data.tags_az.push(tag);       // not in correct order, pazienza
      }
	}  
  };
  
  var voting_is_on = function(){
    if (data && data.cat){
      return data.cat.voting != "OFF";
    }
    return true;
  };
  
  var voting_is_off = function(){
    return !voting_is_on();
  };
  
  var voting_enable = function(cb){
    voting_set('ON', cb);
  };
  
  var voting_disable = function(cb){
    voting_set('OFF', cb);
  };
  
  var clear_votes = function(password){
    alert("Clear votes not yet implemented");
  };
  
  var voting_set = function(status, cb){
    $.ajax({
      type:     'POST',
      dataType: 'json',
      crossDomain: true,
      url:      url('/v1/locks/category/:cat/voting/' + status),
      data:   { cat:    vem.config.category },
      success: function(reply){
        console.log('success');
        if (reply.error){
          vem.cp.error('voting_set()', reply.error.ruby_msg);
        }
        console.log('Successfully set voting to: ', status);
        data.cat.voting = status;
        if (cb){
          cb();
        }
      },
      error:  vem.cp.ajax_error,
    }); 
  };
  
  var summary = function(){
    mode = 'SUMMARY';
    vem.anchors.summary_page.show();
    vem.anchors.vote_page.hide();
    data.target = null;
    events.summary = 0;
    if (vem.callbacks.summary.pre){
      vem.callbacks.summary.pre(); 
    }
    summary_monitor();
  };
  
  var summary_monitor = function(){
    if (mode != 'SUMMARY'){
      return;
    }
    $.ajax({
      url:     url("/v1/rank/category/:cat"),
      data:    { 
        lang:  vem.config.lang,
        cat:   vem.config.category,
      },
      success: function(reply){
        if (mode != 'SUMMARY'){
          return;
        }
        if (reply.error){
          vem.cp.error('summary', reply.error.ruby_msg);
        }
        vem.cp.status('green');
        data.rank = {};
        for (var i=0; i<reply.data.rank.length; i++){
          data.rank[reply.data.rank[i].target] = reply.data.rank[i];
        } 
        if (events.summary++ > vem.max_events.summary){
          vem.cp.status('orange');
          console.log("max_events.summary", vem.max_events.summary, "reached");
          if (vem.callbacks.summary.post){
            vem.callbacks.summary.post(); 
          }
          return;
        }
        if (vem.callbacks.summary.render){
          vem.callbacks.summary.render(); 
        }
        if (voting_is_on()){
          setTimeout(summary_monitor, vem.refresh.summary_ms);
        }  
      },
      error:    vem.cp.ajax_error,
      dataType: 'jsonp'
    });
  };
  
  var vote = function(target){
    console.log("vote", target);
    mode = 'VOTE';
    vem.vote_reveal = false;
    vem.anchors.summary_page.hide();
    vem.anchors.vote_page.show();
    data.target = target;
    events.vote = 0;
    if (vem.callbacks.vote.pre){
      vem.callbacks.vote.pre(); 
    }
    vote_monitor();
  };
  
  var vote_monitor = function(){
    if (mode != 'VOTE'){
      return;
    }
    $.ajax({
      url:     url("/v1/average/category/:cat/target/:target"),
      data:    { 
        cat:    vem.config.category,
        target: data.target,
        labels: vem.config.lang,
      },
      success: function(reply){
        if (mode != 'VOTE'){
          return;
        }
        if (reply.error){
          vem.cp.error('vote',reply.error.ruby_msg);
        }
        vem.cp.status('green');
        data.averages = reply.data.averages;
        check_labels(reply.data.labels);
        if (events.vote++ > vem.max_events.vote){
          vem.cp.status('orange');
          console.log("max_events.vote", vem.max_events.vote, "reached");
          if (vem.callbacks.vote.post){
            vem.callbacks.vote.post(); 
          }
        } else {
          if (vem.callbacks.vote.render){
            vem.callbacks.vote.render(); 
          }
          if (voting_is_on()){
            setTimeout(vote_monitor, vem.refresh.vote_ms);
          }  
        }
      },
      error:    vem.cp.ajax_error,
      dataType: 'jsonp'
    });
  };
  
  var target_name = function(target){
    return data.targets[target||data.target].desc1;
  };
 
  var target_id = function(){
    return data.target;
  };
  
  var target_average = function(dp){
    var val = data.averages.overall;
    return (val && val.toFixed) ?(vem.config.scale * val).toFixed(dp||2) :"";
  };
  
  var target_users = function(){
    return data.averages.users;
  };
  
  var iterate_targets = function(fn){
    for (var i=0; i<data.targets_az.length; i++){
      fn(data.targets[i]);
    }
  };
  
  var iterate_summary = function(fn, spec){
    spec = spec || {};
    
    var f_mean = function(target){
      return (data.rank[target]) ?(vem.config.scale * data.rank[target].mean).toFixed(spec.dp||2) :"";
    };
    
    var f_mean_raw = function(target){
      return (data.rank[target]) ?vem.config.scale * data.rank[target].mean :null;
    };
    
    var f_votes = function(target, dp){
      return (data.rank[target]) ?data.rank[target].votes :"";
    };
    
    var f_votes_raw = function(target, dp){
      return (data.rank[target]) ?data.rank[target].votes :null;
    };
    
    var f_users = function(target, dp){
      return (data.rank[target]) ?data.rank[target].users :"";
    };
    
    var f_users_raw = function(target, dp){
      return (data.rank[target]) ?data.rank[target].users :null;
    };
    
    var _targets = [];
    if (spec.force) {
      _targets = (spec.force == 'az') ?data.targets_az :spec.force;
    } else {
      var seen = {};
      for (var target in data.rank){
        _targets.push(target);
        seen[target] = true;
      }
      spec.base = (spec.base == 'az') ?data.targets_az :spec.base;
      var _base = spec.base || data.targets_az;
      for (var i=0; i<_base.length; i++){
        if (!seen[_base[i]]){
          _targets.push(_base[i]);
        }
      }
    }
     
    var pos = 0;
    for (var i=0; i<_targets.length; i++){
      if (!data.targets[_targets[i]]){
        vem.cp.warning('Summary', 'Unknown target: ' + _targets[i]);
      } else {
        fn({
          pos:        ++pos,
          target:    _targets[i],
          name:      target_name(_targets[i]),
          mean:      f_mean(_targets[i]),
          mean_raw:  f_mean_raw(_targets[i]),
          votes:     f_votes(_targets[i]),
          votes_raw: f_votes_raw(_targets[i]),
          users:     f_users(_targets[i]),
          users_raw: f_users_raw(_targets[i]),
        });
      }
    }
  };
  
  var iterate_vote = function(fn, spec){
    spec = spec || {};
    
    var f_label = function(tag){
      return data.tags[tag].label;
    };
    
    var f_mean = function(tag){
      var val = data.averages.avgS[tag];
      return (val && val.toFixed) ?((vem.config.scale * val).toFixed(spec.dp||2)) :"";
    };
    
    var f_mean_raw = function(tag){
      var val = data.averages.avgS[tag];
      return (val && val.toFixed) ?(vem.config.scale * val) :val;
    };
    
    var f_votes = function(tag){
      return data.averages.sumN[tag] || "";
    };
    
    var f_votes_raw = function(tag){
      return data.averages.sumN[tag];
    };
    
    var _tags = [];
    if (spec.force) {
      _tags = (spec.force == 'az') ?data.tags_az :spec.force;
    } else {
      var seen = {};
      for (var tag in data.averages.avgS){
        _tags.push(tag);
        seen[tag] = true;
      }
      spec.base = (spec.base == 'az') ?data.tags_az :spec.base;
      var _base = spec.base || data.tags_az;
      for (var i=0; i<_base.length; i++){
        if (!seen[_base[i]]){
          _tags.push(_base[i]);
        }
      }
    }
    
    if (data.tags['id-0']){
      var tmp = [];
      for (var i=0; i<_tags.length; i++){
        if (_tags[i] == 'id-0'){
          tmp.push(_tags[i]);
        }
      }
      for (var i=0; i<_tags.length; i++){
        if (_tags[i] != 'id-0'){
          tmp.push(_tags[i]);
        }
      }
      _tags = tmp;
    }
    
    var pos = 0;
    for (var i=0; i<_tags.length; i++){
      if (!data.tags[_tags[i]]){
        vem.cp.warning('Vote', 'Unknown tag: ' + _tags[i]);
      } else {
        if (!vem.config.max_tags || pos < vem.config.max_tags){
          fn({
            pos:       ++pos,
            label:     f_label(_tags[i]),
            mean:      f_mean(_tags[i]),
            mean_raw:  f_mean_raw(_tags[i]),
            users:     f_votes(_tags[i]),
            users_raw: f_votes_raw(_tags[i]),
          });
        }
      }
    }
    
  };
  
  
  vem.api = {
    mode: {
      summary:     summary,
      vote:        vote,
    },
    voting: {
      is_on:   voting_is_on,
      is_off:  voting_is_off,
      enable:  voting_enable,
      disable: voting_disable
    },
    clear: {
      votes: clear_votes
    },
    target: {
      id:      target_id,
      name:    target_name,
      average: target_average,
      users:   target_users
    },
    iterate: {
      targets: iterate_targets, 
      summary: iterate_summary,
      vote:    iterate_vote
    },
    data: function(){
      return $.extend(true, {}, data);
    }
  };

  init();
  console.log('data',data);

  
}());
