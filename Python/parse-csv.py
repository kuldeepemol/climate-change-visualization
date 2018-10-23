# Dependencies
from datetime import datetime
import csv, os, time
from dbclasses import Base, GlobalTemperature, GlobalTemperatureByState, GlobalTemperatureByCountry,\
    GlobalTemperatureByCity, GlobalTemperatureByMajorCity, CO2Data, PollutantData
from sqlalchemy import create_engine


def print_counter(row_count):

    if row_count % 100 == 0:
        print('.', end='')
        if row_count % 5000 == 0:
            print(f' {row_count}')


# Create Database Connection
# Creates a connection to our SQLite DB using the Connect Engine
engine = create_engine("sqlite:///../Resources/db/global-temperature-pollutant.sqlite")
conn = engine.connect()

# Use this to clear out the db
Base.metadata.drop_all(engine)

# Create (if not already in existence) the tables associated with our classes.
Base.metadata.create_all(engine)


# Get the GlobalTemperatures.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'climate-change-earth-surface-temperature-data',
                        'GlobalTemperatures.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0

    t0 = time.time()
    # Loop over all the rows in the CSV file
    for row in reader:

        date, land_average_temperature, land_average_temperature_uncertainty, land_max_temperature,\
        land_max_temperature_uncertainty, land_min_temperature, land_min_temperature_uncertainty,\
        land_and_ocean_average_temperature, land_and_ocean_average_temperature_uncertainty = \
            row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]

        # Date greater than year 1850, ignore any date before that
        if date < '1850':
            continue

        if (date and land_average_temperature and land_average_temperature_uncertainty and land_max_temperature and
                land_max_temperature_uncertainty and land_min_temperature and land_min_temperature_uncertainty and
                land_and_ocean_average_temperature and land_and_ocean_average_temperature_uncertainty):

            # Create a dictionary
            global_temperature_dict = {
                'date': datetime.strptime(date, '%Y-%m-%d'),
                'land_average_temperature': land_average_temperature,
                'land_average_temperature_uncertainty': land_average_temperature_uncertainty,
                'land_max_temperature': land_max_temperature,
                'land_max_temperature_uncertainty': land_max_temperature_uncertainty,
                'land_min_temperature': land_min_temperature,
                'land_min_temperature_uncertainty': land_min_temperature_uncertainty,
                'land_and_ocean_average_temperature': land_and_ocean_average_temperature,
                'land_and_ocean_average_temperature_uncertainty': land_and_ocean_average_temperature_uncertainty
            }

            # Calls the GlobalTemperature Object to create row
            engine.execute(
                GlobalTemperature.__table__.insert(global_temperature_dict)
            )

            row_count += 1

            print_counter(row_count)

    print('\n')
    print(f'SQLAlchemy Core: Total time for {row_count} records for table global_temperature'
          f' {time.time() - t0} secs')
    print('\n')


'''# Get the GlobalLandTemperaturesByCountry.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'climate-change-earth-surface-temperature-data',
                        'GlobalLandTemperaturesByCountry.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0

    # Loop over all the rows in the CSV file
    t0 = time.time()
    for row in reader:

        date, land_average_temperature, land_average_temperature_uncertainty, country =\
            row[0], row[1], row[2], row[3]

        # Date greater than year 1850, ignore any date before that
        if date < '1850':
            continue

        if date and land_average_temperature and land_average_temperature_uncertainty and country:

            # Create a dictionary
            global_temperature_by_country_dict = {
                'date': datetime.strptime(date, '%Y-%m-%d'),
                'land_average_temperature': land_average_temperature,
                'land_average_temperature_uncertainty': land_average_temperature_uncertainty,
                'country': country
            }

            # Calls the GlobalTemperatureByCountry Object to create row
            engine.execute(
                GlobalTemperatureByCountry.__table__.insert(global_temperature_by_country_dict)
            )

            row_count += 1

            print_counter(row_count)

    print(f'\nSQLAlchemy Core: Total time for {row_count} records for table global_temperature_by_country'
          f' {time.time() - t0} secs\n')


# Get the GlobalLandTemperaturesByState.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'climate-change-earth-surface-temperature-data',
                        'GlobalLandTemperaturesByState.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0

    t0 = time.time()
    # Loop over all the rows in the CSV file
    for row in reader:

        date, land_average_temperature, land_average_temperature_uncertainty, state, country =\
            row[0], row[1], row[2], row[3], row[4]

        # Date greater than year 1850, ignore any date before that
        if date < '1850':
            continue

        if date and land_average_temperature and land_average_temperature_uncertainty and state and country:

            # Create a dictionary
            global_temperature_by_state_dict =  {
                'date': datetime.strptime(date, '%Y-%m-%d'),
                'land_average_temperature': land_average_temperature,
                'land_average_temperature_uncertainty': land_average_temperature_uncertainty,
                'state': state,
                'country': country
            }

            # Calls the GlobalTemperatureByState Object to create row
            engine.execute(
                GlobalTemperatureByState.__table__.insert(global_temperature_by_state_dict)
            )

            row_count += 1

            print_counter(row_count)

    print(f'\nSQLAlchemy Core: Total time for {row_count} records for table global_temperature_by_state'
          f' {time.time() - t0} secs\n')
'''

# Get the GlobalLandTemperaturesByMajorCity.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'climate-change-earth-surface-temperature-data',
                        'GlobalLandTemperaturesByMajorCity.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0
    t0 = time.time()
    # Loop over all the rows in the CSV file
    for row in reader:

        date, land_average_temperature, land_average_temperature_uncertainty, city, country, latitude, longitude =\
            row[0], row[1], row[2], row[3], row[4], row[5], row[6]

        # Date greater than year 1850, ignore any date before that
        if date < '1850':
            continue

        if date and land_average_temperature and land_average_temperature_uncertainty and city and country and\
                latitude and longitude:

            if 'S' in latitude:
                latitude = latitude.replace('S', '')
                latitude = '-' + latitude
            elif 'N' in latitude:
                latitude = latitude.replace('N', '')

            if 'W' in longitude:
                longitude = longitude.replace('W', '')
                longitude = '-' + longitude
            elif 'E' in longitude:
                longitude = longitude.replace('E', '')

            # Create a dictionary
            global_temperature_by_major_city_dict = {
                'date': datetime.strptime(date, '%Y-%m-%d'),
                'land_average_temperature': land_average_temperature,
                'land_average_temperature_uncertainty': land_average_temperature_uncertainty,
                'city': city,
                'country': country,
                'latitude': latitude,
                'longitude': longitude
            }

            # Calls the GlobalTemperatureByMajorCity Object to create row
            engine.execute(
                GlobalTemperatureByMajorCity.__table__.insert(global_temperature_by_major_city_dict)
            )

            row_count += 1

            print_counter(row_count)

    print(f'\nSQLAlchemy Core: Total time for {row_count} records for table global_temperature_by_major_city'
          f' {time.time() - t0} secs\n')

'''# Get the GlobalLandTemperaturesByCity.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'climate-change-earth-surface-temperature-data',
                        'GlobalLandTemperaturesByCity.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0
    t0 = time.time()

    # Loop over all the rows in the CSV file
    for row in reader:

        date, land_average_temperature, land_average_temperature_uncertainty, city, country, latitude, longitude =\
            row[0], row[1], row[2], row[3], row[4], row[5], row[6]

        # Date greater than year 1850, ignore any date before that
        if date < '1850':
            continue

        if date and land_average_temperature and land_average_temperature_uncertainty and city and country and\
                latitude and longitude:

            if 'S' in latitude:
                latitude = latitude.replace('S', '')
                latitude = '-' + latitude
            elif 'N' in latitude:
                latitude = latitude.replace('N', '')

            if 'W' in longitude:
                longitude = longitude.replace('W', '')
                longitude = '-' + longitude
            elif 'E' in longitude:
                longitude = longitude.replace('E', '')

                # Create a dictionary
                global_temperature_by_city_dict = {
                    'date': datetime.strptime(date, '%Y-%m-%d'),
                    'land_average_temperature': land_average_temperature,
                    'land_average_temperature_uncertainty': land_average_temperature_uncertainty,
                    'city': city,
                    'country': country,
                    'latitude': latitude,
                    'longitude': longitude
                }

                # Calls the GlobalTemperatureByCity Object to create row
                engine.execute(
                    GlobalTemperatureByCity.__table__.insert(global_temperature_by_city_dict)
                )

            row_count += 1

            print_counter(row_count)

    print(f'\nSQLAlchemy Core: Total time for {row_count} records for table global_temperature_by_city'
          f' {time.time() - t0} secs\n')

# Get the co2-mm-mlo_csv.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'co2-ppm_zip',
                        'data',
                        'co2-mm-mlo_csv.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0
    t0 = time.time()
    # Loop over all the rows in the CSV file
    for row in reader:

        date, average, interpolated, trend, number_of_days = row[0], row[1], row[2], row[3], row[4]

        # Date greater than year 1850, ignore any date before that
        if date < '1850':
            continue

        if date and average and interpolated and trend and number_of_days:

            # Create a dictionary
            co2_data_dict = {
                'date':datetime.strptime(date, '%Y-%m-%d'),
                'average':average,
                'interpolated':interpolated,
                'trend':trend,
                'number_of_days': number_of_days
            }

            # Calls the GlobalTemperatureByCity Object to create row
            engine.execute(
                CO2Data.__table__.insert(co2_data_dict)
            )

            row_count += 1

            print_counter(row_count)

    print(f'\nSQLAlchemy Core: Total time for {row_count} records for co2_data'
          f' {time.time() - t0} secs\n')
'''

# Get the atmospheric-concentration-of-pollutant.csv file to read data from: path where the program resides
filename = os.path.join(os.path.dirname(__file__),
                        '..',
                        'Resources',
                        'atmospheric-concentration-of-pollutant.csv')

# Open the .csv file using csv.DictReader
print(f'Reading file {filename}  .....')
with open(filename, 'r') as csvfile:

    reader = csv.reader(csvfile, delimiter=',')

    # Get the header from the file
    header = next(reader)

    row_count = 0
    t0 = time.time()
    # Loop over all the rows in the CSV file
    for row in reader:

        year, co2_ppm, ch4_ppb, n2o_ppm = row[0], row[1], row[2], row[3]

        # Date greater than year 1850, ignore any date before that
        if year < '1850':
            continue

        if year and co2_ppm and ch4_ppb and n2o_ppm:

            # Create a dictionary
            pollutant_data_dict = {
                'year': datetime.strptime(year, '%Y'),
                'co2_ppm': co2_ppm,
                'ch4_ppb': ch4_ppb,
                'n2o_ppb': n2o_ppm,
            }

            # Calls the PollutantData Object to create row
            engine.execute(
                PollutantData.__table__.insert(pollutant_data_dict)
            )

            row_count += 1

            print_counter(row_count)

    print(f'\nSQLAlchemy Core: Total time for {row_count} records for pollutant_data'
          f' {time.time() - t0} secs\n')

print(f'All Done!!!')