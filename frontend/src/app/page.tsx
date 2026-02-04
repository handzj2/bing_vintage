export default function Home() {  
  return (  
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-8">  
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">🚀 Bingo Vintage</h1>  
        <p className="text-xl text-gray-600 mb-8">Hybrid Lending System for Cash & Bike Loans</p>  
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-700 mb-4">Manage loans, clients, payments, and bike inventory in one system</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/login" className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">  
                Login to Dashboard
              </a>  
              <a href="http://localhost:8000/docs" className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors">  
                View API Docs
              </a>  
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Backend running at: http://localhost:8000
          </div>
        </div>
      </div>  
    </div>  
  );  
}