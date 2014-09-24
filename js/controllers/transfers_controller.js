'use strict';

angular.module('coride')
  .controller('NewTransferCtrl', function ($scope, $location, Transfer, Recipient) {
    $scope.back = function() {
      $location.path('/tab/payments');
    }
    
    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))
    
    $scope.recipient = Recipient.get({ id: $scope.current_user.stripe_recipient_id });
    
    $scope.authorizeTransfer = function() {
      Transfer.save({}, {}, function(){
        $location.path("/tab/payments");
        $scope.current_user.balance = "$0.00";
        localStorage.setItem('current_user', JSON.stringify($scope.current_user));
        var message = 'Transfer request confirmed. It will take up to 48 hours to receive your funds.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      }, function() {
        var message = "There was a problem with your transfer. Please try again later."
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };
  });