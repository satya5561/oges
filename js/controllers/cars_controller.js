'use strict';

angular.module('coride')
  .controller('CarNewCtrl', function ($scope, $rootScope, $state, Car, $location) {
    $rootScope.barClass = "bar-positive"

    $scope.back = function() {
      $state.go('tab.user');
    }

    $scope.car = {
      "doors": 4,
      "seat_count": 4
    }

    $scope.createCar = function() {
      $rootScope.showLoading();
    	Car.save({}, $scope.car, function () {
        $rootScope.hideLoading();
    		$location.path('/tab/user-tab');
        var message = 'Car added successfully.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
    	}, function() {
        $rootScope.hideLoading();
        message = 'There was a problem adding you Car. Please try again.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
    	});
    };
  })

  .controller('CarDetailsCtrl', function ($scope, $rootScope, $stateParams, Car, $location) {
    $rootScope.barClass = "bar-positive"

    $scope.car = Car.get({ id: $stateParams.carId });
    $scope.back = function() {
      window.history.back();
    };
    $scope.edit = function() {
      $location.url("/cars/" + $scope.car.id + "/edit");
    };
    $scope.driverDetails = function () {
      $location.path("/users/" + $scope.car.user.id);
    };
  })

  .controller('CarEditCtrl', function ($scope, $rootScope, $stateParams, Car, $location) {
    $rootScope.barClass = "bar-positive"

    $scope.car = Car.get({ id: $stateParams.carId });

    $scope.back = function() {
      $location.url("/tab/user-tab");
    }

    function onConfirm(buttonIndex) {
      if (buttonIndex == 2) {
        Car.delete({ id: $scope.car.id }, function() {
          $location.url("/tab/user-tab");
          var message = 'Car removed successfully.'
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        }, function() {
          var message = 'There was a problem removing your car. Please try again.'
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);        
        });
      }
    }
    
    $scope.delete = function() {
      navigator.notification.confirm(
          'You will no longer be able to post corides with this car.', // message
           onConfirm,            // callback to invoke with index of button pressed
          'Remove car?',           // title
          ['Nevermind','Confirm']     // buttonLabels
      );
    }

    $scope.updateCar = function() {
      $rootScope.showLoading();
      Car.update({}, $scope.car, function () {
        $rootScope.hideLoading();
        $location.path('/cars/' + $scope.car.id);
        var message = 'Car updated successfully.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      }, function() {
        $rootScope.hideLoading();
        var message = 'There was an problem updating your car\'s data. Please try again.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };
  });