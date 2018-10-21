# Dependencies

# Imports the methods needed to abstract classes into tables
from sqlalchemy.ext.declarative import declarative_base

# Allow us to declare column types
from sqlalchemy import Column, Integer, String, Float, Date

# Sets an object to utilize the default declarative base in SQL Alchemy
Base = declarative_base()


# Creates Classes which will serve as the anchor points for our Tables
class GlobalTemperature(Base):
    __tablename__ = 'global_temperature'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    land_average_temperature = Column(Float)
    land_average_temperature_uncertainty = Column(Float)
    land_max_temperature = Column(Float)
    land_max_temperature_uncertainty = Column(Float)
    land_min_temperature = Column(Float)
    land_min_temperature_uncertainty = Column(Float)
    land_and_ocean_average_temperature = Column(Float)
    land_and_ocean_average_temperature_uncertainty = Column(Float)


class GlobalTemperatureByState(Base):
    __tablename__ = 'global_temperature_by_state'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    land_average_temperature = Column(Float)
    land_average_temperature_uncertainty = Column(Float)
    state = Column(String(255))
    country = Column(String(255))


class GlobalTemperatureByMajorCity(Base):
    __tablename__ = 'global_temperature_by_major_city'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    land_average_temperature = Column(Float)
    land_average_temperature_uncertainty = Column(Float)
    city = Column(String(255))
    country = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)


class GlobalTemperatureByCountry(Base):
    __tablename__ = 'global_temperature_by_country'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    land_average_temperature = Column(Float)
    land_average_temperature_uncertainty = Column(Float)
    country = Column(String(255))


class GlobalTemperatureByCity(Base):
    __tablename__ = 'global_temperature_by_city'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    land_average_temperature = Column(Float)
    land_average_temperature_uncertainty = Column(Float)
    city = Column(String(255))
    country = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)


class PollutantData(Base):
    __tablename__ = 'pollutant_data'
    id = Column(Integer, primary_key=True)
    year = Column(Date)
    co2_ppm = Column(Float)
    ch4_ppb = Column(Float)
    n2o_ppb = Column(Float)


class CO2Data(Base):
    __tablename__ = 'co2_data'
    id = Column(Integer, primary_key=True)
    date = Column(Date)
    average = Column(Float)
    interpolated = Column(Float)
    trend = Column(Float)
    number_of_days = Column(Integer)