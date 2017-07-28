/*
Create By  : Tony Jacob
Description: Controller for ListPatients module
*/

'use strict';
//console.log('From ListPatients-controllers.js');
angular.module('ListPatients')
 
.controller('ListPatientsController',
    ['$scope', '$rootScope', '$location', '$route', 'ListPatientsService','UtilityService',
    function ($scope, $rootScope, $location, $route, ListPatientsService, UtilityService) {
		//console.log('Inside ListPatientsController : ');
		var isOKToLoadForm = true;
        var doctorID = $rootScope.globals.currentUser.DocID;
		var usrType = $rootScope.globals.currentUser.UsrType;
		
		var monthYearStrArray = [];
		
		var sessions = null;
		var doctorUser = null;
		var selSession = null;
		var selSessionMonth = null;
		var selSessionPatientSlots = null;
		var selSlot = null;
		
		$scope.usrName = $rootScope.globals.currentUser.usrName;
		$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
		$scope.UsrType = $rootScope.globals.currentUser.UsrType;

		$scope.months = [];
		$scope.sessions = [];
		$scope.patientSlots = [];
		$scope.selectedSession = {};
		
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
		
		//Note : This was avoided. Instead the same function is called from $scope.formLoad
		/*
		$scope.allSessionsBtnClick = function () {
			getAndSetSessionsInView();
			return;
		};
		*/
		//Note : Copy paste reproduction from ListSessions/controllers
		$scope.monthChange = function () {
			
			$scope.error = "";
			
			if($scope.selectedMonth === "All Months")
			{
				$scope.sessions = sessions;
				
				//Set selectedSession and patientSlots to null
				$scope.selectedSession = null;
				$scope.patientSlots = null;
			}
			else
			{
				$scope.sessions = getSessionsOfMonth(sessions, $scope.selectedMonth);
				
				//Set selectedSession and patientSlots to null
				$scope.selectedSession = null;
				$scope.patientSlots = null; 
			}
			
			return;
		};
		
		//Note : Similar to sesClick from ListSessions/controllers.js
		$scope.sesChange = function() {
			
			$scope.error = "";
			
			selSession = $scope.selectedSession;
			
			if(selSession == null  || (selSession != null && typeof selSession.SesID === "undefined")) {}
			else
			{
				var patNum = (selSession.MaxSlot - selSession.AvailableSlot);
				if(patNum > 0)
				{
					$scope.dataLoading = true;
					UtilityService.DoctorUser_getSlots(selSession.SesID, doctorID)
					.then(function(response) {
					
						var statusInt = parseInt(response.status);
						//console.log('statusInt : ' + statusInt);
				
						if(statusInt == 200) {
							//var tt = angular.toJson(response.data);
							//console.log(tt);
						
							selSessionPatientSlots = response.data;
							
							UtilityService.doctorUser_setSelectedSession(selSession);
							
							UtilityService.doctorUser_setSelectedSessionMonth($scope.selectedMonth);
							UtilityService.doctorUser_setSelectedSessionPatientSlots(selSessionPatientSlots);
							UtilityService.doctorUser_setSelectedSlotPatient(null);
							
							UtilityService.user_setSelectedSlot(null, $scope.UsrType);
							
							//set patients in the view
							setPatientsInView();
						
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
					selSessionPatientSlots = null;
						
					UtilityService.doctorUser_setSelectedSession(selSession);
					UtilityService.doctorUser_setSelectedSessionMonth($scope.selectedMonth);
					UtilityService.doctorUser_setSelectedSessionPatientSlots(selSessionPatientSlots);
					UtilityService.doctorUser_setSelectedSlotPatient(null);
					UtilityService.user_setSelectedSlot(null, $scope.UsrType);
					
					//set patients in the view
					setPatientsInView();
				
					//Set selection in the months combobox
					setSelectedMonthInView();
					
					//Set sessions in the view
					setSessionsOfMonthInView();
				}
			}
			
            return;
        };
		
		$scope.slotClick = function(patientSlot) {
						
			$scope.error = "";
			
			UtilityService.doctorUser_setSelectedSlotPatient(patientSlot);
			
			var slot = {SloID:patientSlot.SloID, SesID:patientSlot.SesID,
						DocID:patientSlot.DocID, PatID:patientSlot.PatID,
						SlotNO:patientSlot.SlotNO, BillNo:patientSlot.BillNo,
						Amount:patientSlot.Amount, Status:patientSlot.Status,
						SessionStart: $scope.selectedSession.SessionStart,
						SessionDateStr: $scope.selectedSession.SessionDateStr};
									
			UtilityService.user_setSelectedSlot(slot, $scope.UsrType);
			
			$location.path('/diagnosis');

			return;
		};
		
		$scope.updateSlotStatusBtnClick = function (patientSlot, selectedSlotStatus, index) {
			$scope.error = "";
			
			var mode = patientSlot.updateSlotStatusBtnMode;
			
			if(mode == "Edit")
			{
				$scope.patientSlots[index].updateSlotStatusBtnMode = "Save";
			}
			else if(mode == "Save")
			{
				if( (patientSlot.Status == "consulted" || patientSlot.Status == "diagnosed") &&
				    (selectedSlotStatus == "cancelled") ) 
				{
					$scope.error = "Status cannot be changed from consulted/diagnosed to cancelled";
					
					//$scope.patientSlots[index].NewStatus = patientSlot.Status
					
					//set the selection
					for(var j=0; j<$scope.patientSlots[index].slotStatuses.length; j++)
					{
						if($scope.patientSlots[index].slotStatuses[j].name == patientSlot.Status)
						{
							$scope.patientSlots[index].NewStatus = $scope.patientSlots[index].slotStatuses[j];
							break;
						}
					}
					
					$scope.patientSlots[index].updateSlotStatusBtnMode = "Edit";
				}
				else
				{
					updateSlot(patientSlot, selectedSlotStatus, index);
					$scope.patientSlots[index].updateSlotStatusBtnMode = "Edit";
				}
			}
			else {}
			
			return;
		};
		
		$scope.cancelSlotStatusUpdateBtnClick = function (index) {
			$scope.error = "";
			
			$scope.patientSlots[index].updateSlotStatusBtnMode = "Edit";
			
			return;
		};
		
		$scope.deleteSlotBtnClick = function (patientSlot, index) {
			
			$scope.error = "";
			
			if(patientSlot.Status == "cancelled")
				deleteSlot(patientSlot);
			
			return;
		};
		
		var updateSlot = function (patientSlot, selectedSlotStatus, index)
		{
			var slot = {SloID : patientSlot.SloID, 
				        SesID : patientSlot.SesID, 
						DocID : patientSlot.DocID, PatID : patientSlot.PatID,
						SlotNO : patientSlot.SlotNO,
						BillNo : patientSlot.BillNo, Status : selectedSlotStatus, Amount : patientSlot.Amount};
						
			$scope.dataLoading = true;
			UtilityService.updateSlot(slot)
			.then(function (response) {
						
				var statusInt = parseInt(response.status);
			
				if(statusInt == 200) {
					var respData = angular.toJson(response.data);
					//console.log(respData);
				
					var responseData = response.data;
					
					$scope.dataLoading = false;
					if(responseData === true)
					{
						//if selSlot.SloID matches with patientSlot.SloID update the selSlot.Status
						updateSelSlotStatus(patientSlot, selectedSlotStatus);
						$scope.patientSlots[index].Status = selectedSlotStatus;	
						
						$scope.cue = "Done";
						$scope.error = "";
					}
					else
					{
						$scope.error = "Slot updating failed!!! Try again";
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
		
		//Instance variables used : selSlot
		//Global variables modified : UtilityService.doctorUser.selSlot
		var updateSelSlotStatus = function (patientSlot, slotStatus)
		{
			var selectedSlot = selSlot;
				
			if(selectedSlot != null)
			{
				if(selectedSlot.SloID == patientSlot.SloID)
				{
					selectedSlot.Status = slotStatus;
					UtilityService.user_setSelectedSlot(selectedSlot, $scope.UsrType);
				}
			}
			else {}
			
			return;
		};
		
		//Instance variables used : none
		//Global variables modified : 
		var deleteSlot = function (patientSlot)
		{
			var slotForDeletion = {SloID : patientSlot.SloID, SesID : patientSlot.SesID};

			$scope.dataLoading = true;
			ListPatientsService.deleteSlot(slotForDeletion)
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
						UtilityService.user_setDoctorSessions(null, usrType);
												
						UtilityService.doctorUser_setSelectedSessionPatientSlots(null);
						UtilityService.doctorUser_setSelectedSlotPatient(null);
						UtilityService.user_setSelectedSlot(null, $scope.UsrType);
						
						$scope.cue = "Done";
						$scope.error = "";
						UtilityService.doctorUser_setReqReloadOfSelSessionFlag(true);
					
						$route.reload();	//Reload the page
					}
					else
					{
						$scope.error = "Slot deletion failed!!! Try again";
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
		
		//Note : Copy paste reproduction of getAndSetSessionsInView from ListSessions/controllers.js
		//Instance variables modified : sessions, monthYearStrArray
		//Instance variables used : doctorID
		var getAndSetSessionsInView = function () {
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

						monthYearStrArray = getMonthYearStrArray(sessions);
						
						//Set months in the view
						setMonthsInView();
						
						//Set selection in the months combobox
						setSelectedMonthInView();

						//Set sessions in the view
						setSessionsOfMonthInView();
						
						//Set selection in the sessions combobox
						setSelectedSessionInView();
						
						//ReqReloadOfSelSessionFlag is OFF
						if( typeof doctorUser.ReqReloadOfSelSessionFlag === "undefined" || (doctorUser.ReqReloadOfSelSessionFlag === null) )
						{
							//Set patients in the view
							setPatientsInView();
						}
						else //ReqReloadOfSelSessionFlag is ON
						{
							UtilityService.doctorUser_setReqReloadOfSelSessionFlag(null);
							$scope.sesChange();	//Trigger this event explicitly and set patients in the view
						}
				
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
				monthYearStrArray = getMonthYearStrArray(sessions);
						
				//Set months in the view
				setMonthsInView();
			
				//Set selection in the months combobox
				setSelectedMonthInView();
				
				//Set sessions in the view
				setSessionsOfMonthInView();
				
				//Set selection in the sessions combobox
				setSelectedSessionInView();
				
				//ReqReloadOfSelSessionFlag is OFF
				if( typeof doctorUser.ReqReloadOfSelSessionFlag === "undefined" || (doctorUser.ReqReloadOfSelSessionFlag === null) )
				{
					//Set patients in the view
					setPatientsInView();
				}
				else //ReqReloadOfSelSessionFlag is ON (selsession-slot updated/deleted)
				{
					UtilityService.doctorUser_setReqReloadOfSelSessionFlag(null);
					$scope.sesChange();	//Trigger this event explicitly and set patients in the view
				}
			}
			
			return;
		};
		
		//Instance variables used : sessions
		var setSessionsInView = function ()
        {
            if(sessions == null) {}
            else
            {
				$scope.sessions = sessions;
            }
		
            return; 
        };
		
		var setSelectedSessionInView = function ()
		{
			if($scope.sessions.length > 0)
			{
				if(selSession != null)
				{
					for(var i=0; i<$scope.sessions.length; i++)
					{
						if($scope.sessions[i].SesID == selSession.SesID)
						{
							$scope.selectedSession = $scope.sessions[i];
							break;
						}
					}
				}
				else {};
			}
			
			return;
		};
		
		//Instance variables used : selSessionPatientSlots
		var setPatientsInView = function ()
        {
			var patientSlots = selSessionPatientSlots;
			
			$scope.patientSlots = patientSlots;
			
            if(patientSlots == null) 
			{ 
				$scope.patientSlots = [];
			}
            else
            {
				for(var i=0; i<patientSlots.length; i++)
				{
					$scope.patientSlots[i].Age = getAge(patientSlots[i].DateOfBirth);
					$scope.patientSlots[i].updateSlotStatusBtnMode = "Edit";
					//$scope.patientSlots[i].NewStatus = {name: $scope.patientSlots[i].Status};
					
					$scope.patientSlots[i].slotStatuses = [{name: 'booked', disableFlag: false}, 
					                                       {name: 'cancelled', disableFlag: false}, 
														   {name: 'arrived', disableFlag: false}, 
														   {name: 'next', disableFlag: false}, 
														   {name: 'consulted', disableFlag: true},  //disable 'consulted' option
														   {name: 'diagnosed', disableFlag: true}	//disable 'diagnosed' option
														  ];
					//set the selection
					for(var j=0; j<$scope.patientSlots[i].slotStatuses.length; j++)
					{
						if($scope.patientSlots[i].slotStatuses[j].name == $scope.patientSlots[i].Status)
						{
							$scope.patientSlots[i].NewStatus = $scope.patientSlots[i].slotStatuses[j];
							break;
						}
					}
				}
            }
		
            return; 
        };
		
		//Note : Copy paste reproduction from ListSessions/controllers
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
		
		//Note : Similar to setSelectedMonthInView() from ListSessions/controllers. Some changes made
		//Instance variables used : None
		var setSelectedMonthInView = function ()
		{
			if(selSession != null)	//Preselected session exists
			{
				$scope.selectedMonth = getMonthFromSesDateStr(selSession.SessionDateStr);
			}
			else //No preselected session
			{
				//Default month will be set
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
				}
			}
			
			return;
		};
		
		//Note : Copy paste reproduction from ListSessions/controllers
		//Instance variables used : sessions
		var setSessionsOfMonthInView = function ()
        {
            if(sessions == null) {}
            else
            {
				if($scope.selectedMonth === "All Months")
				{
					$scope.sessions = sessions;
				}
				else
				{
					$scope.sessions = getSessionsOfMonth(sessions, $scope.selectedMonth);
				}
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
				selSession = doctorUser.selSession;
				selSessionMonth = doctorUser.selSessionMonth;
				selSessionPatientSlots = doctorUser.selSessionPatientSlots;
				selSlot = doctorUser.selSlot;
			
				//Note : This block has to be modified later.
				/*
				if(usrType === 'D')
				{
					$scope.slotStatuses = ["booked", "cancelled", "arrived", "next", "consulted", "diagnosed"];
				}
				else if(usrType === 'S')
				{
					$scope.slotStatuses = ["booked", "cancelled", "arrived", "next", "consulted", "diagnosed"];
				}
				else 
				{
					$scope.slotStatuses = ["booked", "cancelled", "arrived", "next", "consulted", "diagnosed"];
				}
				*/
				
			}
			
			return;
		};
		
		var init = function () {
			initVariables();
			
		    return;
        };
		
		init();
    }]);
