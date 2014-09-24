'use strict';
angular.module('coride')
  .controller('DestinationIndexCtrl', function ($templateCache, $scope, $rootScope, $stateParams, $ionicPlatform, $location, $ionicModal, City, User, Destination, Trip, PushNotification, Device) {  
    $rootScope.barClass = "bar-positive";
    // $templateCache.removeAll();
    $rootScope.hideLoading();
    
    //reload page upon resuming the app
    document.addEventListener("resume", onResume, false);
    function onResume() {
      getDestinations();
    }

    var newRequest = function() {
      $location.url("/requests/new");
    }
    var newTrip = function() {
      $location.url("/trips/new");
    }
    var newCar = function() {
      $location.url("/why-drive");
    }

    var navButtonCtrl = function() {
      var navbuttons = { right: {}, left: {} };
      var banner = {};
      if ($scope.current_user.confirmed) {
        if ($scope.current_user.profile_picture_url != "https://s3.amazonaws.com/coride/defaults/upload_profile_pic.png") {
          navbuttons.left.title = "Request";
          navbuttons.left.click = newRequest;
          if ($scope.current_user.cars) {
            navbuttons.right.title = "Coride";
            navbuttons.right.click = newTrip;
          } else {
            navbuttons.right.title = "Add Car";
            navbuttons.right.click = newCar;
          }
        } else {
          banner.text = "Add Profile Pic to Post Corides";
          banner.icon = "ion-images";
          banner.click = function() { $location.url("/users/edit"); };
          if (!$scope.current_user.cars) {
            navbuttons.right.title = "Add Car";
            navbuttons.right.click = newCar;
          }
        }
      } else {
        banner.text = "Confirm Email to Post Corides";
        banner.icon = "ion-email";
        banner.click = function() { $rootScope.confirmEmail($scope.current_user); };
        if (!$scope.current_user.cars) {
          navbuttons.right.title = "Add Car";
          navbuttons.right.click = newCar;
        }
      }
      $scope.navbuttons = navbuttons;
      $scope.banner = banner;
    }
    
    var clearMarkers = function(markerArr) {
      for (var i = 0; i < markerArr.length; i++ ) {
        markerArr[i].setMap(null);
      }
      markerArr = [];
    };

    var originMarkers = [];
    var destMarkers = [];
    var conditions;

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));

    if ($scope.user) {
      navButtonCtrl();
    }

    var posCache = JSON.parse(localStorage.pos || null);
    
    if (posCache === null) {
      posCache = { //Initialize map with center on madison when first logging in
        "latitude": 43.0667,
        "longitude": -89.4000
      };
    }

    var cityCache = localStorage.current_city || null;

    if (cityCache !== null) {
      $scope.current_city = JSON.parse(cityCache);

      $scope.headerTitle = $scope.current_city.name

      $scope.filter = {
        starting_point: $scope.current_city.name,
        leaving_around: "Whenever"
      };
    }

    var destinationCache = localStorage.destinations || null;

    if (destinationCache !== null) {
      $scope.destinations = JSON.parse(destinationCache);

      angular.forEach($scope.destinations, function(value, key) {
        destMarkers.push(new google.maps.Marker({
          position: new google.maps.LatLng(value.lat, value.lng),
          map: $scope.map,
          title: value.name,
          icon: "img/destination_icon.png",
          optimized: false
        }));
      });
    } else {
      $rootScope.showLoading();
    }

    $scope.$on('mapInitialized', function(event, map) {
      $scope.map = map;
      var SPLatLng = new google.maps.LatLng(posCache.latitude, posCache.longitude);
      map.setCenter(SPLatLng);

      originMarkers.push(new google.maps.Marker({
          position: SPLatLng,
          //title: $scope.current_city.name,
          map: $scope.map,
          icon: "img/starting_point_icon.png",
          optimized: false
      }));

      angular.forEach($scope.destinations, function(value, key) {
        destMarkers.push(new google.maps.Marker({
          position: new google.maps.LatLng(value.lat, value.lng),
          map: $scope.map,
          title: value.name,
          icon: "img/destination_icon.png",
          optimized: false
        }));
      });
    });

    // navigator.geolocation.getCurrentPosition(function(pos) {
    //   console.log('geolocation worked')
    //   navigator.notification.alert("worked", null, 'Alert', 'OK');
    // }, function(error) {
    //   console.log("error w geolocation")
    //   navigator.notification.alert("geolocation did not work", null, 'Alert', 'OK');
    // }, {timeout:5000, enableHighAccuracy: false}); //maximumAge:600000,

    var getDestinations = function() {
      navigator.geolocation.getCurrentPosition(function(pos) {
        if (posCache && (cityCache !== null)) {
          var cached_lat = Number((posCache.latitude).toFixed(2));
          var cached_lng = Number((posCache.longitude).toFixed(2));
          var pos_lat = Number((pos.coords.latitude).toFixed(2));
          var pos_lng = Number((pos.coords.longitude).toFixed(2));

          if (cached_lat == pos_lat && cached_lng == pos_lng) {
            conditions = { current_city_id: JSON.parse(cityCache).id };
          } else {
            localStorage.pos = JSON.stringify(pos.coords);
            conditions = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          }
        } else {
          localStorage.pos = JSON.stringify(pos.coords);
          conditions = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        }

        City.get(conditions, function(data) {
          if (cityCache !== JSON.stringify(data.current_city)) {
            localStorage.current_city = JSON.stringify(data.current_city);

            clearMarkers(originMarkers);

            var SPLatLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            $scope.map.setCenter(SPLatLng);

            $scope.current_city = data.current_city;

            $scope.headerTitle = $scope.current_city.name

            $scope.filter = {
              starting_point: $scope.current_city.name,
              leaving_around: "Whenever"
            };

            originMarkers.push(new google.maps.Marker({
              position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
              title: $scope.current_city.name,
              map: $scope.map,
              icon: "img/starting_point_icon.png",
              optimized: false
            }));
          }

          if (destinationCache !== JSON.stringify(data.destinations)) {
            localStorage.destinations = JSON.stringify(data.destinations);

            clearMarkers(destMarkers);

            $scope.destinations = data.destinations;

            angular.forEach($scope.destinations, function(value, key) {
              destMarkers.push(new google.maps.Marker({
                position: new google.maps.LatLng(value.lat, value.lng),
                map: $scope.map,
                title: value.name,
                icon: "img/destination_icon.png",
                optimized: false
              }));
            });
          }
        });

        $rootScope.hideLoading();
      }, function(error) {
        $rootScope.hideLoading();
        var message = 'Unable to find city: ' + error.message
        navigator.notification.alert(message, null, 'Alert', 'OK');
        console.log(message);
      }, {timeout:5000, enableHighAccuracy: false});

      User.get({ id: localStorage.getItem("coride_auth_token") }, function(data) {
        localStorage.setItem('current_user', JSON.stringify(data));
        $scope.current_user = data
        navButtonCtrl();
      });
    }

    getDestinations();

    // FILTER MODAL CODE
    $ionicModal.fromTemplateUrl('trip-filter-modal.html', function (modal) {

      $scope.modal = modal;

      function onConfirm(buttonIndex) {
        if (buttonIndex == 2) {
          $location.path("/requests/new"); 
          $scope.modal.hide();
        }
      }

      $scope.minDate = new Date().format("{yyyy}-{MM}-{dd}")
      $ionicModal.fromTemplateUrl('templates/filter-datemodal.html', 
        function(modal) {
          $scope.filterDateModal = modal;
        },
        { scope: $scope, 
          animation: 'slide-in-up' }
      );

      $scope.openFilterDateModal = function() {
        $scope.filterDateModal.show();
      };
      $scope.closeFilterDateModal = function(model) {
        $scope.filterDateModal.hide();
        $scope.filter.happening_on = model;
      };

      $scope.filterTrips = function() {
        $rootScope.showLoading();
        if (!$scope.filter.destination) {
          Destination.query({ starting_point_name: $scope.filter.starting_point }, function(data) {
            $scope.current_city = data.current_city;
            $scope.headerTitle = $scope.current_city.name;
            $scope.destinations = data.destinations;
            
            // remove previous markers
            clearMarkers(originMarkers);
            clearMarkers(destMarkers);

            // create starting_point and dest markers
            // set center for the map map.setCenter(var)
            // var = new google.maps.LatLng(lat,lng);
            originMarkers.push(new google.maps.Marker({
                position: new google.maps.LatLng(data.current_city.lat,data.current_city.lng),
                title: $scope.current_city.name,
                map: $scope.map,
                icon: "img/starting_point_icon.png",
                optimized: false
            }));

            angular.forEach($scope.destinations, function(value, key) {
              destMarkers.push(new google.maps.Marker({
                position: new google.maps.LatLng(value.lat, value.lng),
                map: $scope.map,
                title: value.name,
                icon: "img/destination_icon.png",
                optimized: false
              }));
            
            });
            var SPLatLng = new google.maps.LatLng(data.current_city.lat,data.current_city.lng);
            $scope.map.setCenter(SPLatLng);
            console.log("close modal")
            $scope.modal.hide();
          });
        } else {
          Trip.filter($scope.filter, function (data) {
            console.log(data);
            if (data.length == 0) {
              navigator.notification.confirm(
                "Create a coride request alert?", // message
                onConfirm,            // callback to invoke with index of button pressed
                'No Matching Coride Found',           // title
                ['Cancel','Yes']     // buttonLabels
              ); 
            } else {
              //$location.path("/tab/trips/" + data.starting_point_id + "/" + data.destination_id);
              //$scope.modal.hide();
              $scope.trips = data;
            }
          }, function (error) {
              console.log(error);
              alert(error.data.error);
          });
        }
        $rootScope.hideLoading();
      }
    }, {
      scope: $scope,  /// GIVE THE MODAL ACCESS TO PARENT SCOPE
      animation: 'slide-in-up', //'slide-left-right', 'slide-in-up', 'slide-right-left'
      focusFirstInput: true
    });   

    $scope.showModal = function() {
      $scope.modal.show();
    }
    $scope.hideModal = function() {
      $scope.modal.hide();
    }

    $ionicPlatform.ready(function() {
      if (localStorage.getItem("device") == null) {
        PushNotification.register();        
      } 
    });
  });

  // .controller("FilterModalCtrl", function ($scope, Destination) {

  // });

//41.8781, -87.6298
