'use strict';

angular.module('coride')
  .controller('NewBookingCtrl', function ($rootScope, $scope, $stateParams, $location, Booking, Trip, Card) {
    $scope.back = function() {
      window.history.back();
    }
    var loadCards = function() {
      $rootScope.showLoading();
      Card.query(function(response) {
        $scope.cards = response;
        $scope.booking.stripe_card_id = response[0].id;
        $rootScope.hideLoading();
      }, function(error) {
        console.log(error);
        $rootScope.hideLoading();
        var message = "There was an error retrieving your card information.";
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    }
    
    Trip.get({ id: $stateParams.tripId }, function(response) {
      $scope.trip = response;
      $scope.booking = {
        trip_id: $scope.trip.id,
        stripe_card_id: ""
      }
      if (response.price != 'Free') {
        loadCards();
      }
    }, function(error) {
      console.log(error);
      var message = "There was an error retrieving the trip information";
      navigator.notification.alert(message, null, 'Alert', 'OK');
    });

    $scope.createBooking = function() {
      Booking.save({}, $scope.booking, function () {
        $location.path('/tab/trips/' + $scope.trip.id);

        var message = 'Coride Booked! (Your card will not be charged until your driver confirms.)'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      }, function() {
        var message = 'There was a problem booking your coride. Please review your card information and try again.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      });
    };

    //NEW CARD
    $scope.card = {}

    $scope.toggleNewCardForm = function() {
      if ($scope.show_card_form == true) {
        $scope.show_card_form = false
      } else {
        $scope.show_card_form = true
      }
    };
    
    $scope.createCard = function() {
      $rootScope.showLoading();
      Stripe.createToken($scope.card, stripeCardResponseHandler); //submit form data to stripe
    };

    //get back token or handle error
    var stripeCardResponseHandler = function(status, response) {
      $rootScope.hideLoading();
      if (response.error) {
        $rootScope.hideLoading();
        var message = response.error.message
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      } else {
        //submit !!!!ONLY TOKEN & NAME!!!
        $scope.card = {}
        $scope.card.stripe_token = response.id;
        $scope.card.full_name = response.card.name
        //handle success or error
        Card.save( {}, $scope.card, function () {
            window.location.reload();
            var message = 'Card added successfully.'
            navigator.notification.alert(message, null, 'Alert', 'OK');
            console.log(message);
          }, function() {
            $rootScope.hideLoading();
            var message = 'There was a problem adding your card. Please try again.'
            navigator.notification.alert(message, null, 'Alert', 'OK');
            console.log(message);
          }
        );
      };
    };
  });
