import { useQuery } from 'react-query';
import { useState } from 'react';
import { storyAPI } from '../services/api';
import StoryCard from '../components/StoryCard';
import { FaSpinner } from 'react-icons/fa';

function HomePage() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');

  const { data, isLoading, error } = useQuery(
    ['stories', page, category],
    () => storyAPI.getAllStories(page, 10, category),
    { keepPreviousData: true }
  );

  const categories = ['teaching', 'reflection', 'reading', 'student-growth', 'classroom', 'other'];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-12 text-center">
        <h1 className="text-4xl font-bold mb-4">æè²åäºå¹³å°</h1>
        <p className="text-xl text-blue-100">
          å¨æå­çä¸çééè§æè²çç¾å¥½ï¼ä¹¦åå¹¸ç¦çç¯ç« 
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => {
            setCategory('');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
            category === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          å¨é¨
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
              category === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">å è½½å¤±è´¥ï¼è¯·ç¨åéè¯</div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.stories.map((story) => (
              <StoryCard key={story._id} story={story} />
            ))}
          </div>

          {/* Pagination */}
          {data?.data.pagination && data.data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                ä¸ä¸é¡µ
              </button>
              {Array.from({ length: data.data.pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg ${
                    page === p ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === data.data.pagination.pages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                ä¸ä¸é¡µ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
