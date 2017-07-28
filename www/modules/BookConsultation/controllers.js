/*
Create By  : Tony Jacob
Description: Controller for BookConsultation module
*/

'use strict';
 
angular.module('BookConsultation')
 
.controller('BookConsultationController',
    ['$scope', '$rootScope', '$location', '$route', 'BookConsultationService', 'UtilityService',
    function ($scope, $rootScope, $location, $route, BookConsultationService, UtilityService) {
		var isOKToLoadForm = true;
        var doctorID = $rootScope.globals.currentUser.DocID;
		var usrType = $rootScope.globals.currentUser.UsrType;
		
		var doctorUser = null;
		var normalUser = null;
		
		var minPerSlotInMts = 10;
		var maxPerSlotInMts = 30;
		
		var patients = [];
		var sessions = [];
               
		$scope.usrName = $rootScope.globals.currentUser.usrName;
		$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
		$scope.UsrType = $rootScope.globals.currentUser.UsrType;
		//$scope.DocName = $rootScope.globals.currentUser.DocName;
		
		$scope.patients = [];
		$scope.sessions = [];
		
		$scope.menuItemClick = function (url) {
           
			$location.path(url);
			return;
		};
		
		$scope.reloadRoute = function() {
			$route.reload();
			$scope.disableSubmit = false;
			return;
		};
		
		$scope.formLoad = function () {
			$scope.error = "";
			
			if(isOKToLoadForm)
				getPatientsAndSessionsAndSetInView();

			return;
		};
		
		//Instance variables used : None
		//Global variables modified : None
        $scope.bookConsultation = function () {
			
			$scope.error = "";
			
			var isValidated = validateFormElements();
			
			if(isValidated)
            {
				//console.log('Inside BookConsultationController function()...SesID ->: ' + $scope.selectedSession.SesID);
				
				//console.log('$scope.selectedSession.MaxSlot: ' + $scope.selectedSession.MaxSlot);
				//console.log('$scope.selectedSession.AvailableSlot: ' + $scope.selectedSession.AvailableSlot);
				//console.log('SlotNo: ' + ($scope.selectedSession.MaxSlot-$scope.selectedSession.AvailableSlot+1));
				//console.log('$scope.selectedPatient : ' + $scope.selectedPatient);
				
				var selectedPatientPatID = getSelectedPatientPatID();
				
				var slotNO = $scope.selectedSession.MaxSlot-$scope.selectedSession.AvailableSlot+1;
				
				//var appointmentTimeStr = getAppointmentTime($scope.selectedSession.SessionStart, slotNO, minPerSlotInMts, maxPerSlotInMts);
				var appointmentTimeStr = $scope.selectedSession.AppointmentTimeStr;
								
				var newSlot = {SesID : $scope.selectedSession.SesID,
							   DocId : doctorID, PatID : selectedPatientPatID,
							   SlotNO : slotNO,
							   BillNo : "999", Status : "booked", Amount : 0};
							   
				//console.log(newSlot);
							   
				$scope.dataLoading = true;
				//console.log('Calling BookConsultationService.CreateSlot2()');
				BookConsultationService.CreateSlot2(newSlot)
					.then(function (response) {
						var statusInt = parseInt(response.status);
						//console.log("statusInt : " + statusInt);
						
						if(statusInt == 200) {
							
							var respData = angular.toJson(response.data);
							//console.log(respData);
						
							var responseData = response.data;
							
							if(responseData === true)
							{
								//Flush out all the sessions by setting to null
								UtilityService.user_setDoctorSessions(null, usrType);
							
								//$scope.cue = "Success!!!!!! Consultation booked";
								$scope.cue = "Done, Slot : " + slotNO + ", Time : " + appointmentTimeStr;
								$scope.error = "";
								$scope.dataLoading = false;
								$scope.disableSubmit = true;
							}
							else
							{
								//alert("Book consultation failed!!! Try again");
								$scope.error = "Book consultation failed!!! Try again";
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
			}
			else
			{
				//alert('Please correct the errors and try again');
			}
				
			return;
        };
		
		var getAppointmentTime = function(sesStartTime, slotNO, minPerSlotInMts, maxPerSlotInMts)
		{
			var avgPerSlotInMts = (minPerSlotInMts+maxPerSlotInMts)/2;
			var appointmentTimeInMilliSecs = (new Date(sesStartTime)).getTime() + (slotNO-1)*avgPerSlotInMts*60*1000;
			var appointmentTimeStr = getClockTime(appointmentTimeInMilliSecs);
			
			return appointmentTimeStr;
		}
		
		//Instance variables used : usrType
		//Global variables modified : None
		var getSelectedPatientPatID = function()
		{
			var selectedPatientPatID = 0;
			
			if(usrType === 'D' || usrType === 'S')	//Doctor user, Staff user
			{
				var selectedPatientIDNameStr = $scope.selectedPatient;
				//var arr = selectedPatientIDNameStr.split("...");
				var arr = selectedPatientIDNameStr.split(".");
				var selectedPatientPatID = 0;
				if(arr.length>1){selectedPatientPatID = Number(arr[0]);}
			}
			else if(usrType === 'N') //Normal user
			{
				selectedPatientPatID = $scope.selectedPatient.PatID;
			}
			else {}
			
			//console.log('selectedPatientPatID : ' + selectedPatientPatID);
				
			return selectedPatientPatID;
		}
		
		//Instance variables used : None
		//Global variables modified : None
		var validateFormElements = function()
		{
			var isValid = false;
			var slotsAvailable = false;
			
			if($scope.selectedSession.AvailableSlot > 0)
				slotsAvailable = true;
			else 
				slotsAvailable = false;
			
			if(!slotsAvailable) $scope.error = "No slots available in the selected session";
			isValid = slotsAvailable;
						
			return isValid;
		}

		//Instance variables used : patients
		//Global variables used : None
		var setPatientsInView = function()
		{
			$scope.patients = patients;
			return;
		}
		
		//Instance variables used : sessions
		//Global variables used : None
		var setSessionsInView = function()
        {
			//$scope.sessions = getFutureSessions(sessions);
			var futureSessions = getFutureSessions(sessions);
			$scope.sessions = [];
			
			var j = 0;
			for(var i=0; i<futureSessions.length; i++)
			{
				if(futureSessions[i].AvailableSlot > 0)
				{
					$scope.sessions[j] = futureSessions[i];
					j++;
				}
			}
			
			for(var i=0; i<$scope.sessions.length; i++)
			{
				var ses = $scope.sessions[i];
				var slotNO = ses.MaxSlot-ses.AvailableSlot+1;
				
				$scope.sessions[i].AppointmentTimeStr = getAppointmentTime(ses.SessionStart, slotNO, minPerSlotInMts, maxPerSlotInMts);
			}
				
			if($scope.sessions.length == 0) $scope.error = 'No sessions available.';
			return;
		}
		
		//Instance variables used : patients, sessions
		//Global variables modified : UtilityService.doctorUser.patients, UtilityService.normalUser.patients,
		//                            UtilityService.doctorUser.Sessions, UtilityService.normalUser.Sessions, 
		var getPatientsAndSessionsAndSetInView = function()
        {
			var process1Finished = true;
			var process2Finished = true;
			
			if(usrType === 'D')	//Doctor User
			{
				if(typeof doctorUser.Patients === "undefined" || (doctorUser.Patients === null) )
				{
					process1Finished = false;

					//console.log("Will call BookConsultationService.DoctorUser_getPatients()");
					$scope.dataLoading = true;
					UtilityService.DoctorUser_getPatients($rootScope.globals.currentUser.DocID)
					.then(function(response) {
							var statusInt = parseInt(response.status);
							//console.log('statusInt : ' + statusInt);
							if(statusInt == 200) {
								patients = response.data;
								
								UtilityService.doctorUser_setPatients(patients);
								//console.log('patients.length : ' + patients.length);
							
								//Set patients in the view
								setPatientsInView();
								
								process1Finished = true;

								if(process1Finished == true && process2Finished == true)
								{
									$scope.dataLoading = false;
								}
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
				else
				{
					patients = doctorUser.Patients;
					
					//Set patients in the view
					setPatientsInView();
				}
			}
			else if(usrType === 'N')	//Normal User
            {
				if(typeof normalUser.Patients === "undefined" || (normalUser.Patients === null) )
				{
					process1Finished = false;
				
					$scope.dataLoading = true;
					UtilityService.NormalUser_getPatients($rootScope.globals.currentUser.UsrID, $rootScope.globals.currentUser.DocID)
					.then(function(response) {
							var statusInt = parseInt(response.status);
							//console.log('statusInt : ' + statusInt);
							if(statusInt == 200) {
								//var tt = angular.toJson(response.data);
								//console.log(tt);
								
								patients = response.data;
								
								UtilityService.normalUser_setPatients(patients);
								
								//Set patients in the view
								setPatientsInView();
								
								process1Finished = true;

								if(process1Finished == true && process2Finished == true)
								{
									$scope.dataLoading = false;
								}
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
				else 
				{
					patients = normalUser.Patients;
				
					//Set patients in the view
					setPatientsInView();
				}	
            }
            else
            {
            }
			
			if( (usrType === 'D' && (typeof doctorUser.Sessions === "undefined" || doctorUser.Sessions === null))
				||
			(usrType === 'N' && (typeof normalUser.Sessions === "undefined" || normalUser.Sessions === null)) )
			{
				process2Finished = false;
				
				$scope.dataLoading = true;
				UtilityService.GetDoctorSessions($rootScope.globals.currentUser.DocID)
                .then(function(response) {
                        var statusInt = parseInt(response.status);
                        //console.log('statusInt : ' + statusInt);
                        if(statusInt == 200) {
                          
							//console.log("sessions will be loaded now()...");
							//sessions = response.data;
							sessions = sortByKey(response.data, 'SessionStart');	//do descending sort
							
							UtilityService.user_setDoctorSessions(sessions, usrType);
							
							//Set sessions in the view
							setSessionsInView();
						
							process2Finished = true;
							
							if(process1Finished == true && process2Finished == true)
							{
								$scope.dataLoading = false;
							}
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
            else	//Sessions already fetched
            {
				if(usrType === 'D')
				{
					sessions = doctorUser.Sessions;
				}
				else if(usrType === 'N')
				{
					sessions = normalUser.Sessions;
				}
				else {}
				
				//Set sessions in the view
				setSessionsInView();
            }
 
            return;
		};
		
		//Instance variables used : doctorUser
		//Global variables used : None
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
				normalUser = UtilityService.normalUser;
				
				if(normalUser == null)
				{
					isOKToLoadForm = false;
					$location.path('/login');
				}
				else
				{
				}
			}
			
			return;
		};
		
		var init = function () {

			initVariables();
			
            return;
        };
		
		init();
    }]);
