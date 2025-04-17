interface AuthSessionInterface {
    var accessToken: String?
    fun setToken(token: String?)
    fun clear()
}

class DefaultAuthSession : AuthSessionInterface {
    override var accessToken: String? = null
        set

    override fun setToken(token: String?) {
        accessToken = token
    }

    override fun clear() {
        accessToken = null
    }
}

// Provide a singleton instance of the default implementation
object AuthSession : AuthSessionInterface by DefaultAuthSession()
