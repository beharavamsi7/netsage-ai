import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground"
    >
      <div className="text-center space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4 text-muted-foreground"
          onClick={() => navigate("/")}
        >
          Back to home
        </Button>
      </div>
    </motion.div>
  );
}
