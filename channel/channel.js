/*jslint devel: true*/
/*eslint-env browser*/

var app = angular.module('channel', ['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/channel', {
        templateUrl: 'channel/channel.html',
        controller: 'channelCtrl'
    })
}]);

app.controller('channelCtrl', ['$scope', '$location', '$sce', 'videoService', 'channelService', function ($scope, $location, $sce, videoService, channelService) {
    'use strict'

    //    if (firebase.auth().currentUser === null) {
    //        $location.path("/login");
    //    }
    var db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });


    $scope.userChannelVideos = [];

    $scope.trustSrc = function (src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.getInfo = function (userEmail) {
        $location.path("/channel");
        channelService.channelId = userEmail;
        sessionStorage.setItem("selectedVidchannelId", channelService.channelId);
    }

    $scope.getIndex = function (id) {
        $scope.indexValue = $scope.userChannelVideos.findIndex(video => video.id === id);
        $scope.videoId = id;
        console.log(id);
        videoService.videoId = $scope.videoId;
        sessionStorage.setItem("selectedVidId", videoService.videoId);
    };

    $scope.channelEmail = sessionStorage.getItem("selectedVidchannelId");

    db.collection("Videos").get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            if (doc.data().video_uploader_Email === $scope.channelEmail && doc.data().block_status == false) {
                // Creating a Json object that will hold the video information of the current user that is logged in
                $scope.videosJson = {
                    id: doc.id,
                    category: doc.data().video_category,
                    description: doc.data().video_desc,
                    link: doc.data().video_link,
                    thumbnailLink: doc.data().thumbnail_link,
                    video_name: doc.data().video_name,
                    uploader_Email: doc.data().video_uploader_Email,
                    uploader_Name: doc.data().video_uploader,
                    visibility: doc.data().video_visibility,
                    views: doc.data().video_view,
                };


                // Pushing the json data one by one into the array of videos to be edited
                $scope.userChannelVideos.push($scope.videosJson);

                }
            // doc.data() is never undefined for query doc snapshots
            //                    console.log(doc.id, " => ", doc.data());
            
        });

        var usersinfo = db.collection("Users").doc($scope.channelEmail);

        usersinfo.get().then(function (doc) {
            'use strict';

            if (doc.exists) {

                var userEmail = doc.data().Email;

                var splitEmail = userEmail.split("@");

                $scope.currentUserId = splitEmail[0];

                $scope.currentUserCourse = doc.data().Course;

                $scope.currentUserName = doc.data().Name;
                $scope.currentUserphotoURL = doc.data().photoURL;
                $scope.currentUservideo_upload = doc.data().video_upload;

                $scope.$apply();
                console.log($scope.currentUserName);

            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            'use strict';
            console.log("Error getting document:", error);
        });



        for (var i = 0; i < $scope.userChannelVideos.length; i++) {
            console.log($scope.userChannelVideos[i].uploader_Name);
            $scope.userName = $scope.userChannelVideos[i].uploader_Name;
            $scope.$apply();
            break;
        }




    });


}]);
