'use strict';

angular.module('coride')
  .controller('NewRequestCtrl', function ($scope, $location, $ionicModal, Request) {
    $scope.back = function() {
      window.history.back();
    };
    
    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))
    $scope.request = {
      'starting_point': JSON.parse(localStorage.getItem("current_city")).name,
      'leaving_around': "Whenever",
      'return_request_leaving_around': "Whenever"
    }

    $scope.roundTrip = true;

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
      $scope.request.leaving_at_date = model;
      $scope.returnMinDate = $scope.request.leaving_at_date; 
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
    };
    $scope.closeReturnDateModal = function(model) {
      $scope.returnDateModal.hide();
      $scope.request.return_request_leaving_at_date = model;
    };
    
    $scope.createRequest = function() {
      if ($scope.request.leaving_at_date == null) {
        alert("Date must have a value");
        return false;
      }
      Request.save({}, $scope.request, function () {
        $location.path('/tab/user-tab');
        var message = 'Request posted successfully.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      }, function(data) {
        var message = 'There was a problem posting your Coride Request Alert. Please try again.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      });
    };
  })

  .controller('RequestDetailsCtrl', function ($scope, $rootScope, $location, $stateParams, Request) {
    $rootScope.barClass = "bar-positive"

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));

    $scope.back = function() {
      $location.path("/tab/trips/" + $scope.starting_point.id + "/" + $scope.destination.id)
    };

    var editRequest = function() {
      $location.path("/requests/" + $stateParams.requestId + "/edit")
    };
    var newTrip = function() {
      $location.url("/trips/new");
    }

    $scope.$on('mapInitialized', function(event, map) {
      $scope.map = map;
    });

    var navButtonCtrl = function() {
      var navbuttons = {};
      var banner = {};
      if ($scope.current_user.confirmed) {
        if ($scope.current_user.profile_picture_url != "https://s3.amazonaws.com/coride/defaults/upload_profile_pic.png") {
          if ($scope.request.current_user) {
            navbuttons.right = {
              title: "Edit",
              click: editRequest
            }
          } else {
            navbuttons.right = {
              title: "Coride",
              click: newTrip
            };
          }
        } else {
          banner = {
            text: "Add Profile Pic to Post Corides",
            icon: "ion-images",
            click: function() { $location.url("/users/edit"); }
          };
        }
      } else {
        banner = {
          text: "Confirm Email to Post Corides",
          icon: "ion-email",
          click: function() { $rootScope.confirmEmail($scope.current_user); }
        };
      }
      $scope.navbuttons = navbuttons;
      $scope.banner = banner;
    };
    
    Request.get({ id: $stateParams.requestId }, function(data) {
      $scope.request = data;

      navButtonCtrl();

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
  })

  .controller('RequestEditCtrl', function ($scope, $rootScope, $location, $stateParams, $ionicModal, Request) {
    $rootScope.barClass = "bar-positive"

    $scope.editRequest = true;
    
    $scope.back = function() {
      window.history.back();
    };

    function onConfirm(buttonIndex) {
      if (buttonIndex == 2) {
        Request.delete({ id: $scope.request.id }, function() {
          $location.url("/tab/user-tab");
          var message = 'Request removed successfully.'
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);
        }, function() {
          var message = 'There was a problem removing your request. Please try again.'
          navigator.notification.alert(message, null, 'Alert', 'OK');
          console.log(message);        
        });
      }
    }
    
    $scope.delete = function() {
      navigator.notification.confirm(
        'You will no longer receive notifications for matching corides.', // message
         onConfirm,            // callback to invoke with index of button pressed
        'Cancel request?',           // title
        ['Nevermind','Confirm']     // buttonLabels
      );
    }

    $scope.minDate = new Date().format("{yyyy}-{MM}-{dd}")

    $ionicModal.fromTemplateUrl('templates/datemodal.html', 
      function(modal) {
          $scope.dateModal = modal;
      },
      { scope: $scope, 
        animation: 'slide-in-up' }
    );

    $scope.openDateModal = function() {
      $scope.modalDate = $scope.request.leaving_at_date
      $scope.dateModal.show();
    };
    $scope.closeDateModal = function(model) {
      $scope.dateModal.hide();
      $scope.request.leaving_at_date = model;
      $scope.returnMinDate = $scope.request.leaving_at_date; 
    };

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))

    $scope.request = Request.get({ id: $stateParams.requestId }, function() {
      $scope.request.starting_point = $scope.request.starting_point.name
      $scope.request.destination = $scope.request.destination.name

      // SET DATE
      var d = Date.create($scope.request.leaving_at_date).format("{yyyy}-{MM}-{dd}")
      $scope.request.leaving_at_date = d;
    });

    $scope.roundTrip = true;
    
    $scope.updateRequest = function() {
      if ($scope.request.leaving_at_date == null) {
        alert("Date must have a value");
        return false;
      }
      Request.update({}, $scope.request, function () {
        $location.path('/tab/user-tab');
        
        var message = 'Request updated successfully.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      }, function(data) {
        var message = 'There was a problem posting your Coride Request Alert. Please try again.'
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      });
    };
  });