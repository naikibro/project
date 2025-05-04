import java.util.Properties
import java.io.FileInputStream

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

// Function to read .env file
fun loadEnvProperties(): Properties {
    val envProperties = Properties()
    val envFile = rootProject.file(".env")
    if (envFile.exists()) {
        envProperties.load(FileInputStream(envFile))
    } else {
        throw GradleException("""
            .env file not found at ${envFile.absolutePath}
            Please create a .env file with required configuration:
            MAPBOX_ACCESS_TOKEN=your_token_here
            API_URL=your_api_url_here
        """.trimIndent())
    }
    return envProperties
}

val envProperties = loadEnvProperties()
val API_URL: String = envProperties.getProperty("API_URL") ?: "http://localhost:4001/"
val MAPBOX_ACCESS_TOKEN: String = envProperties.getProperty("MAPBOX_ACCESS_TOKEN") 
    ?: throw GradleException("MAPBOX_ACCESS_TOKEN is required in .env file")
val GOOGLE_CLIENT_ID: String = envProperties.getProperty("GOOGLE_CLIENT_ID")
    ?: throw GradleException("GOOGLE_CLIENT_ID is required in .env file")

android {
    namespace = "com.deltaforce.mobile"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.deltaforce.mobile"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Add API_URL from local.properties as a BuildConfig field
        buildConfigField("String", "API_URL", "\"$API_URL\"")
        buildConfigField("String", "MAPBOX_ACCESS_TOKEN", "\"$MAPBOX_ACCESS_TOKEN\"")
        buildConfigField("String", "GOOGLE_CLIENT_ID", "\"$GOOGLE_CLIENT_ID\"")

        // Add OAuth redirect scheme
        setManifestPlaceholders(mapOf(
            "appAuthRedirectScheme" to "com.deltaforce.mobile"
        ))
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.ui.test.junit4)
    implementation(libs.retrofit)
    implementation(libs.converter.scalars)
    implementation(libs.converter.gson)
    implementation(libs.gson)
    implementation(libs.androidx.appcompat)
    implementation(libs.material)
    implementation(libs.androidx.activity)
    implementation(libs.androidx.espresso.intents)
    implementation(libs.okhttp)
    implementation(libs.android)
    implementation(libs.maps.compose)
    implementation(libs.hilt.android)
    implementation(libs.play.services.auth)
    implementation(libs.androidx.credentials)
    implementation(libs.androidx.credentials.play.services.auth)
    implementation(libs.googleid)
    implementation(libs.appauth)
    implementation(libs.play.services.auth.v2070)
    implementation(libs.navigationcore.android)
    implementation(libs.copilot)
    implementation(libs.ui.maps)
    implementation(libs.voice)
    implementation(libs.tripdata)
    implementation(libs.ui.components)
    implementation(libs.play.services.location)
    implementation(libs.android.v10161)
    implementation(libs.androidx.ui.text)
    implementation(libs.androidx.ui.text.android)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(platform(libs.androidx.compose.bom.v20250401))
    implementation(libs.coil.compose.v260)

    // Mapbox dependencies
    implementation(libs.autofill)
    implementation(libs.discover)
    implementation(libs.place.autocomplete)
    implementation(libs.offline)
    implementation(libs.mapbox.search.android.v2120beta1)
    implementation(libs.mapbox.search.android.ui.v2120beta1)
    implementation(libs.androidx.room.runtime.android)

    testImplementation(libs.junit)
    testImplementation(libs.junit.jupiter)
    testImplementation(libs.robolectric)
    testImplementation(libs.ui.test.junit4)
    testImplementation(libs.mockwebserver)
    testImplementation(libs.mockito.core)
    testImplementation(libs.mockito.core.v550)
    testImplementation(libs.mockito.kotlin)

    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.mockito.android)
    androidTestImplementation(libs.mockito.android.v550)
    androidTestImplementation(libs.mockito.core.v550)
    androidTestImplementation(libs.mockito.kotlin)
    androidTestImplementation(libs.androidx.espresso.intents.v351)
    androidTestImplementation(libs.hilt.android)
    androidTestImplementation(libs.android)
    androidTestImplementation(libs.maps.compose)
    androidTestImplementation(libs.play.services.auth)
    androidTestImplementation(libs.androidx.credentials)
    androidTestImplementation(libs.androidx.credentials.play.services.auth)
    androidTestImplementation(libs.googleid)
    
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
