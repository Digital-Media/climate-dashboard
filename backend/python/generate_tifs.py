import requests
import calendar
from osgeo import gdal
from pathlib import Path
from datetime import date

#General API parameters
base_url = "https://dataset.api.hub.zamg.ac.at/v1/grid/historical/winfore-v1-1d-1km?"
parameter = "SPEI"
bbox="46.300395%2C9.372346%2C49.191016%2C17.390089"
output_format="netcdf"
url=base_url+"parameters="+parameter+"&bbox="+bbox+"&output_format="+output_format

#Set the month that should be generated
check_date = date(2020, 10, 1)
for di in range(1, calendar.monthrange(check_date.year, check_date.month)[1]+1):
    #Generate URL for the date and fetch nc file from WINFORE dataset
    check_date = date(check_date.year, check_date.month, di)
    check_date_str=check_date.isoformat()+"T00%3A00%3A00.000Z"
    url_dated=url+"&start="+check_date_str+"&end="+check_date_str
    response = requests.get(url_dated, stream=True)

    #Write nc response to file
    filename = Path('nc/AT_SPEI_'+check_date.isoformat()+'.nc')
    filename.write_bytes(response.content)

    #Open nc file and convert to geotif file in EPSG:4326 coordinate system
    nc = gdal.Open(str(filename))
    dest_path = 'tif/AT_SPEI_'+check_date.isoformat()+'.tif'
    gdal.Warp(dest_path, nc, dstSRS='EPSG:4326', resampleAlg=gdal.GRA_Cubic, srcNodata=-999, dstNodata=-999)

