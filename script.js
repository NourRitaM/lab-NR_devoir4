
// API_KEY comes from config.js (loaded before this file in index.html)

const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// get the elements from the HTML page  -> let the manipulation like that be easier and more readable -> use of the DOM (chapter 8)
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("btn");
const loadingMsg = document.getElementById("loading");
const errorMsg = document.getElementById("error");

const weatherBox = document.querySelector(".weather");
const weatherIcon = document.querySelector(".weather-icon");
const tempEl = document.querySelector(".temp");
const cityEl = document.querySelector(".city");
const descriptionEl = document.querySelector(".description");
const humidityEl = document.querySelector(".humidity");
const windEl = document.querySelector(".wind");



function showLoading() {
    loadingMsg.style.display = "block";
    searchBtn.disabled = true; // in order toavoid sending many requests at once
}

function hideLoading() {
    loadingMsg.style.display = "none";
    searchBtn.disabled = false;
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    weatherBox.style.display = "none"; //if their is an error this line will hide the weather box so that the user can see the error message clearly
}

function hideError() {
    errorMsg.style.display = "none";
    errorMsg.textContent = "";
}

// choose a Font Awesome icon depending on the weather
function getIconClass(main, iconCode) {
    const isNight = iconCode.endsWith("n");

    if (main === "Clear") {
        return isNight ? "fa fa-moon-o weather-icon" : "fa fa-sun-o weather-icon";
    } else if (main === "Clouds") {
        return "fa fa-cloud weather-icon";
    } else if (main === "Rain" || main === "Drizzle") {
        return "fa fa-umbrella weather-icon";
    } else if (main === "Thunderstorm") {
        return "fa fa-bolt weather-icon";
    } else if (main === "Snow") {
        return "fa fa-snowflake-o weather-icon";
    } else {
    // for other weather conditions, we can use a generic cloud icon
        return "fa fa-cloud weather-icon";
    }
}

// put the API data into the page who do we do it ? we do it by using the DOM to manipulate the HTML elements and put the data into them
function displayWeather(data) {
    const main = data.weather[0].main;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    tempEl.textContent = Math.round(data.main.temp) + "°C";
    cityEl.textContent = data.name + ", " + data.sys.country;
    descriptionEl.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    humidityEl.textContent = data.main.humidity + "%";
    // the API gives wind in m/s, we convert to km/h
    windEl.textContent = Math.round(data.wind.speed * 3.6) + " Km/h";
    weatherIcon.className = getIconClass(main, iconCode);

    weatherBox.style.display = "block";
}

// the actual function that checks the weather for a given city, using the OpenWeatherMap API
async function checkWeather(city) {
    hideError();

    // 1. check the input
    if (city.trim() === "") {
        showError("Please enter a city name.");
        return;
    }

    // 2. check that the API key exists (config.js may be missing)
    if (typeof API_KEY === "undefined" || API_KEY === "YOUR_API_KEY_HERE") {
        showError("API key missing. Please create config.js (see README).");
        return;
    }

    showLoading();

    try {
        const response = await fetch(apiUrl + encodeURIComponent(city.trim()) + "&appid=" + API_KEY);

        // 3. handle non-200 responses explicitly
        if (response.status === 404) {
            throw new Error("City not found. Please check the spelling and try again.");
        } else if (response.status === 401) {
            throw new Error("Invalid API key. Please check your config.js file.");
        } else if (response.status === 429) {
            throw new Error("Too many requests (rate limit reached). Please wait a moment and try again.");
        } else if (!response.ok) {
            throw new Error("Something went wrong (error " + response.status + "). Please try again later.");
        }

        const data = await response.json();
        displayWeather(data);

    } catch (error) {
        // fetch throws a TypeError when there is no internet / network problem
        if (error.name === "TypeError") {
            showError("Network error. Please check your internet connection.");
        } else {
            showError(error.message);
        }
    } finally {
        // runs in every case (success or error)
        hideLoading();
    }
}

// ---------- events ----------

searchBtn.addEventListener("click", function () {
    checkWeather(cityInput.value);
});

// also search when the user presses Enter
cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        checkWeather(cityInput.value);
    }
});

// load a default city when the page opens (real data, not hardcoded)
checkWeather("Beirut");
