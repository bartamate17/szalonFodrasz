//AJAX - REQUEST
function request(method, url, functMethod) {

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {

            functMethod(this.responseText);
        }
    };

    xhttp.open(method, url);
    xhttp.send();
};

var hairDresserSelectList = document.getElementById('hairDresserSelectList');

request("GET", "/fodraszok", function(response) {

    hairDressers = JSON.parse(response);

    console.log(hairDressers);

    for (let y = 0; y < hairDressers.length; y++) {
        var dresserName = hairDressers[y].neve;
        console.log(dresserName);

        hairDresserSelectList.innerHTML += hairdresserName(y, dresserName);
    };
});

function hairdresserName(number, name) {

    return `
        <option value="${number}" name="${name}">${name}</option>
        `;
};

document.getElementById('hairDresserSelectList').onchange = function() {

    request("GET", "/idopontok", function(response) {

        var reservedDates = JSON.parse(response);

        document.getElementById('reservedDatesList').innerHTML = "";

        for (i = 0; i < reservedDates.length; i++) {

            var reservedName = reservedDates[i].nev;
            var reservedDate = reservedDates[i].datum;
            var reservedHour = reservedDates[i].ora;
            var reservedDresser = reservedDates[i].fodrasz;

            var hairDresserText = hairDresserSelectList.options[hairDresserSelectList.selectedIndex].text;

            if (hairDresserText == reservedDresser) {

                document.getElementById('reservedDatesList').innerHTML += hairdresserDatesList(reservedName, reservedDate, reservedHour);
            }
        }
    });
};

function hairdresserDatesList(name, date, hour) {

    return `
        <option id="headerOption">Jegyzett időpont</option>
        <option id="nameOption" name="${name}">${name}</option>
        <option id="dateOption" name="${name}">${date}</option>
        <option id="hourOption" name="${name}">${hour}</option>
        `;
};