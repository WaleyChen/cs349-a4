function g011(userId, htmlId) {
  "use strict";
  var templates = {};
  var waterlooAPIKey = '2382b86bf4cfde897e02a8fa55a02d31';

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

    markCurrentlyTaking: function(selector, courseCode) {
      selector = '#g011 ' + selector + ':not(:checked):not(.g011_cur-course)';
      $(selector).first().parent().append(" - (" + courseCode + ")");
      $(selector).first().addClass("g011_cur-course");
    },

    // load information about the courses the student has taken
    loadCourses: function() {
      var that = this;

      $.getJSON("https://cs349.student.cs.uwaterloo.ca:9410/api/v1/student/stdGrades/" + userId, function (d) {
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
              that.markCurrentlyTaking('.third-or-fourth-year-CS-course', courseCode);
              that.markCurrentlyTaking('#g011_cs-breadth-1 .' + courseCode, courseCode);

              thirdOrFourthYearCSCourseCount++;
            } else if ( that.isFourthYearCSCourse(subjectCode, courseNumber) ) {
              that.markCurrentlyTaking('.fourth-year-CS-course', courseCode);
              that.markCurrentlyTaking('#g011_cs-breadth-1 .' + courseCode, courseCode);
            } else {
              courseCodeSelector = "#g011 ." + courseCode;
              $(courseCodeSelector).first().addClass("g011_cur-course");
            }
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
              courseCodeSelector = "#g011 .g011_non-math-course:not(:checked)";
              $(courseCodeSelector).first().parent().append(courseCode);
            } else {
              courseCodeSelector = "#g011 ." + courseCode;
            }

            // select a checkbox that matches a specific course code, if no such checkbox exists,
            // then it's a elective
            if ($(courseCodeSelector).length) {
              $(courseCodeSelector).first().prop('checked', true).attr("disabled", true);
            } else {
              courseCodeSelector = "#g011 .g011_elective-course:not(:checked)";
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

        $('#g011 .g011_multi-courses:not(:checked):not(.g011_cur-course)').parent().append(
          '&nbsp; <input class=\'form-control g011_course\' placeholder=\'CourseCode\' type=\'text\'> &nbsp;' + 
          '<select class="form-control g011_term-select"> <option>Term</option> <option>Fall</option> <option>Winter</option> <option>Spring</option> </select> &nbsp;' +
          '<select class="form-control g011_term-select"> <option>Year</option> <option>2014</option> <option>2015</option> <option>2016</option> <option>2017</option> <option>2018</option> </select> &nbsp;'
        );

        $('#g011 input.g011_course').keyup(function() {
          var that = this;
          $.getJSON('http://api.uwaterloo.ca/public/v1/?key=' + waterlooAPIKey + '&service=CourseInfo&q=' + $(this).val() + '&output=json' + userId, function (d) {
            if($(that).parent().children().last().hasClass('glyphicon')) {
              $(that).parent().children().last().remove();
            }

            if (d.response.data.result === undefined) {
              $(that).next().removeClass('FALL').removeClass('WINTER').removeClass('SPRING');

              var lastSibling = $(that).parent().last().children();
              
              if ($(that).val() != '') {
                $(that).parent().append(
                  '<span class=\"glyphicon glyphicon-remove-circle\" data-container=\"body\" data-toggle=\"popover\" data-trigger=\"hover\" data-delay=\'{ \"hide\": \"2000\" }\' data-placement=\"right\" data-content=\"Invalid course code.\"></span>'
                )

                $(that).parent().children().last().popover('toggle');
                $(that).parent().children().last().popover('toggle');
              }
            } else {
              var course = d.response.data.result[0];
              var offerings = course.noteDesc.substring(course.noteDesc.indexOf('Offered:'));
              var offeringsString = "";

              if (offerings.indexOf('F') != -1) { 
                $(that).next().addClass('FALL');
                offeringsString += 'Fall'
              }
              if (offerings.indexOf('W') != -1) { 
                $(that).next().addClass('WINTER'); 
                if (offeringsString == '') { offeringsString += 'Winter' } else { offeringsString += ', Winter' }
              }
              if (offerings.indexOf('S') != -1) { 
                $(that).next().addClass('SPRING'); 
                if (offeringsString == '') { offeringsString += 'Spring' } else { offeringsString += ', Spring' }
              }

              $(that).parent().append('<span class=\'glyphicon glyphicon-info-sign\' data-container=\"body\" data-toggle=\"popover\" data-trigger=\"hover\" data-delay=\'{ \"hide\": \"3000\" }\' data-placement=\"right\" data-content=\"' + $(that).val() + ' is offered ' + offeringsString + '.\"></span>');
              $(that).parent().children().last().popover('toggle');
              $(that).parent().children().last().popover('toggle');
            }
          });
        });
      }).fail(function( jqxhr, textStatus, error ) {
        var err = textStatus + ", " + error;
        console.log( "Request Failed: " + err );
      });
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

      $('#g011 .g011_container').append(templates.header);
      $('#g011 .g011_container').append(templates.estimateGraduation);

      $('#g011 .g011_container').append(templates.requiredCourses);
      $('#g011 #required-courses .panel').html(templates.csCourses);
      $('#g011 #required-courses .panel').append(templates.mathCourses);
      $('#g011 #required-courses .panel').append(templates.nonMathCourses);
      $('#g011 #required-courses .panel').append(templates.electiveCourses);

      $('#g011 .g011_container').append(templates.additionalConstraints);
      $('#g011 #g011_additional-constraint .panel').html(templates.csBreadth1Courses);
      $('#g011 #g011_additional-constraint .panel').append(templates.csBreadth2Courses);
      $('#g011 #g011_additional-constraint .panel').append(templates.communicationCourses);
      $('#g011 #g011_additional-constraint .panel').append(templates.businessCourses);

      $('#g011 .g011_container').append(templates.footer);

      model.loadCourses();
    }
  );

  $(htmlId).html(
    '<title>CS349 A4 Portal</title>'
  );
}

$(function () {

// Checkbox Counts
  $('#g011_cs').change(function() {
    var courses = $("#g011_cs input:checked").length;
    
    if(courses > 0) {
      $('#g011_csunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011_csunits').text(""); 
    }
  });

  $('#g011_math').change(function() {
    var courses = $("#g011_math input:checked").length;
    
    if(courses > 0) {
      $('#g011_mathunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011_mathunits').text(""); 
    }
  });

  $('#g011_mathadd').change(function() {
    var courses = $("#g011_mathadd input:checked").length;
    
    if(courses > 0) {
      $('#g011_mathaddunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011_mathaddunits').text(""); 
    }
  });

  $('#g011_nonmath').change(function() {
    var courses = $("#g011_nonmath input:checked").length;
    
    if(courses > 0) {
      $('#g011_nonmathunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011_nonmathunits').text(""); 
    }
  });


  $('#g011_elective').change(function() {
    var courses = $("#g011_elective input:checked").length;
    
    if(courses > 0) {
      $('#g011_electiveunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011_electiveunits').text(""); 
    }
  });

  $('#g011_twoof').change(function() {
    var checkboxes = $("#g011_twoof input[type='checkbox']");
    var courses = $("#g011_twoof input:checked").length;
    var max = 2;
    
    if(courses > 0) {
      $('#g011_twoofunits').text(courses + "/ ");
    }
    else {
      $('#g011_twoofunits').text("");
    }

    checkboxes.change(function(){
        var current = checkboxes.filter(':checked').length;
        checkboxes.filter(':not(:checked)').prop('disabled', current >= max);
    });
  });

  $('#g011_communication').change(function() {
    var checkboxes = $("#g011_communication input[type='checkbox']");
    var courses = $("#g011_communication input:checked").length;
    var max = 2;
    
    if(courses > 0) {
      $('#g011_communicationunits').text(courses + "/ ");
    }
    else {
      $('#g011_communicationunits').text(""); 
    }

    checkboxes.change(function(){
        var current = checkboxes.filter(':checked').length;
        checkboxes.filter(':not(:checked)').prop('disabled', current >= max);
    });
  });  

  $('#g011_business').change(function() {
    var checkboxes = $("#g011_business input[type='checkbox']");
    var courses = $("#g011_business input:checked").length;
    var max = 6;

    if(courses > 0) {
      $('#g011_businessunits').text(courses + "/ ");
    }
    else {
      $('#g011_businessunits').text(""); 
    }
    checkboxes.change(function(){
        var current = checkboxes.filter(':checked').length;
        checkboxes.filter(':not(:checked)').prop('disabled', current >= max);
    });
  });  

//Popovers
  $('#g011_estimatedate').popover({
    html: true,
    trigger: 'hover', 
    placement: 'right',
    content: function() {
      return $('#g011_estimatenote').html();
    }
  });

  $('#g011_note').popover({
    html: true,
    trigger: 'hover', 
    placement: 'right',
    content: function() {
      return $('#g011_mathaddnote').html();
    }
  });
})