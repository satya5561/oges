'use strict';

angular.module('coride')
  .controller('RegistrationCtrl', function ($rootScope, $scope, $location, User, Authentication) {
    $rootScope.barClass = "bar-clear"

    $scope.back = function() {
      $location.path("/login");
    }

    var fbLoginSuccess = function (userData) {
      var access_token = String(userData.authResponse.accessToken)
      if(!access_token) {
        // ANDROID CODE
        facebookConnectPlugin.getAccessToken(function (token) {
          access_token = token
        }, function(err) {
          $rootScope.hideLoading();
          var message = "Could not get access token: " + err + " Please register with your email address.";
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        });
      }

      var auth = { 'access_token': access_token };

      // TODO THIS IS IN SESSIONS CONTROLLER TOO
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
        var message = "There was a problem with your Facebook Account. Please register with your email address."
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      });
    };

    $scope.facebookLogin = function () {
      $rootScope.showLoading();
      facebookConnectPlugin.login(["email,user_about_me,user_interests,user_birthday,user_likes"], 
        fbLoginSuccess, 
        function (error) {
          $rootScope.hideLoading(); 
          var message = "" + error + " Please register with your email address.";
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message); 
        }
      );
    };

    $scope.user = {};

    $scope.submit = function() {
      User.sign_up({}, $scope.user, function(data) {
        localStorage.setItem("coride_auth_token", data.auth_token);
        localStorage.setItem("new_user", true);
        $location.path("/users/edit");
      }, function(data) {
        var message = "";
        angular.forEach(data.data.error, function(value, key){
           message += key + ' ' + value[0] + "\n";
        });
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      });
    };
  });