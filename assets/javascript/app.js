$(document).ready(function () {
    var config = {
        apiKey: "AIzaSyDnAngsPuPe1NjT9LzmGP028Q9dU8TE0Q4",
        authDomain: "trainactivity-5f162.firebaseapp.com",
        databaseURL: "https://trainactivity-5f162.firebaseio.com",
        projectId: "trainactivity-5f162",
        storageBucket: "trainactivity-5f162.appspot.com",
        messagingSenderId: "644921315880"
    };
    firebase.initializeApp(config);
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // ...
        }
        // The signed-in user info.
        var user = result.user;
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }).catch(function(error) {
        // An error happened.
      });
    var database = firebase.database();
    var trainName = "";
    var destination = "";
    var firstTime = "";
    var frequency = 0;
    var nextArrival = 0;
    var minutesAway = 0;
    $("#submit").on("click", function (event) {
        event.preventDefault();
        trainName = $("#train-name").val().trim();
        destination = $("#destination").val().trim();
        frequency = $("#frequency").val().trim();
        firstTime = $("#first-train-time").val().trim();
        database.ref().push({
            trainName: trainName,
            destination: destination,
            frequency: frequency,
            firstTime: firstTime,
        });
    });
    var updateTime = function () {
        database.ref().on("child_added", function (childSnapshot) {
            currentTime = moment().utc()
            var firstTime = childSnapshot.val().firstTime
            var hourDifference = currentTime.local().format('HH') - firstTime.slice(0, 2)
            var minuteDifference = currentTime.local().format('mm') - firstTime.slice(3, 5)
            var totalDifference = 60 * hourDifference + minuteDifference
            var minutesAway = childSnapshot.val().frequency - totalDifference % childSnapshot.val().frequency
            var nextArrival = currentTime.add(minutesAway, "minutes")
            var displayNextArrival = nextArrival.format("hh:mm A")
            var nextDate = nextArrival.format("MM-DD-YYYY")
            var name = childSnapshot.val().trainName
            $("#data-goes-here").append("<tr class='train-info' key='" + childSnapshot.key + "'> " +
                "<th class='" + name + "'>" + name + "</th>" +
                "<td class='" + name + "'>" + childSnapshot.val().destination + "</td>" +
                "<td class='" + name + "'>" + childSnapshot.val().frequency + "</td>" +
                "<td class='" + name + "'>" + displayNextArrival + "</td>" +
                "<td class='" + name + "'>" + minutesAway + "</td>" +
                "<td class='" + name + "'>" + nextDate + "</td>" +
                "</tr>")
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
    $(document).on("mouseenter", ".train-info", function () {
        $(this).append("<a class='remove btn-floating btn-small waves-effect waves-light blue right''><i  class=' material-icons'>remove_circle_outline</i></a>")
        var current = this
        var currentDb = database.ref($(this).attr("key"))
        $(".remove").on("click", function () {
            currentDb.remove()
            $(current).remove()
        })
    }).on("mouseleave", ".train-info", function () {
        $(".remove").remove()
    })

    updateTime()
    setInterval(function () { $(".train-info").remove(), updateTime(); }, 60000)
});
