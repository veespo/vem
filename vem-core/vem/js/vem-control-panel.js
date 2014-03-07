(function() {

  if (!window.vem || !window.vem.config) {
    alert("vem.settings not found");
  }

  if (!window.$ || !window.$.ajax) {
    alert("jquery not found");
  }

  var config = {
    led: {
      folder: '../../vem-core/vem/img/',
      src: {
        red:    'alert-red.gif',
        orange: 'alert-orange.png',
        green:  'alert-green.png',
        black:  'alert-black.png'
      }
    }
  };

  var state = {
    login: false,
    operative_state: null,
    message_error: null
  };

  var gen_phash = function(password){
    var salt = "$2a$10$CrF8FTMyvZ8.hZqf4hLyE.";
    return dcodeIO.bcrypt.hashSync(password, salt);
  };
  
  var clear_votes = (function() {

    var reset_votes = function(username, password) {
      
    };
 
    $(document).on('click', '#modal-reset-login-button', function() {
      if (check_field('#modal-reset-login-password')) {
        reset_category(get_field('#modal-reset-login-password'));
      } else {
        alert("Insert password to clear votes");
      };
    });

    var show_user_password_login = function() {
      var html = "";
      html += '<div id="modal-login-form">';
      //html += '<input type="text" id="modal-reset-login-username" placeholder="username..." />';
      html += '<input type="password" id="modal-reset-login-password" placeholder="password..." />';
      html += '<button id="modal-reset-login-button">Clear</button>';
      html += '</div>';

      // $("#btn-clear").hide();
      $("#modal-reset-login-request").html(html);
    };

    return function() {
      show_user_password_login();
    };

  })();

  var check_field = function(selector) {
    return jQuery.trim($(selector).val()).length > 0;
  };

  var get_field = function(selector) {
    return $(selector).val();
  };

  vem.dialog = (function() {

    var render_html = function() {
      var html = "";
      html += '<div style="height:440px;">';
      
      console.log('cat', vem.api.data());
      var cat_title = '';
      try{ cat_title = vem.api.data().cat.desc1;} catch (e) {};  
      html += '<p style="font-size:1.3em;color:blue;text-align:center;font-weight:bold">' + cat_title + '</p>';
      
      if (state.operative_state == 'green') {
        html += '<span id="dialog-status">Status</span>';
        html += '<div id="dialog-status-log" style="color:#00ff00">OK</div>';
      } else {
        html += '<span id="dialog-status">Status</span>';
        if (state.message_error == null) {
          html += '<div id="dialog-status-log" style="color:#00ff00">OK</div>';

        } else {
          // html += '<div id="dialog-status-log" style="color:#ff0000">' + state.message_error + '</div>';

        }
      }

      html += '<hr/>';
      html += '<div><button id="btn-login"></button></div>';
      html += '<div id="modal-login-form" style="display:none">';
      html += '<input type="text" id="modal-login-username" placeholder="username..." />';
      html += '<input type="password" id="modal-login-password" placeholder="password..." />';
      html += '<button id="modal-login-button">Login</button>';
      html += '</div>';
      html += '<hr/>';

      html += '<div id="modal-login-enabled">';
      if (vem.api.voting.is_on()) {
        html += '<div><button id="btn-enable">Disable voting</button></div>';
      } else {
        html += '<div><button id="btn-enable">Enable voting</button></div>';
      };
      html += '<hr/>';
      html += '<div><button id="btn-clear">Clear Votes</button></div>';
      html += '<div id="modal-reset-login-request"></div>';
      html += '</div>';
      
      var legend = {
        red:    "Serious error, VEM is not running",
        black:  "Voting has been disabled, VEM is not refreshing",
        green:  "All ok, VEM is refreshing at set intervals",
        orange: "VEM has stopped refreshing, reload page to continue"
      };
      
      html += '<table style="font-size:0.9em; margin:15px; width:100%">';
      for (var key in legend){
        var src = config.led.folder + config.led.src[key];
        html += '<tr><td style="padding:8px 8px 0 0 "><img style="height:16px" src=' + src + '></td><td style="padding:8px 0 0 0">' + legend[key] + '</td></tr>';
      }  
      html += '</table>';
      
      html += '</div>';
      return html;
    };


    var show_form_login = function() {
      $("#modal-login-form").show();
      $("#btn-login").hide();
    };

    var hide_form_login = function() {
      $("#modal-login-form").hide();
      $("#btn-login").show().html("Logout");
    };


    var get_login_status = function() {
      return state.login;
    };


    var set_login_status = function(status) {
      state.login = status;
      if (state.login == false) {
        $("#btn-login").html("Login");
        show_form_login();
        $("#modal-login-enabled").hide();
      } else {
        $("#btn-login").html("Logout");
        hide_form_login();
        $("#modal-login-enabled").show();
      };

    };

    var login_event = function() {
      if (get_login_status() == true) {
        logout();
      } else {
      };
    };

    var enable_votes_status = function() {

      var promise_enable = function() {
        var defer = $.Deferred();
        vem.api.voting.enable(function() {
          defer.resolve("on");
        });
        return defer;
      };


      var promise_disable = function() {
        var defer = $.Deferred();
        vem.api.voting.disable(function() {
          defer.resolve("off");
        });
        return defer;
      };

      var that = this;

      if (vem.api.voting.is_on() == true) {
        promise_disable().then(function() {
          $(that).html("Enable votes");
        });
      };

      if (vem.api.voting.is_off() == true) {
        promise_enable().then(function() {
          window.location.reload();
          $(that).html("Disable votes");
        });
      };

    };

    var bind_events = function() {
      $(document).on('click', '#btn-login', login_event);
      $(document).on('click', '#btn-enable', enable_votes_status);
      $(document).on('click', '#btn-clear', clear_votes);
      $(document).on('click', '#modal-login-button', function() {
        if (check_field('#modal-login-username') && check_field('#modal-login-password')) {
          login({
            username: get_field('#modal-login-username'),
            password: get_field('#modal-login-password')
          });
        } else {
          alert("Insert username and password for login");
        };
      });
    };

    var modal = function() {

      var modal = picoModal({
        content: render_html(),
        width: 500,
        modalStyles: {
          border: '2px solid blue',
          backgroundColor: "#FFF",
          padding: '20px'
        },
        overlayStyles: {
          backgroundColor: "#FFF",
          opacity: 0.75
        }
      });

      if (get_session('token') == null) {
        set_login_status(false);
      } else {
        set_login_status(true);
      };
      return modal;
    };

    //bind events
    $(document).ready(bind_events);


    return {
      modal: modal
    };

  })();

  var status = function(color) {
    if (color != 'red' && vem.api.voting.is_off()) {
      color = 'black';
    }
    vem.anchors.indicator.html("<img style='height:22px; width:22px' src='" + config.led.folder + config.led.src[color] + "' />");
  };

  var error = function(mode, msg) {
    state.message_error = msg;
    status('red');
    throw new Error(msg);
  };

  var warning = function(mode, msg) {
    alert('implement warning');
  };

  var ajax_error = function(jqXHR, textStatus, errorThrown) {
    error('api', errorThrown);
  };

  var token = function() {
    if (!vem.config.token) {
      if (get_session('token') == null) {
        error('get_token', 'not logged in');
      } else {
        vem.config.token = get_session('token');
      };
    }
    return vem.config.token;
  };

  var prefix_session = function(name) {
    return vem.veespo.host + "_" + vem.config.partner + "_" + vem.config.category + "_" + name;
  };

  var set_session = function(cname, cvalue, exdays) {
    cname = prefix_session(cname);
    if (cvalue == null) {
      delete localStorage[cname];
    } else {
      localStorage[cname] = cvalue;
    }
  };

  var get_session = function(cname) {
    return localStorage[prefix_session(cname)];
  };


  var logout = function() {
    set_session('token', null);
    document.location.reload();
  };

  var login = function(params) {

    var username = params.username;
    var phash = gen_phash(params.password);
    
    var uri = "http://" + vem.veespo.host + ":" + vem.veespo.port + "/admin/manager/login?email=" + username + "&phash=" + phash;
    $.ajax({
      url: uri,
      dataType: 'jsonp',
      success: function(reply) {
        if (reply.data) {
          vem.config.token = reply.data.token;
          set_session('token', vem.config.token);
          document.location.reload();
        } else {
          alert(reply.error.ruby_msg);
          set_session('token', null);
          document.location.reload();
        };
      }
    });
    crash();
  };
  
  
  var reset_category = function(password) {

    var uri = "http://" + vem.veespo.host + ":" + vem.veespo.port + "/v1/reset/category/:cat";
    $.ajax({
      url: uri,
      type:       'POST',
      dataType:   'json',
      crossDomain: true,
      data: {
        token: token(),
        cat:   vem.config.category,
        phash: gen_phash(password)
      },
      success: function(reply) {
        if (reply.data) {
          alert('Votes cleared successfully');
          document.location.reload();
        } else {
          alert('Fail');
        };
      }
    });
    crash();
  };

  
  var control_panel = function() {
    //login(); 
    vem.dialog.modal();
  };

  // check anchors
  for (var id in vem.anchors) {
    var anchor = $('#' + vem.anchors[id]);
    if (anchor.length != 1) {
      error('init', "Failed to find HTML anchor: " + vem.anchors[id]);
    }
    vem.anchors[id] = anchor;
  }


  $(vem.anchors.indicator).css('cursor', 'pointer').click(control_panel);


  vem.cp = {
    status: status,
    warning: warning,
    error: error,
    ajax_error: ajax_error,
    token: token
  };



})();
