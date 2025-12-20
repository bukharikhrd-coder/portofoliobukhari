import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, MailOpen, Trash2, X } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

interface AdminMessagesProps {
  onUpdate?: () => void;
}

const AdminMessages = ({ onUpdate }: AdminMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (message: Message) => {
    if (message.is_read) return;
    
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", message.id);

    if (!error) {
      setMessages(messages.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)));
      onUpdate?.();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    
    if (error) {
      toast.error("Failed to delete message");
    } else {
      toast.success("Message deleted!");
      setMessages(messages.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      onUpdate?.();
    }
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    markAsRead(message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">MESSAGES</h1>
        <p className="text-muted-foreground mt-1">
          View messages from your contact form ({messages.filter((m) => !m.is_read).length} unread)
        </p>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <div>
                <h2 className="font-display text-xl">
                  {selectedMessage.subject || "No Subject"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  From {selectedMessage.name} ({selectedMessage.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-muted-foreground">
                {format(new Date(selectedMessage.created_at), "PPP 'at' p")}
              </div>
              <div className="text-foreground whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex justify-between p-6 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-6 py-3 border border-destructive text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || "Your message"}`}
                className="px-6 py-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Mail size={48} className="mx-auto mb-4 opacity-50" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => openMessage(message)}
              className={`p-4 border cursor-pointer transition-all duration-300 ${
                message.is_read
                  ? "bg-card border-border hover:border-muted-foreground"
                  : "bg-secondary/50 border-primary/30 hover:border-primary"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="pt-1">
                    {message.is_read ? (
                      <MailOpen size={20} className="text-muted-foreground" />
                    ) : (
                      <Mail size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                        {message.name}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        &lt;{message.email}&gt;
                      </span>
                    </div>
                    <div className={`mt-1 ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {message.subject || "No Subject"}
                    </div>
                    <div className="text-muted-foreground text-sm mt-1 truncate">
                      {message.message}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-muted-foreground text-sm">
                    {format(new Date(message.created_at), "MMM d")}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(message.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
