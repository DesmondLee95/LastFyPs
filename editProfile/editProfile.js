var app = angular.module('editProfile', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/EditProfile', {
        templateUrl: 'editProfile/editProfile.html',
        controller: 'editProfileCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('editProfileCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'


    var db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });

    Auth.$onAuthStateChanged(function (user) {

        if (user) {
            $scope.userId = user.uid;
            $scope.userEmail = user.email;

            var usersinfo = db.collection("Users").doc(user.email); //@TODO




            usersinfo.get().then(function (doc) {
                'use strict';

                if (doc.exists) {


                    $scope.EditName = doc.data().Name;
                    $scope.EditCourse = doc.data().Course;
                    $scope.$apply();

                } else {
                    console.log("No such document!");
                }
            }).catch(function (error) {
                'use strict';
                console.log("Error getting document:", error);
            });
        } else {
            $location.path("/login");
        }



    });

    $scope.editSubmit = function () {

        if ($scope.EditCourse === "") {
            toaster.pop({
                type: 'danger',
                title: "Error",
                body: "Please enter your course"
            });
            return;
        }

        if ($scope.EditName === "") {
            toaster.pop({
                type: 'danger',
                title: "Error",
                body: "Please enter your name"
            });
            return;
        }

        var usersinfo = db.collection("Users").doc($scope.userEmail);

        db.collection("Users").doc($scope.userEmail).update({
            Course: $scope.EditCourse
        });
        db.collection("Users").doc($scope.userEmail).update({
            Name: $scope.EditName
        });
        toaster.pop({
            type: 'success',
            title: "Success",
            body: "Profile Edited"
        });
        $location.path("/userpage");

    }


            }]);
