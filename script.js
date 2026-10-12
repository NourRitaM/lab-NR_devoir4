
// API key comes from config.js (loaded before this file in index.html).
// The API URL uses metric units so temperatures are returned in Celsius.
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// Get the DOM elements needed to update the interface.
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

// Disable the button while a request is in progress.
function showLoading() {
    loadingMsg.style.display = "block";
    searchBtn.disabled = true;
}

// Re-enable the button once the request is complete.
function hideLoading() {
    loadingMsg.style.display = "none";
    searchBtn.disabled = false;
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = "block";
    weatherBox.style.display = "none";
}

function hideError() {
    errorMsg.style.display = "none";
    errorMsg.textContent = "";
}

// Choose a Font Awesome icon based on the current weather condition.
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
        return "fa fa-cloud weather-icon";
    }
}

// Update the page with weather data returned by the API.
function displayWeather(data) {
    const main = data.weather[0].main;
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;

    tempEl.textContent = Math.round(data.main.temp) + "°C";
    cityEl.textContent = data.name + ", " + data.sys.country;
    descriptionEl.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    humidityEl.textContent = data.main.humidity + "%";
    windEl.textContent = Math.round(data.wind.speed * 3.6) + " Km/h";
    weatherIcon.className = getIconClass(main, iconCode);

    weatherBox.style.display = "block";
}

// Fetch weather data for a given city.
async function checkWeather(city) {
    hideError();

    if (city.trim() === "") {
        showError("Please enter a city name.");
        return;
    }

    if (typeof API_KEY === "undefined" || API_KEY === "YOUR_API_KEY_HERE") {
        showError("API key missing. Please create config.js (see README).");
        return;
    }

    showLoading();

    try {
        const response = await fetch(apiUrl + encodeURIComponent(city.trim()) + "&appid=" + API_KEY);

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
        if (error.name === "TypeError") {
            showError("Network error. Please check your internet connection.");
        } else {
            showError(error.message);
        }
    } finally {
        hideLoading();
    }
}

// ---------- events ----------

searchBtn.addEventListener("click", function () {
    checkWeather(cityInput.value);
});

cityInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        checkWeather(cityInput.value);
    }
});

// Load a default city when the page opens.
checkWeather("Beirut");
