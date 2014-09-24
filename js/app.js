angular.module('coride', ['ionic', 'ngResource', 'ngMap', 'pickadate', 'ui.bootstrap', 'coride.services', 'coride.interceptors', 'coride.directives' ])

// .constant('HOST', 'http://localhost:3000/api/v1') //DEV
// .constant('WEBSOCKETS', 'localhost:3000/websocket') //DEV

.constant('HOST', 'https://www.coride.co/api/v1') //PRODUCTION
.constant('WEBSOCKETS', 'coride.co/websocket') //PRODUCTION

.run(function ($rootScope, $ionicLoading, $timeout, $ionicPopup, Confirmation) {
  $rootScope.showLoading = function() {
    $ionicLoading.show({
      template: "<i class='icon ion-loading-c'></i>"
    });
  };

  $rootScope.hideLoading = function() {
    $timeout(function() {
      $ionicLoading.hide();
    }, 1000)
  };

  $rootScope.confirmEmail = function(user) {
    $rootScope.user = user;
    var emailPopup = $ionicPopup.show({
      template: '<input type="email" ng-model="user.email">',
      title: 'Resend Confirmation Email',
      scope: $rootScope,
      buttons: [
        { 
          text: 'Cancel',
          onTap: function(e) {
          } 
        },
        {
          text: '<b>Submit</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$rootScope.user.email) {
              var message = "Please enter an email address"
              console.log(message);
              navigator.notification.alert(message, null, 'Alert', 'OK');
              e.preventDefault();
            } else {
              return $rootScope.user.email;
            }
          }
        },
      ]
    });

    emailPopup.then(function(res) {
      if (res) {
        Confirmation.save({}, { email: res }, function(res) {
          cordova.plugins.Keyboard.close();
          $rootScope.hideLoading();
          console.log(res.message);
          navigator.notification.alert(res.message, null, 'Alert', 'OK');
        }, function(error) {
          cordova.plugins.Keyboard.close();
          $rootScope.hideLoading();
          var message = "There was a problem resending. Please try again."
          console.log(message);
          navigator.notification.alert(message, null, 'Alert', 'OK');
        });
      }
    });
  }
})

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('how-it-works', {
      url: '/how-it-works',
      templateUrl: 'templates/how-it-works.html',
      controller: 'TutorialCtrl'
    })

    .state('why-drive', {
      url: '/why-drive',
      templateUrl: 'templates/why-drive.html',
      controller: 'TutorialCtrl'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'SessionsCtrl'
    })

    .state('password-new', {
      url: '/password/new',
      templateUrl: 'templates/password-new.html',
      controller: 'NewPasswordCtrl'
    })

    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegistrationCtrl'
    })

    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    .state('tab.destination-index', {
      url: '/destinations',
      views: {
        'destinations-tab': {
          templateUrl: 'templates/destination-index.html',
          controller: 'DestinationIndexCtrl'
        }
      }
    })

    .state('tab.trip-index', {
      url: '/trips/:startingPointId/:destinationId',
      views: {
        'destinations-tab': {
          templateUrl: 'templates/trip-index.html',
          controller:   'TripIndexCtrl'
        }
      }
    })

    .state('tab.trip-details', {
      url: '/trips/:tripId',
      views: {
        'destinations-tab': {
          templateUrl: 'templates/trip-details.html',
          controller:   'TripDetailsCtrl'
        }
      }
    })

    .state('tab.chat-room-index', {
      url: '/chat_rooms',
      views: {
        'chat-rooms-tab': {
          templateUrl: 'templates/chat-room-index.html',
          controller: 'ChatRoomIndexCtrl'
        }
      }
    })

    .state('tab.share', {
      url: '/share',
      views: {
        'share-tab': {
          templateUrl: 'templates/share.html',
          controller: 'ShareTabCtrl'
        }
      }
    })

    .state('tab.payments', {
      url: '/payments',
      views: {
        'payments-tab': {
          templateUrl: 'templates/payments.html',
          controller: 'PaymentTabCtrl'
        }
      }
    })

    .state('tab.user', {
      url: '/user-tab',
      views: {
        'user-tab': {
          templateUrl: 'templates/user-tab.html',
          controller: 'UserTabCtrl'
        }
      }
    })

    .state('review-new', {
      url: '/reviews/new/:revieweeId',
      templateUrl: 'templates/review-new.html',
      controller: 'NewReviewCtrl'
    })

    .state('review-details', {
      url: '/reviews/:reviewId',
      templateUrl: 'templates/review-details.html',
      controller: 'ReviewDetailsCtrl'
    })

    .state('review-index', {
      url: '/users/:userId/reviews',
      templateUrl: 'templates/review-index.html',
      controller: 'ReviewIndexCtrl'
    })

    .state('user-edit', {
      url: '/users/edit',
      templateUrl: 'templates/user-edit.html',
      controller: 'UserEditCtrl'
    })
    
    .state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })

    .state('user-settings', {
      url: '/users/settings',
      templateUrl: 'templates/user-settings.html',
      controller: 'UserSettingsCtrl'
    })

    .state('user-details', {
      url: '/users/:userId',
      templateUrl: 'templates/user-details.html',
      controller: 'UserDetailsCtrl'
    })

    .state('car-new', {
      url: '/cars/new',
      templateUrl: 'templates/car-new.html',
      controller:   'CarNewCtrl'
    })

    .state('car-details', {
      url: '/cars/:carId',
      templateUrl: 'templates/car-details.html',
      controller:   'CarDetailsCtrl'
    })

    .state('car-edit', {
      url: '/cars/:carId/edit',
      templateUrl: 'templates/car-edit.html',
      controller:   'CarEditCtrl'
    })

	  .state('trip-new', {
      url: '/trips/new',
      templateUrl: 'templates/trip-new.html',
      controller:   'NewTripCtrl'
    })

    .state('trip-edit', {
      url: '/trips/:tripId/edit',
      templateUrl: 'templates/trip-edit.html',
      controller:   'TripEditCtrl'
    })

	  .state('request-new', {
      url: '/requests/new',
      templateUrl: 'templates/request-new.html',
      controller:   'NewRequestCtrl'
    })

    .state('request-edit', {
      url: '/requests/:requestId/edit',
      templateUrl: 'templates/request-edit.html',
      controller:   'RequestEditCtrl'
    })

    .state('tab.request-details', {
      url: '/requests/:requestId',
      views: {
        'destinations-tab': {
          templateUrl: 'templates/request-details.html',
          controller:   'RequestDetailsCtrl'
        }
      }
    })

    .state('chat-room-details', {
      url: '/trips/:tripId/chat_rooms/:chatRoomId',
      templateUrl: 'templates/chat-room-details.html',
      controller:   'ChatRoomDetailsCtrl'
    })

    .state('transfer-new', {
      url: '/transfer/new',
      templateUrl: 'templates/transfer-new.html',
      controller:   'NewTransferCtrl'
    })

    .state('booking-new', {
      url: '/:tripId/booking/new',
      templateUrl: 'templates/booking-new.html',
      controller:   'NewBookingCtrl'
    })

    .state('privacy', {
      url: '/privacy',
      templateUrl: 'templates/privacy.html',
      controller: 'PrivacyCtrl'
    })

    .state('terms', {
      url: '/terms',
      templateUrl: 'templates/terms.html',
      controller: 'TermsCtrl'
    })

    .state('contact', {
      url: '/contact',
      templateUrl: 'templates/contact.html',
      controller: 'ContactCtrl'
    })

  $urlRouterProvider.otherwise('/login');

})

.filter('range', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
})

.filter('makeRange', function() {
  return function(input) {
    var lowBound, highBound;
    switch (input.length) {
    case 1:
        lowBound = 0;
        highBound = parseInt(input[0]) - 1;
        break;
    case 2:
        lowBound = parseInt(input[0]);
        highBound = parseInt(input[1]);
        break;
    default:
        return input;
    }
    var result = [];
    for (var i = lowBound; i <= highBound; i++)
        result.push(i);
    return result;
  };
});

// PUSH NOTIFICATIONS
// iOS
function onNotificationAPN(event) {

  if ( event.alert ) {
    function onConfirm(buttonIndex) {
      if (buttonIndex == 2) {
        // navigator.notification.alert(event.url, null, 'Coride Alert', 'OK');
        window.location = (event.url);
      }
    }

    navigator.notification.confirm( // THIS WORKS! But won't navigate after to a location
         event.alert, // message
         onConfirm,            // callback to invoke with index of button pressed
        'Coride Alert',           // title
        ['Ignore','OK']     // buttonLabels
    );
  }

  if ( event.sound ) {
    var snd = new Media(event.sound);
    snd.play();
  }

  // WHEN THIS IS COMMENTED IN THE ALERTS DO NOT WORK
  // if ( event.url ) { // or url
  //   window.location = (event.url);
  // }

  //navigator.notification.beep(1); // 'beep.wav' in www folder

  // if ( event.badge ) {
  //   pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
  // }
}

// Android and Amazon Fire OS
function onNotificationGCM(e) {
  console.log("GCM Event Received");
  console.log(event);

  switch( e.event ) {
    
    case 'registered':
      if ( e.regid.length > 0 ) {
        // Already registering id in response from register() method in PushNotification service
        console.log("regID = " + e.regid);
        var PushNotificationService = angular.element(document.querySelector('[ng-app]')).injector().get('PushNotification');
        PushNotificationService.registerID(e.regid);
      }
    break;

    case 'message':
      console.log(e);

      var my_media = new Media("/android_asset/www/"+ e.soundname);
      my_media.play();
      
      if ( e.foreground ) {
        if (window.location.href != "chat_room") { // TODO
          alert(e.payload.data.message);
        }
      } else { 
        if ( e.coldstart ) { 
          // Do nothing bc app was closed
        } else { 
          window.location.assign(e.payload.data.url); // navigate to url upon swipe
        }
      }
    break;

    case 'error':
      console.log("GCM Error")
    break;

    default:
      console.log("Unknown GCM event received")
    break;
  }
}

// .filter('relativets', function() {
//   return function(value) {
//     var now = new Date();
//     var diff = now - value;

//     // ms units
//     var second = 1000;
//     var minute = second * 60;
//     var hour = minute * 60;
//     var day = hour * 24;
//     var year =  day * 365;
//     var month = day * 30;

//     var unit = day;
//     var unitStr = 'd';
//     if(diff > year) {
//       unit = year;
//       unitStr = 'y';
//     } else if(diff > day) {
//       unit = day;
//       unitStr = 'd';
//     } else if(diff > hour) {
//       unit = hour;
//       unitStr = 'h';
//     } else if(diff > minute) {
//       unit = minute;
//       unitStr = 'm';
//     } else {
//       unit = second;
//       unitStr = 's';
//     }

//     var amt = Math.ceil(diff / unit);
//     return amt + '' + unitStr;
//   }
// });