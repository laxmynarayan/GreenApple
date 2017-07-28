/*
Create By  : Tony Jacob
Description: Controller for Landing module
*/

'use strict';
 
//console.log('From landing-controllers.js');
angular.module('Landing')
 
.controller('LandingController',
    ['$scope', '$rootScope', '$location',
    function ($scope, $rootScope, $location) {
		//console.log("Inside LandingController");
		
		$scope.loggedIn = false;
		$scope.UsrType = '';
	
        $scope.menuItemClick = function (url) {

			$location.path(url);
			return;
		};
		
		$scope.formLoad = function () {
			
			return;
		};

		//Note : Copy paste from NewUserRegistration/controllers.js
		var setUserProfileInView = function ()
        {
			if(typeof $rootScope.globals.currentUser === "undefined" || ($rootScope.globals.currentUser === null) )
			{
				$scope.usrName = 'guest';
				$scope.UsrEmail = '-';
				$scope.UsrType = '-';
			} 
			else
			{
				$scope.usrName = $rootScope.globals.currentUser.usrName;
				$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
				$scope.UsrType = $rootScope.globals.currentUser.UsrType;
			}
		
            return; 
        };
		
		var setlogInfoVars = function ()
		{
			if(typeof $rootScope.globals.currentUser === "undefined" || $rootScope.globals.currentUser === null) 
				$scope.loggedIn = false; 
			else
			{
				$scope.loggedIn = true;
				$scope.UsrType = $rootScope.globals.currentUser.UsrType;
			}
			
			return;
		};
		
		var init = function () 
		{
			//Set scope variables - loggedIn, UsrType
 			setlogInfoVars();
			
			//Set user profile in view
			setUserProfileInView();
			
            return;
        };
		
		init();
			
    }]);