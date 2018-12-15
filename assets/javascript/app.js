$(document).ready(function () {
    // initialize firebase 
    var config = {
        apiKey: "AIzaSyDnAngsPuPe1NjT9LzmGP028Q9dU8TE0Q4",
        authDomain: "trainactivity-5f162.firebaseapp.com",
        databaseURL: "https://trainactivity-5f162.firebaseio.com",
        projectId: "trainactivity-5f162",
        storageBucket: "trainactivity-5f162.appspot.com",
        messagingSenderId: "644921315880"
    };
    firebase.initializeApp(config);
    // setup google authentication so the user must use this to view page
    var provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        // ...
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


    // variables to pass and recieve infromatio from/to firebase in the click event and updateTime functions below
    var database = firebase.database();
    var trainName = "";
    var destination = "";
    var firstTime = "";
    var frequency = 0;
    var nextArrival = 0;
    var minutesAway = 0;

    // Submits the information entered by the user by taking the text and number values in the input fields, stores them in variables and pushes the variables in an object to firebase
    $("#submit").on("click", function (event) {
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

    // To allow the setInterval function to run the reference function is stored in the updateTime function below.
    var updateTime = function () {
        // the function below calls objects on by one from firebase and stores them in childSnapshot so their respective variables can be retrieved
        database.ref().on("child_added", function (childSnapshot) {
            // current time in local time zone retrieved from moment js
            currentTime = moment().utc()
            // variables used for calculating the time from the next arrival its minutes away
            var firstTime = childSnapshot.val().firstTime
            var hourDifference = currentTime.local().format('HH') - firstTime.slice(0, 2)
            var minuteDifference = currentTime.local().format('mm') - firstTime.slice(3, 5)
            // convert the total time since the FIRST train of the given day to minutes, converted to minutes so minutesAway can calulate using just minutes
            var totalDifference = 60 * hourDifference + minuteDifference
            // calculate the minutes away by subtracting the remainder of TOTAL TIME since the FIRST TRAIN by its FREQUENY. The remainder of the modal is the time since the last train left.
            var minutesAway = childSnapshot.val().frequency - totalDifference % childSnapshot.val().frequency
            // calulate the minutes away from current time and format
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

    // a mouse over function add a remove train and its info from the page and firebase
    $(document).on("mouseenter", ".train-info", function () {
        $(this).append("<a class='remove btn-floating btn-small waves-effect waves-light green darken-4 right'><i  class=' material-icons'>remove_circle_outline</i></a>")
        var current = this
        var currentDb = database.ref($(this).attr("key"))
        $(".remove").on("click", function () {
            currentDb.remove()
            $(current).remove()
        })
    }).on("mouseleave", ".train-info", function () {
        $(".remove").remove()
    })
    // loads train info from firebase on page load
    updateTime()
    // updates the information on the page every minute
    setInterval(function () { $(".train-info").remove(), updateTime(); }, 60000)
});
