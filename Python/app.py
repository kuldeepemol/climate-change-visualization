# Dependencies
import pandas as pd
from .dbclasses import Base, GlobalTemperature, GlobalTemperatureByMajorCity, PollutantData
from sqlalchemy import func
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../Resources/db/global-temperature-pollutant.sqlite"
db = SQLAlchemy(app)

# Home Page
@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")


# Get all the list of Unique countries
@app.route("/countries")
def countries():
    """Return a list of countries names."""

    # Perform the sql query
    query = db.session.query(
            GlobalTemperatureByMajorCity.country.distinct().label("Country")
        ).order_by(GlobalTemperatureByMajorCity.country)

    countries = [row.Country for row in query.all()]

    # Return a list of the countries
    return jsonify(countries)


# Get all the list of unique cites by selected country
@app.route("/cities/<country>")
def city_by_country(country):
    """Return a list of cities in a given country."""

    # Perform the sql query
    query = db.session.query(
            GlobalTemperatureByMajorCity.city
        ).filter(GlobalTemperatureByMajorCity.country == country
        ).group_by(GlobalTemperatureByMajorCity.city
        ).order_by(GlobalTemperatureByMajorCity.city)

    cities = [row.city for row in query.all()]

    # Return a list of the cities
    return jsonify(cities)


# Get all the all the data by selected country
@app.route("/temperature/country/<country>/period/<period>")
def temperature_by_country(country, period):
    """Return a list of temperature for a given country."""

    # Perform the sql query
    query = db.session.query(
                GlobalTemperatureByMajorCity.date,
                func.avg(GlobalTemperatureByMajorCity.land_average_temperature).label('avg_temperature')
            ).filter(GlobalTemperatureByMajorCity.country == country)

    if period == 'yearly':
        query = query.group_by(func.strftime('%Y', GlobalTemperatureByMajorCity.date))

    df = pd.read_sql_query(query.statement, db.session.bind)

    # Format the data to send as json

    data = {
        "date": df.date.values.tolist(),
        "temperature": df.avg_temperature.values.tolist(),
    }

    return jsonify(data)


# Get all the all the data by selected city and country
@app.route("/temperature/city/<city>/country/<country>/period/<period>")
def temperature_by_city_country(city, country, period):
    """Return a list of temperature for a given city and country."""

    # Perform the sql query
    query = db.session.query(
                GlobalTemperatureByMajorCity.date,
                func.avg(GlobalTemperatureByMajorCity.land_average_temperature).label('avg_temperature')
            ).filter(
                GlobalTemperatureByMajorCity.city == city and
                GlobalTemperatureByMajorCity.country == country
            )

    if period == 'yearly':
        query = query.group_by(func.strftime('%Y', GlobalTemperatureByMajorCity.date))

    df = pd.read_sql_query(query.statement, db.session.bind)

    # Format the data to send as json

    data = {
        "date": df.date.values.tolist(),
        "temperature": df.avg_temperature.tolist(),
    }

    return jsonify(data)


# Get all the all the data by global land and ocean temperature
@app.route("/global/temperature")
def global_temperature():
    """Return a list of temperature for a global."""

    # Perform the sql query
    query = db.session.query(
                GlobalTemperature.date,
                func.avg(GlobalTemperature.land_average_temperature).label('avg_land_temperature'),
                func.avg(GlobalTemperature.land_and_ocean_average_temperature).label('avg_land_and_ocean_temperature')
            ).group_by(func.strftime('%Y', GlobalTemperature.date))

    df = pd.read_sql_query(query.statement, db.session.bind)

    # Format the data to send as json

    data = {
        "date": df.date.values.tolist(),
        "avg_land_temperature": df.avg_land_temperature.tolist(),
        "avg_land_and_ocean_temperature": df.avg_land_and_ocean_temperature.tolist(),
    }

    return jsonify(data)


# Get all the all the data by global land and ocean temperature
@app.route("/global/pollutant")
def global_pollutant():
    """Return a list of pollutant for a global."""

    # Perform the sql query
    query_temperature = db.session.query(
        func.strftime('%Y', GlobalTemperature.date).label('date'),
        func.avg(GlobalTemperature.land_average_temperature).label('avg_land_temperature'),
        func.avg(GlobalTemperature.land_and_ocean_average_temperature).label('avg_land_and_ocean_temperature')
    ).group_by(func.strftime('%Y', GlobalTemperature.date))

    temperature_dict = {}

    for row in query_temperature.all():
        date = row.date+'-01-01'
        temperature_dict[date] = row.avg_land_and_ocean_temperature

    # Perform the sql query
    query_pollutant = db.session.query(
        PollutantData.year,
        PollutantData.co2_ppm,
        PollutantData.ch4_ppb,
        PollutantData.n2o_ppb
    )

    data = []

    for row in query_pollutant.all():

        if str(row.year) in temperature_dict:

            data_dict = {
                "date": row.year,
                "co2_ppm": row.co2_ppm,
                "ch4_ppb": row.ch4_ppb,
                "n2o_ppb": row.n2o_ppb,
                "average_temperature": temperature_dict[str(row.year)]
            }

            data.append(data_dict)

    return jsonify(data)


# Get all the all the data by city for temperature
@app.route("/timeline/geoJSON")
def timeline_geojson():
    """Return a list of temperature for a global."""

    # Perform the sql query
    query = db.session.query(
                GlobalTemperatureByMajorCity.date,
                GlobalTemperatureByMajorCity.latitude,
                GlobalTemperatureByMajorCity.longitude,
                GlobalTemperatureByMajorCity.city,
                GlobalTemperatureByMajorCity.country,
                func.avg(GlobalTemperatureByMajorCity.land_average_temperature).label('avg_land_temperature')
            ).group_by(
                GlobalTemperatureByMajorCity.city,
                GlobalTemperatureByMajorCity.country,
                func.strftime('%Y', GlobalTemperatureByMajorCity.date)
            )

    features = []

    for row in query.all():

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [row.latitude, row.longitude]
            },
            "properties": {
                "average_temperature": row.avg_land_temperature,
                "name": row.city + ', ' + row.country,
                "start": "1850-01-01",
                "end": "2015-01-01",
                "time": row.date,
            }
        }

        features.append(feature)

    # Format the data to send as GeoJSON
    data = {
        "type": "FeatureCollection",
        "features": features
    }

    return jsonify(data)


# Get all the all the data by city for temperature
@app.route("/timeline/json/<date>")
def timeline_json_date(date):

    """Return a list of temperature for a global."""

    # Perform the sql query
    query = db.session.query(
                GlobalTemperatureByMajorCity.date,
                GlobalTemperatureByMajorCity.latitude,
                GlobalTemperatureByMajorCity.longitude,
                GlobalTemperatureByMajorCity.city,
                GlobalTemperatureByMajorCity.country,
                func.avg(GlobalTemperatureByMajorCity.land_average_temperature).label('avg_land_temperature')
            ).filter(
                GlobalTemperatureByMajorCity.date == date
            ).group_by(
                GlobalTemperatureByMajorCity.city,
                GlobalTemperatureByMajorCity.country,
                func.strftime('%Y', GlobalTemperatureByMajorCity.date)
            )

    features = []

    for row in query.all():

        feature = {
            'location': {
                'latitude': row.latitude,
                'longitude': row.longitude,
            },
            "average_temperature": row.avg_land_temperature,
            "name": row.city + ', ' + row.country,
            "time": row.date,
        }

        features.append(feature)

    return jsonify(features)


if __name__ == "__main__":
    app.run(debug=True)
