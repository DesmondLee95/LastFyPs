/*jslint devel: true*/
/*eslint-env browser*/


var app = angular.module('home', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/Home', {
        templateUrl: 'home/home.html',
        controller: 'homeCtrl'
    });
}]);

app.controller('homeCtrl', ['$scope', '$location', 'videoService', function ($scope, $location, videoService) {
    'use strict';

    var db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });

    $scope.$watch("name", function (event) {
        console.log(event);
    });

    // All videos go here

    $scope.publicVideos = [];

    // Videos By Category go here

    $scope.business = [];
    $scope.design = [];
    $scope.engineering = [];
    $scope.science = [];
    $scope.computing = [];
    $scope.englishLanguage = [];
    $scope.postgraduateCoursework = [];
    $scope.postgraduateResearch = [];
    $scope.shortCourses = [];
    $scope.others = [];

    // START

    // Getting video Index On click and other information
    $scope.getIndex = function (id) {
        $scope.indexValue = $scope.publicVideos.findIndex(video => video.id === id);
        $scope.videoId = id;
        videoService.videoId = $scope.videoId;
        sessionStorage.setItem("selectedVidId", videoService.videoId);
    };

    // GETTING VIDEOS START ---------------------------------------------------------------------------------------------------

    // Getting All Public Videos which are not being edited
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.publicVideos = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false) {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.publicVideos.push(videoJson);
            }
        });

        console.log($scope.publicVideos);
        paginationFunc();
        $scope.$apply();
    });

    $scope.currentPage = 1, $scope.numPerPage = 4, $scope.showMoreClicked = false, $scope.reverseSort = true, $scope.orderByField = 'timestamp'
    $scope.$watch("name", function (newVal, oldVal) {
        for (var i = 0; i < $scope.publicVideos.length; i++) {
            $scope.publicVideos[i].filtered = $scope.publicVideos[i].data.video_name.toUpperCase().indexOf(newVal.toUpperCase()) === -1;
            paginationFunc();
        }
    });
    $scope.$watch("publicVideos.length", paginationFunc);
    $scope.$watch("currentPage + numPerPage", paginationFunc);
    $scope.selectedPage = function (index) {
        $scope.currentPage = index;
    }

    $scope.changeNumPerPage = function (index) {
        $scope.numPerPage = index * 100;
        $scope.showMoreClicked = true;
        console.log($scope.reverseSort);
    }

    $scope.showLess = function (index) {
        $scope.numPerPage = index * 4;
        $scope.showMoreClicked = false;
        console.log($scope.reverseSort);
    }

    $scope.changePage = function (sign) {
        var currentPageValue = eval($scope.currentPage + sign + 1);
        if (currentPageValue < 1) currentPageValue = 1;
        if (currentPageValue > $scope.numbers) currentPageValue = $scope.numbers;
        $scope.currentPage = currentPageValue;
    }

    function paginationFunc() {
        var publicVideos = $scope.publicVideos.filter(function (item) {
            return !item.filtered
        });
        $scope.numbers = Math.ceil(publicVideos.length / $scope.numPerPage);
        if ($scope.currentPage < 1) $scope.currentPage = 1;
        if ($scope.currentPage > $scope.numbers) $scope.currentPage = $scope.numbers;
        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
            end = begin + $scope.numPerPage;
        $scope.filteredVideos = publicVideos.slice(begin, end);
    }

    // #region Getting Business Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.business = [];
        querySnapshot.forEach(function (doc) {

            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Business") {

                console.log(doc.data());
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }

                $scope.business.push(videoJson);

                $scope.business.sort($scope.orderByDate);
            }

        });

        $scope.$apply();
    });

    $scope.currentBusinessPage = 1, $scope.numberofBusinessPerPage = 4, $scope.showMoreBusinessClicked = false, $scope.reverseSortBusiness = true, $scope.orderByFieldBusiness = 'timestamp'
    $scope.$watch("business.length", businesspaginationFunc);
    $scope.$watch("currentBusinessPage + numberofBusinessPerPage", businesspaginationFunc);

    $scope.showLessBusiness = function (index) {
        $scope.numberofBusinessPerPage = index * 4;
        console.log(index);
        $scope.showMoreBusinessClicked = false;

    }

    $scope.showMoreBusiness = function (index) {
        $scope.numberofBusinessPerPage = index * 100;
        console.log(index);
        $scope.showMoreBusinessClicked = true;
    }

    function businesspaginationFunc() {
        var business = $scope.business.filter(function (item) {
            return !item.filtered
        });
        $scope.bnumbers = Math.ceil(business.length / $scope.numberofBusinessPerPage);
        if ($scope.currentBusinessPage < 1) $scope.currentBusinessPage = 1;
        if ($scope.currentBusinessPage > $scope.bnumbers) $scope.currentBusinessPage = $scope.bnumbers;
        var begin = (($scope.currentBusinessPage - 1) * $scope.numberofBusinessPerPage),
            end = begin + $scope.numberofBusinessPerPage;
        $scope.filteredBusinessVideos = business.slice(begin, end);
    }

    // Getting Design Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.design = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Design") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                
                $scope.design.push(videoJson);
                
                 $scope.design.sort($scope.orderByDate);
            }
        });


        $scope.$apply();

    });

    $scope.currentDesignPage = 1;
    $scope.numberofDesignPerPage = 4;
    $scope.showMoreDesignClicked = false;
    $scope.reverseSortDesign = true,
        $scope.orderByFieldDesign = 'timestamp'
    $scope.$watch("design.length", designpaginationFunc);
    $scope.$watch("currentDesignPage + numberofDesignPerPage", designpaginationFunc);

    $scope.showLessDesign = function (index) {
        $scope.numberofDesignPerPage = index * 4;
        console.log(index);
        $scope.showMoreDesignClicked = false;

    }

    $scope.showMoreDesign = function (index) {
        $scope.numberofDesignPerPage = index * 100;
        console.log(index);
        $scope.showMoreDesignClicked = true;
    }

    function designpaginationFunc() {
        var design = $scope.design.filter(function (item) {
            return !item.filtered
        });
        $scope.bnumbers = Math.ceil(design.length / $scope.numberofDesignPerPage);
        if ($scope.currentDesignPage < 1) $scope.currentDesignPage = 1;
        if ($scope.currentDesignPage > $scope.bnumbers) $scope.currentDesignPage = $scope.bnumbers;
        var begin = (($scope.currentDesignPage - 1) * $scope.numberofDesignPerPage),
            end = begin + $scope.numberofDesignPerPage;
        $scope.filteredDesignVideos = design.slice(begin, end);
    }



    // Getting Engineering Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.engineering = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Engineering") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.engineering.push(videoJson);
                
                 $scope.engineering.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentEngineeringPage = 1;
    $scope.numberofEngineeringPerPage = 4;
    $scope.showMoreEngineeringClicked = false;
    $scope.reverseSortEng = true,
        $scope.orderByFieldEng = 'timestamp'
    $scope.$watch("engineering.length", engineeringpaginationFunc);
    $scope.$watch("currentEngineeringPage + numberofEngineeringPerPage", engineeringpaginationFunc);

    $scope.showLessEngineering = function (index) {
        $scope.numberofEngineeringPerPage = index * 4;
        console.log(index);
        $scope.showMoreEngineeringClicked = false;

    }

    $scope.showMoreEngineering = function (index) {
        $scope.numberofEngineeringPerPage = index * 100;
        console.log(index);
        $scope.showMoreEngineeringClicked = true;
    }

    function engineeringpaginationFunc() {
        var engineering = $scope.engineering.filter(function (item) {
            return !item.filtered
        });
        $scope.bnumbers = Math.ceil(engineering.length / $scope.numberofEngineeringPerPage);
        if ($scope.currentEngineeringPage < 1) $scope.currentEngineeringPage = 1;
        if ($scope.currentEngineeringPage > $scope.bnumbers) $scope.currentEngineeringPage = $scope.bnumbers;
        var begin = (($scope.currentEngineeringPage - 1) * $scope.numberofEngineeringPerPage),
            end = begin + $scope.numberofEngineeringPerPage;
        $scope.filteredEngineeringVideos = engineering.slice(begin, end);
    }

    // Getting Science Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.science = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Science") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.science.push(videoJson);
                
                 $scope.science.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentSciencePage = 1;
    $scope.numberofSciencePerPage = 4;
    $scope.showMoreScienceClicked = false;
    $scope.reverseSortSci = true,
        $scope.orderByFieldSci = 'timestamp'
    $scope.$watch("science.length", sciencepaginationFunc);
    $scope.$watch("currentSciencePage + numberofSciencePerPage", sciencepaginationFunc);

    $scope.showLessScience = function (index) {
        $scope.numberofSciencePerPage = index * 4;
        console.log(index);
        $scope.showMoreScienceClicked = false;
    }

    $scope.showMoreScience = function (index) {
        $scope.numberofSciencePerPage = index * 100;
        console.log(index);
        $scope.showMoreScienceClicked = true;
    }

    function sciencepaginationFunc() {
        var science = $scope.science.filter(function (item) {
            return !item.filtered
        });
        $scope.enumbers = Math.ceil(science.length / $scope.numberofSciencePerPage);
        if ($scope.currentSciencePage < 1) $scope.currentSciencePage = 1;
        if ($scope.currentSciencePage > $scope.enumbers) $scope.currentSciencePage = $scope.enumbers;
        var begin = (($scope.currentSciencePage - 1) * $scope.numberofSciencePerPage),
            end = begin + $scope.numberofSciencePerPage;
        $scope.filteredScienceVideos = science.slice(begin, end);
    }

    // Getting Computing Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.computing = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Computing") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.computing.push(videoJson);
                
                 $scope.computing.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentComputingPage = 1;
    $scope.numberofComputingPerPage = 4;
    $scope.showMoreComputingClicked = false;
    $scope.reverseSortComp = true,
        $scope.orderByFieldComp = 'timestamp'
    $scope.$watch("computing.length", computingpaginationFunc);
    $scope.$watch("currentComputingPage + numberofComputingPerPage", computingpaginationFunc);

    $scope.showLessComputing = function (index) {
        $scope.numberofComputingPerPage = index * 4;
        console.log(index);
        $scope.showMoreComputingClicked = false;
    }

    $scope.showMoreComputing = function (index) {
        $scope.numberofComputingPerPage = index * 100;
        console.log(index);
        $scope.showMoreComputingClicked = true;
    }

    function computingpaginationFunc() {
        var computing = $scope.computing.filter(function (item) {
            return !item.filtered
        });
        $scope.cnumbers = Math.ceil(computing.length / $scope.numberofComputingPerPage);
        if ($scope.currentComputingPage < 1) $scope.currentComputingPage = 1;
        if ($scope.currentComputingPage > $scope.cnumbers) $scope.currentComputingPage = $scope.cnumbers;
        var begin = (($scope.currentComputingPage - 1) * $scope.numberofComputingPerPage),
            end = begin + $scope.numberofComputingPerPage;
        $scope.filteredComputingVideos = computing.slice(begin, end);
    }

    // Getting English Language Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.englishLanguage = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "English Language") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.englishLanguage.push(videoJson);
                
                 $scope.englishLanguage.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentEnglishPage = 1;
    $scope.numberofEnglishPerPage = 4;
    $scope.showMoreEnglishClicked = false;
    $scope.reverseSortEnglish = true,
        $scope.orderByFieldEnglish = 'timestamp'
    $scope.$watch("englishLanguage.length", englishpaginationFunc);
    $scope.$watch("currentEnglishPage + numberofEnglishPerPage", englishpaginationFunc);

    $scope.showLessEnglish = function (index) {
        $scope.numberofEnglishPerPage = index * 4;
        console.log(index);
        $scope.showMoreEnglishClicked = false;
    }

    $scope.showMoreEnglish = function (index) {
        $scope.numberofEnglishPerPage = index * 100;
        console.log(index);
        $scope.showMoreEnglishClicked = true;
    }

    function englishpaginationFunc() {
        var english = $scope.englishLanguage.filter(function (item) {
            return !item.filtered
        });
        $scope.enumbers = Math.ceil(english.length / $scope.numberofEnglishPerPage);
        if ($scope.currentEnglishPage < 1) $scope.currentEnglishPage = 1;
        if ($scope.currentEnglishPage > $scope.enumbers) $scope.currentEnglishPage = $scope.enumbers;
        var begin = (($scope.currentEnglishPage - 1) * $scope.numberofEnglishPerPage),
            end = begin + $scope.numberofEnglishPerPage;
        $scope.filteredEnglishVideos = english.slice(begin, end);
    }

    // Getting Post Graduate Coursework Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.postgraduateCoursework = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Postgraduate (Coursework)") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.postgraduateCoursework.push(videoJson);
                
                $scope.postgraduateCoursework.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentPgCoursePage = 1;
    $scope.numberofPgCoursePerPage = 4;
    $scope.showMorePgCourseClicked = false;
    $scope.reverseSortPC = true,
        $scope.orderByFieldPC = 'timestamp'
    $scope.$watch("postgraduateCoursework.length", pgCoursepaginationFunc);
    $scope.$watch("currentPgCoursePage + numberofPgCoursePerPage", pgCoursepaginationFunc);

    $scope.showLessPgCourse = function (index) {
        $scope.numberofPgCoursePerPage = index * 4;
        console.log(index);
        $scope.showMorePgCourseClicked = false;
    }

    $scope.showMorePgCourse = function (index) {
        $scope.numberofPgCoursePerPage = index * 100;
        console.log(index);
        $scope.showMorePgCourseClicked = true;
    }

    function pgCoursepaginationFunc() {
        var pgCourse = $scope.postgraduateCoursework.filter(function (item) {
            return !item.filtered
        });
        $scope.pgcnumbers = Math.ceil(pgCourse.length / $scope.numberofPgCoursePerPage);
        if ($scope.currentPgCoursePage < 1) $scope.currentPgCoursePage = 1;
        if ($scope.currentPgCoursePage > $scope.pgcnumbers) $scope.currentPgCoursePage = $scope.pgcnumbers;
        var begin = (($scope.currentPgCoursePage - 1) * $scope.numberofPgCoursePerPage),
            end = begin + $scope.numberofPgCoursePerPage;
        $scope.filteredPgCourseVideos = pgCourse.slice(begin, end);
    }

    // Getting Post Graduate Research Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.postgraduateResearch = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Postgraduate (Research)") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.postgraduateResearch.push(videoJson);
                
                 $scope.postgraduateResearch.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentPgResearchPage = 1;
    $scope.numberofPgResearchPerPage = 4;
    $scope.showMorePgResearchClicked = false;
    $scope.reverseSortPR = true,
        $scope.orderByFieldPR = 'timestamp'
    $scope.$watch("postgraduateResearch.length", pgResearchpaginationFunc);
    $scope.$watch("currentPgResearchPage + numberofPgResearchPerPage", pgResearchpaginationFunc);

    $scope.showLessPgResearch = function (index) {
        $scope.numberofPgResearchPerPage = index * 4;
        console.log(index);
        $scope.showMorePgResearchClicked = false;
    }

    $scope.showMorePgResearch = function (index) {
        $scope.numberofPgResearchPerPage = index * 100;
        console.log(index);
        $scope.showMorePgResearchClicked = true;
    }

    function pgResearchpaginationFunc() {
        var pgResearch = $scope.postgraduateResearch.filter(function (item) {
            return !item.filtered
        });
        $scope.pgrnumbers = Math.ceil(pgResearch.length / $scope.numberofPgResearchPerPage);
        if ($scope.currentPgResearchPage < 1) $scope.currentPgResearchPage = 1;
        if ($scope.currentPgResearchPage > $scope.pgrnumbers) $scope.currentPgResearchPage = $scope.pgrnumbers;
        var begin = (($scope.currentPgResearchPage - 1) * $scope.numberofPgResearchPerPage),
            end = begin + $scope.numberofPgResearchPerPage;
        $scope.filteredPgResearchVideos = pgResearch.slice(begin, end);
    }



    // Getting Short Courses Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.shortCourses = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Short Courses") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.shortCourses.push(videoJson);
                
                $scope.shortCourses.sort($scope.orderByDate);
            }
        });

        $scope.$apply();
    });

    $scope.currentSCPage = 1;
    $scope.numberofSCPerPage = 4;
    $scope.showMoreSCClicked = false;
    $scope.reverseSortSVID = true,
        $scope.orderByFieldSVID = 'timestamp'
    $scope.$watch("shortCourses.length", SCResearchpaginationFunc);
    $scope.$watch("currentSCPage + numberofSCPerPage", SCResearchpaginationFunc);

    $scope.showLessSC = function (index) {
        $scope.numberofSCPerPage = index * 4;
        console.log(index);
        $scope.showMoreSCClicked = false;
    }

    $scope.showMoreSC = function (index) {
        $scope.numberofSCPerPage = index * 100;
        console.log(index);
        $scope.showMoreSCClicked = true;
    }

    function SCResearchpaginationFunc() {
        var SC = $scope.shortCourses.filter(function (item) {
            return !item.filtered
        });
        $scope.scnumbers = Math.ceil(SC.length / $scope.numberofSCPerPage);
        if ($scope.currentSCPage < 1) $scope.currentSCPage = 1;
        if ($scope.currentSCPage > $scope.scnumbers) $scope.currentSCPage = $scope.scnumbers;
        var begin = (($scope.currentSCPage - 1) * $scope.numberofSCPerPage),
            end = begin + $scope.numberofSCPerPage;
        $scope.filteredSCVideos = SC.slice(begin, end);
    }

    // #region Getting Others Videos
    db.collection("Videos").onSnapshot(function (querySnapshot) {
        $scope.others = [];
        querySnapshot.forEach(function (doc) {
            if (doc.data().block_status === false && doc.data().video_visibility === "Public" && doc.data().editing === false && doc.data().video_category === "Others") {
                var videoJson = {
                    id: doc.id,
                    data: doc.data(),
                    timestamp: moment(doc.data().date_uploaded.toDate()).format('DD, MMMM YYYY HH:mm')
                }
                $scope.others.push(videoJson);
                
                 $scope.others.sort($scope.orderByDate);
            }

        });

        $scope.$apply();
    });

    $scope.currentOthersPage = 1, $scope.numberofOthersPerPage = 4, $scope.showMoreOthersClicked = false, $scope.reverseSortOthers = true, $scope.orderByFieldOthers = 'timestamp'
    $scope.$watch("others.length", otherspaginationFunc);
    $scope.$watch("currentOthersPage + numberofOthersPerPage", otherspaginationFunc);

    $scope.showLessOthers = function (index) {
        $scope.numberofOthersPerPage = index * 4;
        console.log(index);
        $scope.showMoreOthersClicked = false;

    }

    $scope.showMoreOthers = function (index) {
        $scope.numberofOthersPerPage = index * 100;
        console.log(index);
        $scope.showMoreOthersClicked = true;
    }

    function otherspaginationFunc() {
        var others = $scope.others.filter(function (item) {
            return !item.filtered
        });
        $scope.onumbers = Math.ceil(others.length / $scope.numberofOthersPerPage);
        if ($scope.currentOthersPage < 1) $scope.currentOthersPage = 1;
        if ($scope.currentOthersPage > $scope.onumbers) $scope.currentOthersPage = $scope.onumbers;
        var begin = (($scope.currentOthersPage - 1) * $scope.numberofOthersPerPage),
            end = begin + $scope.numberofOthersPerPage;
        $scope.filteredOthersVideos = others.slice(begin, end);
    }




    // GETTING VIDEOS END ---------------------------------------------------------------------------------------------------


    // ORDER BY DATE FUNCTION

    $scope.orderByDate = function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.timestamp) - new Date(a.timestamp);
    };

}]);

app.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 0; i < total; ++i) input.push(i);
        return input;
    };
});

