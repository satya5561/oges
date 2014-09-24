'use strict';

angular.module('coride')
  .controller('UserTabCtrl', function ($rootScope, $scope, $location, $state, $ionicPopup, Review, User, Authentication){
    $rootScope.barClass = "bar-clear";
    $rootScope.hideLoading();

    $scope.user = JSON.parse(localStorage.getItem("current_user"));

    User.get({ id: localStorage.getItem("coride_auth_token") }, function(data) {
      localStorage.setItem('current_user', JSON.stringify(data));
      $scope.user = data;
    });

    $scope.user_tab = true;

    var fbLoginSuccess = function(userData) {
      console.log(userData);
      //IOS CODE
      var access_token = String(userData.authResponse.accessToken);
      console.log(!access_token);
      if(!access_token) {
        // ANDROID CODE
        facebookConnectPlugin.getAccessToken(function (token) {
          access_token = token
        }, function(err) {
            $rootScope.hideLoading();
            console.log("Could not get access token: " + err);
        });
      }

      var auth = { 'access_token': access_token };

      Authentication.save({}, auth, function (data) {
        $rootScope.hideLoading();
        var message = "Facebook verification successfully added.";
        navigator.notification.alert(message, null, 'Alert', 'OK');
        User.get({ id: localStorage.getItem("coride_auth_token") }, function(data) {
          localStorage.setItem('current_user', JSON.stringify(data));
          $scope.user = data;
        });      
      }, function(data) {
        $rootScope.hideLoading();
        var message = data.data.error
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };

    $scope.getReviews = function() {
      window.plugins.socialsharing.share('Help improve my profile on Coride.co by writing me a reference. Thanks!', null, null, 'https://www.coride.co/reviews/new?reviewee_id=' + $scope.user.id)
    };
    $scope.settings = function() {
      $location.url("/settings");
    };
    $scope.newCar = function() {
      $location.url("/cars/new");
    };
    $scope.editProfile = function() {
      $location.url("/users/edit");
    };
    $scope.verifyFacebook = function() {
      $rootScope.showLoading();
      facebookConnectPlugin.login(["email,user_about_me,user_interests,user_birthday,user_likes"], 
        fbLoginSuccess,
        function (error) {
          $rootScope.hideLoading(); 
          var message = "Error:" + error;
          console.log(message);
          navigator.notification.alert(message, null, 'Alert', 'OK');
        }
      );
    };
    $scope.verifyStudent = function () {
      var emailPopup = $ionicPopup.show({
        template: '<input type="email" ng-model="user.student_email">',
        subTitle: '<p>You will receive a confirmation email</p>',
        title: 'Enter student email',
        scope: $scope,
        buttons: [
          { text: 'Cancel',
            onTap: function(e) {
              $scope.user.student_email = null;
              $state.go("tab.user");
            } 
          },
          {
            text: '<b>Submit</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.user.student_email || !/\.edu$/.test($scope.user.student_email)) {
                var message = "Please enter an email address ending in .edu"
                console.log(message);
                navigator.notification.alert(message, null, 'Alert', 'OK');
                e.preventDefault();
              } else {
                return $scope.user.student_email;
              }
            }
          },
        ]
      });

      emailPopup.then(function(res) {
        if (res) {
          User.update({}, $scope.user, function(data) {
            $rootScope.hideLoading();
            localStorage.setItem('current_user', JSON.stringify(data));
            $scope.user = data;
            var message = 'Verification submitted.'
            console.log(message);
            navigator.notification.alert(message, null, 'Alert', 'OK');
            $state.go("tab.user");
          }, function(data) {
            $rootScope.hideLoading();
            var message = "There was a problem updating your profile. Please try again."
            console.log(message);
            navigator.notification.alert(message, null, 'Alert', 'OK');
          });
        }
      });
    }
  })

  .controller('UserSettingsCtrl', function ($rootScope, $scope, $location, User) {
    $rootScope.barClass = "bar-positive"
    
    $scope.back = function() {
      window.history.back();
    };
    
    $scope.user = JSON.parse(localStorage.getItem("current_user"))

    $scope.updateUser = function(){
      $rootScope.showLoading();
      User.update({}, $scope.user, function(data) {
        $rootScope.hideLoading();
        localStorage.setItem('current_user', JSON.stringify(data));
        // $location.url('/tab/user-tab');
        var message = 'Account settings successfully updated.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      }, function(data) {
        $rootScope.hideLoading();
        var message = "There was a problem updating your account settings. Please try again."
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };
  })

  .controller('SettingsCtrl', function ($rootScope, $scope, $location) {
    $rootScope.barClass = "bar-positive"
    
    $scope.back = function() {
      window.history.back();
    };

    $scope.logout = function() {
      window.localStorage.clear();
      window.localStorage['didTutorial'] = true;
      $rootScope.$broadcast('app.loggedOut'); 
      $location.url("/")
    }
    
    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))

    $scope.inviteFriends = function() {
      window.plugins.socialsharing.share('Share corides on Coride.co with me!', null, null, 'http://www.coride.co')
    }

    $scope.getReviews = function() {
      window.plugins.socialsharing.share('Help improve my profile on Coride.co by writing me a reference. Thanks!', null, null, 'https://www.coride.co/reviews/new?reviewee_id=' + $scope.current_user.id)
    }
  })
  
  .controller('UserEditCtrl', function ($rootScope, $scope, $state, $location, $http, User) {
    $rootScope.barClass = "bar-positive"
    $rootScope.hideLoading();
    
    $scope.user = JSON.parse(localStorage.getItem("current_user"));

    User.get({ id: localStorage.getItem("coride_auth_token") }, function(data) {
      localStorage.setItem('current_user', JSON.stringify(data));
      $scope.user = data;
    });
    
    $scope.back = function() {
      $state.go('tab.user');
    };

    $scope.reviewApp = function() {
      if (device_ios) {
        //window.open('itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id511364723?ls=1&mt=8'); // or itms://
        window.open('https://www.coride.co/ios');
      } else if (device_android) {
        //window.open('market://details?id=<package_name>');
        window.open('https://www.coride.co/android');
      }
    };

    $scope.updateUser = function(){
      $rootScope.showLoading();
      User.update({}, $scope.user, function(data) {
        $rootScope.hideLoading();
        localStorage.setItem('current_user', JSON.stringify(data));
        if (localStorage.getItem("new_user") == "true") {
          localStorage.removeItem("new_user");
          $location.url("/cars/new");
        } else {
          $location.url('/tab/user-tab');
        }
        var message = 'User successfully updated.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      }, function(data) {
        $rootScope.hideLoading();
        var message = "There was a problem updating your profile. Please try again."
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };
  })

  .controller('UserDetailsCtrl', function ($rootScope, $scope, $stateParams, User) {
    $rootScope.barClass = "bar-clear";

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));
    $scope.user_tab = false;
    $scope.mutual_friends = [];

    User.get({ id: $stateParams.userId }, function(data) {
      $scope.user = data;

      if ($scope.user.facebook_uid && $scope.current_user.facebook_uid) {
        User.friends({ id: $stateParams.userId }, function(response){
          $scope.spinner = false;
          $scope.mutual_friends = response.data.friends;
        }, function(error) {
          var message = error.data;
          console.log(message);
          $scope.spinner = false;
        });
        $scope.spinner = true;
      }
    }, function(error) {
      console.log(error);
      var message = "There was a problem with your request.";
      navigator.notification.alert(message, null, 'Alert', 'OK');
      window.history.back();
    });
    
    $scope.back = function() {
      window.history.back();
    }
  });
