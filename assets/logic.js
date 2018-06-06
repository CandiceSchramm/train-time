// Initialize Firebase
var config = {
    apiKey: "AIzaSyCH6JEeWhI8YFYN4yh-n-JzwhLdVAml4m4",
    authDomain: "train-time-e77fe.firebaseapp.com",
    databaseURL: "https://train-time-e77fe.firebaseio.com",
    projectId: "train-time-e77fe",
    storageBucket: "",
    messagingSenderId: "609117619031"
};

firebase.initializeApp(config);

var database = firebase.database();

//---------------when submit is clicked-------------------------------
$(".submit").on("click", function (event) {
    event.preventDefault();

    var trainName = $(".train-name").val().trim();
    var destination = $(".destination").val().trim();
    var firstTrain = $(".first-train").val().trim();
    var frequency = $(".frequency").val().trim();


    //resets the form
    $(".train-name").val("")
    $(".destination").val("")
    $(".frequency").val("");
    $(".first-train").val("")


    // time conversions

    //current time
    var currentTime = moment().seconds(0).milliseconds(0).unix();

    //we need the time from where it was entered, split it into hours and minutes separately
    var timeArray = firstTrain.split(":");
    var hourTrainLeft = parseInt(timeArray[0]);
    var minuteTrainLeft = parseInt(timeArray[1]);
    //get the day the train left, default time is 00:00 
    var timeTrainLeft = moment().startOf("day");
    //change the default time of the timeTrainLeft to include the hour and minute that it left
    timeTrainLeft.add(hourTrainLeft, "h");
    timeTrainLeft.add(minuteTrainLeft, "m");
    //save that time the train left in unix time
    var timeTrainLeft = timeTrainLeft.unix();



    //we need to know how many seconds have passed since the 1sr train left
    var secondsSinceTrainLeft = (currentTime - timeTrainLeft);
    //we need to know the frequency in seconds
    var IntervalInSeconds = (parseInt(frequency) * 60);
    //here we find out how many seconds have passed since the last train
    var secondsSinceLastTrain = (secondsSinceTrainLeft % IntervalInSeconds);


    //now we need to subtract the seconds that have passed...
    //from the interval to get how much time is remaining til the next train
    var nextTrainComesIn = (IntervalInSeconds - secondsSinceLastTrain);


    //here's the train info that we're gonna push to the database
    var newTrain = {
        //we get trainName from the form upon "submit"
        name: trainName,
        //we get destination from the form upon "submit"
        destination: destination,
        //we get frequency from the form upon "submit"
        rate: frequency,
        //we get the time the next train comes in from the time converson
        next: nextTrainComesIn
    };

    //pushed the new train info to the database
    database.ref().push(newTrain);
});
//---------------------------------------------------------------------

//---------------adding the table row from the database----------------
//when there's another item added to the database or when the page is initially loaded
database.ref().on("child_added", function (childSnapshot, prevChildKey) {

    // Store the train info that is in the database into variables so we can use them.
    var TrainName = childSnapshot.val().name;
    var TrainDestination = childSnapshot.val().destination;
    var TrainRate = childSnapshot.val().rate;
    var MinutesAway = childSnapshot.val().next / 60
    var NextTrain = childSnapshot.val().next
        //lets make the next train time human time
        var NextTrainInMoment = moment().add(NextTrain, "s");
        var NextTrainTimePretty = NextTrainInMoment.format('hh:mm A')


    // Add each train's data into the table
    $(".train-table > tbody").append("<tr><td>" + TrainName + "</td><td>" + TrainDestination + "</td><td>" +
        TrainRate + "</td><td>" + MinutesAway + "</td><td>" + NextTrainTimePretty + "</td></tr>")
});
//-----------------------------------------------------------------------
