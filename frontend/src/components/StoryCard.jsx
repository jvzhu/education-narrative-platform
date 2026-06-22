import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaEye } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function StoryCard({ story }) {
  return (
    <Link to={`/story/${story._id}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 cursor-pointer">
      <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2 hover:text-blue-600">
        {story.title}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3">
        {story.excerpt}
      </p>
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {story.category}
        </span>
        <span>
          {formatDistanceToNow(new Date(story.createdAt), {
            addSuffix: true,
            locale: zhCN,
          })}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-1">
            <FaEye /> {story.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <FaHeart /> {story.likes.length}
          </span>
          <span className="flex items-center gap-1">
            <FaComment /> {story.comments.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src={story.author.avatar}
            alt={story.author.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-semibold text-gray-700">
            {story.author.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default StoryCard;
