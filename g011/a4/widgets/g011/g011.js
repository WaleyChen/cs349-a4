function g011(userid, htmlId) {
  "use strict";
  var templates = {};

  var model = {
    views: [],
    course: {},

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
  console.log("Initializing g011(" + userid + ", " + htmlId + ")");
  portal.loadTemplates("widgets/g011/templates.json",
    function (t) {
      templates = t;
      $(htmlId).html(templates.baseHtml);
      courseView.initView();
    });
}

$(function () {
  // $('#accordion label').append("<div class='term'><button class='btn btn-sm dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown'>Term<span class='caret'></span></button><ul class='dropdown-menu pull-right'><li><a href='#'>Fall</a></li><li><a href='#'>Winter</a></li><li><a href='#'>Spring</a></li></ul><input type='text' class='form-control' placeholder='year'></div>");
  $('#accordion label').append("<span class='g011coursedate'><select class='form-control g011term'><option>Term</option><option value='fall'>Fall</option><option value='winter'>Winter</option><option value='spring'>Spring</option></select><input type='text' class='form-control' placeholder='year'></span>");

// Checkbox Counts
  $('#g011cs').change(function() {
    var courses = $("#g011cs input:checked").length;
    
    if(courses > 0) {
      $('#g011csunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011csunits').text(""); 
    }
  });

  $('#g011math').change(function() {
    var courses = $("#g011math input:checked").length;
    
    if(courses > 0) {
      $('#g011mathunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011mathunits').text(""); 
    }
  });

  $('#g011mathadd').change(function() {
    var courses = $("#g011mathadd input:checked").length;
    
    if(courses > 0) {
      $('#g011mathaddunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011mathaddunits').text(""); 
    }
  });

  $('#g011nonmath').change(function() {
    var courses = $("#g011nonmath input:checked").length;
    
    if(courses > 0) {
      $('#g011nonmathunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011nonmathunits').text(""); 
    }
  });


  $('#g011elective').change(function() {
    var courses = $("#g011elective input:checked").length;
    
    if(courses > 0) {
      $('#g011electiveunits').text(courses/2 + "/ ");
    }
    else {
      $('#g011electiveunits').text(""); 
    }
  });

  $('#g011twoof').change(function() {
    var checkboxes = $("#g011twoof input[type='checkbox']");
    var courses = $("#g011twoof input:checked").length;
    var max = 2;
    
    if(courses > 0) {
      $('#g011twoofunits').text(courses + "/ ");
    }
    else {
      $('#g011twoofunits').text(""); 
    }

    checkboxes.change(function(){
        var current = checkboxes.filter(':checked').length;
        checkboxes.filter(':not(:checked)').prop('disabled', current >= max);
    });
  });

  $('#g011communication').change(function() {
    var checkboxes = $("#g011communication input[type='checkbox']");
    var courses = $("#g011communication input:checked").length;
    var max = 2;
    
    if(courses > 0) {
      $('#g011communicationunits').text(courses + "/ ");
    }
    else {
      $('#g011communicationunits').text(""); 
    }

    checkboxes.change(function(){
        var current = checkboxes.filter(':checked').length;
        checkboxes.filter(':not(:checked)').prop('disabled', current >= max);
    });
  });  

  $('#g011business').change(function() {
    var checkboxes = $("#g011business input[type='checkbox']");
    var courses = $("#g011business input:checked").length;
    var max = 6;

    if(courses > 0) {
      $('#g011businessunits').text(courses + "/ ");
    }
    else {
      $('#g011businessunits').text(""); 
    }

    checkboxes.change(function(){
        var current = checkboxes.filter(':checked').length;
        checkboxes.filter(':not(:checked)').prop('disabled', current >= max);
    });
  });  

//Popovers
  $('#g011estimatedate').popover({
    html: true,
    trigger: 'hover', 
    placement: 'right',
    content: function() {
      return $('#g011estimatenote').html();
    }
  });

  $('#g011note').popover({
    html: true,
    trigger: 'hover', 
    placement: 'right',
    content: function() {
      return $('#g011mathaddnote').html();
    }
  });

  // $("input[type='checkbox']").change(function(){
  //   var coursedate = parent().children('.g011coursedate');
  //   console.log(coursedate);
  //   if(coursedate.css('display') == 'none') {
  //     coursedate.css('display', 'inline');
  //   }
  //   else {
  //     coursedate.css('display', 'none');
  //   }
  // });
});