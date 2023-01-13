import requests
import calendar
from osgeo import gdal
from pathlib import Path
from datetime import date
import datetime
import json

#General API parameters
base_url = "https://dataset.api.hub.zamg.ac.at/v1/grid/historical/winfore-v1-1d-1km?"
parameter = "SPEI"
bbox="46.300395%2C9.372346%2C49.191016%2C17.390089"
output_format="netcdf"
url=base_url+"parameters="+parameter+"&bbox="+bbox+"&output_format="+output_format

def daterange(startdate, enddate, steps=1): 
    """Yields dates in increments of steps days from startdate to enddate"""
    numdays = (enddate-startdate).days 
    for x in range (0, numdays, steps):
        yield startdate + datetime.timedelta(days =x)

#Set the month that should be generated
start_date = date(1962, 1, 1)
current_date = date.today()

with open('../dates.json','r') as f:
    dates_json = json.load(f)

for yi in range(start_date.year, current_date.year):
    dates_json["dates_weekly"][str(yi)] = {}

    min_date = date(yi, 1, 1)
    max_date = date(yi, 12, 31)
    if(yi == current_date.year):
        max_date = current_date

    for index, wi in enumerate(daterange(min_date, max_date, 7)):
        print(wi)
        check_date_str=wi.isoformat()+"T00%3A00%3A00.000Z"
        url_dated=url+"&start="+check_date_str+"&end="+check_date_str
        response = requests.get(url_dated, stream=True)

        object_name = 'AT_SPEI_'+wi.isoformat()
        filename = Path('../data/nc/'+object_name+'.nc')
        filename.write_bytes(response.content)

        nc = gdal.Open(str(filename))
        dest_path = '../data/tif/'+object_name+'.tif'
        gdal.Warp(dest_path, nc, dstSRS='EPSG:4326', creationOptions = ['TFW=NO', 'COMPRESS=LZW'],resampleAlg=gdal.GRA_Cubic, srcNodata=-999, dstNodata=-999, multithread=True)

        dates_json["dates_weekly"][str(yi)][str(index+1)] = wi.isoformat()

        with open('../dates.json','w') as f:
            json.dump(dates_json, f, indent=4)
