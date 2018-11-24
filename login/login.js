/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('login', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/login', {
        templateUrl: 'login/login.html'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);

app.controller('loginCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'

    var messaging = firebase.messaging();
    var user = firebase.auth().currentUser;

    Auth.$onAuthStateChanged(function (user) {
        //Check if user is verified before allowing login
        if (user) {
            if (user.emailVerified) {
                // User is signed in.
                $scope.loggedIn = user.uid;
                //                $location.path("/Home");
            } else {
                firebase.auth().signOut();
                toaster.pop({
                    type: 'danger',
                    title: "Verification Required",
                    body: "Please verify your email"
                });
                return;
            }

        } else if (!user) {
            $scope.loggedIn = null;
        }

        $scope.$apply();

    });

    $scope.$watch("loggedIn", function (event) {
        if ($scope.loggedIn == null) {
            console.log("NULL: " + event);
        } else {
            console.log("Value: " + event);
        }
    });

    $scope.login = function (loginEmail, loginPassword) {

        if ((loginEmail.indexOf('@students.swinburne.edu.my', loginEmail.length - '@students.swinburne.edu.my'.length) !== -1) || (loginEmail.indexOf('@swinburne.edu.my', loginEmail.length - '@swinburne.edu.my'.length) !== -1)) {
            Auth.$signInWithEmailAndPassword(loginEmail, loginPassword)
                .then(function (user) {
                    firebase.auth().onAuthStateChanged(function (user) {
                        if (user.emailVerified) {
                            $scope.loggedInUserEmail = user.email;
                            $scope.loggedIn = user.uid;
                            $location.path("/Home");
                        } else {
                            alert("Your email is not verified!");
                        }
                    })
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
            firebase.auth().signOut();
            alert("You've entered an invalid email.");
        }

    }

    // signout
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
                                    if (doc.data().userEmail == user.email) {
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
