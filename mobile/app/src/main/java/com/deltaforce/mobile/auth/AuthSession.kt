import com.deltaforce.mobile.network.User

interface AuthSessionInterface {
    var accessToken: String?
    var currentUser: User?
    fun setToken(token: String?)
    fun setUser(user: User?)
    fun clear()
}

class DefaultAuthSession : AuthSessionInterface {
    override var accessToken: String? = null
    override var currentUser: User? = null

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

// Provide a singleton instance of the default implementation
object AuthSession : AuthSessionInterface by DefaultAuthSession()