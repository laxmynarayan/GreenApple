/*
Create By  : Tony Jacob
Description: Utility services shared across various modules. Most of the global variables are taken care by this service 
*/

'use strict';
//console.log('From Utility-services.js');
angular.module('Utility')
 
.factory('UtilityService',
    ['$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {
	
		//console.log('Inside function UtilityService Utility-services.js');
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-13-126-5-195.ap-south-1.compute.amazonaws.com/SmartClinicWebApi";



		
		service.setDoctorUser = setDoctorUser;
		service.doctorUser_setSessions = doctorUser_setSessions;
		service.doctorUser_setPatients = doctorUser_setPatients;
		service.doctorUser_setSelectedPatient = doctorUser_setSelectedPatient;
		service.doctorUser_setSelectedSlot = doctorUser_setSelectedSlot;
		service.doctorUser_setSelectedSession = doctorUser_setSelectedSession;
		service.doctorUser_setSelectedSessionMonth = doctorUser_setSelectedSessionMonth;
		service.doctorUser_setSelectedSessionPatientSlots = doctorUser_setSelectedSessionPatientSlots;
		service.doctorUser_setSelectedSlotDiagnosis = doctorUser_setSelectedSlotDiagnosis;
		service.doctorUser_setSelectedSlotPatient = doctorUser_setSelectedSlotPatient;
		service.doctorUser_setLocations = doctorUser_setLocations;
		
		service.setNormalUser = setNormalUser;
		service.normalUser_setDocIDList = normalUser_setDocIDList;
		service.normalUser_setPatients = normalUser_setPatients;
		service.normalUser_setDoctorSessions = normalUser_setDoctorSessions;
		service.normalUser_setSelectedSlot = normalUser_setSelectedSlot;
		
		service.user_setDoctorSessions = user_setDoctorSessions;
		service.user_setPatients = user_setPatients;
		service.user_setSelectedSlot = user_setSelectedSlot;
		
		service.setDoctors = setDoctors;
		
        service.GetDoctorSessions = GetDoctorSessions;
		service.DoctorUser_getSlots = DoctorUser_getSlots;
		
		service.DoctorUser_getPatients = DoctorUser_getPatients;
		service.NormalUser_getPatients = NormalUser_getPatients;
		service.updateSlot = updateSlot;
		
		service.doctorUser_setSessionDeletionFlag = doctorUser_setSessionDeletionFlag;
		service.doctorUser_setReqReloadOfSelSessionFlag = doctorUser_setReqReloadOfSelSessionFlag;
               
		

        return service;

		function setDoctorUser() {
			
			service.doctorUser = {Sessions : null, Patients : null, Locations : null};
            
            return;
        };
		
		function doctorUser_setSessions(doctorSessions) {
            service.doctorUser.Sessions = doctorSessions;
			
			if(service.doctorUser.Sessions != null)
			{
				//Add additional properties to each object -> SessionDateStr, SessionStartStr, SessionEndStr (Required in view)
				for(var i=0; i<service.doctorUser.Sessions.length; i++)
				{
					service.doctorUser.Sessions[i].SessionDateStr = getFormattedDate(service.doctorUser.Sessions[i].SessionStart);
					service.doctorUser.Sessions[i].SessionStartStr = getClockTime(service.doctorUser.Sessions[i].SessionStart);
					service.doctorUser.Sessions[i].SessionEndStr = getClockTime(service.doctorUser.Sessions[i].SessionEnd);
				}
			}
			
            return;
        };
		
		function doctorUser_setPatients(patients) {
            //service.doctorUser.patients = patients;
			service.doctorUser.Patients = patients;
            return;
        };
		
		function doctorUser_setSelectedPatient(patient) {
            service.doctorUser.selectedPatient = patient;
            return;
        };
		
		function doctorUser_setSelectedSession(session) {
            service.doctorUser.selSession = session;
            return;
        };
		
		//Note : The sessionMonth is not exactly the month of the session. It could be 'All Months' too
		function doctorUser_setSelectedSessionMonth(sessionMonth) {
            service.doctorUser.selSessionMonth = sessionMonth;
            return;
        };
		
		function doctorUser_setSelectedSessionPatientSlots(selSessionPatientSlots) {
			service.doctorUser.selSessionPatientSlots = selSessionPatientSlots;
			
            return;
        };
		
		function doctorUser_setSelectedSlotPatient(slot) {
			
			service.doctorUser.selSlotPatient = slot;
			
			if(service.doctorUser.selSlotPatient != null)
			{
				var patient = {SloID : slot.SloID, PatID : slot.PatID, PatName : slot.PatName, UsrAddress : slot.UsrAddress, 
						   Sex : slot.Sex, Age : getAge(slot.DateOfBirth), DateOfBirth : getFormattedDate(slot.DateOfBirth),
						   Status : slot.Status};
				service.doctorUser.selSlotPatient = patient;
			}
			else {}
			
            return;
        };
		
		function user_setSelectedSlot(slot, usrType) {
			
			if(usrType == 'D' || usrType == 'S')
			{
				service.doctorUser_setSelectedSlot(slot);
			}
			else if(usrType == 'N')
			{
				service.normalUser_setSelectedSlot(slot);
			}
			else {}
			
            return;
        };
		
		function doctorUser_setSelectedSlotDiagnosis(slotDiagnosis) {
            service.doctorUser.selSlotDiagnosis = slotDiagnosis;
            return;
        };
			
		function doctorUser_setSelectedSlot(slot) {
            
			service.doctorUser.selSlot = slot;
			
			if(service.doctorUser.selSlot != null)
			{
				var theSlot = {SloID:slot.SloID, SesID:slot.SesID,
							   DocID:slot.DocID, PatID:slot.PatID,
							   SlotNO:slot.SlotNO, BillNo:slot.BillNo,
							   Amount:slot.Amount, Status:slot.Status,
							   SessionStart: slot.SessionStart,
							   SessionDateStr: slot.SessionDateStr};
							   
				service.doctorUser.selSlot = theSlot;
			}
			else {}
		
            return;
        };
		
		function normalUser_setSelectedSlot(slot) {
            
			service.normalUser.selSlot = slot;
			
			if(service.normalUser.selSlot != null)
			{
				var theSlot = {SloID:slot.SloID, SesID:slot.SesID,
							   DocID:slot.DocID, PatID:slot.PatID,
							   SlotNO:slot.SlotNO, BillNo:slot.BillNo,
							   Amount:slot.Amount, Status:slot.Status,
							   SessionStart: slot.SessionStart,
							   SessionDateStr: slot.SessionDateStr};
							   
				service.normalUser.selSlot = theSlot;
			}
			else {}
		
            return;
        };
        
		function doctorUser_setLocations(locations) {
            service.doctorUser.Locations = locations;
            return;
        };
		
		function setNormalUser() {
			
            service.normalUser = {Patients : null};
            
            return;
        };
		
		function normalUser_setPatients(patients) {
            //service.normalUser.patients = patients;
			service.normalUser.Patients = patients;
            return;
        };
		
		function normalUser_setDocIDList(docIDList) {
			service.normalUser.DocIDList = docIDList;
            return;
        };
		
		function normalUser_setDoctorSessions(sessions) {
            service.normalUser.Sessions = sessions;
			
			if(service.normalUser.Sessions != null)
			{
				//Add additional properties to each object -> SessionDateStr, SessionStartStr, SessionEndStr (Required in view)
				for(var i=0; i<service.normalUser.Sessions.length; i++)
				{
					service.normalUser.Sessions[i].SessionDateStr = getFormattedDate(service.normalUser.Sessions[i].SessionStart);
					service.normalUser.Sessions[i].SessionStartStr = getClockTime(service.normalUser.Sessions[i].SessionStart);
					service.normalUser.Sessions[i].SessionEndStr = getClockTime(service.normalUser.Sessions[i].SessionEnd);
				}
			}
			
            return;
        };
		
		function user_setDoctorSessions(doctorSessions, usrType) {
            
			if(usrType == 'D')
			{
				service.doctorUser_setSessions(doctorSessions);
			}
			else if(usrType == 'N')
			{
				service.normalUser_setDoctorSessions(doctorSessions);
			}
			else {}
			
            return;
        };
		
		function user_setPatients(patients, usrType) {
            
			if(usrType == 'D')
			{
				service.doctorUser_setPatients(patients);
			}
			else if(usrType == 'N')
			{
				service.normalUser_setPatients(patients);
			}
			else {}
			
            return;
        };
		
		function GetDoctorSessions(doctorID) {
            var def = $q.defer();
            //console.log('Inside UtilityService-GetDoctorSessions()...doctorID : ' + doctorID);
            
            $http({
                method: 'GET',
				url: BaseAPIUrl+'/Session/GetSession/' + doctorID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
 				params: {}
                })
                .success(function (data, status, headers, config) {
                    //console.log("success");
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    //console.log("error...");
                    def.reject("Failed to get user info");
                    alert("AJAX failed!!!!!!");
                });
            
            return def.promise;
        };
		
		function DoctorUser_getSlots(sesID, docID) {
            var def = $q.defer();
            //console.log('will call url : GetSlot'); 

            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Slot/GetSlot/' + sesID + ',' + docID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
                params: {}
                })
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    def.reject("Failed to get pat sessions");
                    alert("AJAX failed!!!!!!");
                });
 
            return def.promise;
        };
		
		function DoctorUser_getPatients(docID) {
            var def = $q.defer();
            		
            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Patient/GetDoctorPatientList/' + docID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
                params: {}
                })
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    def.reject("Failed to get pat sessions");
                    alert("AJAX failed!!!!!!");
                });
	
            return def.promise;
        };
		
		function NormalUser_getPatients(usrID, docID) {
            var def = $q.defer();
            //console.log('Inside service.NormalUser_getPatients()...+++'); 
            
            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Patient/GetUserPatientList/' + usrID  + ',' + docID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
                params: {}
                })
                .success(function (data, status, headers, config) {
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    def.reject("Failed to get diagnosis");
                    alert("AJAX failed!!!!!!");
                });
            
            return def.promise;
        };
		
		function updateSlot(slot) {
			//console.log('Inside updateSlot()');
            var def = $q.defer();
            
            $http({
                method: 'POST',
                url: BaseAPIUrl+'/Slot/UpdateSlot',
                data: slot,
                })
                .success(function (data, status, headers, config) {
                    //console.log("success");
                    var results = {};
                    results.data = data;
                    results.headers = headers();
                    results.status = status;
                    results.config = config;

                    def.resolve(results);
                })
                .error(function (data) {
                    console.log("error...");
                    def.reject("Failed to get user info");
                    alert("AJAX failed!!!!!!");
                });
            return def.promise;
        };
		
		function doctorUser_setSessionDeletionFlag(sesDelFlag) {
            service.doctorUser.SessionDeletionFlag = sesDelFlag;
            return;
        };
		
		function doctorUser_setReqReloadOfSelSessionFlag(flag) {
            service.doctorUser.ReqReloadOfSelSessionFlag = flag;
            return;
        };
		
		function setDoctors(doctors) {
            service.Doctors = doctors;
            return;
        };
}]);