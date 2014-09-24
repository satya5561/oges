'use strict';

angular.module('coride')

  .controller('ChatRoomIndexCtrl', function ($rootScope, $scope, ChatRoom) {
    $rootScope.barClass = "bar-positive";

    var chatCache = localStorage.chat_rooms || null;

    if (chatCache !== null) {
      $scope.chat_rooms = JSON.parse(chatCache);
    }

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"));

    ChatRoom.query({}, {}, function(data) { 
      if (JSON.stringify(data) !== chatCache) {
        $scope.chat_rooms = data;
        localStorage.chat_rooms = JSON.stringify($scope.chat_rooms);
        //console.log(data);
      }
    });
  })

  .controller('ChatRoomDetailsCtrl', function ($rootScope, $scope, $stateParams, $ionicScrollDelegate, $ionicPlatform, ChatRoom, Trip, Message, $location, HOST, WEBSOCKETS) {
    $rootScope.barClass = "bar-positive";

    //reload page upon resuming the app
    document.addEventListener("resume", onResume, false);
    function onResume() {
      getChatRoom();
    }

    $scope.back = function() {
      window.history.back();
    };
    
    $scope.newBooking = function() {
      $location.path('/' + $scope.trip.id + '/booking/new');
    };

    $scope.confirmBooking = function() {
      ChatRoom.confirm({}, { id: $scope.chat_room.id }, 
        function(data) {
          window.location.reload();
        },
        function(data) {
          var message = "There was a problem confirming this booking."
          console.log(message);
          navigator.notification.alert(message, null, 'Alert', 'OK');
        }
      );
    };

    $scope.declineBooking = function() {
      ChatRoom.decline({}, { id: $scope.chat_room.id }, 
        function(data) {
          window.location.reload();
        },
        function(data) {
          var message = "There was a problem declining this booking."
          console.log(message);
          navigator.notification.alert(message, null, 'Alert', 'OK');
        }
      );
    };

    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))
    $scope.trip = Trip.get({ id: $stateParams.tripId });

    var getChatRoom = function() {
      $scope.chat_room = ChatRoom.get({ id: $stateParams.chatRoomId }, function(data) {
        $ionicScrollDelegate.scrollBottom(true);
        $scope.message = {
          'content': ''
        };

        var dispatcher = new WebSocketRails(WEBSOCKETS);
        dispatcher.on_open = function(data) {
          // console.log('Connection has been established: ', data);
          // You can trigger new server events inside this callback if you wish.
        }
        $scope.submit = function() {
          $scope.message.chat_room_id = $scope.chat_room.id
          $scope.message.author_id = $scope.current_user.id
          // dispatcher.trigger('messages.create', $scope.message);
          var message = angular.copy($scope.message)
          $scope.message.content = ""
          Message.save({}, message, function (data){
            
          }, function() {
            var message = 'There was an error. Please check your connection and try again.'
            navigator.notification.alert(message, null, 'Alert', 'OK');
            console.log(message);
          });
        };

        var channel = dispatcher.subscribe("chat_room_" + $scope.chat_room.id);
        channel.bind('new_message', function(data) {
          var data = angular.fromJson(data)
          // console.log(data);
          $scope.$apply(function(){
            $scope.chat_room.messages.push({
              id: data.message.id,
              content: data.message.content,
              user: {
                id: data.user.id,
                name: data.user.name,
                profile_picture_url: data.user.profile_picture_url
              },
              created_at_ago: "less than a minute"
            });
            $ionicScrollDelegate.scrollBottom(true);
          });
        });
      });
    }

    getChatRoom();

    // $scope.driverDetails = function () {
    //   $location.path("/users/" + $scope.trip.user.id);
    // };
  });