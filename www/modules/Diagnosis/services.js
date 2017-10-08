/*
Create By  : Tony Jacob
Description: Services for Diagnosis module 
*/

'use strict';
//console.log('From Diagnosis-services.js');
angular.module('Diagnosis')
 
.factory('DiagnosisService',
    ['$timeout', '$filter', '$http', '$q',
    function ($timeout, $filter, $http, $q) {

        //console.log('Inside function DiagnosisService DiagnosisService-services.js');
        
        var service = {};
		//var BaseAPIUrl = "";
        //var BaseAPIUrl = "http://localhost:8080";
        var BaseAPIUrl = "http://ec2-18-221-0-251.us-east-2.compute.amazonaws.com:1809";




		service.GetDiagnosis = GetDiagnosis;
		service.GetPatient = GetPatient;
        service.GetPatientSlotList = GetPatientSlotList;
		service.DoctorUser_createDiagnosis = DoctorUser_createDiagnosis;
		service.DoctorUser_updateDiagnosis = DoctorUser_updateDiagnosis;
       
        return service;
	
		function GetDiagnosis(sloID) {
            var def = $q.defer();
            //console.log('Inside service.GetDiagnosis()...'); 
            
            $http({
                method: 'GET',
                url: BaseAPIUrl+'/Diagnosis/GetDiagnosis/' + sloID,
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
		
		function GetPatient(patID) {
            var def = $q.defer();
            
            $http({
                method: 'GET',
				url: BaseAPIUrl+'/Patient/GetPatient/' + patID,
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
		
		function GetPatientSlotList(patID, doctorID) {
            var def = $q.defer();
            
            $http({
                method: 'GET',
				url: BaseAPIUrl+'/Slot/GetPatientSlotList/' + patID + ',' + doctorID,
                dataType: 'json',
                headers: {'Content-Type': 'application/json; charset=UTF-8'},
				params: {}
                })
                .success(function (data, status, headers, config) {
                    //console.log("success...>");
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
		
		function DoctorUser_createDiagnosis(diagnosis) {
			console.log('Inside DoctorUser_createDiagnosis()');
            var def = $q.defer();
            
            $http({
                method: 'POST',
                url: BaseAPIUrl+'/Diagnosis/AddDiagnosis',
                data: diagnosis,
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

		function DoctorUser_updateDiagnosis(diagnosis) {
			//console.log('Inside DoctorUser_updateDiagnosis()');
            var def = $q.defer();
            
            $http({
                method: 'POST',
                url: BaseAPIUrl+'/Diagnosis/UpdateDiagnosis2',
                data: diagnosis,
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
		
    }]);
