/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('adminLogin', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/adminLogin', {
        templateUrl: 'adminLogin/adminLogin.html',
        controller: 'adminLoginCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('adminLoginCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'

    // Function for loggin in
    $scope.login = function (loginEmail, loginPassword) {

        if (loginEmail == "100074597@students.swinburne.edu.my") {
            Auth.$signInWithEmailAndPassword(loginEmail, loginPassword)
                .then(function (user) {
                    $location.path("/Admin");
                })
                .catch(function (error) {
                    if (error.code === 'auth/invalid-email') {
                        alert("You've entered an invalid email.");
                    } else if (error.code === 'auth/user-disabled') {
                        alert("This account has been disabled by the administrator.");
                    } else if (error.code === 'auth/user-not-found') {
                        alert("This email does not exist.");
                    } else {
                        alert("You've entered the wrong password.");
                    }
                })
        } else {
            alert("This is not an admin account!");
            document.getElementById("email_field").value = "";
            document.getElementById("password_field").value = "";
            return;
        }
    }

    // signout
    $scope.signout = function () {
        firebase.auth().signOut();
        $location.path("/login");
        location.reload();
    };
            }]);
