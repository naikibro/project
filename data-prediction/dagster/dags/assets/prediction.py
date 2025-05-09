from dagster import asset, AssetExecutionContext, MetadataValue
from typing import Dict, Any, Optional
import constants
import pandas as pd
import numpy as np
from datetime import datetime, time, timedelta
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from imblearn.over_sampling import SMOTE
import logging
from dagster import asset, Output, MetadataValue
import os


@asset(deps=["nettoyer_donnees_xml"])
def preparer_donnees(context: AssetExecutionContext, nettoyer_donnees_xml) -> Dict[str, Any]:
    """
    Prépare les données nettoyées pour l'entraînement du modèle de prédiction de trafic
    """
    context.log.info("Démarrage de la préparation des données...")
    context.log.info(f"Nombre d'enregistrements initiaux: {len(nettoyer_donnees_xml)}")
    
    # Utiliser les données de l'asset précédent
    df = nettoyer_donnees_xml.copy()
    
    # Vérification des colonnes disponibles
    context.log.info(f"Colonnes disponibles: {df.columns.tolist()}")
    
    # Convertir les colonnes catégorielles en type object pour éviter les problèmes
    for col in df.select_dtypes(include=['category']).columns:
        df[col] = df[col].astype('object')
        context.log.info(f"Colonne catégorielle {col} convertie en object")
    
    # Nettoyage des valeurs manquantes dans les colonnes essentielles
    essential_cols = ['Latitude', 'Longitude', 'NumeroRoute']
    for col in essential_cols[:]:
        if col not in df.columns:
            context.log.warning(f"Colonne {col} non trouvée, retirée des colonnes essentielles")
            essential_cols.remove(col)
    
    if essential_cols:
        df = df.dropna(subset=essential_cols, how='any')
        context.log.info(f"Après suppression des valeurs manquantes essentielles: {len(df)}")
    
    # Extraction de caractéristiques temporelles avec gestion des fuseaux horaires
    if 'DateDebut' in df.columns:
        try:
            # Pour les dates avec fuseau horaire, utiliser utc=True
            df['date_obj'] = pd.to_datetime(df['DateDebut'], utc=True)
            context.log.info("Conversion de DateDebut en date_obj réussie avec utc=True")
        except Exception as e:
            context.log.error(f"Erreur lors de la conversion de DateDebut: {str(e)}")
            # Alternative: extraire manuellement la date sans fuseau horaire
            try:
                df['date_obj'] = df['DateDebut'].apply(lambda x: pd.to_datetime(str(x).split('+')[0]))
                context.log.info("Conversion alternative de DateDebut réussie")
            except:
                context.log.warning("Impossible de convertir DateDebut, colonne date_obj non créée")
    elif 'import_date' in df.columns:
        # Utiliser la date d'importation comme fallback
        df['date_obj'] = pd.to_datetime(df['import_date'])
        context.log.info("Utilisation de import_date comme date_obj")
    
    # Création des caractéristiques temporelles
    if 'date_obj' in df.columns and not df['date_obj'].isna().all():
        df['heure'] = df['date_obj'].dt.hour
        df['jour_semaine'] = df['date_obj'].dt.dayofweek  # 0=lundi, 6=dimanche
        df['mois'] = df['date_obj'].dt.month
        df['est_weekend'] = df['jour_semaine'].apply(lambda x: 1 if x >= 5 else 0)
        df['est_heure_pointe'] = df['heure'].apply(lambda x: 1 if x in [7, 8, 9, 16, 17, 18, 19] else 0)
        context.log.info("Caractéristiques temporelles créées avec succès")
    else:
        # Alternative si date_obj n'est pas disponible
        context.log.warning("Création de caractéristiques temporelles arbitraires")
        df['heure'] = 12  # Midi par défaut
        df['jour_semaine'] = 2  # Mercredi par défaut
        df['mois'] = 6  # Juin par défaut
        df['est_weekend'] = 0
        df['est_heure_pointe'] = 0
    
    # Caractéristiques liées à la route
    df['sur_autoroute'] = df['NumeroRoute'].apply(lambda x: 1 if str(x).startswith('A') else 0)
    
    # Caractéristiques liées à la sévérité du trafic
    if 'Severite' in df.columns:
        severity_map = {
            'high': 3,
            'medium': 2,
            'low': 1,
            'none': 0,
        }
        df['indice_severite'] = df['Severite'].map(severity_map).fillna(0)
    else:
        df['indice_severite'] = 0  # Valeur par défaut
    
    # Caractéristiques liées à la longueur de file
    if 'LongueurFile' in df.columns:
        df['LongueurFile'] = pd.to_numeric(df['LongueurFile'], errors='coerce').fillna(0)
        # Créer des catégories de longueur comme colonne de type object, pas categorical
        conditions = [
            (df['LongueurFile'] < 500),
            (df['LongueurFile'] >= 500) & (df['LongueurFile'] < 2000),
            (df['LongueurFile'] >= 2000) & (df['LongueurFile'] < 5000),
            (df['LongueurFile'] >= 5000)
        ]
        choices = ['court', 'moyen', 'long', 'tres_long']
        df['categorie_longueur'] = np.select(conditions, choices, default='inconnu')
    else:
        df['LongueurFile'] = 0
        df['categorie_longueur'] = 'inconnu'
    
    # Création de la variable cible (bouchon ou non)
    if 'TypeStandardise' in df.columns:
        # Considérer AbnormalTraffic comme indication de bouchon
        df['bouchon'] = df['TypeStandardise'].apply(
            lambda x: 1 if isinstance(x, str) and ('AbnormalTraffic' in x) else 0
        )
    else:
        context.log.warning("Pas de colonne TypeStandardise, création d'une cible simulée")
        df['bouchon'] = np.random.choice([0, 1], size=len(df), p=[0.7, 0.3])
    
    # Informations sur la distribution des classes
    distribution = df['bouchon'].value_counts(normalize=True) * 100
    context.log.info(f"Distribution des classes: Bouchons: {distribution.get(1, 0):.2f}%, Fluide: {distribution.get(0, 0):.2f}%")
    
    # Sélection des caractéristiques pour l'entraînement du modèle
    numeric_features = []
    for col in ['heure', 'jour_semaine', 'mois', 'est_weekend', 'est_heure_pointe', 
                'sur_autoroute', 'indice_severite', 'LongueurFile']:
        if col in df.columns:
            numeric_features.append(col)
    
    categorical_features = []
    for col in ['Direction', 'SousType', 'categorie_longueur']:
        if col in df.columns and not df[col].isna().all():
            categorical_features.append(col)
    
    context.log.info(f"Caractéristiques numériques: {numeric_features}")
    context.log.info(f"Caractéristiques catégorielles: {categorical_features}")
    
    # Préparation du DataFrame d'entraînement
    features = numeric_features + categorical_features
    df_train = df[features + ['bouchon']].copy()
    
    # Remplir les valeurs manquantes de manière sécurisée
    for col in df_train.columns:
        if df_train[col].dtype.name == 'category':
            # Pour les colonnes catégorielles, utiliser une catégorie existante
            categories = df_train[col].cat.categories.tolist()
            if categories:
                df_train[col] = df_train[col].fillna(categories[0])
            else:
                # Convertir en string si pas de catégories
                df_train[col] = df_train[col].astype(str).fillna('inconnu')
        elif df_train[col].dtype.name == 'object':
            df_train[col] = df_train[col].fillna('inconnu')
        else:
            # Pour les colonnes numériques
            df_train[col] = df_train[col].fillna(0)
    
    # One-hot encoding pour les variables catégorielles
    if categorical_features:
        df_encoded = pd.get_dummies(df_train, columns=categorical_features, drop_first=True)
    else:
        df_encoded = df_train.copy()
    
    # Séparation des caractéristiques et de la cible
    X = df_encoded.drop('bouchon', axis=1)
    y = df_encoded['bouchon']
    
    # S'assurer qu'il y a des données à traiter
    if len(X) < 10:
        context.log.warning(f"Très peu de données disponibles ({len(X)} échantillons). Génération de données synthétiques.")
        # Créer des données synthétiques
        X = pd.DataFrame(np.random.random((100, len(X.columns))), columns=X.columns)
        y = pd.Series(np.random.choice([0, 1], size=100))
    
    # Normalisation des caractéristiques numériques
    scaler = StandardScaler()
    numeric_cols_in_X = [col for col in numeric_features if col in X.columns]
    if numeric_cols_in_X:
        X[numeric_cols_in_X] = scaler.fit_transform(X[numeric_cols_in_X])
    
    # Équilibrage des classes avec SMOTE si nécessaire
    class_counts = np.bincount(y)
    if len(class_counts) > 1 and min(class_counts) / max(class_counts) < 0.3 and min(class_counts) > 5:
        context.log.info(f"Distribution des classes avant SMOTE: {dict(zip(*np.unique(y, return_counts=True)))}")
        try:
            smote = SMOTE(random_state=42)
            X_resampled, y_resampled = smote.fit_resample(X, y)
            context.log.info(f"Données après SMOTE: {X_resampled.shape}")
        except Exception as e:
            context.log.error(f"Erreur lors de l'équilibrage des classes: {str(e)}")
            X_resampled, y_resampled = X, y
    else:
        X_resampled, y_resampled = X, y
    
    # Entraînement du modèle
    context.log.info("Entraînement du modèle RandomForest")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_resampled, y_resampled)
    
    # Importance des caractéristiques
    feature_importance = dict(zip(X.columns, model.feature_importances_))
    top_features = dict(sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:5])
    
    # Convertir les types NumPy en types Python standard pour éviter les erreurs de sérialisation
    top_features = {k: float(v) for k, v in top_features.items()}
    
    context.log.info(f"Caractéristiques les plus importantes: {top_features}")
    
    # Préparation des données à retourner
    model_data = {
        'model': model,
        'scaler': scaler,
        'feature_names': X.columns.tolist(),
        'numerical_features': numeric_features,
        'categorical_features': categorical_features
    }
    
    # Métadonnées pour Dagster UI
    bouchon_pct = float(y.mean() * 100)
    metadata = {
        "nombre_echantillons": MetadataValue.int(int(len(df))),
        "distribution_classes": MetadataValue.md(f"Embouteillages: {bouchon_pct:.2f}% des cas"),
        "caracteristiques_importantes": MetadataValue.json(top_features),
        "nombre_caracteristiques": MetadataValue.int(int(len(X.columns))),
    }
    
    # Ajouter les métadonnées au contexte
    context.add_output_metadata(metadata)
    
    context.log.info("Préparation des données et entraînement du modèle terminés avec succès")
    
    return model_data



@asset(deps=["preparer_donnees", "nettoyer_donnees_xml"])
def predire_bouchons_journee(context: AssetExecutionContext, preparer_donnees, nettoyer_donnees_xml) -> pd.DataFrame:
    """
    Génère des prédictions de trafic pour les routes françaises en utilisant le DataFrame existant
    """
    # Déballage du dictionnaire model_scaler_features
    model = preparer_donnees['model']  
    scaler = preparer_donnees['scaler']
    feature_names = preparer_donnees['feature_names']
    
    # Toujours utiliser 6h du matin aujourd'hui comme début de la période
    today = datetime.now().date()
    start_prediction = datetime.combine(today, time(6, 0))  # Aujourd'hui à 6h00
    end_prediction = start_prediction + timedelta(days=1)   # 24h après (demain à 6h00)

    # Format de date pour affichage
    date_prediction = start_prediction.strftime('%Y-%m-%d %H:%M')
    date_fin_prediction = end_prediction.strftime('%Y-%m-%d %H:%M')

    context.log.info(f"Prédiction du {date_prediction} au {date_fin_prediction} (24h)")

    
    context.log.info("Extraction des points routiers uniques...")
    # Extraire les routes uniques du DataFrame existant avec toutes les informations nécessaires
    df_routes = nettoyer_donnees_xml.copy()
    routes_uniques = df_routes[['Latitude', 'Longitude', 'NumeroRoute', 'Lieu']].drop_duplicates().dropna()
    context.log.info(f"Nombre de points routiers uniques: {len(routes_uniques)}")
    
    # Créer les points à partir des données réelles
    points = []
    for _, row in routes_uniques.iterrows():
        points.append({
            'latitude': row['Latitude'],
            'longitude': row['Longitude'],
            'route': row['NumeroRoute'],
            'lieu': row['Lieu'],  # Ajout du lieu
            'sur_autoroute': str(row['NumeroRoute']).startswith('A')
        })
    
    # Générer des prédictions pour différentes heures de la journée
    resultats = []
    # Heures clés de la journée pour les prédictions
    heures_prediction = [7, 8, 9, 12, 16, 17, 18, 19]
    date_obj = datetime.strptime(date_prediction, '%Y-%m-%d %H:%M')
    jour_semaine = date_obj.weekday()
    mois = date_obj.month
    est_weekend = 1 if jour_semaine >= 5 else 0
    
    jour_nom = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][jour_semaine]
    context.log.info(f"Génération des prédictions pour {jour_nom} {date_prediction} (jour {jour_semaine+1}/7)")
    
    total_points = len(points) * len(heures_prediction)
    context.log.info(f"Génération de {total_points} prédictions au total...")
    
    # Traitement par lots pour éviter les problèmes de mémoire
    batch_size = 10000
    count = 0
    
    for heure in heures_prediction:
        for point in points:
            # Préparation des données pour la prédiction
            data_dict = {
                'jour_semaine': jour_semaine,
                'mois': mois,
                'heure': heure,
                'est_weekend': est_weekend,
                'sur_autoroute': 1 if point['sur_autoroute'] else 0,
                # Vous pouvez ajouter d'autres caractéristiques ici
            }
            
            # Créer un DataFrame compatible avec le modèle
            X_pred = pd.DataFrame([data_dict])
            
            # Assurer que nous avons toutes les colonnes du modèle, avec one-hot encoding
            for feature in feature_names:
                if feature not in X_pred.columns:
                    X_pred[feature] = 0
            
            # Réordonner les colonnes comme dans le jeu d'entraînement
            X_pred = X_pred[feature_names]
            
            # Appliquer le même prétraitement
            if scaler is not None:
                X_pred[preparer_donnees['numerical_features']] = scaler.transform(X_pred[preparer_donnees['numerical_features']])
            
            # Faire la prédiction
            prob = float(model.predict_proba(X_pred)[0, 1])  # Probabilité de la classe 1 (bouchon)
            pred = int(model.predict(X_pred)[0])
            
            # Déterminer la sévérité du bouchon
            if prob < 0.3:
                severite = 0  # Trafic fluide
            elif prob < 0.6:
                severite = 1  # Trafic dense
            elif prob < 0.8:
                severite = 2  # Bouchon modéré
            else:
                severite = 3  # Bouchon sévère
            
            # Ajouter aux résultats
            date_heure = f"{date_prediction} {heure:02d}:00:00"
            resultats.append({
                'lieu': point['lieu'],
                'latitude': float(point['latitude']),
                'longitude': float(point['longitude']),
                'route': point['route'],
                'date_heure': date_heure,
                'heure': int(heure),
                'jour_semaine': jour_nom,
                'probabilite_bouchon': prob,
                'prediction': 'Bouchon' if pred == 1 else 'Fluide',
                'indice_severite': int(severite)
            })
            
            count += 1
            if count % batch_size == 0:
                context.log.info(f"{count}/{total_points} points traités ({count/total_points*100:.1f}%)")
    
    # Convertir en DataFrame
    df_resultats = pd.DataFrame(resultats)
    
    # S'assurer que toutes les colonnes requises sont présentes
    colonnes_requises = ['lieu', 'latitude', 'longitude', 'route', 'date_heure', 'heure', 
                         'probabilite_bouchon', 'prediction', 'indice_severite']
    colonnes_manquantes = [col for col in colonnes_requises if col not in df_resultats.columns]
    
    if colonnes_manquantes:
        context.log.warning(f"Colonnes manquantes dans les résultats : {colonnes_manquantes}")
    
    # Sauvegarder les résultats
    filename = f"predictions_trafic_{date_prediction.replace('-', '')}.csv"
    df_resultats.to_csv(filename, index=False)
    context.log.info(f"Prédictions sauvegardées dans {filename}")
    
    # Calcul de métriques pour les logs et métadonnées
    nb_bouchons_predits = int((df_resultats['prediction'] == 'Bouchon').sum())
    pct_bouchons = float(nb_bouchons_predits / len(df_resultats) * 100)
    
    # Ajouter les métadonnées au contexte
    context.add_output_metadata({
        "points_predits": MetadataValue.int(int(len(df_resultats))),
        "bouchons_predits": MetadataValue.int(int(nb_bouchons_predits)),
        "pourcentage_bouchons": MetadataValue.float(float(pct_bouchons)),
        "fichier_resultats": MetadataValue.path(filename)
    })
    
    # Ajouter des métadonnées par heure
    for heure in heures_prediction:
        df_heure = df_resultats[df_resultats['heure'] == heure]
        pct_heure = float((df_heure['prediction'] == 'Bouchon').mean() * 100)
        context.add_output_metadata({
            f"bouchons_{heure}h": MetadataValue.float(float(pct_heure))
        })
    
    # Identifier les zones les plus problématiques
    if 'lieu' in df_resultats.columns:
        lieux_problematiques = df_resultats[df_resultats['probabilite_bouchon'] > 0.7].groupby('lieu').size().sort_values(ascending=False).head(5)
        context.add_output_metadata({
            "zones_critiques": MetadataValue.md("### Zones critiques\n" + 
                                              "\n".join([f"- **{lieu}**: {count} points" for lieu, count in lieux_problematiques.items()]))
        })
    
    context.log.info(f"Prédiction terminée: {pct_bouchons:.2f}% de bouchons prévus")
    
    return df_resultats


# Pour l'export CSV
@asset(deps=["predire_bouchons_journee"])
def prediction_data_csv(context, predire_bouchons_journee) -> str:
    """Exporte les données nettoyées des fichiers XML en format CSV."""
    context.log.info("Début de l'export des données XML vers CSV")
    
    # Récupérer le DataFrame des données nettoyées
    df = predire_bouchons_journee
    
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
    deps=["prediction_data_csv"],
    required_resource_keys={"mongodb"}
)
def prediction_data_mongodb(context: AssetExecutionContext, prediction_data_csv) -> None:
    """Importe les données du CSV dans MongoDB."""
    context.log.info("Début de l'importation des données vers MongoDB")
    
    # Accéder à la ressource mongodb via le context
    mongodb = context.resources.mongodb
    
    # Récupérer le chemin du CSV généré par l'asset précédent
    csv_path = prediction_data_csv
    
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
        
        # Ajouter une date d'importation
        df['import_date'] = datetime.now().strftime('%Y-%m-%d')
        
        # Convertir en dictionnaires pour MongoDB
        records = df.to_dict('records')
        context.log.info(f"Préparation de {len(records)} documents pour l'insertion")
        
        # Obtenir la base de données et la collection MongoDB
        # La méthode get_database() ne prend pas d'arguments
        db = mongodb.get_database()
        collection = db['predictions']  # Accéder à la collection 'activities'
        
        # Supprimer les données existantes
        context.log.info("Suppression des anciennes données de la collection...")
        delete_result = collection.delete_many({})
        context.log.info(f"Données supprimées: {delete_result.deleted_count} documents")
        
        # Insérer les nouvelles données
        if records:
            try:
                result = collection.insert_many(records)
                context.log.info(f"Données insérées dans MongoDB: {len(result.inserted_ids)} documents")
            except Exception as e:
                context.log.error(f"Erreur lors de l'insertion des données: {str(e)}")
                raise
        else:
            context.log.warning("Aucune donnée à insérer dans MongoDB")
        
        context.log.info("Import MongoDB terminé avec succès")
        
    except pd.errors.EmptyDataError:
        context.log.warning(f"Le fichier CSV est vide ou mal formaté: {csv_path}")
        context.log.info("Import MongoDB terminé - aucune donnée à importer")
        return None
    except Exception as e:
        context.log.error(f"Erreur lors du traitement du CSV: {str(e)}")
        raise
