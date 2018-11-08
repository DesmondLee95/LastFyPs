/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
/*global angular */
// DEFINING ANGULAR MODULE ngCookies
/*jshint sub:true*/
var app = angular.module('swinApp', ['ngRoute', 'home', 'login', 'adminLogin', 'userpage', 'editProfile', 'changePassword', 'registration', 'upload', 'manageVideos', 'video', 'resetPassword', 'admin', 'firebase', 'toaster', 'ngAvatar']);

var config = {
    apiKey: "AIzaSyBM0e_dkZOgrC5v5kk1t1loGAj1GiFntyA",
    authDomain: "educational-video-learning-app.firebaseapp.com",
    databaseURL: "https://educational-video-learning-app.firebaseio.com",
    projectId: "educational-video-learning-app",
    storageBucket: "educational-video-learning-app.appspot.com",
    messagingSenderId: "1079981333838"
};

firebase.initializeApp(config);

var db = firebase.firestore();

db.settings({
    timestampsInSnapshots: true
});

app.service("videoService", function () {
    return {
        videoId: ""
    };
});

// Header file
app.directive('headerFile', function () {
    return {
        restrict: 'E',
        templateUrl: 'header/header.html'
    };
});

app.directive('homeheaderFile', function () {
    return {
        restrict: 'E',
        templateUrl: 'header/homeheader.html'
    };
});

app.directive('headerwithprofileFile', function () {
    return {
        restrict: 'E',
        templateUrl: 'header/headerWithProfile.html'
    };
});

app.directive('headeradminFile', function () {
    return {
        restrict: 'E',
        templateUrl: 'header/headerAdmin.html'
    };
});

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.otherwise({
        redirectTo: '/Home'
    });
}]);

// Factory for Auth
app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);

app.controller('swinCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {

    // Retrieve Firebase Messaging object.
    var messaging = firebase.messaging();
    // Add the public key generated from the console here.
    messaging.usePublicVapidKey("BEJMn5qymmZ8NSvmT65TGmOI3kBMXAOp--pphrLUz-Q-8PkGOxKT21IGj0JwT5b5eu2v6_fuFdRy5XzlQRBLUhc");

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            messaging.requestPermission()
                .then(function () {
                    console.log('Notification permission granted.');
                    return messaging.getToken();
                }).then(function (token) {
                    db.collection("Tokens").add({
                        userEmail: user.email,
                        tokenId: token
                    });
                }).catch(function (err) {
                    console.log('Unable to get permission to notify.', err);
                });

            // Callback fired if Instance ID token is updated.
            messaging.onTokenRefresh(function () {
                messaging.getToken()
                    .then(function (refreshedToken) {
                        db.collection("Tokens").add({
                            userEmail: user.email,
                            tokenId: refreshedToken
                        });
                    }).catch(function (err) {
                        console.log('Unable to retrieve refreshed token ', err);
                    });
            });
        } else {
            console.log("No user is logged in");
        }
    });

    messaging.onMessage(function (payload) {

        toaster.pop({
            type: 'danger',
            title: payload.data.title,
            body: payload.data.body
        });
        
        $scope.$apply();
        
        console.log(payload);
    });

            }]);
