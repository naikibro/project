import java.io.FileInputStream
import java.util.Properties

fun loadEnv(): Properties {
    val props = Properties()
    file(".env").takeIf { it.exists() }?.let {
        props.load(FileInputStream(it))
    } ?: throw GradleException(".env not found: expected at ${file(".env").absolutePath}")
    return props
}

val env = loadEnv()
val mapboxToken = env.getProperty("MAPBOX_DOWNLOAD_TOKEN")
    ?: throw GradleException("MAPBOX_DOWNLOAD_TOKEN missing from .env")

pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://api.mapbox.com/downloads/v2/releases/maven")
            authentication { create<BasicAuthentication>("basic") }
            credentials {
                username = "mapbox"
                password = mapboxToken
            }
        }
    }
}

rootProject.name = "Supmap"
include(":app")
 