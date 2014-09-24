'use strict';

angular.module('coride').controller('TutorialCtrl', function($rootScope, $scope, $state, $ionicSlideBoxDelegate) {
  $rootScope.barClass = "bar-clear";

	// Called to navigate to back
	$scope.back = function() {
		// Set a flag that we finished the tutorial
		window.localStorage['didTutorial'] = true;

    window.history.back();
	};
  
  // Called to add new car
  $scope.addCar = function() {
    $state.go('car-new');
  };
 	// Move to the next slide
	$scope.next = function() {
		$ionicSlideBoxDelegate.next();
	};

  $scope.previous = function() {
    $ionicSlideBoxDelegate.previous();
  };

  // Called each time the slide changes
  $scope.slideChanged = function(index) {
    $scope.slideIndex = index;
  };
});