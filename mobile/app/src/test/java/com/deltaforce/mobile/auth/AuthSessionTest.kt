package com.deltaforce.mobile.auth

import DefaultAuthSession
import org.junit.Assert
import org.junit.Before
import org.junit.Test

class DefaultAuthSessionTest {
    private var authSession: DefaultAuthSession? = null

    @Before
    fun setUp() {
        authSession = DefaultAuthSession()
    }

    @Test
    fun shouldStoreTokenWhenSetTokenIsCalled() {
        val token = "sample_token"

        authSession!!.setToken(token)

        Assert.assertEquals(token, authSession!!.accessToken)
    }

    @Test
    fun shouldClearTokenWhenClearIsCalled() {
        authSession!!.setToken("sample_token")

        authSession!!.clear()

        Assert.assertNull(authSession!!.accessToken)
    }

    @Test
    fun shouldReturnNullByDefault() {
        Assert.assertNull(authSession!!.accessToken)
    }
}