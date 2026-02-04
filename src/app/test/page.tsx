'use client';  
  
export default function TestPage() {  
  return (  
    <div className="p-8">  
      <h1 className="text-2xl font-bold mb-4">?? Test API Connection</h1>  
      <p>Make sure your FastAPI backend is running on http://localhost:8000</p>  
      <div className="mt-4 p-4 bg-yellow-100 rounded">  
        Run: curl http://localhost:8000/health  
      </div>  
    </div>  
  );  
}  
