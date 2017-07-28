/*
Create By  : Tony Jacob
Description: Controller for DoctorSelectionDialog module
*/
'use strict';
 
//console.log('From DoctorSelectionDialog-controllers.js');
angular.module('DoctorSelectionDialog')
 
.controller('DoctorSelectionDialogController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', 'UtilityService',
    function ($scope, $rootScope, $location, AuthenticationService, UtilityService) {
		//console.log("Inside DoctorSelectionDialogController");
		
		var usrType = $rootScope.globals.currentUser.UsrType;
		
		$scope.docIDList = null;
	
		$scope.formLoad = function () {
			
			return;
		};
		
		$scope.proceedWithSelectedDoctor = function () {
			
			var currentUser = $rootScope.globals.currentUser;
			currentUser.DocID = $scope.selectedDocID;
			AuthenticationService.SetCredentialsAndUserInfo(currentUser);
			
			$location.path('/bookConsultation');
			
			return;
		};
		
		//Instance variables used : doctorUser,normalUser
		//Global variables used : None
		var initVariables = function()
        {
			if(usrType === 'D')
			{
				//Note : Control should never come here
			}
			else if(usrType === 'S')	//staff user
			{
				alert("Not implemented");
			}
			else if(usrType === 'N')	//normal user
			{
				$scope.docIDList = UtilityService.normalUser.DocIDList;
			}
			
			return;
		};
		
		var init = function () 
		{
			initVariables();
			
            return;
        };
		
		init();
			
    }]);