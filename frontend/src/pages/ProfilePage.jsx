import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { storyAPI } from '../services/api';
import StoryCard from '../components/StoryCard';

function ProfilePage() {
  const { userId } = useParams();
  const { data, isLoading } = useQuery(['userStories', userId], () => storyAPI.getUserStories(userId));

  if (isLoading) return <div>å è½½ä¸­...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4">æå¸æäºé</h1>
        <p className="text-gray-600">è¿æ¯æå¸åå¸çæææè²æäº</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data.stories.map(story => (
          <StoryCard key={story._id} story={story} />
        ))}
      </div>
    </div>
  );
}

export default ProfilePage;
