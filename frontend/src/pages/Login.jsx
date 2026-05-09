import { useState } from 'react'
import API from '../api/axios'
import LoginImage2 from '../assets/LoginPage3.jpg'
import { useNavigate } from 'react-router-dom'


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data))

      // Redirect based on role
      if (res.data.role === 'admin' || res.data.role === 'hr') {
        navigate('/dashboard')
      } else if (res.data.role === 'employee') {
        navigate('/employee-portal')
      } else {
        navigate('/jobs')
      }
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="flex h-screen">
      
      {/* LEFT SIDE (FORM) */}
      <div className="w-[40%] flex flex-col justify-center px-20">
        
        <h2 className='font-bold text-2xl mb-10'>
          HR Management System
        </h2>

        <h3 className='text-2xl font-bold mb-6'>Login</h3>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <input 
            className='w-full p-3 border bg-gray-100 rounded-md' 
            type="email" 
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            className='w-full p-3 border bg-gray-100 rounded-md' 
            type="password" 
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            className='w-full p-3 bg-black text-white rounded-md hover:bg-gray-800 transition'
          >
            Login
          </button>
        </form>

      </div>

      {/* RIGHT SIDE (IMAGE) */}
      <div className="w-[60%]">
        <img 
          src={LoginImage2} 
          alt="Login"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  )
}

export default Login