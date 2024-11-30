const apiKey = "74404d00cada1c0035d727de9709bc21";
const citInput = document.querySelector('#cityname');
const searchBtn = document.querySelector('#searchBtn');
const CurrentBtn = document.querySelector('#currentLocation');
const weatherCards = document.querySelector("#Weathercards");
const weatherCurrent = document.querySelector("#weatherInfo");
const dropdownBtn = document.querySelector("#dropdownBtn");
const dropdownMenu = document.querySelector("#dropdownMenu");

// Get the list of recent cities from localStorage
const getRecentCities = () => {
    let cities = localStorage.getItem("recentCities");
    return cities ? JSON.parse(cities) : [];
};

// Save a city to localStorage
const saveRecentCity = (cityname) => {
    let cities = getRecentCities();
    if (!cities.includes(cityname)) {
        cities.push(cityname);
        if (cities.length > 5) cities.shift(); // Limit to the 5 most recent cities
        localStorage.setItem("recentCities", JSON.stringify(cities));
    }
    updateDropdown(cities);
};

// Update the dropdown menu with recent cities
const updateDropdown = (cities) => {
    dropdownMenu.innerHTML = '';
    cities.forEach(city => {
        const cityItem = document.createElement("li");
        cityItem.classList.add("cursor-pointer", "p-2");
        cityItem.textContent = city;
        cityItem.onclick = () => {
            citInput.value = city;
            getCordinates();
        };
        dropdownMenu.appendChild(cityItem);
    });
};

// Function to create the weather card
const createCard = (cityname, weatherItem, index) => {
    if (index === 0) {
        weatherCurrent.innerHTML = `
            <h2>Cityname: ${cityname}</h2>
            <div class="flex gap-[150px] align-center justify-center align-middle">
                <div class="flex flex-col justify-center align-middle">
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed}</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}</h4>
                </div>
                <div>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon" id="weatherIcon" class="w-[70px] h-[70px]">
                    <h4>Description: ${weatherItem.weather[0].description}</h4>
                </div>
            </div>
        `;
        return weatherCurrent;
    } else {
        const card = document.createElement('div');
        card.innerHTML = `
            <div class="border-[1px] text-center rounded bg-gray-500 text-white">
                <div>
                    <h2>${new Date(weatherItem.dt_txt).toLocaleDateString()}</h2>
                    <h2>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h2>
                    <h2>Humidity: ${weatherItem.main.humidity}%</h2>
                    <h2>Wind: ${weatherItem.wind.speed} m/s</h2>
                </div>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather Icon" id="weatherIcon" class="mx-auto my-3">
                <h2>Description: ${weatherItem.weather[0].description}</h2>
            </div>
        `;
        weatherCards.appendChild(card);
        return card;
    }
};

// Function to fetch weather details using async/await
const getWeatherDetails = async (cityname, lat, lon) => {
    const url = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const uniqueForecastDays = [];
        const fiveDays = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        citInput.value = "";
        weatherCurrent.innerHTML = ""; // Clearing the current weather section
        weatherCards.innerHTML = "";

        fiveDays.forEach((weatherItem, index) => {
            if (index === 0) {
                createCard(cityname, weatherItem, index);
            } else {
                weatherCards.appendChild(createCard(cityname, weatherItem, index));
            }
        });

        saveRecentCity(cityname); // Save the city to localStorage
    } catch (error) {
        alert("An error occurred while fetching weather data.");
    }
};

// Function to get coordinates of the city using async/await
const getCoordinates = async () => {
    const cityname = citInput.value.trim();
    if (!cityname) return;

    const api = `http://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${apiKey}`;

    try {
        const res = await fetch(api);
        const data = await res.json();
        if (!data.length) return alert("No coordinates found");
        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);
    } catch (error) {
        alert("An error occurred while fetching coordinates.");
    }
};

// Function to get weather details based on user's current location using async/await
const getUserCoordinates = async () => {
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;
        const Revurl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        const res = await fetch(Revurl);
        const data = await res.json();
        const { name } = data[0];
        getWeatherDetails(name, latitude, longitude);
    } catch (error) {
        if (error.code === error.PERMISSION_DENIED) {
            alert("You need to allow location access");
        } else {
            alert("An error occurred while fetching the user's location.");
        }
    }
};

// Event listeners
searchBtn.addEventListener("click", getCoordinates);
CurrentBtn.addEventListener("click", getUserCoordinates);

// Initialize the dropdown with recent cities
updateDropdown(getRecentCities());

// Toggle dropdown visibility
dropdownBtn.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
});
