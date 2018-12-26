const http = require('http');

const APPID = "your_OpenWeatherMap_api_key";
const LANGUAGE = "en";
var finalResult = {};
var key = 'weatherData';
finalResult[key] = [];
var result;


exports.handler = (event, context, cb) => {
    // TODO implement
    function convertKelvinToCelsius(kelvin) {
        if (kelvin < (0)) {
            return 'below absolute zero (0 K)';
        }
        else {
            return (Math.round(kelvin - 273.15));
        }
    }
    //Creating Weather Info Json
    function createWeatherJSON(APILocation, generalWeather, description, temparature, humidity, windSpeed) {
        var jsonWeatherObject = {};
        var key = 'Weather';
        jsonWeatherObject[key] = [];

        var tempData = {
            location: APILocation,
            generalWeather: generalWeather,
            description: description,
            temparature: temparature,
            humidity: humidity,
            windSpeed: windSpeed
        };

        jsonWeatherObject[key].push(tempData);
        return jsonWeatherObject;
    }

    //Request Parameters lat,long
    if (event.latitude && event.longitude) {

        var LONG = event.longitude;
        var LAT = event.latitude;
        
        var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + LAT + "&lon=" + LONG + "&APPID=" + APPID + "&lang=" + LANGUAGE;

        http.get(url, (res) => {
            console.log('statusCode: ', res.statusCode);
            var body = "";
            res.on("data", data => {
                //console.log("data: " + data);
                body += data;
            });
            res.on("end", () => {
                if (res.statusCode == 200) {
                    
                    var JSONbody = JSON.parse(JSON.stringify(body));
                    var obj = JSON.parse(JSONbody);
                    var weather = JSON.stringify(obj.weather); //Weather Object
                    var parsedWeather = JSON.parse(weather);
                    var OWMWeatherMainInfo = parsedWeather[0].main; //Weather Main Info
                    var OWMWeatherMainDescription = parsedWeather[0].description; //Weather Description Info
                    var OWMWeatherAPILocation = obj.name; //Location
                    var OWMWeatherTemparatureKelvin = obj.main.temp; //Weather Temperature Info as Kelvin
                    var OWMWeatherTemparatureCelcius = convertKelvinToCelsius(OWMWeatherTemparatureKelvin); //Weather Temperature Info as Celcius
                    var OWMWeatherHumidity = obj.main.humidity;
                    var OWMWeatherWindSpeed = obj.wind.speed;

                    var weatherJSON = createWeatherJSON(OWMWeatherAPILocation, OWMWeatherMainInfo, OWMWeatherMainDescription, OWMWeatherTemparatureCelcius, OWMWeatherHumidity, OWMWeatherWindSpeed) //Create Response JSON

                    finalResult[key].push(weatherJSON);
                    result = finalResult.weatherData[0].Weather[0];
                }
                else {
                    result = "400";
                }
                console.log("result: " + result);

                const response = {
                    statusCode: res.statusCode,
                    body: result
                }
                cb(null, response)
            });
        });
    }
    else {
        const response = {
            statusCode: 400,
            body: "Please set parameters in the request body"
        }
        cb(null, response)
    }
};
