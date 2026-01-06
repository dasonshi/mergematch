import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="pt-10 pb-8 text-center">
          <div className="rounded-full bg-muted p-4 inline-block mb-6">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>

          <h1 className="text-5xl font-bold text-foreground mb-2">404</h1>
          <h2 className="text-xl font-semibold text-foreground mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button asChild>
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Path: <code className="bg-muted px-1.5 py-0.5 rounded">{location.pathname}</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
