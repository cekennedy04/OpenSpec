import { useNavigate } from 'react-router-dom'

export default function HomeScreen() {
  const navigate = useNavigate()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">WorkSpaceRx</h1>
        <p className="text-lg text-gray-600 mb-8">Workspace Compliance Checker</p>
        
        <div className="space-y-4 w-full max-w-sm">
          <button
            onClick={() => navigate('/camera')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition"
          >
            📷 Capture Image
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg transition"
          >
            📁 Upload Image
          </button>
        </div>
      </div>
    </main>
  )
}
