
vem = {
    
  // You should never have to change these two settings  
  veespo: {
    host: 'production.veespo.com',
    port: 80
  },	
  
  // Make sure you add your own values here
  config: {		
    lang:     'en',          // 2 character language code, see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    partner:  'veespo',      // The organization id (get this from the Veespo dashboard)
    category: 'vem-12',      // The category id (get this from the Veespo dashboard)
    max_tags:  4,            // The maximum number of tags to display in the vote view (0 = no maximum)
    scale:     5             // Don't change this! 
  },

  //Important: this is the relative path to the vem_core folder as seen by index.html 
  lib_path: '../../vem-core',
  
  refresh: {
    summary_ms: 500,  // how often (in milliseconds) summary updates are loaded and rendered
    vote_ms:    500   // how often (in milliseconds) vote updates are loaded and rendered
  },
  
  max_events: {
    summary: 20, //1000,    // max number of refreshes to summary page (reset every time page is displayed)
    vote:    20, //1000     // max number of refreshes to vote page (reset every time page is displayed)
  },
  

  // Note: callbacks.init() is called only once (at page load)
  callbacks: {
    init:  function(){
      vem.callbacks.summary.init();  // one-time set-up of summary page
      vem.callbacks.vote.init();     // one-time set-up of vote page
      vem.api.mode.summary();        // commence summary monitoring and rendering
    },
    summary: {},
    vote:    {}
  },
  
  // VEM will NOT start if it cannot find all of the following HTML ids
  anchors: {
    summary_page:   'vem-summary-page',  
    vote_page:      'vem-vote-page',
    indicator:      'vem-indicator',
    back:           'vem-back-button'
  },
  
  info: {}      // optional, use this for app specific settings
};
    
   

