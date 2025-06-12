import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function NewsCard({ article }) {
  const {
    title,
    description,
    urlToImage,
    url,
    source,
    publishedAt,
    author
  } = article;

  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/600x400?text=No+Image+Available';
  };

  return (
    <Card className="flex flex-col h-full bg-card text-card-foreground hover:shadow-lg transition-shadow duration-200">
      {urlToImage && (
        <div className="relative w-full h-48">
          <img
            src={urlToImage}
            alt={title}
            onError={handleImageError}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-xl font-semibold line-clamp-2">{title}</h2>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </span>
        </div>
        {source?.name && (
          <p className="text-sm text-muted-foreground">Source: {source.name}</p>
        )}
        {author && (
          <p className="text-sm text-muted-foreground">Author: {author}</p>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3">{description}</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
} 