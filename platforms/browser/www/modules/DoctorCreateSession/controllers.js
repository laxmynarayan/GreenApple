/*
Create By  : Tony Jacob
Description: Controller for DoctorCreateSession module
*/

'use strict';
 
angular.module('DoctorCreateSession')
 
.controller('DoctorCreateSessionController',
    ['$scope', '$rootScope', '$location', '$route', 'DoctorCreateSessionService', 'UtilityService',
    function ($scope, $rootScope, $location, $route, DoctorCreateSessionService, UtilityService) {
		
		//console.log('From DoctorCreateSessionController');
		var isOKToLoadForm = true;
		var docID = $rootScope.globals.currentUser.DocID;
		var doctorUser = null;
		var sessions = null;
		
		$scope.usrName = $rootScope.globals.currentUser.usrName;
		$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
		$scope.UsrType = $rootScope.globals.currentUser.UsrType;
		
		$scope.selectedStartTime = null;
		$scope.selStartTime = null;
		$scope.selectedEndTime = null;
		$scope.selEndTime = null;
        
		$scope.menuItemClick = function (url) {
            
			$location.path(url);
			return;
		};
		
		$scope.reloadRouteAndResetForm = function() {
			$scope.error = "";
			
			$route.reload();
			
			//Reset form fields
			resetForm();

			return;
		};
		
		$scope.formLoad = function () {
			$scope.error = "";
			
			if(isOKToLoadForm)
				getLocationsAndSetLocationsInView();

			return;
		};
		
		//Instance variables used : sessions
		//Global variables modified : UtilityService.doctorUser.Sessions
        $scope.createSession = function () {
			$scope.error = "";
			
			$scope.selectedStartTime = $scope.selStartTime.hrs + ":" + $scope.selStartTime.mins + " " + $scope.selStartTime.amOrPm;
			$scope.selectedEndTime = $scope.selEndTime.hrs + ":" + $scope.selEndTime.mins + " " + $scope.selEndTime.amOrPm;
			
			$scope.error = "";
			
			var isValidated = validateFormElements();
			
            if(isValidated)
            {
				//Note : This if()else() copied from ListSessions\Controller and then relevant changes were introduced
				if(typeof sessions === "undefined" || sessions === null)
				{
					$scope.dataLoading = true;
					UtilityService.GetDoctorSessions(docID)
					.then(function (response) {
						var statusInt = parseInt(response.status);
						//console.log("statusInt : " + statusInt);
                
						//if(statusInt == 200 || statusInt == 201)
						if(statusInt == 200) 
						{
							//var tt = angular.toJson(response.data);
							//console.log(tt);
									
							//var doctorSessions = response.data;
							var doctorSessions = sortByKey(response.data, 'SessionStart');	//do descending sort
									
							UtilityService.user_setDoctorSessions(doctorSessions, 'D');
							
							//Update instance variable
							sessions = doctorSessions;
							
							var anySessionOverlap = validateSessionOverlap();
							if(anySessionOverlap)
							{
								//alert("Session exists which overlap with the input session");
								$scope.error = "Session exists which overlap with the input session";
								$scope.dataLoading = false;
							}
							else
							{
								createSession();
							}
							
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
					var anySessionOverlap = validateSessionOverlap();
					if(anySessionOverlap)
					{
						//alert("Session exists which overlap with the input session");
						$scope.error = "Session exists which overlap with the input session";
					}
					else
					{
						createSession();
					}
				}
            }
            else 
            {
				//alert('Please correct the errors and try again');
            }
            
            return;
        };
		
		//Instance variables used : None
		//Global variables modified : UtilityService.doctorUser.Sessions
		var createSession = function()
		{
			var sesStartTime = new Date($scope.selectedDate);
			var sesEndTime = new Date($scope.selectedDate);
		   
			sesStartTime.setHours(getHours($scope.selectedStartTime));
			sesStartTime.setMinutes(getMinutes($scope.selectedStartTime));
			
			
			sesEndTime.setHours(getHours($scope.selectedEndTime));
			sesEndTime.setMinutes(getMinutes($scope.selectedEndTime));

			sesStartTime.setTime( sesStartTime.getTime() - sesStartTime.getTimezoneOffset()*60*1000 );
			sesEndTime.setTime( sesEndTime.getTime()  - sesEndTime.getTimezoneOffset()*60*1000 );
			
								
			var newSession = {DocID : $scope.docID, LocID : $scope.selectedLocation.LocID, MaxSlot : $scope.selectedMaxSlotNum,
							  AvailableSlot : $scope.selectedMaxSlotNum, SessionStart : sesStartTime, SessionEnd : sesEndTime};
							 
			$scope.dataLoading = true;
			DoctorCreateSessionService.DoctorUser_createSession(newSession)
            .then(function (response) {
				var statusInt = parseInt(response.status);
				//console.log("statusInt : " + statusInt);
                
				//if(statusInt == 200 || statusInt == 201) {
				if(statusInt == 200) {
					//var respData = angular.toJson(response.data);
					//console.log(respData);
                       
					var responseData = response.data;
					
					if(responseData === true)
					{
						//Flush out all the sessions by setting to null
						UtilityService.user_setDoctorSessions(null, 'D');
						//$scope.cue = "Success!!!!!! Session created. You will directed to the Doctor-Home page";
						$scope.cue = "Done";
						$scope.error = "";
						$scope.dataLoading = false;
						$scope.disableSubmit = true;
					}
					else
					{
						//alert("Session creation failed!!! Try again");
						$scope.error = "Session creation failed!!! Try again";
						$scope.cue = "";
						$scope.dataLoading = false;
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
				
		var validateSessionOverlap = function()
		{
			var anySessionOverlap = false;
			
			var sesStartTime = new Date($scope.selectedDate);
			var sesEndTime = new Date($scope.selectedDate);
		   
			sesStartTime.setHours(getHours($scope.selectedStartTime));
			sesStartTime.setMinutes(getMinutes($scope.selectedStartTime));
			
			sesEndTime.setHours(getHours($scope.selectedEndTime));
			sesEndTime.setMinutes(getMinutes($scope.selectedEndTime));
			
			var sesStartTimeMilliSecs = sesStartTime.getTime();
			var sesEndTimeMilliSecs = sesEndTime.getTime();
			
			//console.log("sesStartTime : " + sesStartTime.toString() + " sesEndTime : " + sesEndTime.toString());
			//console.log("sessions.length : " + sessions.length);
			for(var i=0; i<sessions.length; i++)
			{
				var mySesStartTimeMilliSecs = (new Date(sessions[i].SessionStart)).getTime();
				var mySesEndTimeMilliSecs = (new Date(sessions[i].SessionEnd)).getTime();
			
				if( (mySesStartTimeMilliSecs>=sesStartTimeMilliSecs && mySesStartTimeMilliSecs<=sesEndTimeMilliSecs) ||
			        (mySesEndTimeMilliSecs>=sesStartTimeMilliSecs && mySesEndTimeMilliSecs<=sesEndTimeMilliSecs)
				)
				{
					//console.log("over lap");
					//console.log("Start : " + sessions[i].SessionStart + " End : " + sessions[i].SessionEnd);
					anySessionOverlap = true;
					break;
				}
				else if( (sesStartTimeMilliSecs>=mySesStartTimeMilliSecs && sesStartTimeMilliSecs<=mySesEndTimeMilliSecs) ||
						 (sesEndTimeMilliSecs>=mySesStartTimeMilliSecs && sesEndTimeMilliSecs<=mySesEndTimeMilliSecs)
				)
				{
					//console.log("over lap...");
					//console.log("Start : " + sessions[i].SessionStart + " End : " + sessions[i].SessionEnd);
					anySessionOverlap = true;
					break;
				}
				else 
				{
					//console.log("no over lap");
				}
			}

			//console.log("anySessionOverlap : " + anySessionOverlap);
			
			return anySessionOverlap;
		};
		
		//Instance variables used : None
		//Global variables modified : None
		var validateFormElements = function()
		{
			var isValid = false;
			var maxSlotValid = false;
			var ispastdate = true;
			var compSesStartAndCurTimeValid = false;
			var compSesStartAndEndTimeValid = false;
			var isSesDurBtwnMinAndMaxLt = false;			
			var isSessionMoreThan8Hrs = true;
			
			var maxSlot = $scope.selectedMaxSlotNum;
			
			var sesStartTime = new Date($scope.selectedDate);
            var sesEndTime = new Date($scope.selectedDate);
           
            sesStartTime.setHours(getHours($scope.selectedStartTime));
            sesStartTime.setMinutes(getMinutes($scope.selectedStartTime));
            
            sesEndTime.setHours(getHours($scope.selectedEndTime));
            sesEndTime.setMinutes(getMinutes($scope.selectedEndTime));
			
			var dateStr = addZero(sesStartTime.getDate()) + '-' + addZero(sesStartTime.getMonth()+1) + '-' + sesStartTime.getFullYear();
			
			maxSlotValid = isValidNumber(maxSlot);
			if(!maxSlotValid) $scope.error = "No. of patients is not a valid number";
			isValid = maxSlotValid;
			
			if(isValid)
			{
				ispastdate = isPastDate(dateStr);
				if(ispastdate) $scope.error = "Date cannot be a past date";
				isValid = maxSlotValid && !ispastdate;
			}
			
			if(isValid)
			{
				compSesStartAndCurTimeValid = validateCompSesStartAndCurTime (sesStartTime);
				if(!compSesStartAndCurTimeValid)
					$scope.error = "Session StartTime should be greater than CurrentTime";
				
				isValid = maxSlotValid && (!ispastdate) && compSesStartAndCurTimeValid;
			}
			
			if(isValid)
			{
				compSesStartAndEndTimeValid = validateCompSesStartAndEndTime (sesStartTime, sesEndTime);
				if(!compSesStartAndEndTimeValid)
					$scope.error = "Session EndTime should be greater than Session StartTime";
				
				isValid = maxSlotValid && (!ispastdate) && compSesStartAndCurTimeValid && compSesStartAndEndTimeValid;
			}
			
			if(isValid)
			{
				//isSesDurBtwnMinAndMaxLt = validateSesDurBtwnMinAndMaxLt(sesStartTime, sesEndTime, 10, 30, maxSlot);
				isSesDurBtwnMinAndMaxLt = true; // Hardcoded as of now by lakshmy on 9th Jun 2017
				
				if(!isSesDurBtwnMinAndMaxLt)
				{
					 //alert("Session duration should be within limits (more than 10mins per patient and less than 30mins per patient)");
					 $scope.error = "Session duration should be within limits (more than 10mins per patient and less than 30mins per patient)";
				}
				isValid = maxSlotValid && (!ispastdate) && compSesStartAndCurTimeValid && compSesStartAndEndTimeValid && isSesDurBtwnMinAndMaxLt;
			}
			
			if(isValid)
			{
				isSessionMoreThan8Hrs = validateSessionMoreThanTimeLt(sesStartTime, sesEndTime, 8);
				
				if(isSessionMoreThan8Hrs)
				{
					//alert("Session duration cannot be more than 8 hours");
					$scope.error = "Session duration cannot be more than 8 hours";
				}
				
				isValid = maxSlotValid && (!ispastdate) && compSesStartAndCurTimeValid && compSesStartAndEndTimeValid && 
				          isSesDurBtwnMinAndMaxLt && (!isSessionMoreThan8Hrs);
			}
			
			return isValid;
		};
		
		//Instance variables used : None
		//Global variables modified : None
		var validateSesDurBtwnMinAndMaxLt = function (sesStartTime, sesEndTime, minPerSlotInMts, maxPerSlotInMts, maxSlot) 
		{
			var isSesDurBtwnMinAndMaxLt = false;
			
			var sessionDurationMts = (sesEndTime.getTime() - sesStartTime.getTime())/(1000*60);	//convert milliseconds to mins
			
			if( (sessionDurationMts < (minPerSlotInMts * maxSlot)) || (sessionDurationMts > (maxPerSlotInMts * maxSlot)) )
				isSesDurBtwnMinAndMaxLt = false;
			else 
				isSesDurBtwnMinAndMaxLt = true;
			
			return isSesDurBtwnMinAndMaxLt;
		};
		
		//Instance variables used : None
		//Global variables modified : None
		var validateCompSesStartAndCurTime = function (sesStartTime) 
		{
            var isValidated = true;
			
			var currentTime = new Date();
            var timeDiffStartAndCurrent = sesStartTime.getTime() - currentTime.getTime();
			
			if(timeDiffStartAndCurrent > 0) {}
			else 
			{
				//alert('sesStartTime should be greater than currentTime');
				//$scope.error = "sesStartTime should be greater than currentTime";
				isValidated = false;
			}
			
            return isValidated;
        };
		
		//Instance variables used : None
		//Global variables modified : None
		var validateCompSesStartAndEndTime  = function (sesStartTime, sesEndTime) 
		{
            var isValidated = true;
            
            var timeDiffEndAndStart = sesEndTime.getTime() - sesStartTime.getTime();
        
            if(timeDiffEndAndStart > 0) {}
            else 
            {
                //alert('sesEndTime should be greater than sesStartTime');
				//$scope.error = "sesEndTime should be greater than sesStartTime";
                isValidated = false;
            }
            
            return isValidated;
        };
		
		var validateSessionMoreThanTimeLt = function (sesStartTime, sesEndTime, timeLt) 
		{
			var isSessionMoreThanTimeLt = true;
			
			var sessionDurationHrs = (sesEndTime.getTime() - sesStartTime.getTime())/(1000*60*60);	//convert milliseconds to hrs
			
			if(sessionDurationHrs > timeLt)
				isSessionMoreThanTimeLt = true;
			else 
				isSessionMoreThanTimeLt = false;
			
			return isSessionMoreThanTimeLt;
		};
		
		var isValidNumber = function (data)
		{
			var isvalidnumber = false;
			
			if(isNaN(data))
			{
				isvalidnumber = false;
			}
			else
			{
				if(parseInt(data) == 0)	//0 is not valid
				{
					isvalidnumber = false;
				}
				else 
				{
					isvalidnumber = true;
				}
			}
         
			return isvalidnumber;
		};
		
		//Instance variables used : docID
		//Global variables modified : UtilityService.doctorUser.Locations
		var getLocationsAndSetLocationsInView = function()
        {
			if(typeof UtilityService.doctorUser.Locations === "undefined" || (UtilityService.doctorUser.Locations === null) )
            {
                $scope.dataLoading = true;
                DoctorCreateSessionService.DoctorUser_getLocations(docID)
                .then(function(response) {
                        var statusInt = parseInt(response.status);
                        //console.log('statusInt : ' + statusInt);
                        if(statusInt == 200) {
                            var locations = response.data;
							UtilityService.doctorUser_setLocations(locations);
							
							loadLocationsInView();
							
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
            else	//Use pre fetched locations
            {
				loadLocationsInView();
            }
            
            return;
		};
		
		//Global variables used : UtilityService.doctorUser.Locations
		var loadLocationsInView = function()
        {
            $scope.locations = UtilityService.doctorUser.Locations;  //for the location combobox
			//console.log("...$scope.locations.length : " + $scope.locations.length);
			return;
		};
		
		var resetForm = function ()
		{
			$scope.selectedLocation = null;
		    $scope.selectedMaxSlotNum = null;
			$scope.selectedDate = null;
		    $scope.selectedStartTime = null;
		    $scope.selectedEndTime = null;
			
			$scope.disableSubmit = false;
			
			return; 
        };
		
        var initVariables = function()
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
				
				$scope.selectedStartTime = "10:00 AM";
				$scope.selStartTime = {hrs : "10", mins : "00", amOrPm : 'AM'};
			
				$scope.selectedEndTime = "12:30 PM";
				$scope.selEndTime = {hrs : "12", mins : "30", amOrPm : 'PM'};
			
				$scope.docID = docID;
				
				$scope.locations = doctorUser.Locations;  //for the location combobox
				//console.log("...$scope.locations.length : " + $scope.locations.length);
			
				$scope.startTimeHrs = ['1', '2', '3' , '4', '5', '6', '7', '8', '9', '10', '11', '12'];
				$scope.startTimeMins = ['00', '15', '30', '45'];
				$scope.startTimeAMorPM = ['AM', 'PM'];
									 
				$scope.endTimeHrs = ['1', '2', '3' , '4', '5', '6', '7', '8', '9', '10', '11', '12'];
				$scope.endTimeMins = ['00', '15', '30', '45'];
				$scope.endTimeAMorPM = ['AM', 'PM'];
			}
            
            return;
        };

        var init = function () {
        
            initVariables();
            
            return;
        };
		
		init();
        
    }]);



