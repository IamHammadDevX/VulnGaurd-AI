import { motion } from "framer-motion";
import { Shield } from "lucide-react";

type AuthLoadingOverlayProps = {
  title?: string;
  subtitle?: string;
};

/**
 * Beautiful loading spinner shown during auth flow
 */
export function AuthLoadingOverlay({
  title = "Loading VulnGuard",
  subtitle = "Preparing your secure workspace...",
}: AuthLoadingOverlayProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Shield Icon */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          {/* Pulsing ring around icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.4],
              opacity: [1, 0]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 rounded-xl border border-primary/40"
          />
        </motion.div>

        {/* Loading text with animation */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
        </motion.div>

        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                translateY: [0, -8, 0],
                backgroundColor: ["rgb(100, 116, 139)", "rgb(148, 163, 184)", "rgb(100, 116, 139)"]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-2 h-2 rounded-full bg-muted-foreground"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
