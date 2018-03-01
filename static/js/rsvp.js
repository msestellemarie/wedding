function attendanceList(obj, user){
  var members = obj.people.map(function(x){return x.name;});
  for(var each in members){
    if(user === "plusone" && Number(each) === 1){
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\" checked></td><td><input class=\"review-name\" type=\"text\" placeholder=\"Plus one's name.\" value=\"" + members[each] + "\"></td></tr>");
    }
    else if(user === "plusone"){
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\" checked></td><td><p class=\"review-name\">" + members[each] + "</p></td></tr>");
    }
    else if(user === "noattend"){
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\"></td><td><p class=\"review-name\">" + members[each] + "</p></td></tr>");
    }
    else if(members[each] === null){
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\"></td><td><input class=\"review-name\" type=\"text\" placeholder=\"Plus one's name.\"></td></tr>");
    }
    else if(members[each] !== user.name){
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\" ></td><td><p class=\"review-name\">" + members[each] + "</p></td></tr>");
    }
    else {
      $("tbody").append("<tr class=\"review-row\" data-index=\"" + each + "\"><td><input class=\"review-attending\" type=\"checkbox\" checked></td><td><p class=\"review-name\">" + members[each] + "</p></td></tr>");
    }
  }
}

function userResponse(obj){
  $(".who-else").hide();
  obj.dietary = $(".review-dietary").val();
  if(obj.dietary === ""){
    obj.dietary = null;
  }
  for(var each in obj.people){
    obj.people[each].name = $("[data-index=" + each + "] .review-name").text() || $("[data-index=" + each + "] .review-name").val();
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
  $(".ask-email button").click(function(){
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
      else {
        var person = data.people.filter(function(x){return x.email === email;})[0];
        $(".ask-attending p").text("Hi " + person.name + "! Will you be attending our wedding?")
        $(".ask-attending").show();
        $(".yes-attending").click(function(){
          if(data.family){
            attendanceList(data, person);
            $(".ask-attending").hide();
            $(".who-else").show();
          }
          else {
            $(".ask-attending").hide();
            $(".ask-plus-one").show();
            $(".yes-plus-one").click(function(){
              $(".ask-plus-one").hide();
              $(".ask-plus-one-name").show();
              $(".next").click(function(){
                $(".ask-plus-one-name").hide();
                data.people[1].name = $(".ask-plus-one-name input").val();
                attendanceList(data, "plusone");
                $(".who-else").show();
              });
            });
            $(".no-plus-one").click(function(){
              $(".ask-plus-one").hide();
              data.people[1].name = null;
              attendanceList(data, person);
              $(".who-else").show();
            });
          }
        });
        $(".no-attending").click(function(){
          if(data.family){
            attendanceList(data, "noattend");
            $(".ask-attending").hide();
            $(".who-else").show();
          }
          else {
            $(".ask-attending").hide();
            attendanceList(data, "noattend");
            userResponse(data);
          }
        });
        $(".submit-button").click(function(){
          userResponse(data);
        });
      }
    });
  })
})
