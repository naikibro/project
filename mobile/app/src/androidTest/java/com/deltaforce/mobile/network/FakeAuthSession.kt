package com.deltaforce.mobile.network

import AuthSessionInterface

class FakeDefaultAuthSession : AuthSessionInterface {
    override var accessToken: String? = null
        set

    override fun setToken(token: String?) {
        accessToken = token
    }

    override fun clear() {
        accessToken = null
    }
}

object  FakeAuthSession: AuthSessionInterface by FakeDefaultAuthSession()