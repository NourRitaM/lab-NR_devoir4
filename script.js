
// API_KEY comes from config.js (loaded before this file in index.html)
// it's the address of the API , unit= metric ask for the celcius degree and the q= is waiting for the name of the city that the user should add
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// get the elements from the HTML page  -> let the manipulation like that be easier and more readable -> use of the DOM (chapter 8)
const cityInput = document.getElementById("city");
const searchBtn = document.getElementById("btn");
const loadingMsg = document.getElementById("loading");
const errorMsg = document.getElementById("error");
//saem thing but for the class
const weatherBox = document.querySelector(".weather");
const weatherIcon = document.querySelector(".weather-icon");
const tempEl = document.querySelector(".temp");
const cityEl = document.querySelector(".city");
const descriptionEl = document.querySelector(".description");
const humidityEl = document.querySelector(".humidity");
const windEl = document.querySelector(".wind");


// we are disabling the button function here so that the user don't send 13334 request but wait until the first one is done
function showLoading() {
    loadingMsg.style.display = "block";
    searchBtn.disabled = true; // in order to avoid sending many requests at once
}

// for when the request is  done , the search button is reactive and we can rewrite the city that we want 
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
    const isNight = iconCode.endsWith("n"); // the API should end with n for night and d for day

    if (main === "Clear") {   // if /else fonction to see the type of fa-fa-search weather icon to use on the websitedepending on the weather condition
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
function displayWeather(data) {  // data is an array that contains the weather data from the API
    const main = data.weather[0].main; // main is the main weather condition (Clear, Clouds, Rain, etc.)
    const description = data.weather[0].description;// description is the detailed weather condition (clear sky, few clouds, scattered clouds, etc.)
    const iconCode = data.weather[0].icon;// iconCode is the code for the weather icon (01d, 02d, 03d, etc.)

    tempEl.textContent = Math.round(data.main.temp) + "°C";  // the real temperature might be a float or a double  number so we round it into an integer to be moore clean in the website 
    cityEl.textContent = data.name + ", " + data.sys.country; // not just the city but the country (as an abreviation of it )
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
        return;  // that what we see in the sc image 2 
    }

    // 2. check that the API key exists (config.js may be missing)
    // commes from config.js file that is not uploaded to GitHub for security reasons but if the file is missing or the API key is not set, we show an error message to the user
    if (typeof API_KEY === "undefined" || API_KEY === "YOUR_API_KEY_HERE") {
        showError("API key missing. Please create config.js (see README).");
        return;
    }

    showLoading();

    try {
        const response = await fetch(apiUrl + encodeURIComponent(city.trim()) + "&appid=" + API_KEY);
        // what we see in the image sc 4 this part is clearly shoown in the devtools in the Network area where we can clearly see that the request is sent to the API and we can see the response from the API in the Network area of the devtools
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
        displayWeather(data);  // transforme the data from the API into a format that we can use to display the weather on the page

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
