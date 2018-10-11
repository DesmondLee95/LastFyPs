/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('manageVideos', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/ManageVideos', {
        templateUrl: 'manageVideos/manageVideos.html',
        controller: 'manageVideosCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('manageVideosCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'
    
    var db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });

    // Array of videos to be edited
    $scope.editUserVideos = [];


    $scope.getIndex = function (id) {
        $scope.indexValue = $scope.editUserVideos.findIndex(video => video.id === id);
        console.log($scope.editUserVideos[$scope.indexValue].folder);
    };

    // signout
    $scope.signout = function () {
        firebase.auth().signOut();
        $location.path("/Home");
    };


    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {

            // Getting all videos
            db.collection("Videos").get().then(function (querySnapshot) {
                // looping through the query which will contain all the documents
                querySnapshot.forEach(function (doc) {

                    // Checking for the current user and comparing it with the videos user
                    if (doc.data().video_uploader_Email === user.email) {

                        // Creating a Json object that will hold the video information of the current user that is logged in
                        $scope.videosJson = {
                            id: doc.id,
                            category: doc.data().video_category,
                            description: doc.data().video_desc,
                            link: doc.data().video_link,
                            video_name: doc.data().video_name,
                            uploader_Email: doc.data().video_uploader_Email,
                            uploader_Name: doc.data().video_uploader,
                            visibility: doc.data().video_visibility,
                            thumbnail: doc.data().thumbnail_link,
                            folder: doc.data().folder,
                            thumbnailFile: doc.data().thumbnailName,
                            videoFile: doc.data().fileName
                        };

                        // Pushing the json data one by one into the array of videos to be edited
                        $scope.editUserVideos.push($scope.videosJson);
                        console.log($scope.videosJson);
                    }
                });

            });

            var usersinfo = db.collection("Users").doc(user.email); //@TODO

            usersinfo.get().then(function (doc) {
                'use strict';

                if (doc.exists) {

                    var userEmail = doc.data().Email;

                    var splitEmail = userEmail.split("@");

                    $scope.currentUserId = splitEmail[0];

                    $scope.currentUserCourse = doc.data().Course;


                    $scope.currentUserName = doc.data().Name;
                    $scope.currentUserphotoURL = doc.data().photoURL;
                    $scope.currentUservideo_upload = doc.data().video_upload;


                    $scope.$apply();
                    console.log($scope.currentUserName);

                } else {
                    console.log("No such document!");
                }
            }).catch(function (error) {
                'use strict';
                console.log("Error getting document:", error);
            });
            // User is signed in.
        } else {
            // No user is signed in.
        }
    });



    $scope.saveVideo = function () {


        var r = confirm("Save Changes?");
        if (r == true) {

            if ($scope.editUserVideos[$scope.indexValue].video_name === "") {
                toaster.pop({
                    type: 'warning',
                    title: "Name Empty",
                    body: "Name Cannot be empty"
                });
            } else if ($scope.editUserVideos[$scope.indexValue].description === "") {
                toaster.pop({
                    type: 'warning',
                    title: "Description Empty",
                    body: "Please fill in the description"
                });
            } else {


                db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).update({
                    video_name: $scope.editUserVideos[$scope.indexValue].video_name
                });
                db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).update({
                    video_desc: $scope.editUserVideos[$scope.indexValue].description
                });
                db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).update({
                    video_visibility: $scope.editUserVideos[$scope.indexValue].visibility
                });
                db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).update({
                    editing: false
                });
            }
        } else {

        }

    };

    $("#editVideoModal").on("hidden.bs.modal", function () {
        db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).update({
            editing: false
        });
    });
    
    $scope.editing = function () {
        db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).update({
            editing: true
        });
    }

    $scope.reloadJson = function () {
        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {

                // Getting all videos
                db.collection("Videos").get().then(function (querySnapshot) {
                    // looping through the query which will contain all the documents
                    querySnapshot.forEach(function (doc) {
                        // Checking for the current user and comparing it with the videos user
                        if (doc.data().video_uploader_Email === user.email) {

                            // Creating a Json object that will hold the video information of the current user that is logged in
                            $scope.videosJson = {
                                id: doc.id,
                                category: doc.data().video_category,
                                description: doc.data().video_desc,
                                link: doc.data().video_link,
                                video_name: doc.data().video_name,
                                rating: doc.data().video_name,
                                uploader_Email: doc.data().video_uploader_Email,
                                uploader_Name: doc.data().video_uploader,
                                visibility: doc.data().video_visibility,
                                thumbnail: doc.data().thumbnail_link,
                                folder: doc.data().folder,
                                thumbnailFile: doc.data().thumbnailName,
                                videoFile: doc.data().fileName
                            };

                            // Pushing the json data one by one into the array of videos to be edited
                            $scope.editUserVideos.push($scope.videosJson);
                            console.log($scope.editUserVideos);
                        }
                    });

                });
                var usersinfo = db.collection("Users").doc(user.email); //@TODO

                usersinfo.get().then(function (doc) {
                    'use strict';

                    if (doc.exists) {

                        var userEmail = doc.data().Email;

                        var splitEmail = userEmail.split("@");

                        $scope.currentUserId = splitEmail[0];

                        $scope.currentUserCourse = doc.data().Course;


                        $scope.currentUserName = doc.data().Name;
                        $scope.currentUserphotoURL = doc.data().photoURL;
                        $scope.currentUservideo_upload = doc.data().video_upload;


                        $scope.$apply();
                        console.log($scope.currentUserName);

                    } else {
                        console.log("No such document!");
                    }
                }).catch(function (error) {
                    'use strict';
                    console.log("Error getting document:", error);
                });
                // User is signed in.
            } else {
                // No user is signed in.
                $location.path("/login");
            }
        });
    }

    // FIREBASE STORAGE VARIABLE -----------------------------------------------------------------------------------------------------------------

    var storageRef = firebase.storage().ref();

    $scope.deleteVideo = function () {

        var r = confirm("Are you sure you want to delete this video?");

        if (r == true) {

            var deleteVideo = storageRef.child("userVideos/" + firebase.auth().currentUser.email + "/videos/" + $scope.editUserVideos[$scope.indexValue].folder + "/" + $scope.editUserVideos[$scope.indexValue].videoFile);

            var deleteThumbnail = storageRef.child("userVideos/" + firebase.auth().currentUser.email + "/videos/" + $scope.editUserVideos[$scope.indexValue].folder + "/" + $scope.editUserVideos[$scope.indexValue].thumbnailFile);

            var docRef = db.collection("Users").doc(firebase.auth().currentUser.email);


            // Delete from storage & Database

            deleteVideo.delete().then(function (event) {
                console.log("SUCCESS");

            }).catch(function (error) {
                console.log(error);
            });

            deleteThumbnail.delete().then(function (event) {
                console.log("SUCCESS");

            }).catch(function (error) {
                console.log(error);
            });


            docRef.get().then(function (doc) {
                if (doc.exists) {
                    db.collection("Videos").doc($scope.editUserVideos[$scope.indexValue].id).delete().then(function () {
                        var uploadCount = doc.data().video_upload - 1;

                        db.collection("Users").doc(firebase.auth().currentUser.email).update({
                            video_upload: uploadCount
                        });

                        $scope.editUserVideos = [];

                        $scope.reloadJson();
                    }).catch(function (error) {
                        alert(error);
                    });


                } else {
                    console.log("No such document!");
                }
            });


        }



    }

            }]);
