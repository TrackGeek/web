import { Layout } from '@/components/layouts/main';
import { useParams } from 'react-router-dom';

export function UserDetailsPage() {
  const { username } = useParams();
  
  return (
    <Layout title="User Details">
      <div className="flex flex-col lg:flex-row gap-8">
        {username}
      </div>
    </Layout>
  )
}