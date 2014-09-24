'use strict';

angular.module('coride')
  .controller('ReviewDetailsCtrl', function ($rootScope, $scope, $stateParams, Review) {
    $rootScope.barClass = "bar-positive"

    $scope.back = function() {
      window.history.back();
    }

    $scope.review = Review.get({ id: $stateParams.reviewId });
  })

  .controller('ReviewIndexCtrl', function ($rootScope, $scope, $stateParams, $location, Review) {
    $rootScope.barClass = "bar-positive"

    $scope.back = function() {
      window.history.back();
    }
    $scope.newReview = function() {
      $location.path("/reviews/new/" + $stateParams.userId)
    }

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));
    $scope.reviews = Review.query({ userId: $stateParams.userId }, function() {
      var is_current_user = $scope.current_user.id == $stateParams.userId
      var has_reviewed = false
      angular.forEach($scope.reviews, function(review) {
        if (review.user.id == localStorage.getItem("coride_auth_token")) {
          var has_reviewed = true
        }
      });
      $scope.canReview = !is_current_user && !has_reviewed
    });
    
    $scope.getReviews = function() {
      window.plugins.socialsharing.share('Help improve my profile on Coride.co by writing me a reference. Thanks!', null, null, 'https://www.coride.co/reviews/new?reviewee_id=' + $scope.current_user.id)
    }
  })

  .controller('NewReviewCtrl', function ($rootScope, $scope, $stateParams, $location, Review, User) {
    $rootScope.barClass = "bar-positive"

    $scope.back = function() {
      window.history.back();
    }

    $scope.reviewee = User.get({ id: $stateParams.revieweeId });
    $scope.review = { 'positive': true }

    $scope.createReview = function() {
      $scope.review.reviewee_id = $scope.reviewee.id
      Review.save({}, $scope.review, function () {
        $location.path('/users/' + $scope.reviewee.id);

        var message = 'Review posted successfully.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      }, function() {
        var message = 'There was a problem posting your review. Please try again later.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      });
    };
  });
