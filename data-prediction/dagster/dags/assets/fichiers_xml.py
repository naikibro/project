from dagster import asset, AssetIn, AssetExecutionContext
import os
import requests
import tarfile
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
from lxml import etree
import pymongo
import time

import os

@asset
def fichiers_xml_action_b(context):
    url_base = os.getenv("API_URL")
    login = os.getenv("API_LOGIN")
    password = os.getenv("API_PASSWORD")

    response = requests.get(url_base, auth=(login, password))
    if response.status_code != 200:
        raise Exception(f"Erreur {response.status_code} lors de la récupération de la page")

    soup = BeautifulSoup(response.text, "html.parser")
    liens_xml = [a['href'] for a in soup.find_all('a', href=True) if a['href'].endswith(".xml")]
    context.log.info(f"{len(liens_xml)} fichiers XML trouvés.")

    dossier_data = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'xml_action_b'))
    os.makedirs(dossier_data, exist_ok=True)

    downloaded_files = []

    for lien in liens_xml:
        url_fichier = url_base + lien
        nom_fichier = os.path.join(dossier_data, lien)

        fichier = requests.get(url_fichier, auth=(login, password))
        if fichier.status_code == 200:
            with open(nom_fichier, 'wb') as f:
                f.write(fichier.content)
            downloaded_files.append(nom_fichier)  # Ajouter le chemin du fichier à la liste    
            context.log.info(f"Fichier téléchargé : {nom_fichier}")
        else:
            context.log.warning(f"Échec : {url_fichier} - Code {fichier.status_code}")

    return downloaded_files

@asset
def github_releases_xml():
    repo_owner = os.getenv("GITHUB_REPO_OWNER")
    repo_name = os.getenv("GITHUB_REPO_NAME")
    token = os.getenv("GITHUB_TOKEN")

    downloaded_files = []
    try:
        # URL de l'API GitHub
        url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/releases"

        response = requests.get(url)

        if response.status_code == 200:
            releases = response.json()
            print("Releases trouvées :")
            for release in releases:
                print(f"  - {release['tag_name']}")
                for asset in release["assets"]:
                    print(f"    - {asset['name']}")

                    # Téléchargement de l'asset
                    asset_url = asset["browser_download_url"]
                    response = requests.get(asset_url)
                    if response.status_code == 200:
                        # Enregistrement de l'asset dans un fichier
                        nom_fichier = os.path.join(os.path.dirname(__file__), 'data', asset["name"])
                        os.makedirs(os.path.dirname(nom_fichier), exist_ok=True)
                        try:
                            with open(nom_fichier, 'wb') as f:
                                f.write(response.content)
                        except Exception as e:
                            print(f"Erreur lors de l'enregistrement de {nom_fichier} : {str(e)}")

                        # Extraction des fichiers XML de l'archive
                        if nom_fichier.endswith('.tgz'):
                            try:
                                with tarfile.open(nom_fichier, 'r:gz') as tar_ref:
                                    for member in tar_ref.getmembers():
                                        if member.name.endswith('.xml'):
                                            xml_file_path = os.path.join(os.path.dirname(__file__), 'data', os.path.basename(member.name))
                                            try:
                                                with open(xml_file_path, 'wb') as f:
                                                    f.write(tar_ref.extractfile(member).read())
                                                print(f"Fichier XML extrait : {xml_file_path}")
                                                downloaded_files.append(xml_file_path)
                                            except Exception as e:
                                                print(f"Erreur lors de l'extraction de {xml_file_path} : {str(e)}")
                            except Exception as e:
                                print(f"Erreur lors de l'ouverture de {nom_fichier} : {str(e)}")

                        # Suppression du fichier .tgz
                        try:
                            os.remove(nom_fichier)
                        except Exception as e:
                            print(f"Erreur lors de la suppression de {nom_fichier} : {str(e)}")
                    else:
                        print(f"Échec : {asset_url} - Code {response.status_code}")
        else:
            print("Erreur:", response.status_code)
    except Exception as e:
        print(f"Erreur générale : {str(e)}")

    return downloaded_files
    
@asset(
    ins={
        "fichiers_xml_action_b": AssetIn("fichiers_xml_action_b"),
        "github_releases_xml": AssetIn("github_releases_xml"),
    }
)
def parse_fichiers_xml(context, fichiers_xml_action_b, github_releases_xml):
    """Parse les fichiers XML Action B et extrait les données structurées au format DATEX II."""
    from lxml import etree
    import os
    import pandas as pd

    fichiers_xml = fichiers_xml_action_b + github_releases_xml  # Fusionner les deux listes

    
    # Vérifier si la liste de fichiers est vide
    if not fichiers_xml_action_b:
        context.log.error("Aucun fichier XML à traiter. La liste de fichiers est vide.")
        return pd.DataFrame()
        
    context.log.info(f"Début du parsing de {len(fichiers_xml_action_b)} fichiers XML")

    # Vérifier si la liste de fichiers est vide
    if not github_releases_xml:
        context.log.error("Aucun fichier XML à traiter. La liste de fichiers est vide.")
        return pd.DataFrame()
        
    context.log.info(f"Début du parsing de {len(fichiers_xml_action_b)} fichiers XML")
    
    # Structure pour stocker les données extraites
    situations_data = []
    
    # Définir les namespaces pour la recherche XPath
    namespaces = {
        'soap': 'http://www.w3.org/2003/05/soap-envelope',
        'datex': 'http://datex2.eu/schema/2/2_0',
        'xsi': 'http://www.w3.org/2001/XMLSchema-instance'
    }
    
    # Traitement de chaque fichier XML
    for fichier_xml in fichiers_xml:
        try:
            context.log.info(f"Traitement du fichier: {os.path.basename(fichier_xml)}")
            file_size = os.path.getsize(fichier_xml)
            context.log.info(f"Taille du fichier: {file_size} octets")
            
            # Chargement du fichier XML
            tree = etree.parse(fichier_xml)
            root = tree.getroot()
            context.log.info(f"Fichier XML chargé. Root tag: {root.tag}")
            
            # Extraction des situations - méthode corrigée avec namespaces explicites
            soap_body = root.find(".//soap:Body", namespaces=namespaces)
            if soap_body is None:
                context.log.warning(f"Pas de soap:Body trouvé dans {fichier_xml}")
                continue
                
            # Recherche du modèle DATEX II (sans utiliser le namespace directement)
            d2_model = None
            for child in soap_body:
                if child.tag.endswith('d2LogicalModel'):
                    d2_model = child
                    break
            
            if d2_model is None:
                context.log.warning(f"Pas de d2LogicalModel trouvé dans {fichier_xml}")
                continue
            
            # Recherche de la publication
            payload_pub = None
            for elem in d2_model.iter():
                if elem.tag.endswith('payloadPublication'):
                    payload_pub = elem
                    break
                    
            if payload_pub is None:
                context.log.warning(f"Pas de payloadPublication trouvé dans {fichier_xml}")
                continue
            
            # Extraction des situations
            situation_elements = payload_pub.findall('.//datex:situation', namespaces=namespaces)
            if not situation_elements:
                context.log.warning(f"Aucune situation trouvée dans {fichier_xml}")
                continue
            
            for situation in situation_elements:
                # Extraction des métadonnées de la situation
                situation_id = situation.get('id', '')
                situation_version = situation.get('version', '')
                severity = None
                for elem in situation.iter():
                    if elem.tag.endswith('overallSeverity'):
                        severity = elem.text
                        break
                
                version_time = None
                for elem in situation.iter():
                    if elem.tag.endswith('situationVersionTime'):
                        version_time = elem.text
                        break
                
                # Extraction des enregistrements de situation
                for record in situation.iter():
                    if record.tag.endswith('situationRecord'):
                        record_type = record.get('{http://www.w3.org/2001/XMLSchema-instance}type', '')
                        record_id = record.get('id', '')
                        record_version = record.get('version', '')
                        
                        queue_length = None
                        for elem in record.iter():
                            if elem.tag.endswith('queueLength'):
                                queue_length = elem.text
                                break
                        
                        # Extraction des informations de localisation
                        latitude = longitude = None
                        for elem in record.iter():
                            if elem.tag.endswith('pointCoordinates'):
                                for sub_elem in elem.iter():
                                    if sub_elem.tag.endswith('latitude'):
                                        latitude = sub_elem.text
                                    elif sub_elem.tag.endswith('longitude'):
                                        longitude = sub_elem.text
                        
                        # Extraction des informations sur la route
                        road_number = ''
                        for elem in record.iter():
                            if elem.tag.endswith('roadNumber'):
                                road_number = elem.text
                                break
                        
                        # Extraction des dates de début et de fin
                        start_time = None
                        for elem in record.iter():
                            if elem.tag.endswith('validity'):
                                for sub_elem in elem.iter():
                                    if sub_elem.tag.endswith('validityTimeSpecification'):
                                        for sub_sub_elem in sub_elem.iter():
                                            if sub_sub_elem.tag.endswith('overallStartTime'):
                                                start_time = sub_sub_elem.text
                                                break
                        
                        end_time = None
                        for elem in record.iter():
                            if elem.tag.endswith('validity'):
                                for sub_elem in elem.iter():
                                    if sub_elem.tag.endswith('validityTimeSpecification'):
                                        for sub_sub_elem in sub_elem.iter():
                                            if sub_sub_elem.tag.endswith('overallEndTime'):
                                                end_time = sub_sub_elem.text
                                                break
                        
                        is_end = False
                        if end_time is not None:
                            is_end = True
                        
                        # Extraction du sous-type
                        sous_type = None
                        for elem in record.iter():
                            tag = elem.tag.split('}')[-1]
                            if 'Type' in tag and tag != 'situationRecordExtension':
                                sous_type = elem.text
                                break
                        
                        # Extraction du statut
                        statut = None
                        mobility = None
                        for elem in record.iter():
                            if elem.tag.endswith('mobility'):
                                mobility = elem.text
                                break
                        if mobility is not None:
                            statut = f"Véhicule {mobility}"
                        else:
                            compliance = None
                            for elem in record.iter():
                                if elem.tag.endswith('compliance'):
                                    compliance = elem.text
                                    break
                            if compliance is not None:
                                statut = f"Mesure {compliance}"
                            else:
                                if 'works' in str(record_type).lower() or 'maintenance' in str(record_type).lower():
                                    statut = "Travaux"
                                else:
                                    impact = None
                                    for elem in record.iter():
                                        if elem.tag.endswith('trafficConstrictionType'):
                                            impact = elem.text
                                            break
                                    if impact is not None:
                                        statut = f"Impact {impact}"
                                    else:
                                        statut = "En cours"
                        
                        # Extraction de la direction
                        direction = None
                        for elem in record.iter():
                            if elem.tag.endswith('tpegDirection'):
                                direction_value = elem.text
                                if direction_value is not None:
                                    direction = direction_value
                                break
                        
                        # Chercher l'élément name où tpegOtherPointDescriptorType est townName
                        lieu = ''
                        for name in tree.xpath("//datex:name[datex:tpegOtherPointDescriptorType='townName']", namespaces=namespaces):
                            value = name.xpath("datex:descriptor/datex:values/datex:value[@lang='fr']", namespaces=namespaces)
                            if value:
                                lieu = value[0].text  # Prendre le texte de la première valeur trouvée
                                break  # Sortir après avoir trouvé l'élément
                        
                        # Conversion des dates de début et de fin
                        debut = ''
                        if start_time is not None:
                            dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                            debut = dt.strftime('%d/%m/%Y %H:%M:%S')
                        
                        fin = ''
                        if end_time is not None:
                            dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                            fin = dt.strftime('%d/%m/%Y %H:%M:%S')
                        
                        # Collecter toutes les informations extraites
                        situations_data.append({
                            'SituationID': situation_id,
                            'SituationVersion': situation_version,
                            'Severite': severity,
                            'DateVersion': version_time,
                            'RecordType': record_type,
                            'RecordID': record_id,
                            'RecordVersion': record_version,
                            'EstTermine': is_end,
                            'DateDebut': start_time,
                            'Latitude': latitude,
                            'Longitude': longitude,
                            'LongueurFile': queue_length,
                            'NumeroRoute': road_number,
                            'FichierSource': os.path.basename(fichier_xml),
                            'SousType': sous_type,
                            'Statut': statut,
                            'Direction': direction,
                            'Lieu': lieu,
                            'Debut': debut,
                            'Fin': fin,
                        })
            
            context.log.info(f"Extraction terminée pour le fichier: {os.path.basename(fichier_xml)}")
                    
        except Exception as e:
            context.log.error(f"Erreur lors du traitement du fichier {fichier_xml}: {str(e)}")
            import traceback
            context.log.error(traceback.format_exc())
    
    # Créer un DataFrame à partir des données extraites
    if situations_data:
        df = pd.DataFrame(situations_data)
        context.log.info(f"Données extraites avec succès: {len(df)} situations")
        
        # Conversion des types de données
        for col in ['Latitude', 'Longitude']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        df['LongueurFile'] = pd.to_numeric(df['LongueurFile'], errors='coerce')
        
        # Séparer les heures de début et fin des dates
        df['HeureDebut'] = pd.to_datetime(df['Debut'], format="%d/%m/%Y %H:%M:%S").dt.strftime('%H:%M:%S')
        df['HeureFin'] = pd.to_datetime(df['Fin'], dayfirst=True).dt.strftime('%H:%M:%S')

        
        return df
    else:
        context.log.warning("Aucune situation trouvée dans les fichiers XML analysés.")
        return pd.DataFrame()

@asset(deps=["parse_fichiers_xml"])
def nettoyer_donnees_xml(context, parse_fichiers_xml):
    """
    Asset pour nettoyer et transformer les données extraites des fichiers XML.
    """
    def standardiser_type_evenement(event_type):
        """
        Standardise les types d'événements en mappant différentes notations vers des catégories standard.
        """
        mapping = {
            'Accident': 'Accident',
            'AbnormalTraffic': 'AbnormalTraffic',
            'MaintenanceWorks': 'MaintenanceWorks',
            'RoadOrCarriagewayOrLaneManagement': 'RoadManagement',
            'ns2:Accident': 'Accident',
            'ns2:AbnormalTraffic': 'AbnormalTraffic',
            'ns2:MaintenanceWorks': 'MaintenanceWorks',
            'ns2:RoadOrCarriagewayOrLaneManagement': 'RoadManagement',
            'GeneralObstruction': 'Obstruction',
            'VehicleObstruction': 'Obstruction',
            'AnimalPresenceObstruction': 'Obstruction',
            'InfrastructureDamageObstruction': 'Obstruction',
            'ns2:GeneralObstruction': 'Obstruction',
            'ns2:VehicleObstruction': 'Obstruction',
            'ns2:InfrastructureDamageObstruction': 'Obstruction',
            'ns2:EnvironmentalObstruction': 'Obstruction',
            'NonWeatherRelatedRoadConditions': 'RoadConditions',
            'ns2:NonWeatherRelatedRoadConditions': 'RoadConditions',
            'PoorEnvironmentConditions': 'RoadConditions',
            'ns2:ConstructionWorks': 'ConstructionWorks',
            'OperatorAction': 'TrafficManagement',
            'ns2:OperatorAction': 'TrafficManagement',
            'ns2:GeneralNetworkManagement': 'TrafficManagement',
            'ns2:ReroutingManagement': 'TrafficManagement',
            'ns2:SpeedManagement': 'TrafficManagement',
            'PublicEvent': 'Event',
            'ns2:PublicEvent': 'Event',
            'ns2:RoadsideServiceDisruption': 'ServiceDisruption',
            'ns2:GeneralInstructionOrMessageToRoadUsers': 'RoadUserMessage',
        }
        return mapping.get(event_type, 'Other')

    try:
        import pandas as pd
        
        # Récupération du DataFrame
        df = parse_fichiers_xml

        # Ajoutez ceci juste après la récupération du DataFrame
        context.log.info(f"Vérification des NaN dans le DataFrame d'entrée:")
        for col in ['DateDebut', 'NumeroRoute', 'Fin', 'Debut']:
            if col in df.columns:
                context.log.info(f"Colonne {col}: {df[col].isna().sum()} valeurs NaN")
                # Affichez quelques exemples de lignes avec NaN
                if df[col].isna().any():
                    context.log.info(f"Exemples de lignes avec NaN dans {col}:")
                    context.log.info(df[df[col].isna()].head(3))


        # 1. Vérifier que le DataFrame n'est pas vide
        if df.empty:
            context.log.warning("Le DataFrame d'entrée est vide.")
            return pd.DataFrame()  # Retourne un DataFrame vide
            
        # Comptage initial des lignes
        initial_row_count = len(df)
        context.log.info(f"Nombre de lignes avant nettoyage: {initial_row_count}")

        # 2. Gérer les colonnes de coordonnées de façon plus intelligente
        coord_columns = ['LatitudeDepart', 'LongitudeDepart', 'LatitudeArrivee', 'LongitudeArrivee']
        empty_coord_columns = []

        for col in coord_columns:
            if col in df.columns:
                if df[col].isna().all():
                    empty_coord_columns.append(col)
                    context.log.info(f"Colonne {col} est entièrement vide.")
                else:
                    context.log.info(f"Colonne {col} contient des données valides : {df[col].notna().sum()} valeurs.")
            else:
                context.log.warning(f"Colonne {col} n'existe pas dans le DataFrame.")

        # 3. Normaliser les types d'événements
        if 'RecordType' in df.columns:
            unique_types = df['RecordType'].unique()
            context.log.info(f"Types d'événements uniques dans les données: {unique_types}")

            df['TypeStandardise'] = df['RecordType'].apply(standardiser_type_evenement)
            context.log.info("Colonne TypeStandardise ajoutée.")

            non_std_types = set([t for t in df['RecordType'].unique() if standardiser_type_evenement(t) == 'Other'])
            if non_std_types:
                context.log.warning(f"Types non standardisés trouvés: {non_std_types}")

        # 4. Normaliser les dates
        if 'DateVersion' in df.columns:
            try:
                df['DateVersion'] = pd.to_datetime(df['DateVersion'], errors='coerce')
                context.log.info("Colonne DateVersion convertie en datetime.")
            except Exception as e:
                context.log.error(f"Erreur lors de la conversion de DateVersion: {str(e)}")

        # Gestion spécifique de DateDebut - supprimer les lignes où DateDebut est NaN
        # Modifiez cette partie
        if 'DateDebut' in df.columns:
            try:
                # Conversion en datetime
                df['DateDebut'] = pd.to_datetime(df['DateDebut'], errors='coerce')
        
                # Log plus détaillé
                nan_count = df['DateDebut'].isna().sum()
                context.log.info(f"Après conversion datetime: {nan_count} valeurs NaN dans DateDebut")
        
                if nan_count > 0:
                    context.log.info("Voici quelques exemples de valeurs qui n'ont pas pu être converties:")
                    orig_df = parse_fichiers_xml  # DataFrame original
                    if 'DateDebut' in orig_df.columns:
                        problem_idx = df[df['DateDebut'].isna()].index
                        context.log.info(f"Valeurs originales: {orig_df.loc[problem_idx, 'DateDebut'].head(5).tolist()}")
        
                # Suppression des lignes
                rows_before = len(df)
                df = df.dropna(subset=['DateDebut'])
                rows_after = len(df)
                context.log.info(f"Suppression des lignes avec DateDebut manquant: {rows_before - rows_after} lignes supprimées")
        
                # Vérification après suppression
                if df['DateDebut'].isna().any():
                    context.log.error("ALERTE: Il reste encore des NaN dans DateDebut après dropna!")
            except Exception as e:
                context.log.error(f"Erreur lors du traitement de DateDebut: {str(e)}")


        # 5. Nettoyer les valeurs extrêmes dans les coordonnées géographiques
        coord_cols = [col for col in coord_columns if col in df.columns]
        for col in coord_cols:
            df[col] = df[col].fillna(0)
            context.log.info(f"Valeurs NaN remplacées par 0 dans la colonne {col}.")

            if col.startswith('Latitude'):
                invalid_mask = (df[col] < -90) | (df[col] > 90)
                if invalid_mask.any() and df[col].dtype != object:
                    df.loc[invalid_mask, col] = 0
                    context.log.warning(f"Valeurs invalides détectées dans {col}. {invalid_mask.sum()} valeurs remplacées par 0.")
            elif col.startswith('Longitude'):
                invalid_mask = (df[col] < -180) | (df[col] > 180)
                if invalid_mask.any() and df[col].dtype != object:
                    df.loc[invalid_mask, col] = 0
                    context.log.warning(f"Valeurs invalides détectées dans {col}. {invalid_mask.sum()} valeurs remplacées par 0.")

        # 6. Remplacer les valeurs NaN ou vides selon vos critères spécifiques
        if 'LongueurFile' in df.columns:
            df['LongueurFile'] = df['LongueurFile'].fillna(0)
            context.log.info("Valeurs manquantes dans LongueurFile remplacées par 0.")

        # Pour NumeroRoute
        if 'NumeroRoute' in df.columns:
            missing_count = df['NumeroRoute'].isna().sum()
            context.log.info(f"{missing_count} valeurs manquantes dans NumeroRoute avant remplacement")
            df['NumeroRoute'].fillna('Inconnu', inplace=True)
            still_missing = df['NumeroRoute'].isna().sum()
            context.log.info(f"Après remplacement: {still_missing} valeurs toujours NaN dans NumeroRoute")
    
            # Si encore des NaN
            if still_missing > 0:
                context.log.warning("Tentative de remplacement avec une autre méthode")
                df = df.assign(NumeroRoute=df['NumeroRoute'].fillna('Inconnu'))
                context.log.info(f"Vérification finale: {df['NumeroRoute'].isna().sum()} NaN dans NumeroRoute")

        # Pour Fin/Debut
        if 'Fin' in df.columns and 'Debut' in df.columns:
            missing_fin = df['Fin'].isna().sum()
            context.log.info(f"{missing_fin} valeurs NaN dans Fin avant remplacement")
    
            # Méthode 1: avec df.loc
            df.loc[df['Fin'].isna(), 'Fin'] = df.loc[df['Fin'].isna(), 'Debut']
    
            # Si encore des NaN, essayez une méthode alternative
            still_missing = df['Fin'].isna().sum()
            if still_missing > 0:
                context.log.warning(f"Il reste {still_missing} NaN dans Fin après le premier remplacement, essai méthode 2")
        
                # Méthode 2: avec fillna et une series
                fin_values = df['Fin'].copy()
                debut_values = df['Debut'].copy()
                df['Fin'] = fin_values.fillna(debut_values)
        
                # Vérification finale
                final_missing = df['Fin'].isna().sum()
                context.log.info(f"Après remplacement final: {final_missing} NaN dans Fin")
        
                # Si le problème persiste
                if final_missing > 0 and not df['Debut'].isna().all():
                    context.log.warning("Problème persistant avec le remplacement. Vérification détaillée...")
                    problematic_rows = df[df['Fin'].isna()]
                    context.log.info(f"Lignes problématiques - Debut a des valeurs? {not problematic_rows['Debut'].isna().all()}")
                context.log.info(f"Exemple de lignes problématiques:\n{problematic_rows[['Debut', 'Fin']].head(3)}")


        if 'DateFin' in df.columns and 'DateDebut' in df.columns:
            df['DateFin'] = df['DateFin'].fillna(df['DateDebut'])
            context.log.info("Valeurs manquantes dans DateFin remplacées par les valeurs de DateDebut.")

        if 'HeureFin' in df.columns and 'HeureDebut' in df.columns:
            df['HeureFin'] = df['HeureFin'].fillna(df['HeureDebut'])
            context.log.info("Valeurs manquantes dans HeureFin remplacées par les valeurs de HeureDebut.")

        # Afficher le nombre de lignes après nettoyage
        final_row_count = len(df)
        context.log.info(f"Nombre de lignes après nettoyage: {final_row_count}")
        context.log.info(f"Lignes supprimées au total: {initial_row_count - final_row_count}")

        # Ajoutez ceci à la fin de votre fonction, juste avant le return
        context.log.info("Vérification finale des NaN dans les colonnes critiques:")
        for col in ['DateDebut', 'NumeroRoute', 'Fin']:
            if col in df.columns:
                nan_count = df[col].isna().sum()
                context.log.info(f"Colonne {col}: {nan_count} valeurs NaN restantes ({nan_count/len(df)*100:.2f}%)")
                if nan_count > 0:
                    context.log.warning(f"Des valeurs NaN persistent dans la colonne {col}")

        return df

    except Exception as e:
        context.log.error(f"Une erreur s'est produite lors du nettoyage des données: {str(e)}")
        raise


# Pour l'export CSV
@asset(deps=["nettoyer_donnees_xml"])
def xml_data_csv(context, nettoyer_donnees_xml) -> str:
    """Exporte les données nettoyées des fichiers XML en format CSV."""
    context.log.info("Début de l'export des données XML vers CSV")
    
    # Récupérer le DataFrame des données nettoyées
    df = nettoyer_donnees_xml
    
    # Vérifier si le DataFrame est vide
    if df is None or df.empty:
        context.log.warning("Le DataFrame d'entrée est vide ou None")
        context.log.info("Export CSV terminé - fichier vide créé")
    else:
        context.log.info(f"Préparation de l'export de {len(df)} lignes et {len(df.columns)} colonnes")
        context.log.debug(f"Colonnes du DataFrame: {list(df.columns)}")
    
    try:
        # Créer le dossier de sortie s'il n'existe pas
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'processed'))
        context.log.info(f"Dossier de destination: {output_dir}")
        
        os.makedirs(output_dir, exist_ok=True)
        context.log.info(f"Dossier de destination vérifié/créé: {output_dir}")
        
        # Générer le nom du fichier CSV avec timestamp
        current_timestamp = pd.Timestamp.now().strftime('%Y%m%d')
        csv_path = os.path.join(output_dir, f"action_b_data_{current_timestamp}.csv")
        context.log.info(f"Chemin du fichier CSV à générer: {csv_path}")
        
        # Exporter en CSV
        context.log.info("Exportation des données en cours...")
        df.to_csv(csv_path, index=False, encoding='utf-8')
        
        # Vérifier que le fichier a bien été créé
        if os.path.exists(csv_path):
            file_size = os.path.getsize(csv_path)
            context.log.info(f"Fichier CSV créé avec succès: {csv_path} (taille: {file_size} octets)")
        else:
            context.log.error(f"Le fichier CSV n'a pas été créé: {csv_path}")
            raise FileNotFoundError(f"Échec de création du fichier CSV: {csv_path}")
        
        context.log.info("Export CSV terminé avec succès")
        return csv_path
    
    except Exception as e:
        context.log.error(f"Erreur lors de l'export CSV: {str(e)}")
        raise


@asset(
    deps=["xml_data_csv"],
    required_resource_keys={"mongodb"}
)
def xml_data_mongodb(context: AssetExecutionContext, xml_data_csv) -> None:
    """Importe les données du CSV dans MongoDB avec upsert pour préserver les données existantes."""
    context.log.info("Début de l'importation des données vers MongoDB")
    
    # Accéder à la ressource mongodb via le context
    mongodb = context.resources.mongodb
    
    # Récupérer le chemin du CSV généré par l'asset précédent
    csv_path = xml_data_csv
    
    # Vérifier que le fichier existe
    if not os.path.exists(csv_path):
        context.log.error(f"ERREUR: Le fichier CSV n'existe pas: {csv_path}")
        raise FileNotFoundError(f"Le fichier CSV n'existe pas: {csv_path}")
    
    context.log.info(f"Fichier CSV trouvé: {csv_path}")
    
    try:
        # Charger les données du CSV
        context.log.info(f"Chargement des données depuis: {csv_path}")
        df = pd.read_csv(csv_path)
        
        # Vérifier si le DataFrame est vide
        if df.empty:
            context.log.warning(f"Le fichier CSV est vide: {csv_path}")
            context.log.info("Import MongoDB terminé - aucune donnée à importer")
            return None
        
        # Log des informations sur le DataFrame
        context.log.info(f"Données chargées: {len(df)} lignes, {len(df.columns)} colonnes")
        context.log.debug(f"Colonnes: {list(df.columns)}")
        
        # Ajouter une date d'importation et de mise à jour
        current_time = datetime.now()
        df['import_date'] = current_time.strftime('%Y-%m-%d')
        df['updated_at'] = current_time.isoformat()
        
        # Créer un identifiant unique si nécessaire
        if 'id' not in df.columns:
            # Créer un ID à partir des champs disponibles
            if all(col in df.columns for col in ['localisation', 'date']):
                context.log.info("Création d'identifiants uniques basés sur la localisation et la date")
                df['id'] = df.apply(lambda row: f"{row['localisation']}_{row['date']}_{hash(str(row.values))}", axis=1)
            else:
                context.log.info("Création d'identifiants uniques génériques")
                df['id'] = [f"incident_{i}_{int(time.time())}" for i in range(len(df))]
        
        # Convertir en dictionnaires pour MongoDB
        records = df.to_dict('records')
        context.log.info(f"Préparation de {len(records)} documents pour l'upsert")
        
        # Implémentation avec gestion des reconnexions
        max_retries = 5
        retry_count = 0
        batch_size = 50  # Traiter par lots plus petits
        
        while retry_count < max_retries:
            try:
                # Obtenir la base de données et la collection MongoDB
                db = mongodb.get_database()
                collection = db['incidents']  # Utiliser explicitement 'incidents'
                
                # Récupérer le nombre initial de documents
                initial_count = collection.count_documents({})
                context.log.info(f"Nombre initial de documents dans la collection 'incidents': {initial_count}")
                
                # Traiter l'upsert par lots
                upsert_count = 0
                new_count = 0
                updated_count = 0
                
                for i in range(0, len(records), batch_size):
                    batch = records[i:i+batch_size]
                    batch_result = {"upserted": 0, "modified": 0}
                    
                    for doc in batch:
                        try:
                            # Définir le filtre de recherche basé sur l'identifiant unique
                            if 'id' in doc:
                                filter_query = {'id': doc['id']}
                            else:
                                # Créer un filtre basé sur les champs disponibles
                                filter_parts = {}
                                for key in ['localisation', 'date']:
                                    if key in doc:
                                        filter_parts[key] = doc[key]
                                
                                if not filter_parts:
                                    # Si aucun critère d'identification, on génère un ID unique
                                    doc['id'] = f"incident_{upsert_count}_{int(time.time())}"
                                    filter_query = {'id': doc['id']}
                                else:
                                    filter_query = filter_parts
                            
                            # Effectuer l'upsert
                            result = collection.update_one(
                                filter_query,
                                {'$set': doc},
                                upsert=True
                            )
                            
                            if result.upserted_id:
                                new_count += 1
                                batch_result["upserted"] += 1
                            elif result.modified_count > 0:
                                updated_count += 1
                                batch_result["modified"] += 1
                            
                            upsert_count += 1
                        except pymongo.errors.AutoReconnect as e:
                            context.log.warning(f"Erreur de connexion lors de l'upsert, nouvelle tentative: {str(e)}")
                            time.sleep(2)
                            raise  # Relancer pour être capturé par le bloc try/except extérieur
                        except Exception as e:
                            context.log.error(f"Erreur lors de l'upsert du document: {str(e)}")
                            raise
                    
                    context.log.info(f"Lot {i//batch_size + 1}/{(len(records)-1)//batch_size + 1} traité: "
                                     f"{batch_result['upserted']} nouveaux, {batch_result['modified']} mis à jour")
                
                # Vérification finale
                final_count = collection.count_documents({})
                context.log.info(f"Résultat final: {new_count} nouveaux documents, {updated_count} documents mis à jour")
                context.log.info(f"Nombre total de documents dans la collection 'incidents': {final_count} "
                                f"(+{final_count - initial_count} depuis le début de l'opération)")
                
                # Créer des index pour améliorer les performances
                context.log.info("Création/mise à jour des index...")
                if 'date' in df.columns:
                    collection.create_index([("date", pymongo.ASCENDING)])
                    context.log.info("Index créé sur le champ 'date'")
                
                if 'localisation' in df.columns:
                    collection.create_index([("localisation", pymongo.ASCENDING)])
                    context.log.info("Index créé sur le champ 'localisation'")
                
                # Toujours indexer l'id pour des recherches rapides
                collection.create_index([("id", pymongo.ASCENDING)], unique=True)
                context.log.info("Index unique créé sur le champ 'id'")
                
                context.log.info("Import MongoDB terminé avec succès")
                return None  # Succès
                
            except pymongo.errors.AutoReconnect as e:
                retry_count += 1
                wait_time = min(2 ** retry_count, 30)  # Backoff exponentiel avec max de 30s
                context.log.warning(f"Erreur de connexion MongoDB, nouvelle tentative ({retry_count}/{max_retries}) dans {wait_time}s: {str(e)}")
                time.sleep(wait_time)
            except Exception as e:
                context.log.error(f"Erreur non récupérable: {str(e)}")
                raise
        
        # Si on arrive ici, c'est que toutes les tentatives ont échoué
        raise Exception(f"Échec de l'import dans MongoDB après {max_retries} tentatives")
        
    except pd.errors.EmptyDataError:
        context.log.warning(f"Le fichier CSV est vide ou mal formaté: {csv_path}")
        context.log.info("Import MongoDB terminé - aucune donnée à importer")
        return None
    except Exception as e:
        context.log.error(f"Erreur lors du traitement du CSV: {str(e)}")
        raise

