/*globals getUsers, getVideoList, sortUser, sortVideo, createTableRows */

var app = angular.module('admin', ['ngRoute', 'firebase']);

app.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/Admin', {
        templateUrl: 'admin/admin.html',
        controller: 'adminCtrl'
    });
}]);

app.controller('adminCtrl', ['$scope', '$compile', '$location', '$route', '$sce', function ($scope, $compile, $location, $route, $sce) {
    'use strict';

    var db = firebase.firestore();

    db.settings({
        timestampsInSnapshots: true
    });

    var xhr,
        createOnce = false,
        createOnceVerified,
        userStatus = [],
        userEmails = [],
        selectedID,
        userDetails = [],
        validUsers = [],
        userCreationDate = [];

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
    }

    getUsers();
    getVideoList();

    //Get user accounts list.
    function getUsers() {

        var reqURL = 'https://us-central1-educational-video-learning-app.cloudfunctions.net/getUsers',
            i,
            userDate,
            month,
            userCreatedDate;

        xhr.open('GET', reqURL, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(this.response);

                for (i = 0; i < response.length; i += 1) {
                    userStatus[response[i].email] = response[i].disabled;
                    userEmails.push(response[i].email);

                    userDate = new Date(response[i].metadata.creationTime);
                    month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"][userDate.getMonth()];
                    userCreatedDate = userDate.getDate() + '-' + month + '-' + userDate.getFullYear();
                    userCreationDate.push(userCreatedDate);
                }

                if (response !== null) {
                    createTableRows();
                }
            }
        };
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send();
    }

    //Create the table for User
    function createTableRows() {

        var i;

        db.collection("Users").onSnapshot(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                for (i = 0; i < userEmails.length; i += 1) {
                    if (doc.id === userEmails[i] && doc.data().userType !== "Admin") {
                        if (validUsers.includes(doc.id) === false) {
                            validUsers.push(doc.id);
                        }
                    }
                }
            });
        });

        db.collection("Users").onSnapshot(function (querySnapshot) {
            for (i = 0; i < validUsers.length; i += 1) {
                querySnapshot.forEach(function (doc) {
                    if (doc.id === validUsers[i]) {
                        var ButtonDisable = document.createElement("Button"),
                            ButtonDelete = document.createElement("Button"),
                            ButtonDeleteImage = document.createElement("i"),
                            ButtonDisableText,
                            tableID = document.getElementById("userTableBody"),
                            tRow = tableID.insertRow(-1),
                            tBodyName = tRow.insertCell(0),
                            tBodyID = tRow.insertCell(1),
                            tBodyType = tRow.insertCell(2),
                            tBodyCourse = tRow.insertCell(3),
                            tBodyDate = tRow.insertCell(4),
                            tBodyStatus = tRow.insertCell(5),
                            tBodyTrash = tRow.insertCell(6),
                            splittedEmail = doc.id.split("@"),
                            onlyID = splittedEmail[0];

                        ButtonDelete.className = "delete_btn";
                        ButtonDeleteImage.className = "fa fa-trash";

                        if (userStatus[validUsers[i]] == false) {
                            ButtonDisable.className = "btn btn-success btn-block statusbtn";
                            ButtonDisable.setAttribute("data-ng-click", "disableUser($event.target.id);");
                            ButtonDisableText = document.createTextNode("Active");
                        } else {
                            ButtonDisable.className = "btn btn-danger btn-block statusbtn";
                            ButtonDisable.setAttribute("data-ng-click", "enableUser($event.target.id);");
                            ButtonDisableText = document.createTextNode("Inactive");
                        }

                        tBodyName.setAttribute("id", i + "userRow");
                        tBodyStatus.className = "vidStatus";
                        ButtonDisable.setAttribute("type", "button");
                        ButtonDisable.setAttribute("id", doc.id);
                        ButtonDelete.setAttribute("type", "button");
                        ButtonDelete.setAttribute("data-ng-click", "clickModal($event.target.id);");
                        ButtonDelete.setAttribute("data-toggle", "modal");
                        ButtonDelete.setAttribute("data-target", "#deleteModal");
                        ButtonDelete.setAttribute("data-id", doc.id);
                        ButtonDeleteImage.setAttribute("aria-hidden", "true");

                        $compile(ButtonDelete)($scope);
                        $compile(ButtonDisable)($scope);
                        ButtonDisable.appendChild(ButtonDisableText);
                        ButtonDelete.appendChild(ButtonDeleteImage);

                        tBodyName.innerHTML = doc.data().Name;
                        tBodyID.innerHTML = onlyID;
                        tBodyType.innerHTML = doc.data().userType;
                        tBodyCourse.innerHTML = doc.data().Course;
                        tBodyDate.innerHTML = userCreationDate[i];

                        tBodyStatus.appendChild(ButtonDisable);
                        tBodyTrash.appendChild(ButtonDelete);

                        $scope.sortUser(0);
                    }
                });
            }
        });
    }

    //Clear previous User table list when a user is deleted.
    $scope.refreshTableRow = function () {

        var nodeBody = document.getElementById('userTableBody');
        while (nodeBody.hasChildNodes()) {
            nodeBody.removeChild(nodeBody.lastChild);
        }

        console.log("FTW");
    }

    //Disable user function
    $scope.disableUser = function (email) {

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                db.collection("Users").doc(user.email).get().then(function (doc) {
                    if (doc.exists) {
                        if (doc.data().userType === "Admin") {
                            var reqURL = 'https://us-central1-educational-video-learning-app.cloudfunctions.net/disableUser/',
                                params = "email=" + email;
                            xhr.open('POST', reqURL, true);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    var response = this.responseText;
                                    console.log(response);
                                    $scope.changeBtnAttr(email);
                                }
                            };
                            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                            xhr.send(params);
                        } else {
                            alert("Only Admin accounts can disable users!");
                        }
                    }
                });
            } else {
                console.log("No user is signed-in");
            }
        });
    }

    //Enable user function
    $scope.enableUser = function (email) {

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                db.collection("Users").doc(user.email).get().then(function (doc) {
                    if (doc.exists) {
                        if (doc.data().userType === "Admin") {
                            var reqURL = 'https://us-central1-educational-video-learning-app.cloudfunctions.net/enableUser/',
                                params = "email=" + email;
                            xhr.open('POST', reqURL, true);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    var response = this.responseText;
                                    console.log(response);
                                    $scope.changeBtnAttr(email);
                                }
                            };
                            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                            xhr.send(params);
                        } else {
                            alert("Only Admin accounts can enable users!");
                        }
                    }
                });
            } else {
                console.log("No user is signed-in");
            }
        });
    }

    //Delete user function
    $scope.deleteUser = function (email) {

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                db.collection("Users").doc(user.email).get().then(function (doc) {
                    if (doc.exists) {
                        if (doc.data().userType === "Admin") {
                            var reqURL = 'https://us-central1-educational-video-learning-app.cloudfunctions.net/deleteUser/',
                                params = "email=" + email;
                            xhr.open('POST', reqURL, true);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    var response = this.responseText;
                                    console.log(response);

                                    $scope.refreshTableRow();

                                    if (response === "User with id " + email + " deleted") {
                                        db.collection("Users").doc(email).delete().then(function () {
                                            console.log("Document successfully deleted!");
                                            alert("User has been deleted!");
                                        }).catch(function (error) {
                                            console.error("Error removing document: ", error);
                                        });

                                        var videoRef = db.collection("Videos").where("video_uploader_Email", "==", email);
                                        videoRef.get().then(function (querySnapshot) {
                                            querySnapshot.forEach(function (doc) {
                                                doc.ref.delete();
                                                console.log("doc " + doc.id + " is deleted!");
                                            });
                                        });
                                    }
                                    $scope.deleteUserStorage(email);
                                    $('#deleteModal').modal('hide');
                                }
                            };
                            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                            xhr.send(params);
                        } else {
                            alert("Only Admin accounts can delete users!");
                        }
                    }
                });
            } else {
                console.log("No user is signed-in");
            }
        });
    }

    //Change button look when pressed for Users
    $scope.changeBtnAttr = function (id) {

        var selectedBtn = document.getElementById(id);

        if (selectedBtn.innerHTML === "Active") {
            selectedBtn.className = "btn btn-danger btn-block statusbtn";
            selectedBtn.setAttribute("data-ng-click", "enableUser($event.target.id);");
            selectedBtn.innerHTML = "Inactive";
        } else {
            selectedBtn.className = "btn btn-success btn-block statusbtn";
            selectedBtn.setAttribute("data-ng-click", "disableUser($event.target.id);");
            selectedBtn.innerHTML = "Active";
        }
        $compile(selectedBtn)($scope);
    }

    //Display all uploaded video in a list
    function getVideoList() {

        var videosUploaded = db.collection("Videos");

        videosUploaded.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var BtnDisable = document.createElement("Button"),
                    BtnDisableText,
                    vidtableID = document.getElementById("videoTable"),
                    vidtRow = vidtableID.insertRow(-1),
                    tBodyVidName = vidtRow.insertCell(0),
                    tBodyVidCategory = vidtRow.insertCell(1),
                    tBodyVidUploader = vidtRow.insertCell(2),
                    tBodyVidStatus = vidtRow.insertCell(3);

                tBodyVidName.setAttribute("width", "40%");
                tBodyVidCategory.setAttribute("width", "25%");
                tBodyVidUploader.setAttribute("width", "35%");

                tBodyVidStatus.className = "vidStatus";

                if (doc.data().block_status === false) {
                    BtnDisable.className = "btn btn-success btn-block statusbtn";
                    BtnDisable.setAttribute("id", doc.id);
                    BtnDisable.setAttribute("data-ng-click", "changeVidStatus($event.target.id);");
                    BtnDisableText = document.createTextNode("Active");
                } else {
                    BtnDisable.className = "btn btn-danger btn-block statusbtn";
                    BtnDisable.setAttribute("id", doc.id);
                    BtnDisable.setAttribute("data-ng-click", "changeVidStatus($event.target.id);");
                    BtnDisableText = document.createTextNode("Inactive");
                }

                $compile(BtnDisable)($scope);
                BtnDisable.appendChild(BtnDisableText);
                tBodyVidStatus.appendChild(BtnDisable);

                tBodyVidCategory.innerHTML = doc.data().video_category;
                tBodyVidName.innerHTML = doc.data().video_name;
                tBodyVidUploader.innerHTML = doc.data().video_uploader_Email;
                console.log(vidtableID);
                $scope.sortVideo(0);
            });
        });
    }

    //User Search function
    $scope.searchUser = function () {

        var input = document.getElementById("user_search"),
            table = document.getElementById("userTable"),
            filter = input.value.toUpperCase(),
            tr = table.getElementsByTagName("tr"),
            i;

        for (i = 0; i < tr.length; i += 1) {
            var td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    };

    //Video Search function
    $scope.searchVideo = function () {

        var input = document.getElementById("video_search"),
            table = document.getElementById("videoTable"),
            filter = input.value.toUpperCase(),
            tr = table.getElementsByTagName("tr"),
            i;

        for (i = 0; i < tr.length; i += 1) {
            var td = tr[i].getElementsByTagName("td")[0];
            if (td) {
                if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    };

    $scope.deleteUserStorage = function (email) {

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                db.collection("Users").doc(user.email).get().then(function (doc) {
                    if (doc.exists) {
                        if (doc.data().userType === "Admin") {
                            var reqURL = 'https://us-central1-educational-video-learning-app.cloudfunctions.net/deleteStorage/',
                                params = "email=" + email;
                            xhr.open('POST', reqURL, true);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4 && xhr.status === 200) {
                                    var response = this.responseText;
                                    console.log(response);
                                }
                            };
                            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                            xhr.send(params);
                        } else {}
                    }
                });
            } else {
                console.log("No user is signed-in");
            }
        });
    }

    //Block or unblock video
    $scope.changeVidStatus = function (id) {

        var selectedBtn = document.getElementById(id);

        firebase.auth().onAuthStateChanged(function (user) {
            if (user) {
                db.collection("Users").doc(user.email).get().then(function (doc) {
                    if (doc.exists) {
                        if (doc.data().userType === "Admin") {
                            var vidRef = db.collection("Videos").doc(id);

                            vidRef.get().then(function (doc) {
                                console.log(doc.data().block_status);
                                if (doc.data().block_status === true) {
                                    return vidRef.update({
                                            block_status: false
                                        })
                                        .then(function () {
                                            console.log("Video has been unblocked");
                                            selectedBtn.className = "btn btn-success btn-block statusbtn";
                                            selectedBtn.setAttribute("data-ng-click", "changeVidStatus($event.target.id);");
                                            selectedBtn.innerHTML = "Active";
                                            $compile(selectedBtn)($scope);
                                        })
                                        .catch(function (error) {
                                            console.error("Error updating document: ", error);
                                        });
                                } else if (doc.data().block_status === false) {
                                    return vidRef.update({
                                            block_status: true
                                        })
                                        .then(function () {
                                            console.log("Video has been blocked");
                                            selectedBtn.className = "btn btn-danger btn-block statusbtn";
                                            selectedBtn.setAttribute("data-ng-click", "changeVidStatus($event.target.id);");
                                            selectedBtn.innerHTML = "Inactive";
                                            $compile(selectedBtn)($scope);
                                        })
                                        .catch(function (error) {
                                            console.error("Error updating document: ", error);
                                        });
                                }
                            });
                        } else {
                            alert("Only Admin accounts can enable/disable videos!");
                        }
                    }
                });
            } else {
                console.log("No user is signed-in");
            }
        });
    }
    
    //Sort user list
    $scope.sortUser = function (selected) {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("userTable");
        switching = true;

        while (switching) {

            switching = false;
            rows = table.rows;

            for (i = 1; i < (rows.length - 1); i += 1) {

                shouldSwitch = false;

                x = rows[i].getElementsByTagName("TD")[selected];
                y = rows[i + 1].getElementsByTagName("TD")[selected];

                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {

                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {

                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    //Sort video list
    $scope.sortVideo = function (selected) {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("videoTable");
        switching = true;

        while (switching) {
            switching = false;
            rows = table.rows;

            for (i = 1; i < (rows.length - 1); i += 1) {
                shouldSwitch = false;

                x = rows[i].getElementsByTagName("TD")[selected];
                y = rows[i + 1].getElementsByTagName("TD")[selected];

                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }

    //Show radio buttons for filter based on dropdown selection
    $scope.showUserList = function (selected) {
        var i;

        if (selected === "user_type") {
            document.getElementById("usertypefilter").style.display = "";
            document.getElementById("coursefilter").style.display = "none";
            document.getElementById("statusfilter").style.display = "none";
            $scope.filterUserType("");
            var rbType1 = document.getElementsByName("usertype");
            for (i = 0; i < rbType1.length; i += 1) {
                rbType1[i].checked = false;
            }
        } else if (selected === "course") {
            document.getElementById("coursefilter").style.display = "";
            document.getElementById("usertypefilter").style.display = "none";
            document.getElementById("statusfilter").style.display = "none";
            $scope.filterUserCourse("");
            var rbCourse1 = document.getElementsByName("usercourse");
            for (i = 0; i < rbCourse1.length; i += 1) {
                rbCourse1[i].checked = false;
            }
        } else if (selected === "status") {
            document.getElementById("statusfilter").style.display = "";
            document.getElementById("coursefilter").style.display = "none";
            document.getElementById("usertypefilter").style.display = "none";
            $scope.filterUserStatus("");
            var rbStatus1 = document.getElementsByName("userstatus");
            for (i = 0; i < rbStatus1.length; i += 1) {
                rbStatus1[i].checked = false;
            }
        } else if (selected === "default") {
            document.getElementById("usertypefilter").style.display = "none";
            document.getElementById("coursefilter").style.display = "none";
            document.getElementById("statusfilter").style.display = "none";
            $scope.filterUserType("");
            $scope.filterUserCourse("");
            $scope.filterUserStatus("");
            var rbType2 = document.getElementsByName("usertype");
            for (i = 0; i < rbType2.length; i += 1) {
                rbType2[i].checked = false;
            }
            var rbCourse2 = document.getElementsByName("usercourse");
            for (i = 0; i < rbCourse2.length; i += 1) {
                rbCourse2[i].checked = false;
            }
            var rbStatus2 = document.getElementsByName("userstatus");
            for (i = 0; i < rbStatus2.length; i += 1) {
                rbStatus2[i].checked = false;
            }
        }
    }

    //Show radio buttons for filter based on dropdown selection
    $scope.showVideoList = function (selected) {
        var i;

        if (selected === "category") {
            document.getElementById("categoryfilter").style.display = "";
            document.getElementById("statusvidfilter").style.display = "none";
            $scope.filterVidCat("");
            var rbCategory1 = document.getElementsByName("vidcategory");
            for (i = 0; i < rbCategory1.length; i += 1) {
                rbCategory1[i].checked = false;
            }
        } else if (selected === "status") {
            document.getElementById("statusvidfilter").style.display = "";
            document.getElementById("categoryfilter").style.display = "none";
            $scope.filterVidStatus("");
            var rbVidStatus1 = document.getElementsByName("vidstatus");
            for (i = 0; i < rbVidStatus1.length; i += 1) {
                rbVidStatus1[i].checked = false;
            }
        } else if (selected === "default") {
            document.getElementById("statusvidfilter").style.display = "none";
            document.getElementById("categoryfilter").style.display = "none";
            $scope.filterVidStatus("");
            $scope.filterVidCat("");
            var rbCategory2 = document.getElementsByName("vidcategory");
            for (i = 0; i < rbCategory2.length; i += 1) {
                rbCategory2[i].checked = false;
            }
            var rbVidStatus2 = document.getElementsByName("vidstatus");
            for (i = 0; i < rbVidStatus2.length; i += 1) {
                rbVidStatus2[i].checked = false;
            }
        }
    }

    $scope.filterUserType = function (selected) {
        'use strict';
        var input = selected,
            table = document.getElementById("userTable");

        var tr = table.getElementsByTagName("tr"),
            i;
        if (input === null) {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[2];
                tr[i].style.display = "";
            }
        } else {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[2];
                if (td) {
                    if (td.innerHTML.indexOf(input) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }

    $scope.filterUserCourse = function (selected) {
        'use strict';
        var input = selected,
            table = document.getElementById("userTable");

        var tr = table.getElementsByTagName("tr"),
            i;
        if (input === null) {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[3];
                tr[i].style.display = "";
            }
        } else {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[3];
                if (td) {
                    if (td.innerHTML.indexOf(input) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }

    $scope.filterUserStatus = function (selected) {
        'use strict';
        var input = selected,
            table = document.getElementById("userTable");

        var tr = table.getElementsByTagName("tr"),
            i;
        if (input === null) {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[5];
                tr[i].style.display = "";
            }
        } else {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[5];
                if (td) {
                    if (td.innerHTML.indexOf(input) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }

    $scope.filterVidCat = function (selected) {
        'use strict';
        var input = selected,
            table = document.getElementById("videoTable");

        var tr = table.getElementsByTagName("tr"),
            i;
        if (input === null) {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[1];
                tr[i].style.display = "";
            }
        } else {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[1];
                if (td) {
                    if (td.innerHTML.indexOf(input) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }

    //Function to filter video based on status
    $scope.filterVidStatus = function (selected) {
        'use strict';
        var input = selected,
            table = document.getElementById("videoTable");

        var tr = table.getElementsByTagName("tr"),
            i;
        if (input === null) {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[3];
                tr[i].style.display = "";
            }
        } else {
            for (i = 0; i < tr.length; i += 1) {
                var td = tr[i].getElementsByTagName("td")[3];
                if (td) {
                    if (td.innerHTML.indexOf(input) > -1) {
                        tr[i].style.display = "";
                    } else {
                        tr[i].style.display = "none";
                    }
                }
            }
        }
    }

    //Function to open modal and show relevant information when deleting user.
    $scope.clickModal = function () {
        $('#deleteModal').on('shown.bs.modal', function (event) {
            var button = $(event.relatedTarget), // Button that triggered the modal
                selectedID = button.data('id'),
                splitEmail = selectedID.split("@"),
                splittedEmail = splitEmail[0],
                modal = $(this);

            modal.find('.modal-body #modalContent').html("Are you sure you want to delete user <strong>" + splittedEmail + "</strong>? All information related to the user would also be deleted. This action is irreversible.");

            $(this).find('.modal-body .btn.btn-default.btn-danger.btn-block').attr("id", selectedID);
        });
    }
                    }]);
