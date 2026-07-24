import LoginForm from '../components/auth/LoginForm.jsx'
import { useSession } from '../context/SessionContext.jsx'

function Login() {
  const { login } = useSession()
  return <LoginForm onLoginExitoso={login} />
}
export default Login
