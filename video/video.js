/*jslint devel: true*/
/*eslint-env browser*/
/* exported createComments */
/* exported emptyInput */

var app = angular.module('video', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/Video', {
        templateUrl: 'video/video.html',
        controller: 'videoCtrl'
    });
}]);

app.controller('videoCtrl', ['$scope', '$compile', '$location', '$route', '$sce', 'videoService', function ($scope, $compile, $location, $route, $sce, videoService) {
    'use strict';
    
    //Initialize firestore
    var db = firebase.firestore();

    // Disable deprecated features for Firestore
    db.settings({
        timestampsInSnapshots: true
    });

    var getVidId = sessionStorage.getItem("selectedVidId");

    //$scope.videoId = videoService.videoId;

    $scope.getIndex = function (id) {
        $scope.indexValue = $scope.rcmVids.findIndex(video => video.id === id);
        $scope.videoId = id;
        videoService.videoId = $scope.videoId;
        sessionStorage.setItem("selectedVidId", videoService.videoId);
        var getVidId = sessionStorage.getItem("selectedVidId");
        $route.reload();
    };

    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    };

    /* var messaging = firebase.messaging();
    messaging.requestPermission()
    .then(function() {
        return messaging.getToken();
    })
    .then(function(token) {
        console.log(token);
    })
    .catch(function(err) {
        console.log('Error Occured.');
    }) */

    showRated();
    enableButton();
    getImageComment();
    getUploaderImage();

    //Disable button to rate if user is not logged in.
    function enableButton() {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                document.getElementById('openModal').disabled = false;
            } else {
                document.getElementById('openModal').disabled = true;
            }
        });
    }

    //Get user's initial to display as image.
    function getImageComment() {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var usersinfo = db.collection("Users").doc(user.email); //@TODO

                usersinfo.get().then(function (doc) {

                    if (doc.exists) {
                        $scope.currentUserName = doc.data().Name;

                        $scope.$apply();
                        console.log($scope.currentUserName);

                    } else {
                        console.log("No such document!");
                    }
                });
            }
        });
    }

    function getUploaderImage() {
        $scope.videosRef = db.collection("Videos").doc(getVidId);

        $scope.videosRef.get().then(function (doc) {
            if (doc.exists) {
                var users = doc.data().video_uploader_Email,
                    userRef = db.collection("Users").doc(users);

                userRef.get().then(function (doc) {
                    $scope.uploaderName = doc.data().Name;
                    document.getElementById('uploader').innerHTML = doc.data().Name;
                    $scope.$apply();
                });
            }
        })
    };

    //Disable post button if input is empty or starts with a SPACE
    $scope.emptyInput = function () {

        var regex = /^[^\s].*/,
            commentcontent = document.getElementById("vid_comment").value;

        if (regex.test(commentcontent) && commentcontent !== "") {
            document.getElementById('post').disabled = false;
        } else {
            document.getElementById('post').disabled = true;
        }
    };

    //Creates the comment structure and content when button is pressed.
    $scope.createComments = function () {

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                var userRef = db.collection("Users").doc(user.email),
                    videoRef = db.collection("Videos").doc(getVidId);

                videoRef.get().then(function (doc) {
                    if (doc.exists) {

                        //Get current video's ID number to bind comment with video.
                        var vid_id = doc.id;

                        userRef.get().then(function (doc) {
                            if (doc.exists) {
                                var userInput = document.getElementById("vid_comment").value,
                                    username = doc.data().Name,
                                    userphoto = doc.data().photoURL,
                                    userId = doc.id,

                                    //Create structure for new comment
                                    bigDiv = document.createElement("div"),
                                    ImgColDiv = document.createElement("div"),
                                    TextColDiv = document.createElement("div"),
                                    TextRowDiv = document.createElement("div"),
                                    userColDiv = document.createElement("div"),
                                    userRowDiv = document.createElement("div"),
                                    UserTextColDiv = document.createElement("div"),
                                    userImage = document.createElement("ng-avatar"),
                                    TextColDivContent = document.createTextNode(userInput),
                                    userRowDivContent = document.createTextNode(username),
                                    cgroup = document.getElementById("commentGroup");
                                userImage.setAttribute("bind", "true");
                                userImage.setAttribute("string", username);
                                userImage.setAttribute("auto-color", "true");
                                userImage.setAttribute("style", "width: 35px; height: 35px; display:inline-block");

                                bigDiv.className = 'row commentedBox';
                                ImgColDiv.className = 'col-lg-1 col-md-2 col-sm-2 col-2 imageBoxComment';
                                UserTextColDiv.className = 'col-lg-11 col-md-10 col-sm-10 col-10 pastCommentBox';
                                TextColDiv.className = 'col-lg-11 col-md-10 col-sm-10 col-10 commentArea';
                                userRowDiv.className = 'col-lg-11 col-md-10 col-sm-10 col-10 commentPoster';
                                userImage.className = 'rounded-circle';

                                UserTextColDiv.appendChild(userRowDiv);
                                UserTextColDiv.appendChild(TextRowDiv);
                                userRowDiv.appendChild(userColDiv);
                                TextRowDiv.appendChild(TextColDiv);
                                bigDiv.appendChild(ImgColDiv);
                                bigDiv.appendChild(UserTextColDiv);

                                $compile(userImage)($scope);
                                ImgColDiv.appendChild(userImage);
                                userRowDiv.appendChild(userRowDivContent);
                                TextColDiv.appendChild(TextColDivContent);

                                cgroup.prepend(bigDiv);

                                //Store comment information into Firestore.
                                db.collection("Videos").doc(getVidId).collection("comments").add({
                                    comment_desc: userInput,
                                    comment_user: userId,
                                    comment_date: new Date()
                                });
                                document.getElementById("vid_comment").value = "";
                                document.getElementById('post').disabled = true;
                            }
                        });
                    }
                });

            } else {
                alert("You're not logged-in!");
                document.getElementById("vid_comment").value = "";
            }
        });
    };

    //Display out previous comments and append them by using for loop.
    db.collection("Videos").doc(getVidId).collection("comments").orderBy("comment_date", "desc")
        .get()
        .then(function (querySnapshot) {

            querySnapshot.forEach(function (doc) {

                var user_email = doc.data().comment_user,
                    userComments = doc.data().comment_desc,
                    userphoto,
                    username;

                //To get the name/photo of the comment users
                function getName() {
                    db.collection("Users").doc(user_email).get().then(function (doc) {
                        username = doc.data().Name;
                        userphoto = doc.data().photoURL;
                        var userRowDivContent = document.createTextNode(username);

                        //Attributes for user profile image
                        userImage.setAttribute("bind", "true");
                        userImage.setAttribute("string", username);
                        userImage.setAttribute("auto-color", "true");
                        userImage.setAttribute("style", "width: 35px; height: 35px; display:inline-block");

                        $compile(userImage)($scope);
                        ImgColDiv.appendChild(userImage);
                        userColDiv.appendChild(userRowDivContent);
                    });

                }
                //Structure for the comment section
                var bigDiv = document.createElement("div"),
                    ImgColDiv = document.createElement("div"),
                    TextColDiv = document.createElement("div"),
                    TextRowDiv = document.createElement("div"),
                    userColDiv = document.createElement("div"),
                    userRowDiv = document.createElement("div"),
                    UserTextColDiv = document.createElement("div"),
                    userImage = document.createElement("ng-avatar"),
                    TextColDivContent = document.createTextNode(userComments),
                    cgroup = document.getElementById("commentGroup");

                //Classes name for the structure for css purpose
                bigDiv.className = 'row commentedBox';
                ImgColDiv.className = 'col-lg-1 col-md-2 col-sm-2 col-2 imageBoxComment';
                UserTextColDiv.className = 'col-lg-11 col-md-10 col-sm-10 col-10 pastCommentBox';
                TextColDiv.className = 'col-lg-11 col-md-10 col-sm-10 col-10 commentArea';
                userRowDiv.className = 'col-lg-11 col-md-10 col-sm-10 col-10 commentPoster';
                userImage.className = 'rounded-circle';

                UserTextColDiv.appendChild(userRowDiv);
                UserTextColDiv.appendChild(TextRowDiv);
                userRowDiv.appendChild(userColDiv);
                TextRowDiv.appendChild(TextColDiv);
                bigDiv.appendChild(ImgColDiv);
                bigDiv.appendChild(UserTextColDiv);

                TextColDiv.appendChild(TextColDivContent);

                cgroup.append(bigDiv);
                console.log(cgroup);
                getName();
            });
        })
        .catch(function (error) {

            console.log("Error getting documents: ", error);
        });

    $scope.videosRef = db.collection("Videos").doc(getVidId);

    //Display current video information
    $scope.videosRef.get().then(function (doc) {

        if (doc.exists) {
            //Format the timestamp taken from firestore and convert to date.
            var videoDate = new Date(doc.data().date_uploaded.toDate()),
                month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][videoDate.getMonth()],
                uploadDate = month + ' ' + videoDate.getDate() + ', ' + videoDate.getFullYear(),
                //Store user email into users variable.
                users = doc.data().video_uploader_Email,
                vidCategory = doc.data().video_category,
                userRef = db.collection("Users").doc(users),
                //Store video ID into vid_info variable.
                vid_info = document.getElementById("videolink");

            //Get Recommended video list to display at the side for users.
            db.collection("Videos").onSnapshot(function (querySnapshot) {
                $scope.rcmVids = [];
                querySnapshot.forEach(function (doc) {
                    if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && (doc.data().video_category === vidCategory)) {
                        if (doc.id !== getVidId) {
                            var videoJson = {
                                id: doc.id,
                                data: doc.data(),
                                timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm'),
                                view: doc.data().video_view
                            }
                            $scope.rcmVids.push(videoJson);
                            console.log($scope.rcmVids);
                        }
                    }

                });

                $scope.$apply();
            });

            //Count and display average rating.
            db.collection("Videos").doc(getVidId).collection("ratings").get().then(function (querySnapshot) {

                var allRating = [];
                querySnapshot.forEach(function (doc) {

                    allRating.push(doc.data().rating);
                });

                //Get total of all rating in the array.
                function getSum(total, num) {
                    return total + num;
                }
                //Calculation for average rating and stars.
                var fullRating = 5,
                    //Calculate average rating by sum / number of elements in the array
                    averageRating = allRating.reduce(getSum) / allRating.length,
                    roundedAvgRating = Math.round(averageRating * 10) / 10,
                    starsWidthRating = roundedAvgRating * 10 * 2 + '%';
                document.querySelector('.stars-inner').style.width = starsWidthRating;
                document.getElementById('vid_rating').innerHTML = roundedAvgRating;
            });

            //Get all necessary video information to display.
            document.getElementById('video_desc').innerHTML = doc.data().video_desc;
            document.getElementById('uploaded_date').innerHTML = uploadDate;
            document.getElementById('videolink').src = doc.data().video_link;
            document.getElementById('video_category').innerHTML = doc.data().video_category;
            document.getElementById('video_tag').innerHTML = (doc.data().video_tags).split(/[ ,]+/).join(', ');
            document.getElementById('video_name').innerHTML = doc.data().video_name;
            document.getElementById('video_views').innerHTML = doc.data().video_view;

            //Get video uploader's name to display.
            userRef.get().then(function (doc) {

                document.getElementById('uploader').innerHTML = doc.data().Name;
            });

            //Video view count
            var timeStarted = -1,
                timePlayed = 0,
                duration = 0;

            // If video metadata is loaded get duration
            if (vid_info.readyState > 0) {
                getDuration.call(vid_info);
            } else {
                //If metadata not loaded, use event to get it
                vid_info.addEventListener('loadedmetadata', getDuration);
            }

            // remember time user started the video
            function videoStartedPlaying() {
                timeStarted = new Date().getTime() / 1000;
            }

            //Will run when the video is skipped/paused/stopped
            function videoStoppedPlaying(event) {
                // Start time less then zero means stop event was fired vidout start event
                if (timeStarted > 0) {
                    var playedFor = new Date().getTime() / 1000 - timeStarted;
                    timeStarted = -1;
                    // add the new ammount of seconds played
                    timePlayed += playedFor;
                }
            }
            //Get the rounded total duration of the video
            function getDuration() {
                duration = vid_info.duration;
            }

            function increaseView() {
                var totalDuration = duration * 80 / 100,
                    roundedtotalDuration = Math.round(totalDuration),
                    roundedPlayedDuration = Math.round(timePlayed),
                    x = doc.data().video_view;

                //Add a view if 80% of the total video is watched
                var getView = setInterval(function () {
                    if (roundedPlayedDuration > roundedtotalDuration) {
                        clearInterval(getView);
                        x += 1;
                        db.collection("Videos").doc(getVidId).update({
                            video_view: x
                        });
                    }
                }, 100);
            }

            vid_info.addEventListener("play", videoStartedPlaying);
            vid_info.addEventListener("playing", function () {
                videoStartedPlaying();
                increaseView();
            });
            vid_info.addEventListener("ended", function () {
                videoStoppedPlaying();
                increaseView();
            });
            vid_info.addEventListener("pause", function () {
                videoStoppedPlaying();
                increaseView();
            });

        } else {
            console.log("No such document!");
        }
    }).catch(function (error) {

        console.log("Error getting document:", error);
    });


    //Shows the previous rating given to a video to the individual user.
    function showRated() {

        firebase.auth().onAuthStateChanged(function (user) {
            db.collection("Videos").doc(getVidId).collection("ratings").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {

                    if (doc.data().rated_user === user.email) {
                        var selectedIndex = doc.data().rating,
                            stars = document.querySelectorAll('.star');

                        // Loop through each star, and add or remove the `.selected` class to toggle highlighting
                        stars.forEach(function (star, index) {
                            if (index < selectedIndex) {
                                // Selected star or before it
                                // Add highlighting
                                star.classList.add('selected');
                            } else {
                                // After selected star
                                // Remove highlight
                                star.classList.remove('selected');
                            }
                        });
                        document.getElementById('user_rated').innerHTML = "You've rated this video " + selectedIndex + " stars.";
                    }
                });
            });
        });
    }

    // Listen for form submissions for rating
    document.addEventListener('submit', function (event) {

        //Only allow authenticated users to rate the video
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {

                // Only run our code on .rating forms
                if (!event.target.matches('.rating')) {
                    return;
                }

                // Prevent form from submitting
                event.preventDefault();

                // Get the selected star
                var selected = document.activeElement;
                if (!selected) {
                    return;
                }
                var selectedIndex = parseInt(selected.getAttribute('data-star'), 10),
                    stars = Array.from(event.target.querySelectorAll('.star'));

                // Loop through each star, and add or remove the `.selected` class to toggle highlighting
                stars.forEach(function (star, index) {
                    if (index < selectedIndex) {
                        // Selected star or before it
                        // Add highlighting
                        star.classList.add('selected');
                    } else {
                        // After selected star
                        // Remove highlight
                        star.classList.remove('selected');
                    }
                });

                // Remove aria-pressed from any previously selected star
                var previousRating = event.target.querySelector('.star[aria-pressed="true"]');
                if (previousRating) {
                    previousRating.removeAttribute('aria-pressed');
                }

                // Add aria-pressed role to the selected button
                selected.setAttribute('aria-pressed', true);
                db.collection("Videos").doc(getVidId).collection("ratings").where("rated_user", "==", user.email) //TODO
                    .get()
                    .then(function (querySnapshot) {
                        //If rating document exist for a particular video, overwrite the previous rating, or else, create new rating document with the rated number.
                        if (querySnapshot.size > 0) {
                            querySnapshot.forEach(function (doc) {
                                db.collection("Videos").doc(getVidId).collection("ratings").doc(doc.id).update({
                                    rating: selectedIndex
                                });
                                document.getElementById('user_rated').innerHTML = "You've rated this video " + selectedIndex + " stars.";
                                setTimeout(function () {
                                    document.getElementById('closeModal').click();
                                }, 2000);
                            });
                        } else {
                            db.collection("Videos").doc(getVidId).collection("ratings").add({
                                rated_user: user.email,
                                rating: selectedIndex
                            });
                            document.getElementById('user_rated').innerHTML = "You've rated this video " + selectedIndex + " stars.";
                            setTimeout(function () {
                                document.getElementById('closeModal').click();
                            }, 2000);
                        }
                    });
            } else {}
        });

    }, false);

}]);
