console.log('Javascript js file fut!');

//FRONTEND

const availableDateSelector = document.getElementById('availableSelect');
var hairDressers = "";

doRequest("GET", "/fodraszok", function(response) {

    hairDressers = JSON.parse(response);

    console.log(hairDressers);

    var hairDresserSelect = document.getElementById('hairDresserSelect');

    document.getElementById('dateSelect').valueAsDate = new Date();

    for (let i = 0; i < hairDressers.length; i++) {
        var dresserName = hairDressers[i].neve;
        console.log(dresserName);

        hairDresserSelect.innerHTML += hairdresserName(i, dresserName);
    };
});

function hairdresserName(number, name) {

    return `
        <option value="${number}" name="${name}">${name}</option>
        `;
};

document.getElementById('dateSelect').onchange = function() {

    doRequest("GET", "/idopontok", function(response) {

        var reservedDates = JSON.parse(response);

        var dateSelected = document.getElementById('dateSelect').value;
        var transferDateSelect = new Date(dateSelected);
        var getDateSelect = transferDateSelect.getDay();

        if (getDateSelect == 0) {

            getDateSelect = 7;
        }

        var hairDresserSelected = document.getElementById('hairDresserSelect');
        var hairDresserName = hairDresserSelected.options[hairDresserSelected.selectedIndex].text
        var foundHairDresser = findHairDresserByName(hairDressers, hairDresserSelected.options[hairDresserSelected.selectedIndex].text);

        var reservedHours = makeReservedHourList(reservedDates, hairDresserName, dateSelected)
        calculateDatesAndGenerateOptionValuesByAvailableDate(getDateSelect, foundHairDresser, reservedHours);
    });
};

//AJAX - REQUEST
function doRequest(method, url, functMethod) {

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {

            functMethod(this.responseText);
        }
    };

    xhttp.open(method, url);
    xhttp.send();
};

function findHairDresserByName(hairDresserJSON, hairDresserName) {

    for (let i = 0; i < hairDresserJSON.length; i++) {

        if (hairDresserName == hairDresserJSON[i].neve) {

            return hairDresserJSON[i];
        }
    }
    return null;
};

function calculateDatesAndGenerateOptionValuesByAvailableDate(selectedDate, hairDresserJSON, reservedHours) {

    if (hairDresserJSON == null) {

        availableDateSelector.innerHTML = disabledDate(0);

    } else {

        var dresserDateFound = false;

        for (let j = 0; j < hairDresserJSON.nyitvatartas.length; j++) {

            var availableDate = hairDresserJSON.nyitvatartas[j].napIndex;

            if (selectedDate === availableDate) {

                var freeHours = makeFreeHourList(hairDresserJSON.nyitvatartas[j])
                var availableHours = getAvailableHours(freeHours, reservedHours)
                if (availableHours.length > 0) {
                    dresserDateFound = true;
                    generateHourOptions(availableHours);
                }
            }
        }
    }

    if (dresserDateFound == false) {

        availableDateSelector.innerHTML = disabledDate(0);

    }
};

function makeReservedHourList(reservationDates, hairDresserName, reservationDate) {

    var convertedDateSelected = reservationDate.replaceAll(".", "-");

    var filteredReservations = reservationDates.filter(reservation => reservation.fodrasz == hairDresserName && reservation.datum == convertedDateSelected);

    var reservedHours = [];
    for (let i = 0; i < filteredReservations.length; i++) {

        reservedHours.push(filteredReservations[i].ora)
    }

    return reservedHours;
};

function makeFreeHourList(serviceByDay) {

    var varTolAsNumber = parseInt(serviceByDay.tol);
    var varIgAsNumber = parseInt(serviceByDay.ig);

    var freeHours = [];

    for (let i = varTolAsNumber; i <= varIgAsNumber; i++) {

        if (i < 10) {
            freeHours.push('0' + i + ':00')
        } else {
            freeHours.push(i + ':00')
        }
    };
    return freeHours;
};

function getAvailableHours(freeHours, reservedHours) {

    return freeHours.filter(hour => !reservedHours.includes(hour))
};

function generateHourOptions(freeHours) {

    var availableHourSelect = document.getElementById('availableSelect')

    availableHourSelect.innerHTML = "";

    for (let i = 0; i < freeHours.length; i++) {

        availableHourSelect.innerHTML += `<option>${freeHours[i]}</option>`;
    }
};

function disabledDate(zero) {

    return `
    <option value="" disabled="" selected="" style="display: none;">Nincs időpont</option>
    `;
};


document.getElementById('submitButton').onclick = function() {

    callSubmitRequest({
        method: "POST",
        url: "/newreservation",
        contentType: "application/json",
        params: {
            nev: document.getElementById("reservedName").value,
            datum: document.getElementById("dateSelect").value,
            ora: document.getElementById('availableSelect').options[availableSelect.selectedIndex].text,
            fodrasz: hairDresserSelect.options[hairDresserSelect.selectedIndex].text
        },
        success: function(res) {
            console.log(res);
        }
    });

    document.getElementById("hairDresserSelect").value = "";
    document.getElementById("dateSelect").value = "";
    document.getElementById("availableSelect").value = "";
    document.getElementById("reservedName").value = "";
};

//AJAX - REQUEST - POST
function callSubmitRequest(object) {

    var xhttp = new XMLHttpRequest();

    object.method = object.method || "GET";
    object.params = object.params || {};

    object.contentType = object.contentType || "application/x-www-form-urlencoded";

    object.success = object.success || function() {};

    xhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {
            object.success(this.responseText);
        }
    }

    var paramstmp = [];
    var paramStr = "";

    if (object.contentType != "application/json") {
        for (let key in object.params)
            paramstmp.push(`${key}=${object.params[key]}`);

        paramStr = paramstmp.join("&");

    } else {

        paramStr = JSON.stringify(object.params);
    }

    xhttp.open(object.method, object.url + (object.method == "GET" ? "?" + paramStr : ""));
    xhttp.send(paramStr);
};