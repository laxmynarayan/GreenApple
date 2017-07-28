/*
Create By  : Tony Jacob
Description: Controller for ListSessions module
*/

'use strict';
 
angular.module('ListSessions')
 
.controller('ListSessionsController',
    ['$scope', '$rootScope', '$location', '$route', 'ListSessionsService', 'UtilityService',
    function ($scope, $rootScope, $location, $route, ListSessionsService, UtilityService) {
		//console.log('Inside ListSessionsController : ');
		var isOKToLoadForm = true;
        var doctorID = $rootScope.globals.currentUser.DocID;
		
		var doctorUser = null;
		var sessions = null;
		
		var monthYearStrArray = [];
				
		$scope.usrName = $rootScope.globals.currentUser.usrName;
		$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
		$scope.UsrType = $rootScope.globals.currentUser.UsrType;

		$scope.sessions = [];
		$scope.months = [];
		
		$scope.menuItemClick = function (url) {
           
			$location.path(url);
			return;
		};
		
		$scope.formLoad = function () {
			$scope.error = "";
			
			if(isOKToLoadForm)
				getAndSetSessionsInView();
		
			return;
		};
		
		$scope.deleteSessionBtnClick = function (session, index) {
			$scope.error = "";
			
			var numPatients = session.MaxSlot - session.AvailableSlot;
			
			if(numPatients == 0)
				deleteSession(session);
			
			return;
		};
		
		//Instance variables used : None
		//Global variables used : UtilityService.doctorUser.selSession, UtilityService.doctorUser.selSessionPatientSlots
		$scope.sesClick = function(session, selectedMonth) {
			$scope.error = "";
			//console.log('Inside $scope.sesClick session.SesID : ' + session.SesID);
			
			var patNum = (session.MaxSlot - session.AvailableSlot);
			if(patNum > 0)
			{
				$scope.dataLoading = true;
				UtilityService.DoctorUser_getSlots(session.SesID, doctorID)
				.then(function(response) {
						var statusInt = parseInt(response.status);
						//console.log('statusInt : ' + statusInt);
						if(statusInt == 200) {
							//var tt = angular.toJson(response.data);
							//console.log(tt);
							
							var selSessionPatientSlots = response.data;
							
							UtilityService.doctorUser_setSelectedSession(session);
							
							UtilityService.doctorUser_setSelectedSessionMonth($scope.selectedMonth);
							UtilityService.doctorUser_setSelectedSessionPatientSlots(selSessionPatientSlots);
							UtilityService.doctorUser_setSelectedSlotPatient(null);
							UtilityService.user_setSelectedSlot(null, $scope.UsrType);
			
							$scope.dataLoading = false;
							$location.path('/listPatients');
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
			else {}
            
            return;
        };
		
		//Instance variables used : none
		$scope.monthChange = function () {
			
			$scope.error = "";
						
			if($scope.selectedMonth === "All Months")
			{
				$scope.sessions = sessions;
			}
			else
			{
				$scope.sessions = getSessionsOfMonth(sessions, $scope.selectedMonth);
			}
			
			UtilityService.doctorUser_setSelectedSessionMonth($scope.selectedMonth);
			
			return;
		};
		
		//Instance variables used : none
		//Global variables modified : UtilityService.doctorUser.Sessions
		var deleteSession = function (session)
		{
			var sessionForDeletion = {SesID : session.SesID};
						
			$scope.dataLoading = true;
			ListSessionsService.deleteSession(sessionForDeletion)
			.then(function (response) {
						
				var statusInt = parseInt(response.status);
			
				if(statusInt == 200) {
					var respData = angular.toJson(response.data);
					//console.log(respData);
				
					var responseData = response.data;
					
					$scope.dataLoading = false;
					if(responseData === true)
					{
						//Flush out all the sessions by setting to null
						UtilityService.user_setDoctorSessions(null, 'D');
						
						$scope.cue = "Done";
						$scope.error = "";
						UtilityService.doctorUser_setSessionDeletionFlag(true);
						$route.reload();	//Reload the page
					}
					else
					{
						$scope.error = "Session deletion failed!!! Try again";
						$scope.cue = "";
					}
				} else {
					$scope.error = "Error...";
					$scope.cue = "";
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

			return;
		};


		//Note : It is assumed that sessions have been sorted in the descending order(reverse chronological order)
		//Instance variables used : sessions
		var applyCurrentOrUpcomingFlagOnSessions = function ()
		{

			//Initialize
			for(var i=0; i<sessions.length; i++)
			{
				sessions[i].IsCurrent = false;
				sessions[i].IsUpcoming = false;
			}
			
			var currentSessionFound = false;
			for(var i=0; i<sessions.length; i++)
			{
				sessions[i].IsCurrent = isCurrentSession(sessions[i].SessionStart, sessions[i].SessionEnd);
				
				if(sessions[i].IsCurrent == true)
				{
					currentSessionFound = true;
					break;
				}
			}
			
			if(!currentSessionFound)
			{
				var currentTime = new Date();
				
				var index = -1;
				var timeDiffStartAndCurrent = Number.POSITIVE_INFINITY;
				for(var i=0; i<sessions.length; i++)
				{
					var sesStartTime = new Date(sessions[i].SessionStart);
					var timeDiff = sesStartTime.getTime() - currentTime.getTime();
					
					if(timeDiff < 0) break;	//don't consider any past sessions. Jump out at the first instance to save time
					//Note : if the sessions are not sorted in reverse chronological order then the above logic will have to be changed. Avoid the break
						
					//don't consider any past sessions
					if( (timeDiff > 0) && (timeDiff < timeDiffStartAndCurrent) )
					{
						timeDiffStartAndCurrent = timeDiff;
						index = i;
					}
				}
				
				//console.log("index : " + index);
				//console.log("timeDiffStartAndCurrent : " + timeDiffStartAndCurrent);
				
				if(index == -1){}
				else sessions[index].IsUpcoming = true;
			}
			
			return;
		};
		
		//Instance variables used : sessions
		var setSessionsOfMonthInView = function ()
        {
            if(sessions == null) {}
            else
            {
				$scope.sessions = getSessionsOfMonth(sessions, $scope.selectedMonth);
            }
		
            return; 
        };
		
		//Instance variables used : monthYearStrArray
		var setMonthsInView = function ()
        {
            if(monthYearStrArray == null) {}
            else
            {
				if(monthYearStrArray.length>0)
				{
					$scope.months = [];
					$scope.months.push("All Months");
				
					for(var i=0; i<monthYearStrArray.length; i++)
					{
						$scope.months.push(monthYearStrArray[i]);
					}
				}
            }
		
            return; 
        };
		
		//Instance variables used : None
		var setSelectedMonthInView = function ()
		{
			if( typeof doctorUser.SessionDeletionFlag === "undefined" || (doctorUser.SessionDeletionFlag === null) )
			{
				if($scope.months.length > 0)
				{
					var mths = [];
					for(var i=0; i<$scope.months.length; i++)
					{
						if($scope.months[i] === "All Months"){}
						else
							mths.push($scope.months[i]);
					}
					
					$scope.selectedMonth = getCurrentOrClosestMonth(mths);
					UtilityService.doctorUser_setSelectedSessionMonth($scope.selectedMonth);
				}
			}
			else
			{
				$scope.selectedMonth = doctorUser.selSessionMonth;
				UtilityService.doctorUser_setSessionDeletionFlag(null);
			}
			
			return;
		};
	
	    //Instance variables modified : sessions, monthYearStrArray
		//Instance variables used : doctorID
		var getAndSetSessionsInView = function () 
		{
			if(typeof sessions === "undefined" || sessions === null)
			{
				$scope.dataLoading = true;
				UtilityService.GetDoctorSessions(doctorID)
				.then(function (response) {
					var statusInt = parseInt(response.status);
					//console.log("statusInt : " + statusInt);
                
					//if(statusInt == 200 || statusInt == 201) {
					if(statusInt == 200) {
						
						//var tt = angular.toJson(response.data);
						//console.log(tt);
								
						//var doctorSessions = response.data;
						var doctorSessions = sortByKey(response.data, 'SessionStart');	//do descending sort
						 														
						UtilityService.user_setDoctorSessions(doctorSessions, 'D');
						
						//Update instance variable
						sessions = doctorSessions;
						applyCurrentOrUpcomingFlagOnSessions();
						
						monthYearStrArray = getMonthYearStrArray(sessions);
						
						//Set months in the view
						setMonthsInView();
						
						//Set selection in the months combobox
						setSelectedMonthInView();
						
						//Set sessions in the view
						setSessionsOfMonthInView();
						$scope.dataLoading = false;
					} else {
						$scope.error = 'Error...';
						$scope.dataLoading = false;
					}
				})
				.catch(function(resp) {
					console.error('Error...', resp.status, resp.data);
					$scope.dataLoading = false;
				})
				.finally(function() {
					//console.log("finally finished");
				});
			}
			else	//already fetched
			{
				applyCurrentOrUpcomingFlagOnSessions();
				monthYearStrArray = getMonthYearStrArray(sessions);
						
				//Set months in the view
				setMonthsInView();
				
				//Set selection in the months combobox
				setSelectedMonthInView();
				
				//Set sessions in the view
				setSessionsOfMonthInView();
			}

			return;
		};
		
		var initVariables = function ()
		{
			doctorUser = UtilityService.doctorUser;
			
			if(doctorUser == null)
			{
				isOKToLoadForm = false;
				$location.path('/login');
			}
			else
			{
				sessions = doctorUser.Sessions;
			}
			
			return;
		};
		
		var init = function () {

			initVariables();
			
            return;
        };
		
		init();
		
    }]);
