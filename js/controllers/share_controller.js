'use strict';

angular.module('coride')
  .controller('ShareTabCtrl', function ($rootScope, $scope){
    $rootScope.barClass = "bar-clear";
    $scope.current_user = JSON.parse(localStorage.getItem("current_user"))

    $scope.inviteFriends = function() {
      window.plugins.socialsharing.share('Share corides on Coride.co with me!', null, null, 'http://www.coride.co')
    }

    $scope.getReviews = function() {
      window.plugins.socialsharing.share('Help improve my profile on Coride.co by writing me a reference. Thanks!', null, null, 'https://www.coride.co/reviews/new?reviewee_id=' + $scope.current_user.id)
    }

    $scope.loveCoride = function() {
      navigator.notification.confirm(
        'Tell the world!',          // message
         rateApp,                   // callback to invoke with index of button pressed
        'Love the Coride App?',     // title
        ['No, thanks.', 'Yes!']     // buttonLabels
      );
    }

    function rateApp(buttonIndex) {
      if (buttonIndex == 2) {
        if (device.platform == "iOS") {
          //window.open('itms-apps://itunes.apple.com/us/app/domainsicle-domain-name-search/id511364723?ls=1&mt=8'); // or itms://
          window.open('https://www.coride.co/ios', '_blank', 'location=yes');
        } else if (device.platform == "Android") {
          //window.open('market://details?id=<package_name>');
          window.open('https://www.coride.co/android', '_blank', 'location=yes');
        }
      }
    }

  });