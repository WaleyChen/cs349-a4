function g011(userId, htmlId) {
  "use strict";
  var templates = {};

  var model = {
    views: [],
    course: {},
    courses: {},
    csCourses: {},
    failedCoures: {},
    mathCourses: {}

    // ----- VIEW-RELATED -----

    /**
     * Add a new view to be notified when the model changes.
     */
    addView: function (view) {
      this.views.push(view);
      view("");
    },

    /**
     * Update all of the views that are observing us.
     */
    updateViews: function (msg) {
      var i = 0;
      for (i = 0; i < this.views.length; i++) {
        this.views[i](msg);
      }
    },

    //----- CORE -----
    // load information about the courses the student has taken
    loadCourses: function() {
      var that = this;

      $.getJSON("https://cs349.student.cs.uwaterloo.ca:9410/api/v1/student/stdGrades/" + userId,
        function (d) {

          var courses = d.result.courses;
          var courseCode;

          for (var i = 0; i < courses.length; i++) {
            courseCode = courses[i].subjectCode + courses[i].catalog;
            console.log(courseCode);

            if (courses[i].courseGrade == "WF") {
              that.failedCoures[courseCode] = {};
            } else if (
              courses[i].subjectCode == "CS" || 
              courseCode == "CO487" || 
              courseCode == "STAT440"
            ) {
              that.csCourses[courseCode] = {};
            } else if (courses[i].subjectCode == "MATH" || courses[i].subjectCode == "status") {
              that.mathCourses[courseCode] = {};
            }
            
            that.courses[courseCode] = {};
          }

        }).fail(function( jqxhr, textStatus, error ) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
        }
      );

    },

    // create data structures for courses
    // load prerequisites of a course
    // load terms offered of a course

    loadCourseData: function (subject, catalog) {
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
    }

  };

  var courseView = {
    updateView: function (msg) {
      var t = "";
      if (msg === "error") {
        t = templates.error;
      } else if (msg === "course") {
        t = Mustache.render(templates.courseD, model);
      }
      $("#g011_cDescr").html(t);
    },

    initView: function () {
      console.log("Initializing courseView");

      model.loadCourses();

      /*
       * Set the controller for the "Go" button.
       * Get the subject and catalog from the input fields and
       * then tell the model to get the corresponding course.
       */
      $("#g011_search").click(function () {
        var subject = $("#g011_subject").val();
        var catalog = $("#g011_catalog").val();
        console.log("Go clicked: " + subject + " " + catalog);
        model.loadCourseData(subject.toLowerCase(), catalog);
        $("#g011_subject").val("");
        $("#g011_catalog").val("");
      });
      model.addView(courseView.updateView);
    }
  };


  /*
   * Initialize the widget.
   */
  console.log("Initializing g011(" + userId + ", " + htmlId + ")");
  portal.loadTemplates("widgets/g011/templates.json",
    function (t) {
      templates = t;
      $(htmlId).html(templates.baseHtml);
      courseView.initView();
    });
}