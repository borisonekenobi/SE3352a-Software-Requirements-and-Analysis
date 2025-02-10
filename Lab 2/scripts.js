function changeButton(clickedButton) {
    const currentButton = document.querySelector('.selected.item');
    currentButton.classList.remove('selected');
    clickedButton.classList.add('selected');

    const currentContentID = currentButton.id.split('-')[0] + '-content';
    const currentContent = document.getElementById(currentContentID);
    currentContent.classList.add('hidden');
    const clickedContentID = clickedButton.id.split('-')[0] + '-content';
    const clickedContent = document.getElementById(clickedContentID);
    clickedContent.classList.remove('hidden');
}

function changePassengerCount(input) {
    console.log(input.value);
    if (input.value > 0) return;

    const adultInput = document.getElementById('adults');
    const childrenInput = document.getElementById('children');

    if (input === adultInput && childrenInput.value === '0') childrenInput.value = 1;
    if (input === childrenInput && adultInput.value === '0') adultInput.value = 1;
}

function changeReturnMin() {
    const returnDate = document.getElementById('return');
    const departDate = document.getElementById('depart');

    returnDate.min = departDate.value;
    if (returnDate.value < departDate.value) {
        returnDate.value = null;
    }
}

function search() {
    const tripType = Array.from(document.getElementsByName('trip_type')).find(radio => radio.checked).id;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const departDate = document.getElementById('depart').value;
    const returnDate = document.getElementById('return').value;
    const cabinClass = document.getElementById('cabin-class').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const direct = document.getElementById('direct-flights').checked;

    const qTripType = `trip_type=${tripType}`;
    const qFrom = `&from=${from}`;
    const qTo = `&to=${to}`;
    const qDepart = departDate ? `&depart=${departDate}` : `&depart=${new Date(document.getElementById('depart').min).toLocaleDateString('en-ca')}`;
    const qReturn = returnDate ? `&return=${returnDate}` : '';
    const qCabinClass = `&cabin_class=${cabinClass}`;
    const qAdults = `&adults=${adults}`;
    const qChildren = `&children=${children}`;
    const qDirect = `&direct=${direct}`;

    location.href = `search.html?${qTripType}${qFrom}${qTo}${qDepart}${qReturn}${qCabinClass}${qAdults}${qChildren}${qDirect}`;
}

function populateData() {
    const urlParams = new URLSearchParams(window.location.search);

    const tripType = urlParams.get('trip_type');
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    const departDate = urlParams.get('depart');
    const returnDate = urlParams.get('return');

    switch (tripType) {
        case 'round-trip':
            document.getElementById('trip-type').value = 'Round Trip';
            break;
        case 'one-way':
            document.getElementById('trip-type').value = 'One Way';
            break;
        default:
            throw new Error('Invalid trip type');
    }

    document.getElementById('from').value = getAirportFromCode(from);
    document.getElementById('to').value = getAirportFromCode(to);
    document.getElementById('depart').value = departDate;
    document.getElementById('return').value = returnDate;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const departDateObj = new Date(`${departDate} GMT-0400`);

    fetch("flights.json")
        .then(res => {
            if (!res.ok) {
                throw new Error(`${res.status} Network response was not ok`);
            }
            return res.text();
        })
        .then(text => {
            const dataArr = JSON.parse(text);
            const flights = dataArr
                .filter(flight => flight.departure_airport.toLowerCase() === from && flight.arrival_airport.toLowerCase() === to && flight.departure_time.date === Math.round((departDateObj.getTime() - today.getTime()) / (1000 * 3600 * 24)))
                .sort((a, b) => a.departure_time.hour - b.departure_time.hour || a.departure_time.minute - b.departure_time.minute);

            document.getElementById('num-results').innerText = `${flights.length} Results`;

            const flightsUl = document.getElementById('flights');
            flights.forEach(flight => {
                const departureTime = `${flight.departure_time.hour.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${flight.departure_time.minute.toLocaleString('en-US', {minimumIntegerDigits: 2})}`;
                const arrivalTime = `${flight.arrival_time.hour.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${flight.arrival_time.minute.toLocaleString('en-US', {minimumIntegerDigits: 2})}`;

                const li = document.createElement('li');
                const mainDiv = document.createElement('div');
                const div = document.createElement('div');
                const airlineLogo = document.createElement('img');
                const airline = document.createElement('p');
                const departAirport = document.createElement('p');
                const departTime = document.createElement('p');
                const middleInfo = document.createElement('p');
                const arriveTime = document.createElement('p');
                const arrivalAirport = document.createElement('p');
                const bookButton = document.createElement('button');

                airlineLogo.src = './resources/airline-logo.png';
                airline.innerText = 'Bobo Airlines';
                departAirport.innerText = flight.departure_airport;
                departTime.innerText = departureTime;
                middleInfo.innerText = '-------o-------';
                arriveTime.innerText = arrivalTime;
                arrivalAirport.innerText = flight.arrival_airport;
                bookButton.innerText = 'BOOK NOW';

                bookButton.onclick = () => book(flight.id);

                li.classList.add('flight');
                mainDiv.classList.add('flight-info-container');
                div.classList.add('flight-info');
                airlineLogo.classList.add('airline-logo');
                airline.classList.add('airline-text');
                departAirport.classList.add('airport-text');
                departTime.classList.add('flight-text', 'time');
                middleInfo.classList.add('flight-text');
                arriveTime.classList.add('flight-text', 'time');
                arrivalAirport.classList.add('airport-text');
                bookButton.classList.add('book-button');

                div.appendChild(departTime);
                div.appendChild(middleInfo);
                div.appendChild(arriveTime);
                div.appendChild(departAirport);
                div.appendChild(document.createElement('br'));
                div.appendChild(arrivalAirport);
                mainDiv.appendChild(airlineLogo);
                mainDiv.appendChild(airline);
                mainDiv.appendChild(div);
                mainDiv.appendChild(bookButton);
                li.appendChild(mainDiv);
                flightsUl.appendChild(li);
            });
        })
        .catch(e => console.error(e));
}

function book(flightID) {
    const urlParams = new URLSearchParams(window.location.search);

    const tripType = urlParams.get('trip_type');
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    const departDate = urlParams.get('depart');
    const returnDate = urlParams.get('return');
    const cabinClass = urlParams.get('cabin_class');
    const adults = urlParams.get('adults');
    const children = urlParams.get('children');
    const direct = urlParams.get('direct');

    const qTripID = `trip_id=${flightID}`;
    const qTripType = `&trip_type=${tripType}`;
    const qFrom = `&from=${from}`;
    const qTo = `&to=${to}`;
    const qDepart = `&depart=${departDate}`;
    const qReturn = returnDate ? `&return=${returnDate}` : '';
    const qCabinClass = `&cabin_class=${cabinClass}`;
    const qAdults = `&adults=${adults}`;
    const qChildren = `&children=${children}`;
    const qDirect = `&direct=${direct}`;

    location.href = `booking.html?${qTripID}${qTripType}${qFrom}${qTo}${qDepart}${qReturn}${qCabinClass}${qAdults}${qChildren}${qDirect}`;
}

function loadTripDetails() {
    const urlParams = new URLSearchParams(window.location.search);

    const tripID = parseInt(urlParams.get('trip_id'));
    const tripType = urlParams.get('trip_type');
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    const departDate = urlParams.get('depart');
    const returnDate = urlParams.get('return');
    const cabinClass = urlParams.get('cabin_class');
    const adults = urlParams.get('adults') ? parseInt(urlParams.get('adults')) : 0;
    const children = urlParams.get('children') ? parseInt(urlParams.get('children')) : 0;

    fetch("flights.json")
        .then(res => {
            if (!res.ok) {
                throw new Error(`${res.status} Network response was not ok`);
            }
            return res.text();
        })
        .then(text => {
            const dataArr = JSON.parse(text);
            const flight = dataArr.find(flight => flight.id === tripID);
            const departDate = new Date();
            departDate.setDate(departDate.getDate() + flight.departure_time.date);
            const arriveDate = new Date();
            arriveDate.setDate(arriveDate.getDate() + flight.arrival_time.date);
            const airFare = (flight.duration.hour + flight.duration.minute / 60) * 100;
            const taxes = 100.77;

            document.getElementById('flight-details-simple').innerText = `${getAirportFromCode(from)} → ${getAirportFromCode(to)} • ${new Date(departDate).toLocaleDateString('en-ca', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}`;
            document.getElementById('departDate').innerText = departDate.toLocaleDateString('en-ca', {
                month: 'short',
                day: 'numeric'
            });
            document.getElementById('total-flight-time').innerText = `${flight.duration.hour}h ${flight.duration.minute}m`;
            document.getElementById('arriveDate').innerText = arriveDate.toLocaleDateString('en-ca', {
                month: 'short',
                day: 'numeric'
            });
            document.getElementById('departAirport').innerText = from.toUpperCase();
            document.getElementById('departTime').innerText = `${flight.departure_time.hour.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${flight.departure_time.minute.toLocaleString('en-US', {minimumIntegerDigits: 2})}`;
            document.getElementById('arrivalAirport').innerText = to.toUpperCase();
            document.getElementById('arrivalTime').innerText = `${flight.arrival_time.hour.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${flight.arrival_time.minute.toLocaleString('en-US', {minimumIntegerDigits: 2})}`;
            document.getElementById('cabin-class').innerText = getCabinClass(cabinClass);

            document.getElementById('adults').innerText = `$${(adults * 75).toFixed(2)}`;
            document.getElementById('children').innerText = `$${(children * 50).toFixed(2)}`;
            document.getElementById('air-fare').innerText = `$${(airFare * (adults + children)).toFixed(2)}`;
            document.getElementById('taxes').innerText = `$${taxes.toFixed(2)}`;
            document.getElementById('total-price-value').innerText = `$${(airFare + taxes + adults * 75 + children * 50).toFixed(2)}`;
        })
        .catch(e => console.error(e));
}

function goToFees() {
    const urlParams = new URLSearchParams(window.location.search);

    const tripID = parseInt(urlParams.get('trip_id'));
    const tripType = urlParams.get('trip_type');
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    const departDate = urlParams.get('depart');
    const returnDate = urlParams.get('return');
    const cabinClass = urlParams.get('cabin_class');
    const adults = urlParams.get('adults') ? parseInt(urlParams.get('adults')) : 0;
    const children = urlParams.get('children') ? parseInt(urlParams.get('children')) : 0;
    const price = parseFloat(document.getElementById('total-price-value').innerText.substring(1));

    const qTripID = `trip_id=${tripID}`;
    const qTripType = `&trip_type=${tripType}`;
    const qFrom = `&from=${from}`;
    const qTo = `&to=${to}`;
    const qDepart = `&depart=${departDate}`;
    const qReturn = returnDate ? `&return=${returnDate}` : '';
    const qCabinClass = `&cabin_class=${cabinClass}`;
    const qAdults = `&adults=${adults}`;
    const qChildren = `&children=${children}`;

    location.href = `fees.html?${qTripID}${qTripType}${qFrom}${qTo}${qDepart}${qReturn}${qCabinClass}${qAdults}${qChildren}`;
}

function loadFees() {
    const urlParams = new URLSearchParams(window.location.search);

    const tripID = parseInt(urlParams.get('trip_id'));
    const tripType = urlParams.get('trip_type');
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    const departDate = urlParams.get('depart');
    const returnDate = urlParams.get('return');
    const cabinClass = urlParams.get('cabin_class');
    const adults = urlParams.get('adults') ? parseInt(urlParams.get('adults')) : 0;
    const children = urlParams.get('children') ? parseInt(urlParams.get('children')) : 0;

    fetch("flights.json")
        .then(res => {
            if (!res.ok) {
                throw new Error(`${res.status} Network response was not ok`);
            }
            return res.text();
        })
        .then(text => {
            const dataArr = JSON.parse(text);
            const flight = dataArr.find(flight => flight.id === tripID);
            const airFare = (flight.duration.hour + flight.duration.minute / 60) * 100;
            const taxes = 100.77 + adults * 75 + children * 50;
            const totalFare = airFare + taxes;

            document.getElementById('flight-fees').innerText = `$${totalFare.toFixed(2)}`;
            document.getElementById('total-price-value').innerText = `$${totalFare.toFixed(2)}`;
        })
        .catch(e => console.error(e));
}

function changePrice() {
    const urlParams = new URLSearchParams(window.location.search);

    const tripID = parseInt(urlParams.get('trip_id'));
    const adults = urlParams.get('adults') ? parseInt(urlParams.get('adults')) : 0;
    const children = urlParams.get('children') ? parseInt(urlParams.get('children')) : 0;

    fetch("flights.json")
        .then(res => {
            if (!res.ok) {
                throw new Error(`${res.status} Network response was not ok`);
            }
            return res.text();
        })
        .then(text => {
            const dataArr = JSON.parse(text);
            const flight = dataArr.find(flight => flight.id === tripID);
            const airFare = (flight.duration.hour + flight.duration.minute / 60) * 100;
            const taxes = 100.77 + adults * 75 + children * 50;

            const legRoom = document.getElementById('extra-leg-room').checked ? 50 : 0;
            const baggage = document.getElementById('extra-baggage').checked ? 25 : 0;
            const boarding = document.getElementById('priority-boarding').checked ? 30 : 0;

            const totalFare = airFare + taxes + legRoom + baggage + boarding;

            document.getElementById('total-price-value').innerText = `$${totalFare.toFixed(2)}`;
        })
        .catch(e => console.error(e));
}

function getAirportFromCode(code) {
    switch (code.toLowerCase()) {
        case 'yyz':
            return 'Toronto (YYZ)';
        case 'lhr':
            return 'London (LHR)';
        case 'cdg':
            return 'Paris (CDG)';
        case 'fra':
            return 'Frankfurt (FRA)';
        case 'ams':
            return 'Amsterdam (AMS)';
        case 'mad':
            return 'Madrid (MAD)';
        case 'fco':
            return 'Rome (FCO)';
        case 'zrh':
            return 'Zurich (ZRH)';
        case 'arn':
            return 'Stockholm (ARN)';
        case 'cph':
            return 'Copenhagen (CPH)';
        case 'osl':
            return 'Oslo (OSL)';
        default:
            throw new Error('Invalid airport code');
    }
}

function getCabinClass(cabin_class) {
    switch (cabin_class) {
        case 'economy':
            return 'Economy';
        case 'premium-economy':
            return 'Premium Economy';
        case 'business':
            return 'Business Class';
        case 'first':
            return 'First Class';
        default:
            throw new Error('Invalid cabin class');
    }
}
