import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storyAPI } from '../services/api';

function CreateStoryPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'teaching',
    tags: '',
    status: 'published'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim())
      };
      await storyAPI.createStory(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'åå¸å¤±è´¥');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-6">åå¸æ°æäº</h1>
      {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          name="title"
          placeholder="æäºæ é¢"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <textarea
          name="content"
          placeholder="æäºåå®¹"
          value={formData.content}
          onChange={handleChange}
          required
          rows="10"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="teaching">æå­¦</option>
          <option value="reflection">åæ</option>
          <option value="reading">éè¯»</option>
          <option value="student-growth">å­¦çæé¿</option>
          <option value="classroom">è¯¾å </option>
          <option value="other">å¶ä»</option>
        </select>
        <input
          type="text"
          name="tags"
          placeholder="æ ç­¾ï¼ç¨éå·åéï¼"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'åå¸ä¸­...' : 'åå¸æäº'}
        </button>
      </form>
    </div>
  );
}

export default CreateStoryPage;
