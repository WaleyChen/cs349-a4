

function myCourses(userid, htmlId) {

	var model = {
		bio: {},
		courses: {},
		views: [],
		
		// Initialize this object
		init: function() {
			console.log("initializing model");
			var that = this;
			
			// Initialize bio
			$.getJSON("https://oat.cs.uwaterloo.ca:8410/api/v1/student/stdBio/" + userid,
				function(d) {
					console.log(JSON.stringify(d));
					that.bio = d.result;
					that.updateViews("bio");
				});
			
			// Initialize courses
			$.getJSON("https://oat.cs.uwaterloo.ca:8410/api/v1/student/stdCourseDetails/" + userid,
				function(d) {
					that.courses = d.result;
					that.updateViews("courses");
				});
		},
		
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
		}
	}
	
	var templates = {}
	
	
	var bioView = {
	
		updateView: function(msg) {
			//console.log("bioView.updateView with bio = " + model.bio);
			if (msg == "bio" || msg == "") {
				var name = Mustache.render(templates.bio, model.bio);
				$("#bio").html(name);
			}
		},
		
		// Initialize this object
		init: function() {
			console.log("initializing bio view");
		}
	}
	
	var coursesView = {
		updateView: function(msg) {
			//console.log("coursesView.updateView with c = " + JSON.stringify(model.courses));
			if (msg == "courses" || msg == "") {
				var t = Mustache.render(templates.courses, model.courses);
				$("#courseList").html(t);
			}
		},
		
		// Initialize this object
		init: function() {
			console.log("initializing coursesView")
		}
	}
	

	// Initialization
	console.log("Initializing myCourses(" + userid + ", " + htmlId + ")");
	portal.loadTemplates("widgets/myCourses/templates.json", 
		function(t) { templates = t });
	
	$(htmlId).html('<H1 id="bio"></H1><DIV id="courseList"></DIV><DIV id="courseDescr"></DIV>');
	model.init();
	bioView.init();
	coursesView.init();
	
	model.addView(bioView.updateView);
	model.addView(coursesView.updateView);
}


