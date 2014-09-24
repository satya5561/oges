'use strict';

angular.module('coride')
  .controller('PaymentTabCtrl', function ($rootScope, $scope, $location, Card, Recipient){
    $rootScope.barClass = "bar-positive";

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))
    
    $scope.cards = JSON.parse(localStorage.cards || null)
    if ($scope.cards == null) {
      $rootScope.showLoading();
    }

    Card.query(function(data) {
      if (localStorage.cards !== JSON.stringify(data)) {
        $scope.cards = data
        localStorage.setItem('cards', JSON.stringify(data));
      }
      $rootScope.hideLoading();
    });
  

    if ($scope.current_user.stripe_recipient_id) {
      $scope.recipient = JSON.parse(localStorage.recipient || null)
      if ($scope.recipient == null) {
        $rootScope.showLoading();
      }
      $scope.recipient = Recipient.get({ id: $scope.current_user.stripe_recipient_id }, function(data) {
        if (localStorage.recipient !== JSON.stringify(data)) {
          $scope.recipient = data
          localStorage.setItem('recipient', JSON.stringify(data));
        }
        $rootScope.hideLoading();
      });
    }

    $scope.card = {}
    $scope.new_recipient = {}

    var currentDate = new Date()
    $scope.card.exp_year = currentDate.getFullYear();
    $scope.card.exp_month = 1 + currentDate.getMonth()

    $scope.toggleNewCardForm = function() {
      if ($scope.show_card_form == true) {
        $scope.show_card_form = false
      } else {
        $scope.show_card_form = true
        $scope.show_recipient_form = false
      }
    };
    $scope.toggleNewRecipientForm = function() {
      if ($scope.show_recipient_form == true) {
        $scope.show_recipient_form = false
      } else {
        $scope.show_recipient_form = true
        $scope.show_card_form = false
      }
    };

    $scope.newTransfer = function() {
      $location.path("/transfer/new")
    }
        
    $scope.createCard = function() {
      $rootScope.showLoading();
      Stripe.createToken($scope.card, stripeCardResponseHandler); //submit form data to stripe
    };

    //get back token or handle error
    var stripeCardResponseHandler = function(status, response) {
      $rootScope.hideLoading();
      if (response.error) {
        var message = response.error.message
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      } else {
        //submit !!!!ONLY TOKEN & NAME!!!
        $scope.card = {}
        $scope.card.stripe_token = response.id;
        $scope.card.full_name = response.card.name

        //handle success or error
        Card.save( {}, $scope.card, function (data) {
            //console.log(data.card)
            $scope.cards.push(data.card);
            $scope.toggleNewCardForm();
            var message = 'Card added successfully.'
            console.log(message);
            navigator.notification.alert(message, null, 'Alert', 'OK');
          }, function() {
            var message = 'There was a problem adding your card. Please try again.'
            console.log(message);
            navigator.notification.alert(message, null, 'Alert', 'OK');
          }
        );
      };
    };

    $scope.createRecipient = function() {
      $rootScope.showLoading();
      Stripe.bankAccount.createToken({
        name: $scope.new_recipient.name,
        country: "US",
        type: "individual",
        routingNumber: $scope.new_recipient.routing,
        accountNumber: $scope.new_recipient.account_number,
      }, stripeRecipientResponseHandler);
    };

    //get back token or handle error
    var stripeRecipientResponseHandler = function(status, response) {
      $rootScope.hideLoading();
      if (response.error) {
        var message = response.error.message
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      } else {
        //submit !!!!ONLY THE TOKEN!!!
        $scope.recipient = {}
        $scope.recipient.stripe_recipient_token = response.id;
        //handle success or error
        Recipient.save( {}, $scope.recipient, function (data) {
            console.log(data.recipient);
            $scope.recipient = data.recipient
            $scope.current_user.stripe_recipient_id = data.stripe_recipient_id
            localStorage.setItem('current_user', JSON.stringify($scope.current_user));
            
            $scope.show_recipient_form = false
            var message = 'Bank Account added successfully.'
            console.log(message);
            navigator.notification.alert(message, null, 'Alert', 'OK');
          }, function() {
            var message = 'There was a problem adding your bank acccount. Please try again.'
            console.log(message);
            navigator.notification.alert(message, null, 'Alert', 'OK');
          }
        );
      };
    };

  });