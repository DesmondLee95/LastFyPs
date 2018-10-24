/*jslint devel: true*/
/*eslint-env browser*/
var app = angular.module('registration', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/Registration', {
        templateUrl: 'registration/registration.html',
        controller: 'registrationCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);


app.controller('registrationCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {
    'use strict'

    'use strict';

    var reg = document.getElementById('registration');

    if (reg) {
        reg.addEventListener('submit', submitForm)
    }

    function submitForm(e) {
        e.preventDefault();

        var umail = document.getElementById("usermail").value,
            upass = document.getElementById("userpass").value,
            cupass = document.getElementById("cuserpass").value,
            uname = document.getElementById("username").value,

            //Password Complexity Regex
            hasUpperCase = /[A-Z]/.test(upass),
            hasLowerCase = /[a-z]/.test(upass),
            hasNumbers = /\d/.test(upass),
            hasNonalphas = /\W/.test(upass);

        //Form verification before submission
        if (umail == "" || upass == "" || cupass == "" || uname == "") {
            alert("Please fill in all your details.");
            return false;
        } else if (upass != cupass) {
            alert("Password does not match.");
            return false;
        } else if (upass.length < 6 || hasUpperCase + hasLowerCase + hasNumbers + hasNonalphas < 3) {
            
            alert("Password is too weak, please include a mix of upper and lowercase letters, numbers and no symbols.");
            return false;
        } else {
            //Email validation
            var regex = /^[^a-z]{4,11}[0-9]+\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/,
                regex2 = /^[^0-9]{1,10}[a-z]+\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/;

            if (regex.test(umail)) {
                //Email validation for student emails
                if (umail.indexOf('@students.swinburne.edu.my', umail.length - '@students.swinburne.edu.my'.length) !== -1) {
                    firebase.auth()
                        .createUserWithEmailAndPassword(umail, upass)
                        .then(function (user) {
                            db.collection("Users").doc(umail).set({
                                    Name: uname,
                                    Email: umail,
                                    Course: "",
                                    video_upload: 0,
                                userType: "Student"
                                })
                                .then(function () {
                                    console.log("Document successfully written!");
                                })
                                .catch(function (error) {
                                    console.error("Error writing document: ", error);
                                });
                            firebase.auth().onAuthStateChanged(function (user) {
                                if (user.emailVerified) {
                                    console.log("Verified");
                                } else {
                                    user.sendEmailVerification().then(function () {
                                        alert("You've successfully signed up, please verify your email to login.");
                                        // Email sent.
                                        document.getElementById('registration').reset();
                                        $location.path("/login")
                                    }).catch(function (error) {
                                        // An error happened.
                                    });
                                }
                            });
                        }).catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;

                            alert(errorMessage);
                        });
                } else {
                    alert('Email must be a valid Swinburne Sarawak Email.');
                    document.getElementById('username').value = "";
                    document.getElementById('usermail').value = "";
                    document.getElementById('userpass').value = "";
                    document.getElementById('cuserpass').value = "";
                    document.getElementById('usermail').focus();
                }
            } else if (regex2.test(umail)) {
                //Email validation for staff emails
                if (umail.indexOf('@swinburne.edu.my', umail.length - '@swinburne.edu.my'.length) !== -1) {
                    firebase.auth()
                        .createUserWithEmailAndPassword(umail, upass)
                        .then(function (user) {
                            db.collection("Users").doc(umail).set({
                                    Name: "",
                                    Email: umail,
                                    Course: "",
                                    video_upload: 0,
                                    userType: "Staff"
                                })
                                .then(function () {
                                    console.log("Document successfully written!");
                                })
                                .catch(function (error) {
                                    console.error("Error writing document: ", error);
                                });
                            firebase.auth().onAuthStateChanged(function (user) {
                                if (user.emailVerified) {
                                    console.log("Verified");
                                } else {
                                    user.sendEmailVerification().then(function () {
                                        alert("You've successfully signed up, please verify your Email to login.");
                                        // Email sent.
                                        document.getElementById('registration').reset();
                                        window.location = 'login.html';
                                    }).catch(function (error) {
                                        // An error happened.
                                    });
                                }
                            });
                        }).catch(function (error) {
                            // Handle Errors here.
                            var errorCode = error.code;
                            var errorMessage = error.message;

                            alert(errorMessage);
                        });
                } else {
                    alert('Email must be a valid Swinburne Sarawak Email.');
                    document.getElementById('username').value = "";
                    document.getElementById('usermail').value = "";
                    document.getElementById('userpass').value = "";
                    document.getElementById('cuserpass').value = "";
                    document.getElementById('usermail').focus();
                }
            } else {
                alert('Not a valid e-mail address.');
                document.getElementById('username').value = "";
                document.getElementById('usermail').value = "";
                document.getElementById('userpass').value = "";
                document.getElementById('cuserpass').value = "";
                document.getElementById('usermail').focus();
            }
        }
    }


            }]);
