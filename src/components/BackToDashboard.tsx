import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BackToDashboard = () => {
  const { isAdmin } = useAuth();

  return (
    <AnimatePresence>
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link
            to="/admin"
            className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
          >
            <LayoutDashboard size={20} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToDashboard;