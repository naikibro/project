from dagster import Definitions
import os

# APRÈS si renommé en fichiers_xml.py
from assets.fichiers_xml import fichiers_xml_action_b, github_releases_xml, parse_fichiers_xml, nettoyer_donnees_xml, xml_data_csv, xml_data_mongodb
from assets.prediction import preparer_donnees, predire_bouchons_journee, prediction_data_csv, prediction_data_mongodb
from jobs import mon_job
from resources.mongodb import mongodb_resource  
from jobs.schedules import bison_fute_daily_schedule  
from jobs.sensors import bison_fute_file_sensor  

defs = Definitions(
    assets=[fichiers_xml_action_b, github_releases_xml, parse_fichiers_xml, nettoyer_donnees_xml, xml_data_csv, xml_data_mongodb, preparer_donnees, predire_bouchons_journee, prediction_data_csv, prediction_data_mongodb ],
    jobs=[mon_job],
     schedules=[bison_fute_daily_schedule],  
    sensors=[bison_fute_file_sensor],  
    resources={
        "mongodb": mongodb_resource.configured({
            "connection_string": os.getenv("MONGODB_CONNECTION_STRING"),
            "database_name": os.getenv("MONGODB_DATABASE", "supmap")
        })
    }
)