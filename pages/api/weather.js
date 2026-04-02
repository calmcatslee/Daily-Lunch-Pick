export default async function handler(req, res) {
  const { lat, lon } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat, lon required' })

  try {
    const [forecastRes, airRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,winddirection_10m&timezone=Asia%2FSeoul`
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5`
      ),
    ])

    const [forecast, air] = await Promise.all([forecastRes.json(), airRes.json()])

    const c = forecast.current || {}
    const a = air.current || {}

    return res.json({
      temp: Math.round(c.temperature_2m ?? 0),
      weatherCode: c.weathercode ?? 0,
      windSpeed: Math.round(c.windspeed_10m ?? 0),
      windDir: c.winddirection_10m ?? 0,
      pm25: Math.round(a.pm2_5 ?? 0),
      pm10: Math.round(a.pm10 ?? 0),
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
