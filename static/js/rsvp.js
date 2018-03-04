function attendanceList(obj){
  var members = obj.people.map(function(x){return x.name;});
  for(var each in members){
    if(obj.people[each].email === undefined){
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\"></td><td><input class=\"review-name\" type=\"text\" placeholder=\"Plus one's name.\" value=\"" + (members[each] || "") + "\"></td></tr>");
    }
    else {
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\"></td><td><p class=\"review-name\">" + (members[each] || "") + "</p></td></tr>");
    }
  }
}

function checkBoxes(obj){
  var plusOneChecked;
  for(var each in obj.people){
    if(obj.people[each].attending){
      $("[data-index=" + each + "] .review-attending").prop("checked", true);
    }
    else {
      $("[data-index=" + each + "] .review-attending").prop("checked", false);
    }
  }
  if(!$("[data-index=0] .review-attending").prop("checked") && !obj.family){
    $("[data-index=1] .review-attending").prop("checked", false);
    $("[data-index=1] .review-attending").prop("disabled", true);
    $("[data-index=1] .review-name").prop("disabled", true);
  }
  $(".review-name").keypress(function(){
    $("[data-index=1] .review-attending").prop("checked", true);
  });
  $("[data-index=0] .review-attending").on("change", function(){
    if(!$(this).prop("checked") && !obj.family){
      plusOneChecked = $("[data-index=1] .review-attending").prop("checked");
      $("[data-index=1] .review-attending").prop("checked", false);
      $("[data-index=1] .review-attending").prop("disabled", true);
      $("[data-index=1] .review-name").prop("disabled", true);
    }
    else {
      $("[data-index=1] .review-attending").prop("disabled", false);
      $("[data-index=1] .review-name").prop("disabled", false);
      $("[data-index=1] .review-attending").prop("checked", plusOneChecked);
    }
  });
}

function userResponse(obj){
  $(".who-else").hide();
  obj.submitted = true;
  obj.dietary = $(".review-dietary").val();
  if(obj.dietary === ""){
    obj.dietary = null;
  }
  for(var each in obj.people){
    obj.people[each].name = $("[data-index=" + each + "] .review-name").text() || $("[data-index=" + each + "] .review-name").val() || null;
    obj.people[each].attending = $("[data-index=" + each + "] .review-attending").prop("checked");
  }
  $(".loading").show();
  $.ajax({
    url: "/api/rsvp/",
    type: "PUT",
    data: JSON.stringify(obj),
    dataType: "json",
    contentType: "application/json",
    complete: function(data){
      $(".loading").hide();
      $(".thanks").show();
    }
  });
}

$(document).ready(function(){
  $(".ask-email").show();
  $(".loading").hide();
  $(".not-found").hide();
  $(".ask-attending").hide();
  $(".ask-plus-one").hide();
  $(".ask-plus-one-name").hide();
  $(".who-else").hide();
  $(".review").hide();
  $(".thanks").hide();
  $(".ask-email-address").val(window.location.search.split("=")[1]);
  $(".ask-email-form").on("submit", function(){
    var email = $(".ask-email-address").val().toLowerCase().trim();
    $(".ask-email").hide();
    $(".loading").show();
    $.getJSON("/api/rsvp/?email=" + encodeURIComponent(email), function(data){
      $(".loading").hide();
      if(data === null){
        $(".initial").hide();
        $(".ask-email").show();
        $(".not-found").show();
      }
      else if(data.submitted){
        attendanceList(data);
        checkBoxes(data);
        $(".attendance-message").text("Hi! Review and make any changes to your selections below.");
        $(".review-dietary").val(data.dietary || "");
        $(".who-else").show();
      }
      else if(data.family){
        attendanceList(data);
        $(".attendance-message").text("Hi! Who in your family will be attending? Check the boxes next to their names.");
        $(".who-else").show();
      }
      else {
        var person = data.people.filter(function(x){return x.email === email;})[0];
        $(".ask-attending p").text("Hi " + person.name + "! Will you be attending our wedding?")
        $(".ask-attending").show();
        $(".yes-attending").click(function(){
          data.people[0].attending = true;
          $(".ask-attending").hide();
          $(".ask-plus-one").show();
          $(".yes-plus-one").click(function(){
            data.people[1].attending = true;
            $(".ask-plus-one").hide();
            $(".ask-plus-one-name").show();
            $(".ask-plus-one-name-form").on('submit', function(){
              data.people[1].name = $(".ask-plus-one-name input").val();
              $(".ask-plus-one-name").hide();
              attendanceList(data);
              checkBoxes(data);
              $(".attendance-message").text("Great! Review and make any changes to your selections below.")
              $(".who-else").show();
              return false;
            });
          });
          $(".no-plus-one").click(function(){
            data.people[1].attending = false;
            $(".ask-plus-one").hide();
            attendanceList(data);
            checkBoxes(data);
            $(".attendance-message").text("Great! Review and make any changes to your selections below.")
            $(".who-else").show();
          });
        });
        $(".no-attending").click(function(){
          data.people[0].attending = false;
          data.people[1].attending = false;
          $(".ask-attending").hide();
          attendanceList(data);
          checkBoxes(data);
          userResponse(data);
        });
      }
      $(".submit-button").click(function(){
        userResponse(data);
      });
    });
    return false;
  });
})
