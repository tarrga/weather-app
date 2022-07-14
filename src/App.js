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

const geoNamesApi = {
  userName: 'tg88',
  base: 'http://api.geonames.org/',
};

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherDetails, setWeatherDetails] = useState(null);
  const [error, setError] = useState(null);
  const [latLng, setLatLng] = useState(null);
  const [time, setTime] = useState(null);
  const [sun, setSun] = useState(null);

  //useEffect for set the latitude and longitude
  useEffect(() => {
    if (!weather) return;
    setLatLng({
      lat: weather.coord.lat,
      lng: weather.coord.lon,
    });
  }, [weather]);

  //useEffect for getting the accurate time and sunrise for the city
  useEffect(() => {
    if (!latLng) return;
    setError(null);
    const getGeoData = async () => {
      try {
        const data = await fetch(
          `${geoNamesApi.base}timezoneJSON?lat=${latLng.lat}&lng=${latLng.lng}&username=${geoNamesApi.userName}`
        );
        if (!data.ok) {
          throw new Error('Something went wrong');
        }
        const result = await data.json();
        if (result.status) {
          throw new Error('Exceeded the max limit');
        }
        console.log(result);
        setTime(result.time + ':00');
        setSun((prev) => {
          if (result.sunrise + ':00' < result.time + ':00' && result.sunset + ':00' > result.time + ':00') {
            return true;
          } else {
            return false;
          }
        });
      } catch (error) {
        setTime(new Date());
        setSun(true);
        setError(error.message);
      }
    };
    getGeoData();
  }, [latLng]);

  // weather details
  useEffect(() => {
    if (!latLng) return;
    setError(null);
    const fetchDetails = async () => {
      try {
        const data = await fetch(
          `${weatherApi.base}forecast?lat=${latLng.lat}&lon=${latLng.lng}&units=metric&appid=${weatherApi.key}`
        );
        const result = await data.json();
        if (!data.ok) {
          throw new Error('Something went wrong');
        }
        if (result.status) {
          throw new Error('Exceeded the max limit, try again later');
        }
        console.log(result);
        setWeatherDetails(result);
      } catch (error) {
        setTime(new Date());
        setSun(true);
        setError(error.message);
      }
    };
    fetchDetails();
  }, [latLng]);

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
                .filter((detail, i) => detail.dt_txt.slice(11, 19) === '15:00:00')
                .slice(0, 4)
                .map((detail, i) => (
                  <WeatherDaily
                    key={detail.dt_txt}
                    hour={i === 0 ? 'Today' : dateBuilder(new Date(detail.dt_txt)).day}
                    icon={icon(detail.weather[0].main, true)}
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
