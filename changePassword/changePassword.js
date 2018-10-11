var app = angular.module('changePassword', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/ChangePassword', {
        templateUrl: 'changePassword/changePassword.html',
        controller: 'changePasswordCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('changePasswordCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'



    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {
            $scope.changePasswordUser = user.email;
            $scope.$apply();
        } else {
            $location.path("/login");
        }

    });

    $scope.changePassword = function () {

        if ($scope.newPassword !== $scope.newPasswordrepeat) {
            toaster.pop({
                type: 'danger',
                title: "Error",
                body: "Passwords don't match"
            });
            return;
        }

        if ($scope.newPassword === undefined) {
            toaster.pop({
                type: 'danger',
                title: "Error",
                body: "Please enter a new password"
            });
            return;
        }

        if ($scope.newPasswordrepeat === undefined) {
            toaster.pop({
                type: 'danger',
                title: "Error",
                body: "Please reenter your password"
            });
            console.log("3");

            return;
        }

        if ($scope.currentPass === undefined) {
            toaster.pop({
                type: 'danger',
                title: "Error",
                body: "Please enter your current password"
            });
            return;
        }

        var userData = firebase.auth.EmailAuthProvider.credential($scope.changePasswordUser, $scope.currentPass);

        firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(userData)
            .then(function () {
                Auth.$updatePassword($scope.newPassword)
                    .then(function () {
                        $scope.currentPass = "";
                        $scope.newPassword = "";
                        $scope.newPasswordrepeat = "";
                        toaster.pop({
                            type: 'success',
                            title: "Success",
                            body: "Password Changed"
                        });
                        $location.path("/userpage")
                    });
            })
            // Any error will log an error
            .catch(function (error) {
                toaster.pop({
                    type: 'danger',
                    title: "Error",
                    body: error
                });
                $scope.$apply();
            });

    }


            }]);
