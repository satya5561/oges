'use strict';

angular.module('coride')
  .controller('SessionsCtrl', function ($rootScope, $scope, $state, $location, $ionicPlatform, $timeout, User, AuthService, Authentication) {

    $timeout(function() {
      if(window.localStorage['didTutorial'] !== "true") {
        $state.go('how-it-works');
      }
      AuthService.checkLogin();
    });

    $scope.$on('app.loggedIn', function(event) {
      console.log('LOGGED IN!');
      $location.path("/tab/destinations");
      $ionicPlatform.ready(function() {
        navigator.splashscreen.hide();
      });
    });

    $scope.$on('app.loggedOut', function(event) {
      console.log('NOT LOGGED IN!');
      $ionicPlatform.ready(function() {
        navigator.splashscreen.hide();
      });
    });

    $scope.user = {
      'email': '',
      'password': ''
    };

    // THIS IS IN REGISTRATIONS CONTROLLER
    // IOS FACEBOOK LOGIN CODE 
    var fbLoginSuccess = function (userData) {
      console.log('fb login success');
      console.log(userData)
      //IOS CODE
      var access_token = String(userData.authResponse.accessToken)
      console.log(!access_token)
      if(!access_token) {
        // ANDROID CODE
        facebookConnectPlugin.getAccessToken(function (token) {
          access_token = token
        }, function(err) {
          $rootScope.hideLoading();
          var message = "Could not get access token: " + err + " Please login using your email address.";
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        });
      }

      var auth = { 'access_token': access_token };
      console.log(auth)

      Authentication.save({}, auth, function (data) {
        localStorage.setItem("coride_auth_token", data.auth_token);
        if (data.sign_in_count < 2) {
          localStorage.setItem("new_user", true);
          $location.path("/users/edit");
        } else {
          $location.path("/tab/destinations");
        }
      }, function(data) {
        $rootScope.hideLoading();
        var message = "There was a problem with your Facebook Account. Please login using your email address.";
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };

    $scope.facebookLogin = function () {
      $rootScope.showLoading();
      console.log("attempting to login")
      facebookConnectPlugin.login(["email,user_about_me,user_interests,user_birthday,user_likes"], 
        fbLoginSuccess,
        function (error) {
          $rootScope.hideLoading(); 
          var message = "Error: " + error + " Please login using your email address.";
          console.log(message);
          navigator.notification.alert(message, null, 'Alert', 'OK');
        }
      );
    };

    $scope.login = function() {
      User.sign_in({},{"user": $scope.user},
        function(data) {
          localStorage.setItem("coride_auth_token", data.auth_token);     
          $location.path("/tab/destinations");
        },
        function(data) {
          var message = data.data.error
          console.log(message);
          navigator.notification.alert(message, null, 'Alert', 'OK');
        }
      );
    };

    $scope.register = function() {
      $location.path("/register");
    };  

  })

  .controller('TermsCtrl', function ($scope, $location) {
    $scope.back = function() {
      window.history.back();
    };
  })

  .controller('ContactCtrl', function ($scope, $location) {
    $scope.back = function() {
      window.history.back();
    };
  })

  .controller('PrivacyCtrl', function ($scope, $location) {
    $scope.back = function() {
      window.history.back();
    };
  });