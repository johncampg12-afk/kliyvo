import { useParams, useNavigate } from 'react-router-dom';
import { PropertyDetailView } from './PropertyDetailView';

export function PropertyDetailViewWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (!id) return null;

  return (
    <PropertyDetailView 
      propertyId={id} 
      onBack={() => navigate('/discover')}
    />
  );
}
