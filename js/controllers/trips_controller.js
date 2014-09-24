'use strict';

angular.module('coride')
  .controller('TripIndexCtrl', function ($rootScope, $scope, $stateParams, $filter, $location, Trip, City, Request) {
    $rootScope.barClass = "bar-positive"
    
    $scope.back = function() {
      $location.path('/tab/destinations');
    }
    var newRequest = function() {
      $location.url("/requests/new");
    }

    var navButtonCtrl = function() {
      var navbuttons = { right: {}, left: {} };
      var banner = {};
      if ($scope.current_user.confirmed) {
        if ($scope.current_user.profile_picture_url != "https://s3.amazonaws.com/coride/defaults/upload_profile_pic.png") {
          navbuttons.right.title = "Request";
          navbuttons.right.click = newRequest;
        } else {
          banner.text = "Add Profile Pic to Post Corides";
          banner.icon = "ion-images";
          banner.click = function() { $location.url("/users/edit"); };
        }
      } else {
        banner.text = "Confirm Email to Post Corides";
        banner.icon = "ion-email";
        banner.click = function() { $rootScope.confirmEmail($scope.current_user); };
      }
      $scope.navbuttons = navbuttons;
      $scope.banner = banner;
    };

    $scope.$on('mapInitialized', function(event, map) {
      $scope.map = map;
    });

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));

    if ($scope.current_user) {
      navButtonCtrl();
    }

    Trip.query({'starting_point_id': $stateParams.startingPointId, 'destination_id': $stateParams.destinationId }, function(data) {
      $scope.trips = data;
      $scope.corides = $filter('filter')(data, { is_a_request: 'false'});
      $scope.requests = $filter('filter')(data, { is_a_request: 'true'});
      
      $scope.starting_point = data[0].starting_point;
      $scope.destination = data[0].destination;

      var SPLatLng = new google.maps.LatLng($scope.starting_point.lat, $scope.starting_point.lng);
      var DLatLng = new google.maps.LatLng($scope.destination.lat, $scope.destination.lng);

      $scope.map.setCenter(SPLatLng);

      var directionsDisplay;
      var directionsService = new google.maps.DirectionsService();

      var request = {
        origin: SPLatLng,
        destination: DLatLng,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
        }
      });

      directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
      directionsDisplay.setMap($scope.map);

      var starting_point_marker = new google.maps.Marker({
        position: new google.maps.LatLng($scope.starting_point.lat, $scope.starting_point.lng),
        title: $scope.starting_point.name,
        map: $scope.map,
        icon: "img/starting_point_icon.png",
        optimized: false
      });
      
      var destination_marker = new google.maps.Marker({
        position: new google.maps.LatLng($scope.destination.lat, $scope.destination.lng),
        title: $scope.destination.name,
        map: $scope.map,
        icon: "img/destination_icon.png",
        optimized: false
      });
    });  
  })

  .controller('TripDetailsCtrl', function ($scope, $stateParams, $location, Trip, ChatRoom, $rootScope) {
    $rootScope.barClass = "bar-positive"

	  $scope.back = function() {
      $location.path("/tab/trips/" + $scope.trip.starting_point_id + "/" + $scope.trip.destination_id);
    };
    var newBooking = function() {
      $location.path('/' + $scope.trip.id + '/booking/new');
    };

    var shareTrip = function() {
      window.plugins.socialsharing.share('Ride Offered: from ' + $scope.trip.destination.name + ' to ' + $scope.trip.starting_point.name + ' on ' + $scope.trip.leaving_at_date + ' at ' + $scope.trip.leaving_at_time + ', ' + $scope.trip.price + ', ' + $scope.trip.seats_available + ' Seats left.', null, null, 'https://www.coride.co/trips/' + $scope.trip.id)
    };

    var chatBtnCtrl = function() {
      if (!$scope.trip.chat_rooms && !$scope.trip.current_user && $scope.current_user.confirmed) { 
        if ($scope.current_user.profile_picture_url != "https://s3.amazonaws.com/coride/defaults/upload_profile_pic.png") {
          $scope.showChatBtn = true;
        }
      } 
    }

    var navButtonCtrl = function() {
      var navbuttons = {};
      var banner = {};
      if ($scope.current_user.confirmed) {
        if ($scope.current_user.profile_picture_url != "https://s3.amazonaws.com/coride/defaults/upload_profile_pic.png") {
          if ($scope.trip.current_user) {
            navbuttons.right = {
              icon: "ion-share",
              click: shareTrip
            }
          } else if (!$scope.trip.status) {
            navbuttons.right = {
              title: "Book",
              click: newBooking
            };
          }
        } else {
          banner = {
            text: "Add Profile Pic to Book Corides",
            icon: "ion-images",
            click: function() { $location.url("/users/edit"); }
          };
        }
      } else {
        banner = {
          text: "Confirm Email to Book Corides",
          icon: "ion-email",
          click: function() { $rootScope.confirmEmail($scope.current_user); }
        };
      }
      $scope.navbuttons = navbuttons;
      $scope.banner = banner;
    };

    $scope.$on('mapInitialized', function(event, map) {
      $scope.map = map;
    });

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));

    // TODO Error handling
    Trip.get({ id: $stateParams.tripId }, function(data) {
      $scope.trip = data;

      if ($scope.current_user) {
        navButtonCtrl();
        chatBtnCtrl();
      }

      $scope.starting_point = data.starting_point;
      $scope.destination = data.destination;

      var SPLatLng = new google.maps.LatLng($scope.starting_point.lat, $scope.starting_point.lng);
      var DLatLng = new google.maps.LatLng($scope.destination.lat, $scope.destination.lng);

      $scope.map.setCenter(SPLatLng);

      var directionsDisplay;
      var directionsService = new google.maps.DirectionsService();

      var request = {
        origin: SPLatLng,
        destination: DLatLng,
        travelMode: google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
        }
      });

      directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
      directionsDisplay.setMap($scope.map);

      var starting_point_marker = new google.maps.Marker({
        position: new google.maps.LatLng($scope.starting_point.lat, $scope.starting_point.lng),
        title: $scope.starting_point.name,
        map: $scope.map,
        icon: "img/starting_point_icon.png",
        optimized: false
      });
      
      var destination_marker = new google.maps.Marker({
        position: new google.maps.LatLng($scope.destination.lat, $scope.destination.lng),
        title: $scope.destination.name,
        map: $scope.map,
        icon: "img/destination_icon.png",
        optimized: false
      });
    });
	
    $scope.startChat = function () {
      ChatRoom.save({}, {'chat_room': {'trip_id': $scope.trip.id}}, function(data) {
        $location.path("/trips/" + $scope.trip.id + "/chat_rooms/" + data.id);
      });
    };

    $scope.driverDetails = function () {
      $location.path("/users/" + $scope.trip.user.id);
    };
  })

  .controller('NewTripCtrl', function ($scope, $rootScope, $stateParams, $location, $ionicModal, Trip, $http) {
    $scope.back = function() {
      window.history.back();
    }

    var current_city_name = JSON.parse(localStorage.getItem("current_city")).name || null;
    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));

    $scope.roundTripCtrl = function() {
      if ($scope.trip.round_trip == false) {
        $scope.trip.return_trip_leaving_at_date = null;
        $scope.trip.return_trip_leaving_at_time = null;
      }
    }

    $scope.createTrip = function() {
      if ($scope.trip.leaving_at_date == null) {
        var message = "Leaving date must have a value";
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
        return false;
      }

      if ($scope.trip.round_trip && $scope.trip.return_trip_leaving_at_date == null) {
        var message = "Return date must have a value";
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
        return false;
      }

      $scope.trip.price_in_cents = $scope.trip.price * 100

      Trip.save({}, $scope.trip, function () {
        $location.path('/tab/user-tab');
        var message = 'Coride posted successfully.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      }, function(data) {
        var message = 'There was a problem posting your coride. Please try again.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };

    $scope.trip = {
      'price': 0.00,
      'seats_for_sale': 3,
      'starting_point': current_city_name,
      'car_id': $scope.current_user.cars[0].id,
      'round_trip': true
    };
    
    $scope.setPrice = function(val) {
      //console.log(val.$price)
      if (val.$price) {
        $scope.trip.price = parseFloat(val.$price * 1.333).toFixed(2); 
      }
    }

    // DATE AND RETURN DATE MODALS

    $scope.returnMinDate = new Date().format("{yyyy}-{MM}-{dd}")
    $scope.minDate = new Date().format("{yyyy}-{MM}-{dd}")

    $ionicModal.fromTemplateUrl('templates/datemodal.html', 
      function(modal) {
          $scope.dateModal = modal;
      },
      { scope: $scope, 
        animation: 'slide-in-up' }
    );

    $scope.openDateModal = function() {
      $scope.dateModal.show();
    };
    $scope.closeDateModal = function(model) {
      $scope.dateModal.hide();
      $scope.trip.leaving_at_date = model;
      $scope.returnMinDate = $scope.trip.leaving_at_date; 
    };

    $ionicModal.fromTemplateUrl('templates/return-datemodal.html', 
      function(modal) {
          $scope.returnDateModal = modal;
      },
      { scope: $scope, 
        animation: 'slide-in-up' }
    );

    $scope.openReturnDateModal = function() {
      $scope.returnDateModal.show();
      $scope.returnMindate = Date.create($scope.trip.leaving_at_date).format("{yyyy}-{MM}-{dd}")
    };
    $scope.closeReturnDateModal = function(model) {
      $scope.returnDateModal.hide();
      $scope.trip.return_trip_leaving_at_date = model;
    };

    // TIME SELECTOR
    var d = new Date();
    d.setHours( 12 );
    d.setMinutes( 0 );
    $scope.trip.leaving_at_time = d;
    $scope.trip.return_trip_leaving_at_time = d;
    // $scope.setMaxPrice = function() {
    // }

    // $scope.$watchCollection('[trip.starting_point, trip.destination]', function(newVals, oldVals) {
    //   // console.log(newVals)
    //   // console.log(newVals[1][-1]);
    //   // if (newVals[0].charAt[-2])
    //   if (/^.*,.\D\D/.test($scope.trip.starting_point) && /^.*,.\D\D/.test($scope.trip.destination)) {
    //     var distanceMatrix  = new google.maps.DistanceMatrixService();
    //     var distanceRequest = { origins: [$scope.trip.starting_point], destinations: [$scope.trip.destination], travelMode: google.maps.TravelMode.DRIVING, unitSystem: google.maps.UnitSystem.METRIC, avoidHighways: false, avoidTolls: false };

    //     distanceMatrix.getDistanceMatrix(distanceRequest, function(response, status) {
    //       if (status != google.maps.DistanceMatrixStatus.OK) {
    //           alert('Error was: ' + status);
    //       }
    //       else {
    //         var meters = response.rows[0].elements[0].distance.value
    //         var miles = meters/1609 
    //         var federalRate = 0.56
    //         $scope.$apply(function () {
    //           $scope.maxPrice = parseFloat(miles * federalRate).toFixed(2); 
    //         });
    //         console.log($scope.maxPrice)
    //       }
    //     });
    //   }
    // });
  })

  .controller('TripEditCtrl', function ($scope, $rootScope, $stateParams, $location, $ionicModal, Trip) {
    $scope.back = function() {
      window.history.back();
    }

    function onConfirm(buttonIndex) {
      if (buttonIndex == 2) {
        Trip.delete({ id: $scope.trip.id }, function() {
          $location.url("/tab/user-tab");
          var message = 'Coride cancelled successfully.'
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        }, function() {
          var message = 'There was a problem removing your coride. Please try again.'
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);        
        });
      }
    }

    $scope.delete = function() {
      navigator.notification.confirm(
          'Cancelling this coride will notify and refund any passengers.', // message
           onConfirm,            // callback to invoke with index of button pressed
          'Cancel coride?',           // title
          ['Nevermind', 'Confirm']     // buttonLabels
      );
    }

    $scope.editTrip = true;

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))

    // DATE AND RETURN DATE MODALS
    $scope.returnMinDate = new Date().format("{yyyy}-{MM}-{dd}")
    $scope.minDate = new Date().format("{yyyy}-{MM}-{dd}")

    $ionicModal.fromTemplateUrl('templates/datemodal.html', 
      function(modal) {
          $scope.dateModal = modal;
      },
      { scope: $scope, 
        animation: 'slide-in-up' }
    );

    $scope.openDateModal = function() {
      $scope.modalDate = $scope.trip.leaving_at_date
      $scope.dateModal.show();
    };
    $scope.closeDateModal = function(model) {
      $scope.dateModal.hide();
      $scope.trip.leaving_at_date = model;
      $scope.returnMinDate = $scope.trip.leaving_at_date; 
    };

    $scope.trip = Trip.get({ id: $stateParams.tripId }, function() {
      $scope.trip.starting_point = $scope.trip.starting_point.name
      $scope.trip.destination = $scope.trip.destination.name
      $scope.trip.price = $scope.trip.price.substring(1);
      $scope.trip.car_id = $scope.trip.car.id

      // SET DATE
      var d = Date.create($scope.trip.leaving_at_date).format("{yyyy}-{MM}-{dd}")
      $scope.trip.leaving_at_date = d;
      // SET TIME
      var t = Date.create($scope.trip.leaving_at_time)
      $scope.trip.leaving_at_time = t;

      $scope.yourPrice = parseFloat($scope.trip.price_in_cents * 0.75 / 100)
    });

    $scope.roundTrip = true

    $scope.setPrice = function(val) {
      //console.log(val.$price)
      $scope.trip.price = parseFloat(val.$price * 1.333).toFixed(2); 
    }

    $scope.updateTrip = function() {
      if ($scope.trip.leaving_at_date == null) {
        alert("Date must have a value");
        return false;
      }
      
      $scope.trip.price_in_cents = $scope.trip.price * 100
      
      Trip.update({}, $scope.trip, function () {
        $location.path('/tab/user-tab');
        var message = 'Coride updated successfully.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      }, function(data) {
        var message = 'There was an error posting your Coride. Please try again.'
        console.log(message);
        navigator.notification.alert(message, null, 'Alert', 'OK');
      });
    };

  });
