/*
Created By  : Tony Jacob
Description: Controller for Dashboard module
*/

'use strict';

angular.module('Dashboard')
.controller('DashboardController',
   ['$scope', '$rootScope', '$location', 'DashboardService', 'UtilityService',
   function ($scope, $rootScope, $location, DashboardService, UtilityService) {
	 
	   //console.log("Inside DashboardController");
	   var isOKToLoadForm = true;
	   var doctorID = $rootScope.globals.currentUser.DocID;
	   var usrType = $rootScope.globals.currentUser.UsrType;
	   
	   var doctorUser = null;
	   var normalUser = null;
		
       $scope.usrName = $rootScope.globals.currentUser.usrName;
       $scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
       $scope.UsrType = $rootScope.globals.currentUser.UsrType;
	   
	   $scope.p_colortype = [];
	   $scope.p_name = [];
	   $scope.p_status = [];

       //$scope.patientBookedToday = 0;
       //$scope.patientArrivedToday = 0;
       //$scope.patientSessionsToday = 0;
       //$scope.patientSessionsThisMonth = 0;
	   
       $scope.menuItemClick = function (url) {
           $location.path(url);
           return;
       };
	   
	   $scope.formLoad = function () {
			$scope.error = "";
			
			if(isOKToLoadForm)
				getAndSetDashboardParamsInView();

			return;
		};
		
		//Instance variables modified : None
		//Global variables used : UtilityService.doctorUser
		var getAndSetDashboardParamsInView = function ()
        {
			$scope.error = "";
						
			if(usrType === 'D')	//Doctor User
			{
				doctorUser = UtilityService.doctorUser;
				
				if(doctorUser == null)
				{
					isOKToLoadForm = false;
					$location.path('/login');
				}
				else
				{
					$scope.dataLoading = true;
				
					DashboardService.GetDashboardParams(doctorID)
					.then(function(response) {
						var statusInt = parseInt(response.status);
						//console.log('statusInt : ' + statusInt);
						if(statusInt == 200) {
						    //var respData = angular.toJson(response.data);

							//console.log(respData);
						    var responseData = response.data;
						   // alert(respData);
						    //$scope.patientBookedToday = responseData.NumPatientsBookedToday[0];
						    //$scope.patientArrivedToday = 2;
						    //$scope.patientSessionsToday = 3;
						    //$scope.patientSessionsThisMonth = 4;

						    $scope.patientBookedToday = responseData[0].NumPatientsBookedToday;
						    $scope.patientArrivedToday = responseData[0].NumPatientsArrivedToday;
						    $scope.patientSessionsToday = responseData[0].NumSessionsToday;
						    $scope.patientSessionsThisMonth = responseData[0].NumSessionsThisMonth;
						    //alert(respData.NumPatientsBookedToday);
							//alert($scope.patientBookedToday);
							$scope.dataLoading = false;
						} else {
							$scope.error = 'Error...'; 
							$scope.dataLoading = false;
						}
					})
					.catch(function(response) {
						console.error('Error...', response.status, response.data);
						$scope.error = 'Error...';
						$scope.dataLoading = false;
					})
					.finally(function() {
						//console.log("finally finished.");
					});
				}
			}
			else
			{
			}
	
			return;
		};
	   
	    //Instance variables used : doctorID
		//Global variables used : none
		$scope.refreshQueueBtnClick = function () {
			
			//console.log('Inside refreshQueueBtnClick()...');
			$scope.dataLoading = true;
			DashboardService.GetQueue(doctorID)
               .then(function (response) {
                   var statusInt = parseInt(response.status);
                   if (statusInt == 200) {
                       //var respData = angular.toJson(response.data);
					   //console.log(respData);

						var responseQueueData = response.data;
                        if (responseQueueData.length > 0) {
                            
							for (var i = 0; i < responseQueueData.length; i++) {

								$scope.p_name[i] = responseQueueData[i].PatientsToday;
								$scope.p_status[i] = responseQueueData[i].Status;
																
								if(responseQueueData[i].Status === 'cancelled')
								{
									$scope.p_colortype[i] = 'grey_person';
								}
								else if(responseQueueData[i].Status === 'booked')
								{
									$scope.p_colortype[i] = 'blue_person';
								}
								else if(responseQueueData[i].Status === 'arrived')
								{
									$scope.p_colortype[i] = 'pink_person';
								}
								else if(responseQueueData[i].Status === 'next')
								{
									$scope.p_colortype[i] = 'red_person';
								}
								else if(responseQueueData[i].Status === 'consulted')
								{
									$scope.p_colortype[i] = 'yellow_person';
								}
								else if(responseQueueData[i].Status === 'diagnosed')
								{
									$scope.p_colortype[i] = 'green_person';
								}
								else 
								{
								}
                            }
                        }
						else {}
						$scope.dataLoading = false;
                   } else {
                       $scope.error = "Error...";
                       $scope.cue = "";
                       $scope.dataLoading = false;
                   }
               })
               .catch(function (response) {
                   console.error('Error...', response.status, response.data);
                   $scope.error = 'Error...';
                   $scope.dataLoading = false;
               })
               .finally(function () {
               });
           
			return;
		};
		
		//Instance variables used : doctorUser
		//Global variables used : UtilityService.doctorUser
		var initVariables = function()
        {
			if(usrType === 'D')
			{
				doctorUser = UtilityService.doctorUser;
				
				if(doctorUser == null)
				{
					isOKToLoadForm = false;
					$location.path('/login');
				}
				else
				{
				}
			}
			else	//normal user
			{
			}
			
			return;
		};
		
		var init = function () {

			initVariables();
			
            return;
        };
		
		init();
		
   }]);