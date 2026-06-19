import requests

API_KEY = "YOUR_OPENWEATHER_API_KEY"


def get_weather(city):

    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?q={city}"
        f"&appid={API_KEY}"
        f"&units=metric"
    )

    response = requests.get(url)

    data = response.json()

    if response.status_code != 200:

        raise Exception(
            data.get("message", "Weather API Error")
        )

    return {
        "city": city,
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "description": data["weather"][0]["description"],
        "wind_speed": data["wind"]["speed"]
    }
