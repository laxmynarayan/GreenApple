var isNumber = function(str) {
        var pattern = /^\d+$/;
        return pattern.test(str);  // returns a boolean
}

var getHours = function (selTimeStr) {

	var hr = 0;
				
	var hrAndMinStr = '12:00';
	var amOrpmStr = 'PM';
	var hrStr = '12';
	var arr1 = selTimeStr.split(" ");
	
	if(arr1.length>1)
	{
		hrAndMinStr=arr1[0];
		amOrpmStr=arr1[1];
		
		var arr2 = hrAndMinStr.split(":");
		if(arr2.length>1)
		{
			hrStr=arr2[0];
		}
	}
	
	if(amOrpmStr === 'AM' && hrStr === '12')	//12:00AM, 12:15AM, 12:30AM, 12:45AM
	{
		hr = parseInt(hrStr) - 12;
	}
	else if(amOrpmStr === 'AM')	//AM but not 12
	{
		hr = parseInt(hrStr);
	}
	else if(amOrpmStr === 'PM' && hrStr === '12') //12:00PM, 12:15PM, 12:30PM, 12:45PM
	{
		hr = parseInt(hrStr);
	}
	else    //PM but not 12
	{
		hr = parseInt(hrStr) + 12;
	}
	
	return hr;
};

var getMinutes = function (selTimeStr) {
	
	var min = 0;
	
	var hrAndMinStr = '12:00';
	var minStr = '00';
	var arr1 = selTimeStr.split(" ");
	
	if(arr1.length>1)
	{
		hrAndMinStr=arr1[0];
		var arr2 = hrAndMinStr.split(":");
		if(arr2.length>1)
		{
			minStr=arr2[1];
		}
	}
	
	min = parseInt(minStr);

	return min;
};
		
var addZero = function (i) 
{
	if (i < 10) {
		i = '0' + i;
	}
	return i;
}
        
var getAMOrPMStr = function (hours) {
	
	var strAMOrPM = '';
	//console.log('hours : ' + hours);
	if (hours >= 12) 
		strAMOrPM = 'PM';
	else 
		strAMOrPM = 'AM';
	
	//console.log('strAMOrPM : ' + strAMOrPM);
	return strAMOrPM;
}
        
var getCorrectedHours = function (hours) {

	if (hours > 12) {
		hours -= 12;
	} else if (hours === 0) {
		hours = 12;
	}
	
	return hours;
}
		
var getClockTime = function (date)
{
	var d = new Date(date);
	
	var hrs = getCorrectedHours(d.getHours());
		
	//var strAMOrPM = getAMOrPMStr(hrs);
	var strAMOrPM = getAMOrPMStr(d.getHours());
	
	var timeStr = addZero(hrs)+':'+addZero(d.getMinutes())+' '+strAMOrPM;
	
	//console.log('GMT : ' + date + ' IST : ' + d + ' TimeStr : ' + timeStr);
	
	return timeStr;
}

var getFormattedDate = function (date)
{
	var months = [];
	months[0]="Jan";months[1]="Feb";months[2]="Mar";months[3]="Apr";months[4]="May";months[5]="Jun";
	months[6]="Jul";months[7]="Aug";months[8]="Sep";months[9]="Oct";months[10]="Nov";months[11]="Dec";
	
	var d = new Date(date);
	return addZero(d.getDate()) + '-' + months[d.getMonth()] + '-' + d.getFullYear();
}

//Note : dob should be dateString or milliseconds
var getAge = function (dob)
{
	var today = new Date();
	var birthDate = new Date(dob);
	var age = today.getFullYear() - birthDate.getFullYear();
	var m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	
	return age;
}

var getMonthIndex = function(month)
{
	var monthArray = [];
	monthArray[0]="Jan";monthArray[1]="Feb";monthArray[2]="Mar";monthArray[3]="Apr";monthArray[4]="May";monthArray[5]="Jun";
	monthArray[6]="Jul";monthArray[7]="Aug";monthArray[8]="Sep";monthArray[9]="Oct";monthArray[10]="Nov";monthArray[11]="Dec";
	
	var monthIndex = 0;
	for(var j=0; j<monthArray.length; j++)
	{
		if(monthArray[j] === month)
		{
			monthIndex = j;
			break;
		}
	}
	
	return monthIndex;
}

var getCurrentMonth = function (months)
{
	var currentMonth = "";
		
	var today = new Date();
	
	for(var i=0; i<months.length; i++)
	{
		var monthStr = months[i];
		var array = monthStr.split("-");
		
		if(array.length != 2)
			continue;
		
		var mt = array[0];
		var yr = array[1];
		
		var monthIndex = getMonthIndex(mt);
		
		if(today.getMonth() == monthIndex &&  today.getFullYear() == yr)
		{
			currentMonth = months[i];
			currentOrClosestMonth = currentMonth;
			break;
		}
	}
	
	return currentMonth;
}

var getClosestMonth = function (months)
{
	var closestMonth;
	
	var today = new Date();

	//var diff = 9999000000;
	var diff = Number.POSITIVE_INFINITY;
	for(var i=0; i<months.length; i++)
	{
		var monthStr = months[i];
		var array = monthStr.split("-");
		
		if(array.length != 2)
			continue;
		
		var mt = array[0];
		var yr = array[1];
		
		var monthIndex = getMonthIndex(mt);
		
		var date = new Date();
		date.setFullYear(yr);
		date.setMonth(monthIndex);
		date.setDate(1);	//1st day of the month
		
		var diff1 = Math.abs(today - date);
		
		if(diff1 < diff)
		{
			diff = diff1;
			closestMonth = months[i];
		}
	}
	
	return closestMonth;
}

var getCurrentOrClosestMonth = function (months)
{
	var currentOrClosestMonth;
	
	//First check if the current month is in the list
	var currentMonth = getCurrentMonth(months);
	currentOrClosestMonth = currentMonth;
		
	if(currentMonth === "")
	{
		//Get the closest month if the current month is not in the list
		var closestMonth = getClosestMonth(months);
		currentOrClosestMonth = closestMonth;
	}
	
	return currentOrClosestMonth;
}

var getMonthYearStrArray = function (sessions)
{
	var months = [];
	months[0]="Jan";months[1]="Feb";months[2]="Mar";months[3]="Apr";months[4]="May";months[5]="Jun";
	months[6]="Jul";months[7]="Aug";months[8]="Sep";months[9]="Oct";months[10]="Nov";months[11]="Dec";
				
	var monthYearStrArray = [];
		
    if(sessions != null)
    {	
		for(var i=0; i<sessions.length; i++)
		{
			var sesStartDate = new Date(sessions[i].SessionStart);

			var monthYearStr = months[sesStartDate.getMonth()]+'-'+sesStartDate.getFullYear();
			
			if(monthYearStrArray.indexOf(monthYearStr)==-1)
				monthYearStrArray.push(monthYearStr);
		}
	}
	
	return monthYearStrArray;		
};

var getSessionsOfMonth = function (sessions, selectedMonth)
{
	var sessionsOfMonth = [];
	
	var months = [];
	months[0]="Jan";months[1]="Feb";months[2]="Mar";months[3]="Apr";months[4]="May";months[5]="Jun";
	months[6]="Jul";months[7]="Aug";months[8]="Sep";months[9]="Oct";months[10]="Nov";months[11]="Dec";
	
	if(sessions != null)
    {
		for(var i=0; i<sessions.length; i++)
		{
			var sesStartDate = new Date(sessions[i].SessionStart);

			var monthYearStr = months[sesStartDate.getMonth()]+'-'+sesStartDate.getFullYear();

			if(monthYearStr === selectedMonth)
				sessionsOfMonth.push(sessions[i]);
		}
	}
	
	return sessionsOfMonth;
};

//Note : dateStr should be in DD-MM-YYYY format
var getDateInYYYYMMDDFormat = function (dateStr)
{
	var dateInYYYYMMDD = "";
	
	var array = dateStr.split("-");
	if(array.length == 3)
	{	
		var dt = Number(array[0]);
		var mt = Number(array[1]);
		var yr = Number(array[2]);
		
		dateInYYYYMMDD = yr + '-' + addZero(mt) + '-' + addZero(dt);
	}
	
	return dateInYYYYMMDD;
};

var isDate = function (dateStr)
{
	var isdate = false;
	
	var array = dateStr.split("-");
	if(array.length == 3)
	{	
		var dt = Number(array[0]);
		var mt = Number(array[1]);
		var yr = Number(array[2]);
	
		var date = new Date();
		date.setFullYear(yr);
		date.setMonth(mt-1);	//index starting from 0
		date.setDate(dt);
		
		isdate = date instanceof Date && !isNaN(date.valueOf());
	}
	else 
		isdate = false;
	
	return isdate;
};

//Note : dateStr should be in DD-MM-YYYY format
var isFutureDate = function (dateStr)
{
	var isfuturedate = true;
	
	var array = dateStr.split("-");
	if(array.length == 3)
	{	
		var dt = Number(array[0]);
		var mt = Number(array[1]);
		var yr = Number(array[2]);
	
		var inputDate = new Date();
		inputDate.setFullYear(yr);
		inputDate.setMonth(mt-1);	//index starting from 0
		inputDate.setDate(dt);
		
		//Note : It is Midnight(0:0:0:0) on that date which is considered
		inputDate.setHours(0);
		inputDate.setMinutes(0);
		inputDate.setSeconds(0);
		inputDate.setMilliseconds(0);
		
		var todayTime = new Date().getTime();
		var inputDateTime = inputDate.getTime();
		
		isfuturedate = (todayTime - inputDateTime) < 0 ? true : false;
	}
	else //incorrect input
	{
	}
    
	return isfuturedate;
};

var isFutureTime = function (sesStart)
{
	var isfuturetime = true;
	
	var nowTime = new Date().getTime();
	var sesStartDateTime = new Date(sesStart).getTime();
		
	if(sesStartDateTime > nowTime)
		isfuturetime = true;
	else 
		isfuturetime = false;
	
	return isfuturetime;
};

//Note : dateStr should be in DD-MM-YYYY format
var isPastDate = function (dateStr)
{
	var ispastdate = true;
	
	var array = dateStr.split("-");
	if(array.length == 3)
	{	
		var dt = Number(array[0]);
		var mt = Number(array[1]);
		var yr = Number(array[2]);
	
		var inputDate = new Date();
		inputDate.setFullYear(yr);
		inputDate.setMonth(mt-1);	//index starting from 0
		inputDate.setDate(dt);
		
		//Note : It is 1 millisecond before midnight(23:59:59:999) on that date which is considered
		inputDate.setHours(23);
		inputDate.setMinutes(59);
		inputDate.setSeconds(59);
		inputDate.setMilliseconds(999);
		
		var todayTime = new Date().getTime();
		var inputDateTime = inputDate.getTime();
		
		ispastdate = (todayTime - inputDateTime) > 0 ? true : false;
	}
	else //incorrect input
	{
	}
    
	return ispastdate;
};

//Note : dateStr should be like 05-Oct-2015
var getMonthFromSesDateStr = function (sesDateStr)
{
	var sesMonthStr = "";
	
	var array = sesDateStr.split("-");
	if(array.length == 3)
	{	
		var dtStr = array[0];
		var mtStr = array[1];
		var yrStr = array[2];
		
		sesMonthStr = mtStr + '-' + yrStr;
	}
	
	//console.log("sesDateStr : " + sesDateStr + " sesMonthStr : " + sesMonthStr);
	
	return sesMonthStr;
};

//Note : sesEndDateTime is compared with current time
var getFutureSessions = function (sessions)
{
	var futureSessions = [];
	
	var nowTime = new Date().getTime();

	if(sessions != null)
    {
		for(var i=0; i<sessions.length; i++)
		{
			var sesEndDateTime = new Date(sessions[i].SessionEnd).getTime();
			
			if(sesEndDateTime > nowTime)
			{
				futureSessions.push(sessions[i]);
			}
		}
	}
	
	return futureSessions;
};

//Note : dateStr should be in DD-MM-YYYY format
var isAgeAboveLimit = function (dateStr, ageLimit)
{
	var isageabovelimit = true;
	
	var array = dateStr.split("-");
	if(array.length == 3)
	{	
		var dt = Number(array[0]);
		var mt = Number(array[1]);
		var yr = Number(array[2]);
	
		var inputDate = new Date();
		inputDate.setFullYear(yr);
		inputDate.setMonth(mt-1);	//index starting from 0
		inputDate.setDate(dt);
		
		//Note : It is Midnight(0:0:0:0) on that date which is considered
		inputDate.setHours(0);
		inputDate.setMinutes(0);
		inputDate.setSeconds(0);
		inputDate.setMilliseconds(0);
		
		var inputDateTime = inputDate.getTime();
		var age = getAge(inputDateTime);
		//console.log("age : " + age);
		
		isageabovelimit = (ageLimit - age) < 0 ? true : false;
	}
	else //incorrect input
	{
	}
	
	//console.log("isageabovelimit : " + isageabovelimit);
	
	return isageabovelimit;
}

var getSexStr = function(sex) {
	var sexStr = "Male"
	
	if(sex == 1) sexStr = "Male"; else sexStr = "Female";
	
	return sexStr;
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        //return ((x < y) ? -1 : ((x > y) ? 1 : 0)); //ascending
		return ((x < y) ? 1 : ((x > y) ? -1 : 0));	//descending
    });
}

var isCurrentSession = function(SessionStart, SessionEnd) {
	var iscurrentsession = false;
	
	var sesStartDateTime = new Date(SessionStart).getTime();
	var sesEndDateTime = new Date(SessionEnd).getTime();
	var nowTime = new Date().getTime();
	
	if(sesStartDateTime < nowTime &&  sesEndDateTime > nowTime) 
		iscurrentsession = true;
	else 
		iscurrentsession = false;
	
	return iscurrentsession;
}
		

