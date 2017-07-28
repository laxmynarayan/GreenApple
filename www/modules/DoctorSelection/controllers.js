/*
Create By  : Tony Jacob
Description: Controller for DoctorSelection module
*/
'use strict';
 
console.log('From DoctorSelection-controllers.js');
angular.module('DoctorSelection')

.controller('DoctorSelectionController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', 'DoctorSelectionService', 'UtilityService',
    function ($scope, $rootScope, $location, AuthenticationService, DoctorSelectionService, UtilityService) {
		
		var isOKToLoadForm = true;
		var usrType = $rootScope.globals.currentUser.UsrType;
		
		$scope.usrName = $rootScope.globals.currentUser.usrName;
		$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
		$scope.UsrType = $rootScope.globals.currentUser.UsrType;
					
		$scope.userDocIDList = null;
		$scope.userDoctorList = null;
		$scope.selectedDoctor = null;
			
		$scope.menuItemClick = function (url) {
           
			$location.path(url);
			return;
		};
		
		$scope.formLoad = function () {
			
			$scope.error = "";
			
			if(isOKToLoadForm)
				getDoctorsAndSetDoctorsInView();
			
			return;
		};
		
		$scope.docChange = function () {
			
			var currentUser = $rootScope.globals.currentUser;
			//Update DocID
			currentUser.DocID =  $scope.selectedDoctor.DocID;
			//Add DocName. Note : This property is additionally added to the currentUser
			currentUser.DocName = $scope.selectedDoctor.DocName;
			AuthenticationService.SetCredentialsAndUserInfo(currentUser);
                        
			if(usrType == 'D')//doctor user
			{
				//Control is not expected here
			}
			else if(usrType == 'N')//normal user
			{
				//Reset normaluser
				UtilityService.setNormalUser();
				UtilityService.normalUser_setDocIDList($scope.userDocIDList);
			}
			else {alert("Not implemented");}

			return;
		};
		
		//Instance variables used : docID
		//Global variables modified : UtilityService.doctorUser.Locations
		var getDoctorsAndSetDoctorsInView = function()
        {
			if(typeof UtilityService.Doctors === "undefined" || (UtilityService.Doctors === null) )
            {
                $scope.dataLoading = true;

                DoctorSelectionService.GetAllDoctors()
                .then(function(response) {
                        var statusInt = parseInt(response.status);
                        //console.log('statusInt : ' + statusInt);
                        if(statusInt == 200) {
                            var doctors = response.data;
							UtilityService.setDoctors(doctors);
							
							loadDoctorsInView();
							
							//Set selection in the doctor combobox
							setSelectedDoctorInView();
							
							//Explicitly fire the event
							$scope.docChange();
							
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
				loadDoctorsInView();
				
				//Set selection in the doctor combobox
				setSelectedDoctorInView();
				
				//Explicitly fire the event
				$scope.docChange();
            }
            
            return;
		};
		
		//Instance variables used : None
		var setSelectedDoctorInView = function ()
		{
			if($scope.userDoctorList != null)
			{
				if($scope.userDoctorList.length > 0)
				{
					for(var i=0; i<$scope.userDoctorList.length; i++)
					{
						if($scope.userDoctorList[i].DocID == $rootScope.globals.currentUser.DocID)
						{
							$scope.selectedDoctor = $scope.userDoctorList[i];
							break;
						}
					}
				}
			}
			else {}
			
			return;
		};
		
		//Instance variables used : None
		//Global variables used : UtilityService.Doctors
		var loadDoctorsInView = function()
        {
			$scope.userDoctorList = [];
			
			if($scope.userDocIDList != null && UtilityService.Doctors != null)
			{
				for(var i=0; i<$scope.userDocIDList.length; i++)
				{
					var docID = $scope.userDocIDList[i];
					for(var j=0; j<UtilityService.Doctors.length; j++)
					{
						var doctor = UtilityService.Doctors[j];
						if(docID == doctor.DocID)
						{
							$scope.userDoctorList.push(doctor);
							break;
						}
					}
				}
			}
			else {}
			
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
				$scope.userDocIDList = UtilityService.normalUser.DocIDList;
			}
			else {}
			
			return;
		};
			
		var init = function () 
		{
			initVariables();
			
            return;
        };
		
		init();
			
    }]);