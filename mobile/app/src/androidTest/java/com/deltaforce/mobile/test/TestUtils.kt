package com.deltaforce.mobile.test

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.intent.matcher.IntentMatchers.hasComponent
import com.deltaforce.mobile.MainActivity
import com.deltaforce.mobile.MapboxActivity
import androidx.test.espresso.intent.Intents
import com.deltaforce.mobile.network.FakeAuthSession

class TestUtils {

    fun fakeLogin(): ActivityScenario<MainActivity> {
        FakeAuthSession.setToken("fake_token")
        val scenario = ActivityScenario.launch(MainActivity::class.java)
        Intents.intended(hasComponent(MapboxActivity::class.java.name))
        return scenario
    }

    companion object {
        val instance = TestUtils()
    }
}