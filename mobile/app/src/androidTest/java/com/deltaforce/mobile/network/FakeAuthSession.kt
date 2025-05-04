package com.deltaforce.mobile.network

import AuthSessionInterface

class FakeDefaultAuthSession : AuthSessionInterface {
    override var accessToken: String? = null
        set
    override var currentUser: User? = null
        set

    override fun setToken(token: String?) {
        accessToken = token
    }

    override fun setUser(user: User?) {
        currentUser = user
    }

    override fun clear() {
        accessToken = null
    }
}

object  FakeAuthSession: AuthSessionInterface by FakeDefaultAuthSession()