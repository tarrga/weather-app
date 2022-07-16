function WeatherDaily({ day, icon, degree }) {
  return (
    <div className='weather-daily'>
      <span>{day}</span>
      <div>{icon}</div>
      <span>{degree}</span>
    </div>
  );
}
export default WeatherDaily;
