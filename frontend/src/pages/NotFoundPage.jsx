import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">é¡µé¢æªæ¾å°</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        è¿åé¦é¡µ
      </Link>
    </div>
  );
}

export default NotFoundPage;
