/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define */
/*global angular */
// DEFINING ANGULAR MODULE ngCookies
/*jshint sub:true*/
var app = angular.module('swinApp', ['ngRoute', 'home', 'login', 'userpage', 'editProfile', 'changePassword', 'registration', 'upload', 'manageVideos', 'video', 'resetPassword', 'firebase', 'toaster', 'ngAvatar']);
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

app.service("videoService", function() {
  return {
      videoId: ""
  }
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

app.controller('swinCtrl', ['$scope', 'Auth', '$location', function ($scope, Auth, $location) {
    
   


}]);
