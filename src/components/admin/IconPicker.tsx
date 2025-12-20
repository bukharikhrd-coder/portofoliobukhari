import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Curated icon list organized by category
const iconCategories = {
  "Development": [
    "Code", "Code2", "CodeXml", "Terminal", "FileCode", "FileCode2", "Braces", "Binary", 
    "Bug", "GitBranch", "GitCommit", "GitMerge", "Github", "Gitlab", "Database", 
    "Server", "Cloud", "CloudCog", "Cpu", "HardDrive", "Network", "Wifi", "Globe",
    "Globe2", "Link", "Link2", "ExternalLink", "QrCode", "Blocks", "Component",
    "Layers", "Layers2", "Layers3", "Box", "Boxes", "Package", "FolderCode", "FolderGit"
  ],
  "Design": [
    "Palette", "Paintbrush", "Paintbrush2", "PenTool", "Pencil", "PencilRuler",
    "Figma", "Framer", "Image", "Images", "ImagePlus", "Camera", "Aperture",
    "Crop", "Slice", "Scissors", "Eraser", "Droplet", "Droplets", "Blend",
    "Circle", "Square", "Triangle", "Hexagon", "Pentagon", "Octagon", "Star",
    "Sparkle", "Sparkles", "Wand", "Wand2", "Brush", "Highlighter", "Eye",
    "EyeOff", "Scan", "ScanLine", "Grid3X3", "LayoutGrid", "LayoutTemplate"
  ],
  "Editor & Tools": [
    "Type", "Bold", "Italic", "Underline", "Strikethrough", "AlignLeft", 
    "AlignCenter", "AlignRight", "AlignJustify", "List", "ListOrdered",
    "FileText", "FileEdit", "FilePlus", "Folder", "FolderPlus", "FolderOpen",
    "Copy", "Clipboard", "ClipboardCopy", "Scissors", "Trash2", "Undo", 
    "Redo", "RotateCcw", "RotateCw", "Move", "Maximize", "Minimize", "ZoomIn", "ZoomOut"
  ],
  "Video & Audio": [
    "Video", "VideoOff", "Film", "Clapperboard", "Play", "Pause", "Square",
    "SkipBack", "SkipForward", "FastForward", "Rewind", "Volume", "Volume1",
    "Volume2", "VolumeX", "Mic", "MicOff", "Headphones", "Music", "Music2",
    "Music3", "Music4", "Radio", "Podcast", "Speaker", "MonitorPlay"
  ],
  "Communication": [
    "Mail", "MailOpen", "MailPlus", "Send", "MessageSquare", "MessageCircle",
    "MessagesSquare", "Phone", "PhoneCall", "Video", "AtSign", "Hash",
    "Bell", "BellRing", "Share", "Share2", "Forward", "Reply", "ReplyAll"
  ],
  "Business": [
    "Briefcase", "Building", "Building2", "Landmark", "Store", "ShoppingBag",
    "ShoppingCart", "CreditCard", "Wallet", "Banknote", "DollarSign", "Euro",
    "PoundSterling", "Receipt", "PieChart", "BarChart", "BarChart2", "BarChart3",
    "LineChart", "TrendingUp", "TrendingDown", "Target", "Award", "Trophy"
  ],
  "UI Components": [
    "Menu", "MoreHorizontal", "MoreVertical", "Grid", "LayoutDashboard",
    "Layout", "SidebarOpen", "PanelLeft", "PanelRight", "Table", "Table2",
    "Columns", "Rows", "SplitSquareVertical", "SplitSquareHorizontal",
    "Tabs", "ChevronsUpDown", "Sliders", "SlidersHorizontal", "Settings",
    "Settings2", "Cog", "Wrench", "Tool", "Hammer", "Filter", "Search"
  ],
  "Arrows & Navigation": [
    "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowUpRight",
    "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight", "ChevronsUp",
    "Home", "Navigation", "Navigation2", "Compass", "Map", "MapPin", "Route"
  ],
  "Status & Actions": [
    "Check", "CheckCircle", "CheckCircle2", "X", "XCircle", "AlertCircle",
    "AlertTriangle", "Info", "HelpCircle", "Ban", "Shield", "ShieldCheck",
    "Lock", "Unlock", "Key", "Eye", "EyeOff", "Bookmark", "Heart", "ThumbsUp"
  ],
  "Misc": [
    "Zap", "Rocket", "Flame", "Lightning", "Sun", "Moon", "CloudSun",
    "Lightbulb", "Atom", "Activity", "Gauge", "Timer", "Clock", "Calendar",
    "CalendarDays", "User", "Users", "UserPlus", "Crown", "Gem", "Diamond"
  ]
};

// Flatten all icons for search
const allIcons = Object.values(iconCategories).flat();

interface IconPickerProps {
  selectedIcon: string | null;
  onSelect: (iconName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const IconPicker = ({ selectedIcon, onSelect, isOpen, onClose }: IconPickerProps) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredIcons = useMemo(() => {
    let icons = activeCategory === "All" 
      ? allIcons 
      : iconCategories[activeCategory as keyof typeof iconCategories] || [];
    
    if (search) {
      icons = icons.filter(name => 
        name.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return icons;
  }, [search, activeCategory]);

  const getIcon = (iconName: string): LucideIcon | null => {
    const icon = (LucideIcons as Record<string, unknown>)[iconName];
    if (typeof icon === 'function' || (icon && typeof icon === 'object' && '$$typeof' in icon)) {
      return icon as LucideIcon;
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl max-h-[80vh] bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl">Choose Icon</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search icons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 py-3 border-b border-border overflow-x-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                    activeCategory === "All"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                {Object.keys(iconCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {filteredIcons.map((iconName) => {
                  const IconComponent = getIcon(iconName);
                  if (!IconComponent) return null;
                  
                  const isSelected = selectedIcon === iconName;
                  
                  return (
                    <motion.button
                      key={iconName}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        onSelect(iconName);
                        onClose();
                      }}
                      className={`relative p-3 rounded-lg border transition-all duration-200 group ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-secondary/50 border-transparent hover:border-primary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                      title={iconName}
                    >
                      <IconComponent size={22} />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Check size={10} className="text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              
              {filteredIcons.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No icons found for "{search}"
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-secondary/30">
              <p className="text-xs text-muted-foreground text-center">
                {filteredIcons.length} icons available • Click to select
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IconPicker;
