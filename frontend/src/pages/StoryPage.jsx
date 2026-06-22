import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { storyAPI, commentAPI } from '../services/api';
import { FaSpinner, FaHeart, FaBookmark } from 'react-icons/fa';
import { useState } from 'react';

function StoryPage() {
  const { id } = useParams();
  const [newComment, setNewComment] = useState('');
  const { data: story, isLoading, refetch } = useQuery(['story', id], () => storyAPI.getStoryById(id));
  const { data: comments } = useQuery(['comments', id], () => commentAPI.getComments(id));

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentAPI.addComment(id, newComment);
      setNewComment('');
      refetch();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-4xl" /></div>;
  }

  if (!story?.data) return <div>æäºä¸å­å¨</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">{story.data.title}</h1>
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <img src={story.data.author.avatar} alt={story.data.author.name} className="w-12 h-12 rounded-full" />
          <div>
            <p className="font-semibold">{story.data.author.name}</p>
            <p className="text-gray-500 text-sm">æµè§ {story.data.viewCount}</p>
          </div>
        </div>
        <div className="prose max-w-none mb-8 whitespace-pre-wrap">{story.data.content}</div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
            <FaHeart /> {story.data.likes.length}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200">
            <FaBookmark /> {story.data.bookmarks.length}
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">è¯è®º</h2>
        
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="åäº«ä½ çæ³æ³..."
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
            rows="4"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            åå¸è¯è®º
          </button>
        </form>

        <div className="space-y-4">
          {comments?.data && comments.data.map((comment) => (
            <div key={comment._id} className="border-l-4 border-blue-600 pl-4 py-2">
              <div className="flex items-center gap-2 mb-2">
                <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full" />
                <span className="font-semibold">{comment.author.name}</span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoryPage;
