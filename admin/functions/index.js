const functions = require('firebase-functions');

// Imports the Google Cloud client library
const {
    Storage
} = require('@google-cloud/storage');

// Your Google Cloud Platform project ID
const projectId = 'educational-video-learning-app';

// Creates a client
const storage = new Storage({
    projectId: projectId,
});

// The name for the new bucket
const bucketName = 'educational-video-learning-app.appspot.com';

const bucket = storage.bucket(bucketName);

var admin = require("firebase-admin");
var express = require("express");
const cors = require('cors')({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200
});

admin.initializeApp(functions.config().firebase);

exports.getUsers = functions.https.onRequest((req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        var users = [];
        admin.auth().listUsers(1000)
            .then(function (listUsersResult) {
                listUsersResult.users.forEach(function (userRecord) {
                    users.push(userRecord);
                });
                res.send(users);
            })
            .catch(function (error) {
                console.log("Error listing users:", error);
            });
    }
});

exports.enableUser = functions.https.onRequest((req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        var uid;
        var email = req.body.email;

        admin.auth().getUserByEmail(email)
            .then(function (userRecord) {
                var id = userRecord.uid;
                uid = id;
                admin.auth().updateUser(uid, {
                        disabled: false
                    })
                    .then(function (userRecord) {
                        res.send("This user is enabled!");
                    })
                    .catch(function (error) {
                        console.log("Error updating user:", error);
                    });
            })
            .catch(function (error) {
                console.log("Error fetching user data:", error);
            });
    }
});

exports.disableUser = functions.https.onRequest((req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        var uid;
        var email = req.body.email;

        admin.auth().getUserByEmail(email)
            .then(function (userRecord) {
                var id = userRecord.uid;
                uid = id;
                admin.auth().updateUser(uid, {
                        disabled: true
                    })
                    .then(function (userRecord) {
                        res.send("This user is disabled!");
                    })
                    .catch(function (error) {
                        console.log("Error updating user:", error);
                    });
            })
            .catch(function (error) {
                console.log("Error fetching user data:", error);
            });
    }
});

exports.deleteUser = functions.https.onRequest((req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        var email = req.body.email;
        var uid;

        admin.auth().getUserByEmail(email)
            .then(function (userRecord) {
                var id = userRecord.uid;
                uid = id;
                admin.auth().deleteUser(uid)
                    .then(function () {
                        res.send("User with id " + email + " deleted");
                    })
                    .catch(function (error) {
                        console.log("Error deleting user:", error);
                        res.send("Error deleting user: " + error);
                    });
            })
            .catch(function (error) {
                console.log("Error fetching user data:", error);
            });
    }
});

exports.deleteStorage = functions.https.onRequest((req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        var email = req.body.email;

        bucket.deleteFiles({
            prefix: 'userVideos/' + email + '/'
        }, function (err) {
            if (!err) {}
        });
        res.send("Delete is successful");
    }
})
