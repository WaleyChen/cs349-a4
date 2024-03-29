

function sample(userid, htmlId) {
  var myDiv = $("div" + htmlId);
  var wsServer = "oat.cs.uwaterloo.ca:8410";
  var templates = {};

  var model = {
  	views: [],
  	course: {},

		/**
		 * Add a new view to be notified when the model changes.
		 */
		addView: function(view) {
			this.views.push(view);
			view("");
		},
		
		/**
		 * Update all of the views that are observing us.
		 */
		updateViews: function(msg) {
			for(i=0; i<this.views.length; i++) {
				this.views[i](msg);
			}
		},

		loadCourseData: function(subject, catalog) {
			var that = this;
			// getJSON can fail silently.  It may be better (and only slightly more work)
			// to use $.ajax -- or write your own version of getJSON that does not fail silently.
			$.getJSON("https://api.uwaterloo.ca/v2/courses/" + subject + "/" + catalog + ".json?key=89660ae4dc888bbf1821c62d8eeb65a9",
					function (d) {
						if (d.meta.status === 200) {
							that.course = d.data;
							that.updateViews("course");
						} else {
							that.course = {};
							that.updateViews("error");
							console.log("Failed to read course data." + JSON.stringify(d.meta));
						}
					});
		},

  }

  var courseView = {
  	updateView: function(msg) {
  		var t = ""
  		if (msg === "error") {
  			t = templates.error;
  		} else if (msg === "course") {
			t = Mustache.render(templates.courseD, model);
  		}
		$(htmlId + " #cDescr").html(t);
  	},

  	initView: function() {
  		console.log("Initializing courseView");

  		/*
  		 * Set the controller for the "Go" button.
  		 * Get the subject and catalog from the input fields and
  		 * then tell the model to get the corresponding course.
  		 */
  		$(htmlId + " #search").click(function() {
  			var subject = $(htmlId + " #subject").val();
  			var catalog = $(htmlId + " #catalog").val();
  			console.log("Go clicked: " + subject + " " + catalog);
  			model.loadCourseData(subject.toLowerCase(), catalog);
  			$(htmlId + " #subject").val("");
  			$(htmlId + " #catalog").val("");
  		});
		model.addView(courseView.updateView);
  	}
  }


  /*
   * Initialize the widget.
   */
	console.log("Initializing sample(" + userid + ", " + htmlId + ")");
	portal.loadTemplates("widgets/sample/templates.json", 
		function(t) { 
			templates = t;
			$(htmlId).html(templates.baseHtml);
			courseView.initView();
		});
}