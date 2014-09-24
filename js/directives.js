'use strict';

angular.module('coride.directives', ['coride.services'])
	.directive('autocomplete', ['$compile', 'City', function ($compile, City, $parse, $http, $sce, $timeout) {
		return {
			restrict: "E",
			scope: {
				field: '=',
				content: '@',
				icon: '@',
        label: '@'
			},
			template: '<label class="item item-input"><span class="input-label">{{label}}</span><input type="text" ng-model="field" placeholder={{content}} required></label><div class="list" ng-show=toShow><div class="item" ng-repeat="name in names" ng-click="autoComplete(name)" ><img ng-src={{icon}} width="11px"/> {{name.label}}</div></div>',
			link: function(scope, elem, attrs) {
				scope.$watch('field', function() {
          if (scope.field) {
            if (scope.field.length >= 3 && scope.field.length < 6 && !scope.match) {
              scope.toShow = true;
              scope.names = City.city_names({term: scope.field});
            }
            else {
              scope.names = "";
              scope.toShow = false;
              scope.match = false;
            }
          }
        });
        
        scope.autoComplete = function(name) {
					scope.field = name.label;
					scope.match = true;
				};
			}
		}
	}])

	.directive("fileread", [function () {
    return {
      scope: {
          fileread: "="
      },
      link: function (scope, element, attributes) {
        element.bind("change", function (changeEvent) {
          var reader = new FileReader();
          reader.onload = function (loadEvent) {
            scope.$apply(function () {
              scope.fileread = loadEvent.target.result;
            });
          }
          reader.readAsDataURL(changeEvent.target.files[0]);
        });
      }
    }
	}])

  .directive('currency', function () {
    return {
      require: 'ngModel',
      link: function(elem, $scope, attrs, ngModel){
        ngModel.$formatters.push(function(val){
          if (val) {
            return '$' + val
          }
        });
        ngModel.$parsers.push(function(val){
          if (val) {
            return val.replace(/^\$/, '')
          }
        });
      }
    }
  })
  
  .directive('isFocused', function($timeout) {
    return {
      scope: { trigger: '@isFocused' },
      link: function(scope, element) {
        scope.$watch('trigger', function(value) {
          if(value === "true") {
            $timeout(function() {
              element[0].focus();

              element.on('blur', function() {
                element[0].focus();
              });
            });
          }

        });
      }
    };
  })

  .directive('titleCase', function(){ //TODO DOES NOT WORK http://stackoverflow.com/questions/14419651/angularjs-filters-on-ng-model-in-an-input
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        modelCtrl.$parsers.push(function (inputValue) {
          if (inputValue) {
            var words = inputValue.split(' ');
            for (var i = 0; i < words.length; i++) {
                words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
            }
            var transformedInput = words.join(' ');
            if (transformedInput!=inputValue) {
              modelCtrl.$setViewValue(transformedInput);
              modelCtrl.$render();
            }         

            return transformedInput;     
          }    
        });
      }
    };
  });
