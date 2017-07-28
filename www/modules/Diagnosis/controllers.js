/*
Create By  : Tony Jacob
Description: Controller for Diagnosis module
*/

'use strict';
//console.log('From Diagnosis-controllers.js');
angular.module('Diagnosis')
 
.controller('DiagnosisController',
	['$scope', '$rootScope', '$location', 'DiagnosisService', 'UtilityService',
    function ($scope, $rootScope, $location, DiagnosisService, UtilityService) {
		//console.log('Inside DiagnosisController : ');
		var isOKToLoadForm = true;
		var doctorID = $rootScope.globals.currentUser.DocID;
		var usrType = $rootScope.globals.currentUser.UsrType;

		var doctorUser = null;
		var normalUser = null;
		
		var selSession = null;
		var selSlotPatient = null;
		var selSlot = null;
		var selSlotDiagnosis = null;
				
		var patientSlotList = [];
		var patients = [];
		
		var getSlotsProcessFinished = true;
		var getPatientProcessFinished = true;
		
		$scope.usrName = $rootScope.globals.currentUser.usrName;
		$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
		$scope.UsrType = $rootScope.globals.currentUser.UsrType;
		
		$scope.diagnosis = {};
		$scope.patient = {};
		$scope.slots = [];
		$scope.selectedSlot = {};
		$scope.slotStatuses = [];
		$scope.newStatusObj = null;
		$scope.patID = "";	//Note : This variable was used in html earlier and was removed later. But this is still retained in the controller
		$scope.patientDetails = "";
		
		$scope.patients = [];
		$scope.selectedPatient = null;
				
		$scope.enableSearchChecked = false;
		$scope.disableSelectPatCombo = true;
		$scope.showAllSlotsBtn = true;
		
		$scope.updateSlotStatusBtnMode = "Edit";
		
		$scope.isSelectedSlotInFuture = true;
		
		$scope.menuItemClick = function (url) {

			$location.path(url);
			
			return;
		};
		
		$scope.formLoad = function () {
			$scope.cue = "";
			$scope.error = "";
						
			if(isOKToLoadForm)
				getAndSetDiagnosisInView();
			
			return;
		};
		
		$scope.enableSearchClick = function (enableSearchChecked) {
			$scope.cue = "";
			$scope.error = "";
			
			//Hide Get All Slots Button
			$scope.showAllSlotsBtn = false;
			
			if(enableSearchChecked == true)
			{
				$scope.disableSelectPatCombo = false;
			
				$scope.selectedPatient = null;
				$scope.patID = ''; //clear patID
				$scope.patient = {}; //clear patient
				
				$scope.diagnosis = {};	//clear diagnosis
					
				$scope.selectedSlot = null;	//clear slot selection
				$scope.newStatusObj = null;
				$scope.slots = [];	//clear slots
			
				getPatientsAndSetInView();
			}
			else 
			{
				$scope.disableSelectPatCombo = true;
			}
			
			return;
		};
		
		$scope.editDiagnosisFields = function () {
			$scope.cue = "";
			$scope.error = "";
			enableDiagnosisFieldsInView();
			
			return;
		};

		$scope.saveDiagnosis = function () {
            $scope.cue = "";
			$scope.error = "";
			
			var isValidated = false;
			var isPatIDValid = false;
			var isPatIDSameAsSelSlotPatID = false;
			var isSlotSelected = false;
			
			var selectedSlot = $scope.selectedSlot;
			var patID = $scope.patID;
			
			//Note : This validation has become superfluous
			isPatIDValid = isNumber(patID);
			if(!isPatIDValid) $scope.error = "Please enter a valid PatientID";
			isValidated  = isPatIDValid;
			
			if(isValidated)
			{
				if($scope.patID == selSlotPatient.PatID)
					isPatIDSameAsSelSlotPatID = true;
				else 
					isPatIDSameAsSelSlotPatID = false;
				
				if(!isPatIDSameAsSelSlotPatID) $scope.error = "PatientID mismatch. Enter PatientID and press 'Get All Slots' button";
				isValidated  = isPatIDValid && isPatIDSameAsSelSlotPatID;
			}
			
			if(isValidated)
			{
				if(selectedSlot == null  || (selectedSlot != null && typeof selectedSlot.SloID === "undefined"))
					isSlotSelected = false;
				else
					isSlotSelected = true;
				
				if(!isSlotSelected) $scope.error = "Please select a slot";
			}
			
			isValidated  = isPatIDValid && isSlotSelected;
			
			if(isValidated)
            {
				if($scope.diagnosis.DID === 0)	//diagnosis doesn't exist
				{
					createDiagnosis();
				}
				else	//diagnosis already exists
				{
					updateDiagnosis();
				}
			}
			else
			{
				//alert('Rectify the errors and try again');
			}

            return;
        };
		
		$scope.slotChange = function () {
			$scope.cue = "";
			$scope.error = "";
			
			selSlot = $scope.selectedSlot;		
			
			var isfuturetime = isFutureTime(selSlot.SessionStart);
			if(isfuturetime) $scope.isSelectedSlotInFuture = true; else $scope.isSelectedSlotInFuture = false;
				
			UtilityService.user_setSelectedSlot(selSlot, $scope.UsrType);
			 
			//Set selected slot status
			setSelectedSlotStatusInView(1);
			
			//Get and set selected slot-diagnosis
			getAndSetDiagnosisInView();
			
			return;
		};
		
		$scope.patientChange = function () {
			$scope.cue = "";
			$scope.error = "";
			
			if($scope.selectedPatient != null)
			{
				var selectedPatientPatID = getSelectedPatientPatID();
				
				//Set PatID
				$scope.patID = selectedPatientPatID;
				
				$scope.allSlotsBtnClick();
			}
			else {}
			
			return;
		};
		
		//Instance variables used : doctorID
		//Global variables used : None
		$scope.allSlotsBtnClick = function () {
			$scope.cue = "";
			$scope.error = "";
			
			$scope.patient = {};
			
			$scope.diagnosis = {};
				
			$scope.selectedSlot = null;
			$scope.newStatusObj = null;
			$scope.slots = [];
				
			//Note : This validation has become superfluous
			var isValidated = isNumber($scope.patID);

			if(isValidated)
            {
				//Get slots and set in combobox
				getAndSetSlotsInView(1);
				
				//Get patient and set in view
				getAndSetPatientInView();
			}
			else
			{
				//alert('Please enter a valid PatientID');
				$scope.error = "Please enter a valid PatientID";
			}
			
			return;
		};
		
		$scope.updateSlotStatusBtnClick = function (selectedSlotStatus) {
			$scope.cue = "";
			$scope.error = "";
			
			var mode = $scope.updateSlotStatusBtnMode;
			
			if(mode == "Edit")
			{
				$scope.updateSlotStatusBtnMode = "Save";
			}
			else if(mode == "Save")
			{
				var isValidated = false;
				var isPatIDValid = false;
				var isSlotSelected = false;
				var isSlotStatusSelected = false;
				
				var selectedSlot = $scope.selectedSlot;
				
				var patID = $scope.patID;
			
				//Note : This validation has become superfluous
				isPatIDValid = isNumber(patID);
				if(!isPatIDValid) $scope.error = "Please enter a valid PatientID";
				isValidated  = isPatIDValid;
			
				if(isValidated)
				{
					if(selectedSlot == null  || (selectedSlot != null && typeof selectedSlot.SloID === "undefined"))
						isSlotSelected = false;
					else
						isSlotSelected = true;
					
					if(!isSlotSelected) $scope.error = "Please select a slot";
					isValidated  = isPatIDValid && isSlotSelected;
				}
				
				if(isValidated)
				{
					if(selectedSlotStatus == null || selectedSlotStatus == '')
						isSlotStatusSelected = false;
					else
						isSlotStatusSelected = true;
					
					if(!isSlotStatusSelected) $scope.error = "Please select a slot status";
					isValidated  = isPatIDValid && isSlotSelected && isSlotStatusSelected;
				}

				if(isValidated)
				{
 					updateSlot(selectedSlot, selectedSlotStatus);
				}
				
				$scope.updateSlotStatusBtnMode = "Edit";
			}
			else {}
			
			return;
		};
		
		$scope.cancelSlotStatusUpdateBtnClick = function () {
			$scope.error = "";
			
			$scope.updateSlotStatusBtnMode = "Edit";
			
			return;
		};
		
		$scope.printPage = function () {
			$scope.error = "";
			
			window.print();
			
			return;
		};
		
		//Instance variables used : None
		var setSelectedPatientInView = function ()
		{
			if($scope.patients.length > 0)
			{
				$scope.selectedPatient = $scope.patients[0];
			}
			
			return;
		};
		
		var getPatientsAndSetInView = function()
        {
			if(usrType === 'D')	//Doctor User
			{
				if(typeof doctorUser.Patients === "undefined" || (doctorUser.Patients === null) )
				{
					$scope.dataLoading = true;
					UtilityService.DoctorUser_getPatients($rootScope.globals.currentUser.DocID)
					.then(function(response) {
						var statusInt = parseInt(response.status);
						//console.log('statusInt : ' + statusInt);
						if(statusInt == 200) {
							patients = response.data;
							
							UtilityService.doctorUser_setPatients(patients);
						
							//Set patients in the view
							setPatientsInView(1);
							
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
					patients = doctorUser.Patients;
					
					//Set patients in the view
					setPatientsInView(1);
				}
			}
			else if(usrType === 'N')	//Normal User
            {
				if(typeof normalUser.Patients === "undefined" || (normalUser.Patients === null) )
				{
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
								setPatientsInView(1);
							
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
					patients = normalUser.Patients;
				
					//Set patients in the view
					setPatientsInView(1);
				}
			}
		};
			
		//Instance variables used : None
		//Global variables used : None
		var updateSlot = function (patientSlot, selectedSlotStatus)
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
						$scope.selectedSlot.Status = selectedSlotStatus;
						updateSelSlotStatus(slot, selectedSlotStatus);
												
						$scope.cue = "Done";
						$scope.error = "";
						
						setReqReloadOfSelSessionFlag(true);
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
		
		//Instance variables used : selSession, selSlot
		//Global variables modified : UtilityService.doctorUser.ReqReloadOfSelSessionFlag
		var setReqReloadOfSelSessionFlag = function (flag)
		{
			if(selSession != null && selSlot != null)
			{
				if(selSession.SesID == selSlot.SesID)
				{
					UtilityService.doctorUser_setReqReloadOfSelSessionFlag(flag);
				}
				else {}
			}
			else {}
			
			return;
		};
		
		//Note : This is very similar to the function of the same name in ListPatients/controllers.js
		//Instance variables used : selSlot
		//Global variables modified : UtilityService.doctorUser.selSlot
		var updateSelSlotStatus = function (patientSlot, slotStatus)
		{
			var selectedSlot = selSlot;
				
			if(selectedSlot != null)
			{
				if(selectedSlot.SloID == patientSlot.SloID)	//this is a given
				{
					selectedSlot.Status = slotStatus;
					UtilityService.user_setSelectedSlot(selectedSlot, $scope.UsrType);
				}
			}
			else {}
			
			return;
		};
		
		//Instance variables used : None
		//Global variables used : None
		var createDiagnosis = function ()
		{
			$scope.dataLoading = true;
			DiagnosisService.DoctorUser_createDiagnosis($scope.diagnosis)
				.then(function (response) {
							
					var statusInt = parseInt(response.status);
					//console.log("statusInt : " + statusInt);
				
					//if(statusInt == 200 || statusInt == 201) {
					if(statusInt == 200) {
						var respData = angular.toJson(response.data);
						//console.log(respData);
					
						var responseData = response.data;
						
						if(responseData === true)
						{
							//alert("Success!!!!!! Diagnosis created");
							$scope.cue = "Done";
							$scope.error = "";
							
							//Disable diagnosis fields in view
							disableDiagnosisFieldsInView();
							
							getAndSetSlotsInView(2);
							
							var newDID = 101;	//Note : This is not the real DID of the diagnosis that was just created. 
							                    //       But this would serve our purpose
							var selSlotDiag = $scope.diagnosis;
							selSlotDiag.DID = newDID;
							UtilityService.doctorUser_setSelectedSlotDiagnosis(selSlotDiag);
							$scope.diagnosis = selSlotDiag;
							
							var selectedSlot = $scope.selectedSlot;
							syncPatSlotsInDBAndView(selectedSlot, selSlotDiag);
							
							$scope.dataLoading = false;
						}
						else
						{
							//alert("Diagnosis updating failed!!! Try again");
							$scope.error = "Diagnosis updating failed!!! Try again";
							$scope.cue = "";
							$scope.dataLoading = false;
						}
					} else {
						//$scope.error = response.message;
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
		
		//Instance variables used : None
		//Global variables used : None
		var updateDiagnosis = function ()
		{
			$scope.dataLoading = true;
			DiagnosisService.DoctorUser_updateDiagnosis($scope.diagnosis)
				.then(function (response) {
						
					var statusInt = parseInt(response.status);
					//console.log("statusInt : " + statusInt);
				
					//if(statusInt == 200 || statusInt == 201) {
					if(statusInt == 200) {
						var respData = angular.toJson(response.data);
						//console.log(respData);
					
						var responseData = response.data;
						
						if(responseData === true)
						{
							//alert("Success!!!!!! Diagnosis updated");
							$scope.cue = "Done";
							$scope.error = "";
							
							//Disable diagnosis fields in view
							disableDiagnosisFieldsInView();
							
							var selSlotDiag = $scope.diagnosis;
							UtilityService.doctorUser_setSelectedSlotDiagnosis(selSlotDiag);
							
							$scope.dataLoading = false;
						}
						else
						{
							//alert("Diagnosis updating failed!!! Try again");
							$scope.error = "Diagnosis updating failed!!! Try again";
							$scope.cue = "";
							$scope.dataLoading = false;
						}
					} else {
						//$scope.error = response.message;
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
		
		var disableDiagnosisFieldsInView = function ()
        {
			$scope.disableIllness = true;
			$scope.disableDoctorComments = true;
			$scope.disablePrescription = true;
			
			return;
		};
		
		var enableDiagnosisFieldsInView = function ()
        {
			$scope.disableIllness = false;
			$scope.disableDoctorComments = false;
			$scope.disablePrescription = false;
			
			return;
		};
		
		//Instance variables modified : None
		//Global variables used : None
		var getAndSetDiagnosisInView = function ()
        {
			$scope.error = "";
			var selectedSlot = $scope.selectedSlot;
			if(selectedSlot == null  || (selectedSlot != null && typeof selectedSlot.SloID === "undefined")) {}
			else
			{
				$scope.dataLoading = true;
				DiagnosisService.GetDiagnosis(selectedSlot.SloID)
				.then(function(response) {
						var statusInt = parseInt(response.status);
						//console.log('statusInt : ' + statusInt);
						if(statusInt == 200) {
							//var tt = angular.toJson(response.data);
							//console.log(tt);
							
							var respData = response.data;
							var selSlotDiag = respData;
						
							if(selSlotDiag == null)
							{
								selSlotDiag = {DID : 0, SloID : selectedSlot.SloID, Illness : 'not diagnosed',
								DoctorComments : 'not diagnosed', Prescription : 'not diagnosed', DiscussionTemplate : '', PostAction : ''};
							}
							else {}
							
							selSlotDiagnosis = selSlotDiag;
							if(usrType == 'D')
							{
								UtilityService.doctorUser_setSelectedSlotDiagnosis(selSlotDiagnosis);
							}
							else {}
			
							//Sync patient slots in DB and view (whether each slot has a diagnosis or not)
							syncPatSlotsInDBAndView(selectedSlot, selSlotDiag);
			
							//Set diagnosis in the view
							setDiagnosisInView();
							
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
			
			return;
		};
		
		//Instance variables modified : getPatientProcessFinished
		//Instance variables used : getSlotsProcessFinished
		//Global variables used : None
		var getAndSetPatientInView = function ()
        {
			var patID = $scope.patID;
			
			getPatientProcessFinished = false;
			
			$scope.dataLoading = true;
			DiagnosisService.GetPatient(patID)
			.then(function(response) {
				var statusInt = parseInt(response.status);
				//console.log('statusInt : ' + statusInt);
			
				if(statusInt == 200) {
					//var tt = angular.toJson(response.data);
					//console.log(tt);
					
					var patientList = response.data;
					
					var patient = null;
										
					if(patientList.length > 0)
					{
						patient = patientList[0];
					
						var selPatient = {SloID : 0, PatID : patient.PatID, PatName : patient.PatName, UsrAddress : patient.UsrAddress, 
										  Sex : patient.Sex, Age : getAge(patient.DateOfBirth), DateOfBirth : getFormattedDate(patient.DateOfBirth)};
						
						selSlotPatient = selPatient;
						
						if(usrType == 'D')
						{
							UtilityService.doctorUser_setSelectedSlotPatient(selSlotPatient);
						}
						else {}
					
						//set patient in the view
						setPatientInView();
					}
					else 
					{
						$scope.error = "No patient found!!!";
					}
					
					getPatientProcessFinished = true;

					if(getSlotsProcessFinished == true && getPatientProcessFinished == true)
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
			
			return;
		};
		
		//Instance variables modified : getSlotsProcessFinished
		//Instance variables used : getPatientProcessFinished
		//Global variables used : None
		var getAndSetSlotsInView = function (flag)
        {
			var patID = $scope.patID;
						
			getSlotsProcessFinished = false;
			
			$scope.dataLoading = true;
			DiagnosisService.GetPatientSlotList(patID, doctorID)
			.then(function(response) {
				var statusInt = parseInt(response.status);
				//console.log('statusInt : ' + statusInt);
			
				if(statusInt == 200) {
					//var tt = angular.toJson(response.data);
					//console.log(tt);
					
					patientSlotList = response.data;
					
					//Populate the slots combobox
					if(flag == 1) setSlotsInView(1);
					else {}
					
					getSlotsProcessFinished = true;

					if(getSlotsProcessFinished == true && getPatientProcessFinished == true)
					{
						$scope.dataLoading = false;
					}
					
					if(patientSlotList != null && patientSlotList.length == 0) $scope.error = "The patient doesn't have any slots.";
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
			
			return;
		};
		
		//Note : This function is to update the last created/fetched diagnosis in the slot combobox.
		var syncPatSlotsInDBAndView = function (selectedSlot, selSlotDiag)
		{
			for(var i=0; i<$scope.slots.length; i++)
			{
				if($scope.slots[i] == selectedSlot)
				{
					if(selSlotDiag.DID == 0)
					{
						$scope.slots[i].hasDiagnosis = false;
					}
					else
					{
						$scope.slots[i].hasDiagnosis = true;
					}
					
					break;	//jump out of the loop
				}
			}
			
			return;
		}
		
		//Instance variables used : selSlot
		//Global variables used : None
		var setSlotsInView = function (flag)
        {
			if(flag === 0)
			{
				if(selSlot == null) {}
				else
				{
					var slot = {SloID: selSlot.SloID, SesID:selSlot.SesID,
						        DocID:selSlot.DocID, PatID: selSlot.PatID, 
								SlotNO:selSlot.SlotNO, BillNo:selSlot.BillNo,
								Amount:selSlot.Amount, Status:selSlot.Status,
								SessionStart: selSlot.SessionStart,
								SessionDateStr: selSlot.SessionDateStr, hasDiagnosis:false};
								
					$scope.slots = [slot];
				}
			}
			else
			{
				if(patientSlotList.length > 0)
				{
					for(var i=0; i<patientSlotList.length; i++)
					{
						var slot = {SloID:patientSlotList[i].SloID, SesID:patientSlotList[i].SesID,
						            DocID:patientSlotList[i].DocID, PatID:patientSlotList[i].PatID,
									SlotNO:patientSlotList[i].SlotNO, BillNo:patientSlotList[i].BillNo,
									Amount:patientSlotList[i].Amount, Status:patientSlotList[i].Status,
									SessionStart: patientSlotList[i].SessionStart,
									SessionDateStr: getFormattedDate(patientSlotList[i].SessionStart), hasDiagnosis:false};
						$scope.slots[i] = slot;
					}
				}
			}
			
            return; 
        };
		
		//Instance variables used : selSlotPatient, patients
		//Global variables used : None
		var setPatientsInView = function (flag)
        {
			if(flag === 0)
			{
				var patient = selSlotPatient;
				
				if(patient == null) {}
				else
				{
					$scope.patients = [patient];
				}
			}
			else
			{
				$scope.patients = patients;
			}
			
			return; 
		};
		
		//Instance variables used : None
		//Global variables used : None
		var setSelectedSlotInView = function ()
		{
			if($scope.slots.length > 0)
			{
				$scope.selectedSlot = $scope.slots[0];
				
				var isfuturetime = isFutureTime($scope.selectedSlot.SessionStart);
				if(isfuturetime) $scope.isSelectedSlotInFuture = true; else $scope.isSelectedSlotInFuture = false;
			}
						
			return;
		};
		
		//Instance variables used : None
		//Global variables used : None
		var setSelectedSlotStatusInView = function (flag)
		{
			if(flag === 0)
			{
				if(selSlot == null) {}
				else
				{
					//$scope.selectedSlotStatus = selSlot.Status;
					
					//Set the selection
					for(var i=0; i<$scope.slotStatuses.length; i++)
					{
						if($scope.slotStatuses[i].name == selSlot.Status)
						{
							$scope.newStatusObj = $scope.slotStatuses[i];
							break;
						}
					}
				}
			}
			else
			{
				if($scope.selectedSlot != null)
				{
					//$scope.selectedSlotStatus = $scope.selectedSlot.Status;
					
					//Set the selection
					for(var i=0; i<$scope.slotStatuses.length; i++)
					{
						if($scope.slotStatuses[i].name == selSlot.Status)
						{
							$scope.newStatusObj = $scope.slotStatuses[i];
							break;
						}
					}
				}
			}
			return;
		};
		
		//Instance variables used : selSlotPatient
		//Global variables used : None
		var setPatientIDInView = function ()
        {
			var patient = selSlotPatient;
			
            if(patient == null) {}
            else
            {
				$scope.patID = patient.PatID;
            }
		
            return; 
        };
		
		//Instance variables used : selSlotPatient
		//Global variables used : None
		var setPatientInView = function ()
        {
			var patient = selSlotPatient;
			
            if(patient == null) {}
            else
            {
				$scope.patient = patient;
				
				$scope.patient.SexStr = getSexStr($scope.patient.Sex);
				$scope.patientDetails = ", " + $scope.patient.PatName + 
										", " + $scope.patient.UsrAddress + 
										", " + $scope.patient.SexStr + 
										", " + $scope.patient.Age + " Years" + 
										", " + patient.DateOfBirth;
            }
			
            return; 
        };
		
		//Instance variables used : selSlotDiagnosis
		//Global variables used : None
		var setDiagnosisInView = function ()
        {
			var diagnosis = selSlotDiagnosis;
			
            if(diagnosis == null) {}
            else
            {
				$scope.diagnosis = diagnosis;
            }
			
            return; 
        };
		
		//Note : Copy paste reproduction from BookConsultation\controllers.js
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
		
		//Instance variables used : doctorUser,normalUser
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
					selSession = doctorUser.selSession;
					selSlotPatient = doctorUser.selSlotPatient;
					selSlot = doctorUser.selSlot;
					selSlotDiagnosis = doctorUser.selSlotDiagnosis;
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
					selSession = null;
					selSlotPatient = null;
					selSlot = null;
					selSlotDiagnosis = null;
				}
			}
			
			//Note : This block has to be modified later.
			if(usrType === 'D')
			{
				$scope.slotStatuses = [{name: 'Booked', disableFlag: false}, 
									   {name: 'Cancelled', disableFlag: false}, 
									   {name: 'Arrived', disableFlag: false}, 
									   {name: 'Next', disableFlag: false}, 
									   {name: 'Consulted', disableFlag: false}, 
									   {name: 'Diagnosed', disableFlag: false}
									  ];
			}
			else if(usrType === 'S')
			{
				$scope.slotStatuses = [{name: 'Booked', disableFlag: true}, 
									   {name: 'Cancelled', disableFlag: true}, 
									   {name: 'Arrived', disableFlag: true}, 
									   {name: 'Next', disableFlag: true}, 
									   {name: 'Consulted', disableFlag: false}, 
									   {name: 'Diagnosed', disableFlag: true}
									  ];
			}
			else 
			{
				//Other than D/S user types this is not relevant
				$scope.slotStatuses = [];
			}
			
			return;
		};
		
		var init = function () {
			
			initVariables();
			
			//Populate the patients combobox
			setPatientsInView(0);
			
			//Set selection in the patients combobox
			setSelectedPatientInView();
			
			//Populate the slots combobox
			setSlotsInView(0);
			
			//Set selection in the slots combobox
			setSelectedSlotInView();
			
			//Set selected slot status
			setSelectedSlotStatusInView(0);
			
			//set patientID in the view
			setPatientIDInView();
			
			//set patient in the view
			setPatientInView();
			
			//Disable diagnosis fields
			disableDiagnosisFieldsInView();
           
            return;
        };
		
		init();
    }]);
