'use strict';

angular.module('coride')
  .controller('NewPasswordCtrl', function ($rootScope, $scope, $location, Password) {
    $rootScope.barClass = "bar-clear";
    $scope.back = function() {
      $location.path("/login");
    }

    $scope.user = {};

    $scope.submit = function() {
      Password.save({}, $scope.user, 
        function(data) {
          $location.path("/login");
          var message = "Password recovery instructions sent successfully."
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        }, function(data) {
          var message = "There was a problem sending your recovery instructions. Please try again."
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        });
    };
  })
