/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('upload', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/Upload', {
        templateUrl: 'upload/upload.html',
        controller: 'uploadCtrl'
    })
}]);

app.factory("Auth", ["$firebaseAuth",
  function ($firebaseAuth) {
        return $firebaseAuth();
  }
]);

app.controller('uploadCtrl', ['$scope', 'Auth', '$location', 'toaster', function ($scope, Auth, $location, toaster) {

    //Initialize firestore
    var db = firebase.firestore();

    // Disable deprecated features for Firestore
    db.settings({
        timestampsInSnapshots: true
    });

    var uploadBtn = document.getElementById('uploadButton');
    var checkTOU = document.getElementById('termsofuse');

    checkTOU.onchange = function () {
        if (this.checked) {
            uploadBtn.disabled = false;
        } else {
            uploadBtn.disabled = true;
        }
    }
    
    // VIDEO
    var selectedFile;
    var selectedFileSize;
    var progressBar = document.getElementById('upload_progress');
    var filename = document.getElementById("upload_text");
    var fileExtValidate = /(.*?)\.(avi|AVI|wmv|WMV|flv|FLV|mpg|MPG|mp4|MP4|mkv|MKV|mov|MOV|3gp|3GP|webm|WEBM)$/;

    firebase.auth().onAuthStateChanged(function (user) {

        if (!user) {
            $location.path("/login");
        }
    });

    document.getElementById("file").addEventListener('change', function (e) {
        'use strict';
        selectedFile = e.target.files[0];
        //Validate chosen file type
        if (fileExtValidate.test(selectedFile.name)) {
            //Validate chosen file size
            selectedFileSize = selectedFile.size / 1024 / 1024;
            if (selectedFileSize > 40) {
                alert("Chosen file exceeds 40MB!");
                selectedFile.value = null;
                document.getElementById("upload_text").innerHTML = "Choose a file to upload";
                document.getElementById("upload_text").style.color = "#808080";
                document.getElementById("upload_text").style.fontSize = "15px";
            } else {
                document.getElementById("upload_text").innerHTML = selectedFile.name;
                document.getElementById("upload_text").style.color = "#000000";
                document.getElementById("upload_text").style.fontSize = "18px";
            }
        } else {
            alert("Invalid file type!");
            selectedFile.value = null;
            document.getElementById("upload_text").innerHTML = "Choose a file to upload";
            document.getElementById("upload_text").style.color = "#808080";
            document.getElementById("upload_text").style.fontSize = "15px";
        }
    });

    // THUMBNAIL
    var selectedThumbnail;
    var selectedThumbnailSize;
    var thumbnailName = document.getElementById("thumbnail_text");
    var fileExtValidateThumbnail = /(.*?)\.(jpeg|jpg|png)$/;


    document.getElementById("pic").addEventListener('change', function (e) {
        'use strict';
        selectedThumbnail = e.target.files[0];
        //Validate chosen file type
        if (fileExtValidateThumbnail.test(selectedThumbnail.name)) {
            //Validate chosen file size
            selectedThumbnailSize = selectedThumbnail.size / 1024 / 1024;
            if (selectedThumbnailSize > 1) {
                alert("Chosen file exceeds 1MB!");
                selectedFile.value = null;
                document.getElementById("thumbnail_text").innerHTML = "Choose a file to upload";
                document.getElementById("thumbnail_text").style.color = "#808080";
                document.getElementById("thumbnail_text").style.fontSize = "15px";
            } else {
                document.getElementById("thumbnail_text").innerHTML = selectedThumbnail.name;
                document.getElementById("thumbnail_text").style.color = "#000000";
                document.getElementById("thumbnail_text").style.fontSize = "18px";
            }
        } else {
            alert("Invalid file type!");
            selectedFile.value = null;
            document.getElementById("thumbnail_text").innerHTML = "Choose a file to upload";
            document.getElementById("thumbnail_text").style.color = "#808080";
            document.getElementById("thumbnail_text").style.fontSize = "15px";
        }
    });

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    $scope.randomFolder = guid();

    $scope.uploadFile = function () {
        'use strict';

        var video_name = document.getElementById('video_name').value,
            video_tag = document.getElementById('video_tag').value,
            video_category = document.getElementById('category').value,
            visibility = document.getElementById('visibility').value,
            video_desc = document.getElementById('video_desc').value,
            filename = selectedFile.name,
            thumbnailFileName = selectedThumbnail.name,
            storageRef = firebase.storage().ref('userVideos/' + firebase.auth().currentUser.email + '/videos/' + $scope.randomFolder + "/" + filename),
            storageRefThumbnail = firebase.storage().ref('userVideos/' + firebase.auth().currentUser.email + '/videos/' + $scope.randomFolder + "/" + thumbnailFileName),
            upload = storageRef.put(selectedFile),
            uploadThumbnail = storageRefThumbnail.put(selectedThumbnail);

        console.log(visibility);

        //Video information validation
        if (video_name === "" || video_tag === "" || video_category === "" || video_desc === "" || selectedFile === null || selectedFile === "") {
            alert("Please fill in all details for your video file.");
        } else {
            //Validate video name length
            if (video_name.length > 32) {
                alert("Video name is too long.");
                return;
            } else {
                if (video_tag.length > 32) {
                    alert("Tag is too long.");
                    return;
                }
            }
            upload.on('state_changed',
                function progress(snapshot) {
                    document.getElementById('uploadButton').disabled = true;
                    var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    progressBar.value = percentage;
                    switch (snapshot.state) {
                        case firebase.storage.TaskState.PAUSED:
                            //Upload is paused
                            break;
                        case firebase.storage.TaskState.RUNNING:
                            //Upload is running
                            break;
                    }
                },
                function (error) {
                    switch (error.code) {
                        case 'storage/unauthorized':
                            alert("Upload has failed! An error has happened.");
                            // User doesn't have permission to access the object
                            break;
                        case 'storage/canceled':
                            alert("Upload has been canceled.");
                            // User canceled the upload
                            break;
                        case 'storage/unknown':
                            alert("Upload has failed! An error has happened.");
                            // Unknown error occurred, inspect error.serverResponse
                            break;
                    }
                },
                function complete() {
                    document.getElementById('uploadButton').disabled = false;
                    // THUMBNAIL
                    uploadThumbnail.snapshot.ref.getDownloadURL().then(
                        function (downloadURL) {
                            firebase.auth().onAuthStateChanged(function (user) {

                                $scope.thumbnailURL = downloadURL;
                                $scope.$apply();

                                console.log($scope.thumbnailURL);
                            });
                        }
                    );

                    //VIDEO
                    upload.snapshot.ref.getDownloadURL().then(
                        function (downloadURL) {
                            firebase.auth().onAuthStateChanged(function (user) {

                                $scope.userEmail = user.email;

                                console.log($scope.userEmail);
                                if (user) {
                                    //Get logged-in username to store with the uploaded video
                                    var docRef = db.collection("Users").doc(user.email);
                                    //Write video information into Firestore when video is uploaded to Storage.
                                    docRef.get().then(function (doc) {
                                        if (doc.exists) {
                                            var user;
                                            user = doc.data().Name;
                                            db.collection("Videos").add({
                                                    video_link: downloadURL,
                                                    video_uploader: user,
                                                    video_uploader_Email: $scope.userEmail,
                                                    video_category: video_category,
                                                    video_tags: video_tag,
                                                    video_desc: video_desc,
                                                    date_uploaded: new Date(),
                                                    video_visibility: visibility,
                                                    block_status: false,
                                                    video_view: 0,
                                                    video_name: video_name,
                                                    thumbnail_link: $scope.thumbnailURL,
                                                    editing: false,
                                                    folder: $scope.randomFolder,
                                                    thumbnailName: thumbnailFileName,
                                                    fileName: filename
                                                })
                                                .then(function () {
                                                    //Clear form when video is successfully updated
                                                    console.log("Document successfully written!");

                                                    alert("Upload is successfully!");

                                                    var uploadCount = doc.data().video_upload + 1;

                                                    db.collection("Users").doc($scope.userEmail).update({
                                                        video_upload: uploadCount
                                                    });

                                                    //                                                    progressBar.value = "";
                                                    //                                                    selectedFile.value = null;
                                                    //                                                    document.getElementById("upload_text").innerHTML = "Choose a file to upload";
                                                    //                                                    document.getElementById("upload_text").style.color = "#808080";
                                                    //                                                    document.getElementById("upload_text").style.fontSize = "15px";
                                                    //                                                    document.getElementById('video_name').value = "";
                                                    //                                                    document.getElementById('video_tag').value = "";
                                                    //                                                    document.getElementById('category').value = "";
                                                    //                                                    document.getElementById('video_desc').value = "";

                                                    $location.path("/userpage");
                                                    $scope.$apply();

                                                })
                                                .catch(function (error) {
                                                    console.error("Error writing document: ", error);
                                                    alert(error);
                                                });

                                        } else {
                                            console.log("No such document!");
                                        }
                                    });
                                } else {
                                    alert("Please sign-in first!");
                                    window.location = "index.html";
                                }
                            });
                        }
                    );
                });
        }
    }
            }]);
