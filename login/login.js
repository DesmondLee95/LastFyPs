/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('login', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/login', {
        templateUrl: 'login/login.html',
        controller: 'loginCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('loginCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'
    
    Auth.$onAuthStateChanged(function (user) {
        //Check if user is verified before allowing login
        if (user) {
            if(user.emailVerified) {
                // User is signed in.
                $scope.loggedIn = user.uid;
//                $location.path("/Home");
            } else {
                //User not signed in.
                toaster.pop({type: 'danger', title: "Verification Required", body: "Please verify your email"});
                return;
            }
            
        } else if (!user) {
            $scope.loggedIn = null;
        }
        
        $scope.$apply();
                
    });
    
    $scope.$watch("loggedIn", function(event) {
        if($scope.loggedIn == null) {
            console.log("NULL: " + event); 
        } else {
            console.log("Value: " + event); 
        }
       
    });

    // Function for loggin in
    $scope.login = function (loginEmail, loginPassword) {

        Auth.$signInWithEmailAndPassword(loginEmail, loginPassword)
            .then(function (user) {
            
            $scope.loggedInUserEmail = user.email;
            $scope.loggedIn = user.uid;
            $location.path("/Home");
            

            })
    }
    
      // signout
    $scope.signout = function () {
        firebase.auth().signOut();
        $location.path("/Home");
        location.reload();
    };

    // Function for resetting password
    $scope.resetPass = function () {
        var auth = firebase.auth(),
            emailAddress = document.getElementById("user_mail").value;

        auth.sendPasswordResetEmail(emailAddress).then(function () {
            // Email sent.
            alert("A reset password email has been sent to your email");
            window.location = "login.html";
        }).catch(function (error) {
            // An error happened.
            console.log("Email has not been sent.");
            alert("This email address does not exist.");
            document.getElementById('user_mail').value = "";
            document.getElementById('user_mail').focus();
        });
    }

            }]);
