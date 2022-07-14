function WeatherDaily({ hour, icon, degree }) {
  return (
    <div className='weather-daily'>
      <span>{hour}</span>
      <div>{icon}</div>
      <span>{degree}</span>
    </div>
  );
}
export default WeatherDaily;
