![logo supmap](./docs/images/logo_full_white.png)

# SUPMAP - Mobile app

Welcome to the **SUPMAP Mobile App** repository! This project contains the source code for our mobile application built with **Kotlin** for Android.

---

## 📖 About This Repository

This repository hosts the mobile app designed to provide a seamless user experience. Our app is built using modern Android development practices, ensuring optimal performance and reliability.

Features include:

- **Mapbox Navigation**
- **User authentication**
- **NestJs API secure integration**

---

## ✅ Prerequisites

To run the project locally, make sure you have the following installed and configured:

### Environment Variables

Copy the .env.example file in a .env and fill in the secrets with the right values

```sh
cp .env.example .env
```

### Mapbox access token

Please download and move the `mapbox_access_token.xml` file to `app/src/main/res/values/mapbox_access_token.xml`
⚠️ Always make sure this file is not commited to VCS ⚠️

## The `mapbox_access_token.xml` is accessible in the Proton vault

### Google service account

Make sure you place the `google-service.json` file in the **/app** module  
You can [ask the development team](mailto:supmap-deltaforce@proton.me) for access to the service account

> The file is in the dev team drive

## 🚀 Run the Project Locally

Follow these steps to get started:

1. **Clone the repository:**

   ```bash
   git clone git@github.com:SUPMAP-DELTA-FORCE/supmap-mobile-app.git
   ```

2. **Open the project in Android Studio:**

   - Launch Android Studio.
   - Select **File > Open** and navigate to the cloned repository.

3. **Set up local properties:**

   - Create a `.local.properties` file in the root directory (if not already created).
   - Add the required environment variables.

4. **Build and run the app:**
   - Sync the project with Gradle by clicking on **Sync Now** in Android Studio.
   - Select an AVM or a connected device.
   - Press **Run** (green play button) to launch the app.

---

## 🧪Tests

### Unit testing

```sh
./gradlew clean :app:test
```

### Instrumented testing

```sh
./gradlew clean :app:connectedDebugAndroidTest
```

## 🤝 Contributing

We welcome contributions to improve this project!  
Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute.

---

### 📝 Additional Notes

- A Discord bot has been enabled to monitor the most important events relative to this repository. Join the [Discord channel](https://discord.gg/8jjrztYUTZ)
