/*
Create By  : Tony Jacob
Description: Controller for NewUserRegistration module
*/

'use strict';
 
angular.module('NewUserRegistration')
 
.controller('NewUserRegistrationController',
    ['$scope', '$rootScope', '$location', '$route', 'UserService', 'UtilityService',
    function ($scope, $rootScope, $location, $route, UserService, UtilityService) {
		
		$scope.loggedIn = false;
		$scope.sex = 'M';
		$scope.UsrType = '';
		$scope.username = null;
		$scope.verifyUserExistChecked = false;
		$scope.disableDoctorID = false;
		$scope.disableUserName = false;
		$scope.verifyLabel = "Verify";
		
		//$scope.cue2 = "Please verify if the user exists. Enter User Name & Doctor ID";
		$scope.cue2 = "";
		
		$scope.menuItemClick = function (url) {
            
			$location.path(url);
			return;
		};
		
		$scope.reloadRouteAndResetForm = function() {
			$route.reload();
			
			//Reset form fields
			resetForm();

			return;
		};
		
		$scope.verifyUserExistClick = function (verifyUserExistChecked) {
			
			$scope.error = "";
			$scope.cue = "";
			
			if(verifyUserExistChecked == true)
			{
				//$scope.verifyLabel = "Clear User Name";
				var isOKToProceed = isOKToVerify();
				
				if(isOKToProceed)
				{
					$scope.dataLoading = true;
					UserService.CheckUserExists($scope.username, $scope.doctorID)
						.then(function(response) {
							var statusInt = parseInt(response.status);
							
							if(statusInt == 200) {

								var tt = angular.toJson(response.data);
								console.log(tt);
								
								var checkUserExistsRetList = response.data;
								
								$scope.dataLoading = false;
								if(checkUserExistsRetList == null)
								{
									$scope.cue = "User doesn't exist. Please fill the rest of the details and submit";
									$scope.cue2 = "";
									$scope.disableUserName = true;
									
									//Enable fields
									enableOrDisableFieldsBasedOnUserExistCheck(false);
								}
								else
								{
									var existingUser = checkUserExistsRetList[0];
									
									$scope.cue = "User name exists. Uncheck the Verify Checkbox and try another";
									$scope.cue2 = "";
									$scope.disableUserName = true;
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
				}
				else 
				{
					$scope.error = "Please enter User Name and Doctor ID";
				}
			}
			else 
			{
				$scope.reloadRouteAndResetForm();
				setDocIDInView();
				
				$scope.username = null;
				$scope.disableUserName = false;
			}
			
			return;
		};
		
		//Instance variables used : None
		//Global variables used : None
        $scope.registerNewUser = function () {
			
			$scope.error = "";
			
			var isValidated = validateFormElements();

			if(isValidated)
            {
				//var newUser = {usrName : $scope.loginID, UsrPwd : $scope.password, UsrType : 'N', UsrAddress : $scope.place, 
				//               UsrPhone1 : $scope.mobile, UsrPhone2 : $scope.mobile, UsrEmail : $scope.email, DocID : $scope.doctorID};
				
				//Note :  The fields are not matching. UsrPhone1,UsrPhone2 are same. UsrType hardcoded
				var sexStr = $scope.sex;
				var sex = 1;	//default value
				
				var dobInYYYYMMDDFormat = getDateInYYYYMMDDFormat($scope.dateOfBirth);
				
				if(sexStr === 'M') sex = 1; else sex = 0;
				
				var newUser = {usrName : $scope.username, UsrPwd : $scope.password, UsrType : 'N', UsrAddress : $scope.place, 
							  UsrPhone1 : $scope.mobile, UsrPhone2 : $scope.mobile, UsrEmail : $scope.email, DocID : $scope.doctorID,
							  Sex : sex, DateOfBirth : dobInYYYYMMDDFormat};
				
				$scope.dataLoading = true;
				UserService.Create(newUser)
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
								if($scope.loggedIn == true)
								{
									//Flush out all the patients by setting to null
									UtilityService.user_setPatients(null, $scope.UsrType);
								}
								else {} 
									
								//alert("Success!!!!!! You will directed to the login page");
								//$scope.cue = "Success!!!!!! You will directed to the login page";
								$scope.cue = "Done";
								$scope.error = "";
								$scope.dataLoading = false;
								$scope.disableSubmit = true;
								//$location.path('/');
							}
							else
							{
								//alert("New user creation failed!!! Try again");
								$scope.error = "New user creation failed!!! Try again";
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
			}
			else
			{
				//alert('Please correct the errors and try again');
			}
			return;
        };
		
		var isOKToVerify = function()
		{
			var isOKToProceed = false;
			
			if($scope.username != null && $scope.doctorID != null) 
				isOKToProceed = true; 
			else 
				isOKToProceed = false;
			
			return isOKToProceed;
		};
		
		var enableOrDisableFieldsBasedOnUserExistCheck = function(flag)
		{
			if($scope.loggedIn == true)
			{
				if($scope.UsrType == 'D' || $scope.UsrType == 'S')
				{
				}
				else
				{
					$scope.disableDoctorID = flag;
				}
			}
			
			$scope.disablePassword = flag;
			//$scope.disableDoctorID = flag;
 			$scope.disableFullName = flag;
			$scope.disableSex = flag;
			$scope.disableDateOfBirth = flag;
			$scope.disablePlace = flag;
			$scope.disableMobile = flag;
			$scope.disableEmail = flag;
			
			return;
		};
		
		//Instance variables used : None
		//Global variables modified : None
		var validateFormElements = function()
		{
			var isValid = false;
			var isdate = false;
			var isfuturedate = true;
			var isageabovelimit = true;
			 
			isdate = isDate($scope.dateOfBirth);
			if(!isdate) $scope.error = "Date Of Birth is not a proper date";
			isValid = isdate;
			
			if(isValid)
			{
				isfuturedate = isFutureDate($scope.dateOfBirth);
				if(isfuturedate) $scope.error = "Date Of Birth cannot be a future date";
				isValid = isdate && (!isfuturedate);
			}
			
			if(isValid)
			{
				isageabovelimit = isAgeAboveLimit($scope.dateOfBirth, 100);
				if(isageabovelimit) $scope.error = "Date Of Birth is above the limit : 100";
				isValid = isdate && (!isfuturedate) && (!isageabovelimit);
			}
						
			return isValid;
		};
		
		var setUserProfileInView = function ()
        {
			if(typeof $rootScope.globals.currentUser === "undefined" || ($rootScope.globals.currentUser === null) )
			{
				$scope.usrName = 'Guest';
				$scope.UsrEmail = '-';
				$scope.UsrType = '-';
			}
			else
			{
				$scope.usrName = $rootScope.globals.currentUser.usrName;
				$scope.UsrEmail = $rootScope.globals.currentUser.UsrEmail;
				$scope.UsrType = $rootScope.globals.currentUser.UsrType;
			}
		
            return; 
        };
		
		var resetForm = function ()
		{
			$scope.username = null;
			$scope.password = null;
			$scope.fullName = null;
			//$scope.shortName = null;
			$scope.sex = null;
			$scope.dateOfBirth = null;
			$scope.place = null;
			$scope.mobile = null;
			$scope.email = null;
			$scope.doctorID = null;
			
			$scope.disableSubmit = false;
			
			return; 
        };
		
		//This function is not used. Delete it later
		var populateFormFields = function (existingUser)
		{
			//Note : Most of the fields are not matching. This has to be taken up later
			$scope.email = existingUser.UsrEmail;
			$scope.mobile = existingUser.UsrPhone1;
			$scope.place = existingUser.UsrAddress;
			$scope.fullName = existingUser.usrName;
			
			return; 
        };
		
		var setlogInfoVars = function ()
		{
			if(typeof $rootScope.globals.currentUser === "undefined" || $rootScope.globals.currentUser === null) 
				$scope.loggedIn = false; 
			else
			{
				$scope.loggedIn = true;
				$scope.UsrType = $rootScope.globals.currentUser.UsrType;
			}
			
			return;
		};
		
		var setDocIDInView = function ()
		{
			//Populate doctorID if logged in and user type is doctor/staff
			if($scope.loggedIn == true)
			{
				if($scope.UsrType == 'D' || $scope.UsrType == 'S')
				{
					$scope.doctorID = $rootScope.globals.currentUser.DocID;
					$scope.disableDoctorID = true;	//Disable doctorID field
				}
			}
			else {}
		};
		
		var init = function () 
		{
			//Set scope variables - loggedIn, UsrType
 			setlogInfoVars();
			
			//Set user profile in view
			setUserProfileInView();
			
			//Set DocID in view if logged in and user type is doctor/staff
			setDocIDInView();
			
			//Disable fields if logged in and user type is doctor/staff
			enableOrDisableFieldsBasedOnUserExistCheck(true);
			
            return;
        };
		
		init();
    }]);