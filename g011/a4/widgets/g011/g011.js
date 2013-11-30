function g011(userId, htmlId) {
  "use strict";
  var templates = {};

  var model = {
    views: [],
    course: {},
    courses: {},
    csCourses: {},
    failedCoures: {},
    mathCourses: {},

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

    //----- BOOLS -----
    isFourthYearCSCourse: function(subject, courseNumber) {
      return subject == "CS" && 440 <= courseNumber && courseNumber <= 489;
    },

    isNonMathCourse: function(subject) {
      return subject != "ACTSC" && subject != "AMATH" && subject != "CO" && 
                subject != "COMM" && subject != "CM" && subject != "CS" && 
                subject != "MATH" && subject != "MATBUS" && subject != "MTHEL" &&
                subject != "PMATH" && subject != "SE" && subject != "STAT"
    },

    isSixthYearCSCourse: function(subject, courseNumber) {
      return subject == "CS" && 600 <= courseNumber && courseNumber < 700;
    },

    isSeventhYearCSCourse: function(subject, courseNumber) {
      return subject == "CS" && 700 <= courseNumber && courseNumber < 800;
    },

    isThirdYearCSCourse: function(subject, courseNumber) {
      return subject == "CS" && 340 <= courseNumber && courseNumber <= 398;
    },

    isThirdOrFourthYearCSCourse: function(subject, courseNumber) {
      return this.isThirdYearCSCourse(subject, courseNumber) ||
                this.isFourthYearCSCourse(subject, courseNumber);
    },
    //----- CORE -----

    // load information about the courses the student has taken
    loadCourses: function() {
      var that = this;

      $.getJSON("https://cs349.student.cs.uwaterloo.ca:9410/api/v1/student/stdGrades/" + userId,
        function (d) {

          var courses = d.result.courses;
          var courseCode;
          var courseCodeSelector;
          var courseNumber;
          var grade;
          var rawGrade;
          var subjectCode;
          var thirdOrFourthYearCSCourseCount = 0;

          for (var i = 0; i < courses.length; i++) {
            courseNumber = courses[i].catalog;

            subjectCode = courses[i].subjectCode;
            courseCode = subjectCode + courseNumber;

            rawGrade = courses[i].courseGrade;
            grade = parseInt(rawGrade);

            // add courseCode to appropriate checkbox if the student is currently taking 
            // the course
            if (rawGrade == "") {
              if ( that.isThirdOrFourthYearCSCourse(subjectCode, courseNumber) && thirdOrFourthYearCSCourseCount != 3) {
                courseCodeSelector = "#g011 .third-or-fourth-year-CS-course:not(:checked):not(.appended-course-code)";
                $(courseCodeSelector).first().parent().append(" - (" + courseCode + ")");
                thirdOrFourthYearCSCourseCount++;
              } else if ( that.isFourthYearCSCourse(subjectCode, courseNumber) ) {
                courseCodeSelector = "#g011 .fourth-year-CS-course:not(:checked):not(.appended-course-code)";
                $(courseCodeSelector).first().parent().append(" - (" + courseCode + ")");
              } else {
                courseCodeSelector = "#g011 ." + courseCode;
              }

              $(courseCodeSelector).first().addClass("appended-course-code");
            }

            // select course if the student passed the course
            // pass == number grade assigned and grade >=50
            if (!isNaN(grade) && parseInt(grade) >= 50) {
              // excludes CS341 and CS350 however since they have their own checkbox
              if ( that.isThirdOrFourthYearCSCourse(subjectCode, courseNumber) && 
                   ( courseNumber != 341 && courseNumber != 350 ) && 
                   thirdOrFourthYearCSCourseCount != 3 ) {
                courseCodeSelector = "#g011 .third-or-fourth-year-CS-course:not(:checked)";
                $(courseCodeSelector).first().parent().append(" - (" + courseCode + ")");
                thirdOrFourthYearCSCourseCount++;
              } else if ( that.isFourthYearCSCourse(subjectCode, courseNumber) ) {
                courseCodeSelector = "#g011 .fourth-year-CS-course:not(:checked)";
                $(courseCodeSelector).first().parent().append(" - (" + courseCode + ")");
              } else if ( that.isSixthYearCSCourse(subjectCode, courseNumber) ) {
                courseCodeSelector = "#g011 .sixth-year-CS-course:not(:checked)";
                $(courseCodeSelector).first().parent().append(" - (" + courseCode + ")");
              } else if ( that.isSeventhYearCSCourse(subjectCode, courseNumber) ) {
                courseCodeSelector = "#g011 .seventh-year-CS-course:not(:checked)";
                $(courseCodeSelector).first().parent().append(" - (" + courseCode + ")");
              } else if (that.isNonMathCourse(subjectCode)) {
                courseCodeSelector = "#g011 .non-math-course:not(:checked)";
                $(courseCodeSelector).first().parent().append(courseCode);
              } else {
                courseCodeSelector = "#g011 ." + courseCode;
              }

              if ($(courseCodeSelector).length) {
                $(courseCodeSelector).first().prop('checked', true).attr("disabled", true);
              } else {
                courseCodeSelector = "#g011 .elective-course:not(:checked)";
                $(courseCodeSelector).first().parent().append(courseCode);
                $(courseCodeSelector).first().prop('checked', true).attr("disabled", true);
              }

              $("#g011 ." + courseCode).prop('checked', true).attr("disabled", true);
              courses[courseCode] = "";
            }

            console.log(courseCode);
            console.log(that.isThirdOrFourthYearCSCourse(courseCode, courseNumber));
            console.log(grade);
            console.log(parseInt(grade) >= 50);
          }

          $('#g011 input:checkbox:not(:checked)').parent().append(' <input class=\"g011-course\" type=\"text\">');

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

  // ----- CONTROLLERS -----
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

  var estimateGraduationController = {
    initView: function () {
      console.log("Initializing estimateGraduationController");
    }
  }

  // ----- INITIALIZATION -----
  console.log("Initializing g011(" + userId + ", " + htmlId + ")");
  portal.loadTemplates("widgets/g011/templates.json",
    function (t) {
      templates = t;

      $(htmlId).html(templates.container);

      $('#g011 .g011-container').html(templates.header);
      $('#g011 .g011-container').append(templates.estimateGraduation);

      $('#g011 .g011-container').append(templates.requiredCourses);
      $('#g011 #required-courses .panel').html(templates.csCourses);
      $('#g011 #required-courses .panel').append(templates.mathCourses);
      $('#g011 #required-courses .panel').append(templates.nonMathCourses);
      $('#g011 #required-courses .panel').append(templates.electiveCourses);

      $('#g011 .g011-container').append(templates.additionalConstraints);
      $('#g011 #additional-constraints .panel').html(templates.csBreadth1Courses);
      $('#g011 #additional-constraints .panel').append(templates.csBreadth2Courses);
      $('#g011 #additional-constraints .panel').append(templates.communicationCourses);
      $('#g011 #additional-constraints .panel').append(templates.businessCourses);

      $('#g011 .g011-container').append(templates.footer);

      model.loadCourses();
    }
  );

  $(htmlId).html(
    '<title>CS349 A4 Portal</title>'
  );
}
