import http from 'http';
import fetch from 'node-fetch';
import Compass from 'cardinal-direction';

const latitude = parseFloat(process.env.LATITUDE);
const longitude = parseFloat(process.env.LONGITUDE);

const API_BASE_URL = 'https://api.weather.gov';
const buildUrl = (uri) => `${API_BASE_URL}${uri}`;

const fetchJSON = async (url) => (await fetch(url)).json();

const getPointData = (lat, lon) =>
  fetchJSON(buildUrl(`/points/${lat.toFixed(4)},${lon.toFixed(4)}`));

const getForecast = (pointData) =>
  fetchJSON(pointData.properties.forecastHourly);

const buildMetricValue = (name, value, labels = {}) => {
  const labelsOutput = Object.entries(labels)
    .map(([key, value]) => `${key}="${value}"`)
    .join(',');
  if (labelsOutput) {
    return `${name}{${labelsOutput}} ${value}`;
  }
  return `${name} ${value}`;
};

const buildMetric = (name, type, description) => {
  return `# TYPE ${name} ${type}`;
};

const server = http.createServer(async (request, response) => {
  try {
    const pointData = await getPointData(latitude, longitude);
    const forecast = await getForecast(pointData);

    const current = forecast.properties.periods[0];
    const currentTemp = current.temperature;
    const windDirection = Compass.degreeFromCardinal(current.windDirection);
    const windSpeed = parseInt(current.windSpeed, 10);

    const lines = [
      buildMetric(
        'weather_current_temperature',
        'gauge',
        'current temperature in F',
      ),
      buildMetricValue('weather_current_temperature', currentTemp, {
        latitude,
        longitude,
      }),
      buildMetric(
        'weather_current_wind_direction',
        'gauge',
        'wind direction in deg',
      ),
      buildMetricValue('weather_current_wind_direction', windDirection, {
        latitude,
        longitude,
      }),
      buildMetric('weather_current_wind_speed', 'gauge', 'wind speed in mph'),
      buildMetricValue('weather_current_wind_speed', windSpeed, {
        latitude,
        longitude,
      }),
    ];

    console.log(lines.join('\n'));
    response.write(lines.join('\n'));
    response.end();
  } catch (e) {
    console.error(e);
    console.error(`Error getting weather for ${latitude},${longitude}`);
    response.end();
  }
});

server.listen(8080, () => {
  console.log('listening');
});
