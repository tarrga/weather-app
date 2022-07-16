import './App.css';
import { useState } from 'react';
import { useEffect } from 'react';
// icons
import { BsSnow } from 'react-icons/bs';
import { BsCloudRainHeavy } from 'react-icons/bs';
import { BsCloudRain } from 'react-icons/bs';
import { BsCloudSun } from 'react-icons/bs';
import { RiThunderstormsFill } from 'react-icons/ri';
import { BsSun } from 'react-icons/bs';
import { BsCloudHaze1 } from 'react-icons/bs';
import { BsMoonStars } from 'react-icons/bs';
import { BsCloudMoon } from 'react-icons/bs';
//motion
import { motion } from 'framer-motion';
import WeatherDaily from './components/WeatherDaily';

const weatherApi = {
  key: '04f9040d2c8ed797b3043eed791301e7',
  base: 'https://api.openweathermap.org/data/2.5/',
};

const apiGeolocation = {
  key: '440dee3a89fc4a569b4084a8b6701428',
  base: 'https://api.ipgeolocation.io/',
};

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(null);
  const [sun, setSun] = useState(null);

  //get current time in the city and sunrise value
  useEffect(() => {
    if (!weather) return;
    setError(null);
    const getCurrentTime = async () => {
      try {
        const data = await fetch(
          `${apiGeolocation.base}timezone?apiKey=${apiGeolocation.key}&lat=${weather.coord.lat}&long=${weather.coord.lon}`
        );
        if (!data.ok) throw new Error('Something went wrong');
        const result = await data.json();
        setTime(result.date_time);
        setSun(
          weather.sys.sunrise < result.date_time_unix && weather.sys.sunset > result.date_time_unix ? true : false
        );
      } catch (error) {
        setError(error.message);
      }
    };
    getCurrentTime();
  }, [weather]);

  // weather details
  useEffect(() => {
    if (!weather) return;
    setError(null);
    const fetchDetails = async () => {
      try {
        const data = await fetch(
          `${weatherApi.base}forecast?lat=${weather.coord.lat}&lon=${weather.coord.lon}&units=metric&appid=${weatherApi.key}`
        );
        const result = await data.json();
        if (!data.ok) {
          throw new Error('Something went wrong');
        }
        if (result.status) {
          throw new Error('Exceeded the max limit, try again later');
        }
        result.list = result.list.map((list) => {
          return {
            ...list,
            weatherStatus: {
              Snow: 0,
              Rain: 0,
              Clouds: 0,
              Thunderstorm: 0,
              Clear: 0,
              Drizzle: 0,
              Rest: 0,
            },
          };
        });
        setWeatherDetails(result);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchDetails();
  }, [weather]);

  const search = async (e) => {
    if (e.key === 'Enter' && e.target.value.length > 0) {
      setError(null);
      setWeather(null);
      try {
        const data = await fetch(`${weatherApi.base}/weather?q=${query}&units=metric&APPID=${weatherApi.key}`);
        const result = await data.json();
        if (result.cod === '404') throw new Error('City not Found!');
        setWeather(result);
        setQuery('');
        console.log(result);
      } catch (err) {
        setQuery('');
        setError(err.message);
      }
    }
  };

  const dateBuilder = (d) => {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().length === 1 ? `0${d.getHours()}` : d.getHours();
    const minutes = d.getMinutes().toString().length === 1 ? `0${d.getMinutes()}` : d.getMinutes();

    return {
      day,
      date,
      month,
      year,
      hours,
      minutes,
      monthNumher: d.getMonth(),
    };
  };

  //icon function
  const icon = (currentWeather, sun) => {
    switch (currentWeather) {
      case 'Snow':
        return <BsSnow />;
      case 'Rain':
        return <BsCloudRainHeavy />;
      case 'Clouds':
        return sun ? <BsCloudSun /> : <BsCloudMoon />;
      case 'Thunderstorm':
        return <RiThunderstormsFill />;
      case 'Clear':
        return sun ? <BsSun /> : <BsMoonStars />;
      case 'Drizzle':
        return <BsCloudRain />;
      default:
        return <BsCloudHaze1 />;
    }
  };

  return (
    <div className={`app ${sun ? 'warm' : ''}`}>
      <main className={`${weather?.weather[0]?.main.toLowerCase()}`}>
        <div className='search-box'>
          <input
            type='text'
            className='search-bar'
            placeholder='City...'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            onKeyUp={search}
          />
        </div>
        {weather && !error && (
          <>
            <motion.div
              className='location-box'
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className='location'>
                {weather.name}, {weather.sys.country}
              </div>
              <div className='date'>{dateBuilder(new Date(`${time}`)).day}</div>
              {time && (
                <div className='date'>
                  {dateBuilder(new Date(`${time}`)).hours > 12
                    ? dateBuilder(new Date(`${time}`)).hours - 12
                    : dateBuilder(new Date(`${time}`)).hours >= 10
                    ? dateBuilder(new Date(`${time}`)).hours
                    : dateBuilder(new Date(`${time}`)).hours.slice(1)}
                  :{dateBuilder(new Date(`${time}`)).minutes}{' '}
                  <span>{dateBuilder(new Date(`${time}`)).hours >= 12 ? 'pm' : 'am'}</span>
                </div>
              )}
            </motion.div>

            <div className='weather-box'>
              <motion.div
                className='weather-image-container'
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {icon(weather.weather[0].main, sun)}
              </motion.div>

              <motion.div
                className='weather-info'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className='temp'>
                  <div>{Math.round(weather.main.temp)}°C</div>
                  <span>Feels like {Math.round(weather.main.feels_like)}</span>
                </div>
                <div className='weather'>{weather.weather[0].main}</div>
              </motion.div>
            </div>
            <div className='weather-details'>
              {weatherDetails?.list
                .filter((detail, i) => new Date(detail.dt_txt).getDate() <= dateBuilder(new Date(`${time}`)).date + 3)
                .map((detail, i, arr) => {
                  const indexOfArry = new Date(detail.dt_txt).getDate() - dateBuilder(new Date(`${time}`)).date;
                  //check for min and max temp
                  if (arr[indexOfArry].main.temp_min > detail.main.temp_min) {
                    arr[indexOfArry].main.temp_min = detail.main.temp_min;
                  }
                  if (arr[indexOfArry].main.temp_max < detail.main.temp_max) {
                    arr[indexOfArry].main.temp_max = detail.main.temp_max;
                  }

                  // add new dates for the first four element
                  detail.newDate = dateBuilder(new Date(new Date(detail.dt_txt).getTime() + i * (1000 * 60 * 60 * 24)));

                  //add weather status for each day
                  arr[indexOfArry].weatherStatus[detail.weather[0].main || 'Drizzle'] += 1;

                  return detail;
                })
                .slice(0, 4)
                .map((detail, i) => (
                  <WeatherDaily
                    key={detail.dt_txt}
                    day={i === 0 ? 'Today' : detail.newDate.day}
                    icon={icon(
                      // check which weather status is the most common
                      Object.keys(detail.weatherStatus).reduce((a, b) =>
                        detail.weatherStatus[a] > detail.weatherStatus[b] ? a : b
                      ),
                      true
                    )}
                    degree={`${Math.round(detail.main.temp_min)}°-${Math.round(detail.main.temp_max)}°`}
                  />
                ))}
            </div>
          </>
        )}
        {error && <div className='error-message'>{error}</div>}
      </main>
    </div>
  );
}

export default App;
