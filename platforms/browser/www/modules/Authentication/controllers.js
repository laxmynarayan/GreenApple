/*
Create By  : Tony Jacob
Description: Controller for Authentication module
*/

'use strict';
 
//console.log('From authentication-controllers.js');
angular.module('Authentication')
 
.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService', 'UtilityService', '$uibModal',
    function ($scope, $rootScope, $location, AuthenticationService, UtilityService, $uibModal) {
       
		$scope.usrType = 'D';	//Default value for radio button
		
        // reset login status
        AuthenticationService.ClearCredentials();
 
		$scope.menuItemClick = function (url) {
            
			$location.path(url);
			return;
		};
		
		//Instance variables used : None
		//Global variables modified : $rootScope.globals, UtilityService.doctorUser, UtilityService.normalUser
		$scope.login = function () {
            //console.log('Inside login()');
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, $scope.usrType)
                .then(function(response) {
                    var statusInt = parseInt(response.status);
                    if(statusInt == 200) {

						//var tt = angular.toJson(response.data);
						//console.log(tt);
                        
						var loginReturnList = response.data;
						
						var docIDList = getDocIDList(loginReturnList);
						
						if(loginReturnList == null)
                        {
                            $scope.error = 'Login failed!!!';
                            $scope.dataLoading = false;
                        }
                        else
                        {
							var currentUser = null;
							var usrType = $scope.usrType;
                        
                            if(usrType == 'D')//doctor user
                            {
								currentUser = loginReturnList[0];
								AuthenticationService.SetCredentialsAndUserInfo(currentUser);
 								UtilityService.setDoctorUser();
								$location.path('/dashboard');
                            }
                            else if(usrType == 'N')//normal user
                            {
								currentUser = loginReturnList[0];
								//Note : This will be modified on Doctor selection page
								AuthenticationService.SetCredentialsAndUserInfo(currentUser); 
								
								UtilityService.setNormalUser();
								UtilityService.normalUser_setDocIDList(docIDList);
								
								$location.path('/doctorSelection');
							}
							else {alert("Not implemented");}
                        }
                    } else {
                        $scope.error = 'Error...';
                        $scope.dataLoading = false;
                    }
                })
                .catch(function(response) {
                    console.error('Error...', response.status, response.data);
                    $scope.dataLoading = false;
                })
                .finally(function() {
                    //console.log("finally finished.");
                });
				
				return;
        };
		
		var getDocIDList = function (loginReturnList)
        {
			var docIDList = [];
			
			if(loginReturnList == null) {}
            else
            {
				for(var i=0; i<loginReturnList.length; i++)
				{
					docIDList.push(loginReturnList[i].DocID);
				}
            }
			
			return docIDList;
		};
		
    }]);