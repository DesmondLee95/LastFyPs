/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('userpage', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/userpage', {
        templateUrl: 'userpage/userpage.html',
        controller: 'userpageCtrl'
    })
}]);

app.controller('userpageCtrl', ['$scope', '$location', '$sce', 'videoService', function ($scope, $location, $sce, videoService) {
    'use strict'

    //    if (firebase.auth().currentUser === null) {
    //        $location.path("/login");
    //    }
    var db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });


    $scope.currentUserVideos = [];

    $scope.getIndex = function (id) {
        $scope.indexValue = $scope.currentUserVideos.findIndex(video => video.id === id);
        console.log("UserPage | Video ID: " + id);
        console.log("UserPage | Index: " + $scope.indexValue);
        $scope.currentUserVideos[$scope.indexValue].views += 1;
        $scope.videoId = id;
        videoService.videoId = $scope.videoId;
        sessionStorage.setItem("selectedVidId", videoService.videoId);
    };

    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    }

    var user = firebase.auth().currentUser;
    var messaging = firebase.messaging();

    // signout
    $scope.signout = function () {

        firebase.auth().signOut().then(function () {
            messaging.getToken().then(function (currentToken) {
                if (currentToken) {
                    var tokenRefs = db.collection("Tokens");

                    if (currentToken !== null) {
                        tokenRefs.where("tokenId", "==", currentToken)
                            .get()
                            .then(function (querySnapshot) {
                                querySnapshot.forEach(function (doc) {
                                    if(doc.data().userEmail == user.email) {
                                        console.log("Token is deleted");
                                    console.log(user.email + currentToken);
                                    doc.ref.delete();
                                    }
                                })
                            }).catch(function (error) {
                                console.error("Error removing document: ", error);
                            });
                    }
                } else {
                    // Show permission request.
                    console.log('No Instance ID token available. Request permission to generate one.');
                }
            }).catch(function (err) {
                console.log('An error occurred while retrieving token. ', err);
            });
        }).catch(function (error) {
            console.log(error);
        });
        $location.path("/Home");
    };

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            $location.path("/userpage");
            db.collection("Videos").get().then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {

                    if (doc.data().video_uploader_Email === user.email) {

                        // Creating a Json object that will hold the video information of the current user that is logged in
                        $scope.videosJson = {
                            id: doc.id,
                            category: doc.data().video_category,
                            description: doc.data().video_desc,
                            link: doc.data().video_link,
                            thumbnailLink: doc.data().thumbnail_link,
                            video_name: doc.data().video_name,
                            uploader_Email: doc.data().video_uploader_Email,
                            uploader_Name: doc.data().video_uploader,
                            visibility: doc.data().video_visibility,
                            views: doc.data().video_view,
                            timestampdisplay: moment(doc.data().date_uploaded.toDate()).format('DD MMMM YYYY'),
                            duration: doc.data().duration,
                            block: doc.data().block_status
                        };

                        // Pushing the json data one by one into the array of videos to be edited
                        $scope.currentUserVideos.push($scope.videosJson);

                    }
                    // doc.data() is never undefined for query doc snapshots
                    //                    console.log(doc.id, " => ", doc.data());
                });

            });
            console.log($scope.currentUserVideos);

            var usersinfo = db.collection("Users").doc(user.email);

            usersinfo.get().then(function (doc) {
                'use strict';

                if (doc.exists) {

                    var userEmail = doc.data().Email;

                    $scope.currentUserId = userEmail;

                    $scope.currentUserCourse = doc.data().Course;

                    $scope.currentUserName = doc.data().Name;
                    $scope.currentUserphotoURL = doc.data().photoURL;
                    $scope.currentUservideo_upload = doc.data().video_upload;

                    $scope.$apply();

                } else {
                    console.log("No such document!");
                }
            }).catch(function (error) {
                'use strict';
                console.log("Error getting document:", error);
            });
            // User is signed in.
        } else {
            $location.path("/Home"); // No user is signed in.
        }
    });

    }]);
