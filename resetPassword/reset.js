/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('resetPassword', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/ResetPassword', {
        templateUrl: 'resetPassword/reset.html',
        controller: 'resetCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('resetCtrl', ['$scope', 'Auth', '$location', 'toaster', '$window', function ($scope, Auth, $location, toaster, $window) {
    'use strict'

    $scope.resetPass = function () {
        'use strict';

        var auth = firebase.auth(),
            emailAddress = document.getElementById("user_mail").value;

        auth.sendPasswordResetEmail(emailAddress)
            .then(function () {
                // Email sent.
                alert("A reset password email has been sent to your email");
                $window.location.assign("/");
            }).catch(function (error) {
                // An error happened.
                console.log("Email has not been sent.");
                alert("An error has happened! Please try again");
                document.getElementById('user_mail').value = "";
                document.getElementById('user_mail').focus();
            });
    };
            }]);
