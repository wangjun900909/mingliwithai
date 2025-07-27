export default function HealthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">✅ Healthy</h1>
        <p className="text-gray-600">Application is running successfully</p>
        <p className="text-sm text-gray-400 mt-2">
          {new Date().toISOString()}
        </p>
      </div>
    </div>
  );
} 