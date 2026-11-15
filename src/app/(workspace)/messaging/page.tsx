"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  Clock,
  Check,
  CheckCheck,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  X,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Building2,
  UserCheck,
  Info,
} from "lucide-react";
import { SEED_USERS, SEED_PROPERTIES } from "@/lib/db/seed";

interface ConversationMember {
  userId: string;
  fullName: string;
  roleName: string;
  propertyId: string | null;
  role: "ADMIN" | "MEMBER";
}

interface MessageAttachment {
  id: string;
  name: string;
  type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
  mimeType: string;
  sizeBytes: number;
  signedUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  attachments?: MessageAttachment[];
  isVoiceNote?: boolean;
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  edited: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  tenantId: string;
  propertyId: string | null;
  type: "DIRECT" | "GROUP";
  name: string;
  description?: string;
  avatarUrl?: string;
  members: ConversationMember[];
  lastMessage?: {
    id: string;
    senderName: string;
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
}

export default function MessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "DIRECT" | "GROUP">("ALL");

  // Message input state
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
    mimeType: string;
    sizeBytes: number;
    url: string;
    durationSeconds?: number;
  } | null>(null);

  // Edit message state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Current session user
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Group creation modal state
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Voice note recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Voice playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // WebRTC Call state
  const [callSession, setCallSession] = useState<{
    callId: string;
    receiverId: string;
    receiverName: string;
    status: "INITIATING" | "RINGING" | "CONNECTED" | "ENDED" | "DECLINED";
    secondsElapsed: number;
    micPermissionGranted: boolean;
    isMuted: boolean;
    isSpeaker: boolean;
  } | null>(null);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user from session / localStorage
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.authenticated && json.user) {
            setCurrentUser(json.user);
            return;
          }
        }
      } catch {
        // Fallback
      }
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("hotelgest_user");
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch {
            // Ignore
          }
        }
      }
    }
    loadUser();
  }, []);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messaging/conversations${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
      const json = await res.json();
      if (json.success) {
        setConversations(json.data || []);
        if (!activeConversation && json.data?.length > 0) {
          setActiveConversation(json.data[0]);
        }
      }
    } catch (e) {
      console.error("Error loading conversations", e);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const timer = setInterval(fetchConversations, 10000); // 10s poll
    return () => clearInterval(timer);
  }, [searchQuery]);

  // Fetch messages when active conversation changes
  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/messaging/conversations/${conversationId}/messages`);
      const json = await res.json();
      if (json.success) {
        setMessages(json.data || []);
      }
    } catch (e) {
      console.error("Error loading messages", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation?.id]);

  // Scroll to bottom on message update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle file attachment selection with client validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert("Ce fichier dépasse la limite autorisée de 15 Mo pour la sécurité du réseau.");
      return;
    }

    // Check disallowed extensions
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const disallowed = [".exe", ".bat", ".cmd", ".sh", ".php", ".py", ".js", ".vbs", ".msi", ".jar"];
    if (disallowed.includes(ext)) {
      alert(`Pour des raisons de sécurité de l'établissement, les fichiers exécutables (${ext}) sont strictement interdits.`);
      return;
    }

    let type: "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" = "DOCUMENT";
    if (file.type.startsWith("image/")) type = "IMAGE";
    else if (file.type.startsWith("audio/")) type = "AUDIO";
    else if (file.type.startsWith("video/")) type = "VIDEO";

    const objectUrl = URL.createObjectURL(file);
    setSelectedFile({
      name: file.name,
      type,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      url: objectUrl,
    });
  };

  // Send message
  const handleSendMessage = async () => {
    if (!activeConversation) return;
    if (!messageText.trim() && !selectedFile) return;

    setSending(true);
    try {
      const idempotencyKey = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const payload: any = {
        content: messageText.trim(),
        idempotencyKey,
      };

      if (selectedFile) {
        payload.attachments = [
          {
            name: selectedFile.name,
            type: selectedFile.type,
            mimeType: selectedFile.mimeType,
            sizeBytes: selectedFile.sizeBytes,
            signedUrl: selectedFile.url,
            durationSeconds: selectedFile.durationSeconds,
          },
        ];
        if (selectedFile.type === "AUDIO") {
          payload.isVoiceNote = true;
        }
      }

      const res = await fetch(`/api/messaging/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [...prev, json.data]);
        setMessageText("");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        alert(json.error || "Impossible d'envoyer le message.");
      }
    } catch {
      alert("Erreur réseau lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  // Edit message
  const handleSaveEdit = async () => {
    if (!editingMessageId || !activeConversation || !editContent.trim()) return;
    try {
      const res = await fetch(`/api/messaging/conversations/${activeConversation.id}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: editingMessageId, newContent: editContent.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMessageId ? json.data : m))
        );
        setEditingMessageId(null);
        setEditContent("");
      } else {
        alert(json.error || "Modification impossible.");
      }
    } catch {
      alert("Erreur lors de la modification du message.");
    }
  };

  // Soft delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Voulez-vous supprimer ce message ? Il sera remplacé par [Message supprimé].")) {
      return;
    }
    if (!activeConversation) return;

    try {
      const res = await fetch(
        `/api/messaging/conversations/${activeConversation.id}/messages?messageId=${messageId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? json.data : m))
        );
      } else {
        alert(json.error || "Suppression impossible.");
      }
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  // Voice note recording simulation with mic permission check
  const startRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (e) {
      console.warn("Microphone permission prompt simulation", e);
    }
    setIsRecording(true);
    setRecordTimer(0);
    recordIntervalRef.current = setInterval(() => {
      setRecordTimer((t) => t + 1);
    }, 1000);
  };

  const stopRecordingAndAttach = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    setIsRecording(false);
    const duration = Math.max(1, recordTimer);
    setSelectedFile({
      name: `Note_vocale_${new Date().toLocaleTimeString("fr-FR").replace(/:/g, "-")}.m4a`,
      type: "AUDIO",
      mimeType: "audio/mp4",
      sizeBytes: duration * 16000,
      url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      durationSeconds: duration,
    });
    setRecordTimer(0);
  };

  const cancelRecording = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    setIsRecording(false);
    setRecordTimer(0);
  };

  // Create new group
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Veuillez saisir un nom pour le groupe.");
      return;
    }
    if (selectedMembers.length === 0) {
      alert("Veuillez sélectionner au moins un membre pour ce groupe.");
      return;
    }

    setCreatingGroup(true);
    try {
      const res = await fetch("/api/messaging/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || undefined,
          memberUserIds: selectedMembers,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setConversations((prev) => [json.data, ...prev]);
        setActiveConversation(json.data);
        setShowNewGroupModal(false);
        setNewGroupName("");
        setNewGroupDescription("");
        setSelectedMembers([]);
      } else {
        alert(json.error || "Erreur de création de groupe.");
      }
    } catch {
      alert("Erreur de connexion.");
    } finally {
      setCreatingGroup(false);
    }
  };

  // WebRTC Call Initiation
  const startWebRTCCall = async () => {
    if (!activeConversation) return;

    // In direct conversation, find other member
    const otherMember = activeConversation.members.find(
      (m) => m.userId !== (currentUser?.id || "user-prom-01")
    );
    if (!otherMember) {
      alert("Veuillez sélectionner une conversation avec un correspondant pour démarrer un appel.");
      return;
    }

    // Explicit Mic permission prompt check
    let micGranted = false;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        micGranted = true;
      } else {
        micGranted = true;
      }
    } catch {
      alert("Veuillez autoriser l'accès au microphone dans votre navigateur pour passer des appels vocaux.");
      return;
    }

    try {
      const res = await fetch("/api/messaging/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "INITIATE",
          receiverUserId: otherMember.userId,
          conversationId: activeConversation.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const call = json.data;
        setCallSession({
          callId: call.id,
          receiverId: otherMember.userId,
          receiverName: otherMember.fullName,
          status: "RINGING",
          secondsElapsed: 0,
          micPermissionGranted: micGranted,
          isMuted: false,
          isSpeaker: true,
        });

        // Simulate pickup after 3 seconds for demonstration
        setTimeout(async () => {
          try {
            await fetch("/api/messaging/calls", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "ANSWER", callId: call.id }),
            });
            setCallSession((prev) => (prev ? { ...prev, status: "CONNECTED" } : null));

            // Start timer
            callIntervalRef.current = setInterval(() => {
              setCallSession((prev) =>
                prev && prev.status === "CONNECTED"
                  ? { ...prev, secondsElapsed: prev.secondsElapsed + 1 }
                  : prev
              );
            }, 1000);
          } catch {
            // Ignore
          }
        }, 3000);
      } else {
        alert(json.error || "Impossible d'initier l'appel.");
      }
    } catch {
      alert("Erreur de connexion WebRTC.");
    }
  };

  const endWebRTCCall = async () => {
    if (!callSession) return;
    if (callIntervalRef.current) clearInterval(callIntervalRef.current);

    try {
      await fetch("/api/messaging/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "END", callId: callSession.callId }),
      });
    } catch {
      // Ignore
    }
    setCallSession((prev) => (prev ? { ...prev, status: "ENDED" } : null));
    setTimeout(() => setCallSession(null), 1200);
  };

  // Helper format seconds mm:ss
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterType === "DIRECT" && c.type !== "DIRECT") return false;
    if (filterType === "GROUP" && c.type !== "GROUP") return false;
    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Top Main Bar / Header */}
      <div className="bg-stone-900 text-white px-5 py-3 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#184f28] flex items-center justify-center text-amber-300 shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight flex items-center gap-2">
              Messagerie Interne Sécurisée
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-mono font-semibold">
                Personnel Uniquement
              </span>
            </h1>
            <p className="text-[11px] text-stone-400">
              Canaux d'équipes, échanges direct 1:1, notes vocales & appels chiffrés DTLS-SRTP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewGroupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#184f28] hover:bg-[#1f6634] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau Groupe</span>
          </button>
        </div>
      </div>

      {/* Main Split-Pane Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Rail: Conversations List */}
        <div className="w-80 md:w-96 border-r border-stone-200 bg-stone-50/50 flex flex-col">
          {/* Search & Tabs */}
          <div className="p-3 border-b border-stone-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full bg-stone-100 border border-stone-200 pl-9 pr-3 py-1.5 text-xs rounded-xl focus:outline-none focus:bg-white focus:border-[#184f28] text-stone-800"
              />
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterType("ALL")}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "ALL"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterType("DIRECT")}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "DIRECT"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                Directs (1:1)
              </button>
              <button
                onClick={() => setFilterType("GROUP")}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === "GROUP"
                    ? "bg-stone-900 text-white shadow-xs"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                Groupes
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {loadingConversations ? (
              <div className="p-6 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-stone-500" />
                Chargement des conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Aucune conversation trouvée.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversation?.id === conv.id;
                const isGroup = conv.type === "GROUP";
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isActive
                        ? "bg-[#184f28]/10 border-l-4 border-[#184f28]"
                        : "hover:bg-stone-100/70"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isGroup
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      {isGroup ? <Users className="w-5 h-5" /> : conv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive ? "text-[#184f28]" : "text-stone-900"
                          }`}
                        >
                          {conv.name}
                        </span>
                        {conv.lastMessage && (
                          <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        {conv.lastMessage ? (
                          <>
                            <span className="font-semibold text-stone-700">
                              {conv.lastMessage.senderName}:{" "}
                            </span>
                            {conv.lastMessage.content}
                          </>
                        ) : (
                          <span className="italic text-stone-400">Aucun message</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded font-medium">
                          {isGroup ? `${conv.members.length} membres` : "Direct 1:1"}
                        </span>
                        {conv.unreadCount && conv.unreadCount > 0 ? (
                          <span className="ml-auto bg-[#184f28] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {conv.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Rail: Active Conversation Thread */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Conversation Header */}
            <div className="h-16 border-b border-stone-200 px-5 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs">
                  {activeConversation.type === "GROUP" ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    activeConversation.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold text-stone-900 truncate">
                      {activeConversation.name}
                    </h2>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-mono">
                      {activeConversation.type === "GROUP" ? "Groupe" : "Échange direct"}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">
                    {activeConversation.description ||
                      `${activeConversation.members.length} participants inscrits`}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Audio Call & Details */}
              <div className="flex items-center gap-2">
                <button
                  onClick={startWebRTCCall}
                  title="Démarrer un appel vocal chiffré WebRTC"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Appel Sécurisé</span>
                </button>
              </div>
            </div>

            {/* Messages Thread Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9f8]">
              {loadingMessages ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-stone-400" />
                  Chargement des messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
                  <MessageSquare className="w-10 h-10 text-stone-300 mb-2 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-stone-600">Aucun message pour le moment</p>
                  <p className="text-[11px] text-stone-400 max-w-sm mt-1">
                    Démarrez la conversation en envoyant un message écrit, un document ou une note vocale ci-dessous.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === (currentUser?.id || "user-prom-01");

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      {/* Sender metadata for other users in group */}
                      {!isMine && (
                        <div className="text-[10px] text-stone-500 mb-1 ml-1 flex items-center gap-1.5">
                          <span className="font-bold text-stone-700">{msg.senderName}</span>
                          <span className="text-stone-400">• {msg.senderRole}</span>
                        </div>
                      )}

                      {/* Bubble Container */}
                      <div
                        className={`group relative max-w-md md:max-w-lg rounded-2xl px-4 py-2.5 shadow-xs transition-all ${
                          msg.deleted
                            ? "bg-stone-200/60 text-stone-500 italic border border-stone-200"
                            : isMine
                            ? "bg-[#184f28] text-white rounded-br-none"
                            : "bg-white text-stone-900 border border-stone-200 rounded-bl-none"
                        }`}
                      >
                        {/* Soft Deleted Indicator */}
                        {msg.deleted ? (
                          <div className="text-xs text-stone-500 flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Ce message a été supprimé</span>
                          </div>
                        ) : (
                          <>
                            {/* Message Text */}
                            {msg.content && (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {msg.content}
                              </p>
                            )}

                            {/* Voice Note Player */}
                            {msg.isVoiceNote && (
                              <div
                                className={`mt-2 flex items-center gap-3 p-2 rounded-xl ${
                                  isMine ? "bg-white/10" : "bg-stone-100"
                                }`}
                              >
                                <button
                                  onClick={() =>
                                    setPlayingAudioId(playingAudioId === msg.id ? null : msg.id)
                                  }
                                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    isMine
                                      ? "bg-white text-[#184f28]"
                                      : "bg-[#184f28] text-white"
                                  }`}
                                >
                                  {playingAudioId === msg.id ? (
                                    <Pause className="w-3.5 h-3.5 fill-current" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                                    <span>Note vocale</span>
                                    <span>
                                      {msg.attachments?.[0]?.durationSeconds
                                        ? formatDuration(msg.attachments[0].durationSeconds)
                                        : "00:15"}
                                    </span>
                                  </div>
                                  <div
                                    className={`h-1.5 rounded-full overflow-hidden ${
                                      isMine ? "bg-white/30" : "bg-stone-300"
                                    }`}
                                  >
                                    <div
                                      className={`h-full rounded-full transition-all ${
                                        playingAudioId === msg.id
                                          ? "w-full animate-pulse bg-amber-400"
                                          : "w-1/3 bg-current"
                                      }`}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Standard Attachments (Images & Documents) */}
                            {msg.attachments &&
                              msg.attachments.length > 0 &&
                              !msg.isVoiceNote && (
                                <div className="mt-2 space-y-1.5">
                                  {msg.attachments.map((att) => (
                                    <div
                                      key={att.id}
                                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs ${
                                        isMine
                                          ? "bg-white/15 text-white"
                                          : "bg-stone-100 text-stone-800"
                                      }`}
                                    >
                                      {att.type === "IMAGE" ? (
                                        <ImageIcon className="w-4 h-4 shrink-0 text-amber-400" />
                                      ) : (
                                        <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-semibold truncate">{att.name}</div>
                                        <div className="text-[10px] opacity-75">
                                          {(att.sizeBytes / 1024).toFixed(1)} Ko
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Bubble Footer: Timestamp, Edited tag & Delivery status */}
                            <div
                              className={`flex items-center justify-end gap-1.5 text-[9px] mt-1.5 ${
                                isMine ? "text-stone-300" : "text-stone-400"
                              }`}
                            >
                              {msg.edited && <span className="italic">(modifié)</span>}
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {isMine && (
                                <span title={`Statut: ${msg.status}`}>
                                  {msg.status === "READ" ? (
                                    <CheckCheck className="w-3 h-3 text-cyan-300" />
                                  ) : msg.status === "DELIVERED" ? (
                                    <CheckCheck className="w-3 h-3 text-white/70" />
                                  ) : msg.status === "SENT" ? (
                                    <Check className="w-3 h-3 text-white/70" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-white/50" />
                                  )}
                                </span>
                              )}
                            </div>
                          </>
                        )}

                        {/* Message Actions Menu (Edit / Delete) for Own Messages */}
                        {isMine && !msg.deleted && (
                          <div className="absolute right-2 -top-3 hidden group-hover:flex items-center gap-1 bg-stone-900 border border-stone-700 rounded-lg p-0.5 shadow-md">
                            <button
                              onClick={() => {
                                setEditingMessageId(msg.id);
                                setEditContent(msg.content);
                              }}
                              title="Modifier"
                              className="p-1 hover:bg-stone-800 text-stone-300 hover:text-white rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              title="Supprimer"
                              className="p-1 hover:bg-stone-800 text-red-400 hover:text-red-300 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Edit Banner if active */}
            {editingMessageId && (
              <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Modification du message en cours...</span>
                </div>
                <button
                  onClick={() => {
                    setEditingMessageId(null);
                    setEditContent("");
                  }}
                  className="text-stone-400 hover:text-stone-600 p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Selected Attachment Preview Banner */}
            {selectedFile && !isRecording && (
              <div className="bg-stone-100 border-t border-stone-200 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-stone-700">
                  <Paperclip className="w-3.5 h-3.5 text-[#184f28]" />
                  <span className="font-semibold">{selectedFile.name}</span>
                  <span className="text-stone-400 text-[10px]">
                    ({(selectedFile.sizeBytes / 1024).toFixed(1)} Ko)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-stone-400 hover:text-red-500 p-1 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Composer Bar */}
            <div className="p-3 border-t border-stone-200 bg-white">
              {isRecording ? (
                /* Voice Recording Mode */
                <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-bold text-red-700 font-mono">
                      Enregistrement note vocale... {formatDuration(recordTimer)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={cancelRecording}
                      className="px-3 py-1 bg-white border border-stone-300 text-stone-600 hover:text-stone-900 rounded-lg text-xs font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={stopRecordingAndAttach}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      Terminer & Joindre
                    </button>
                  </div>
                </div>
              ) : editingMessageId ? (
                /* Editing Mode */
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                    placeholder="Modifier votre message..."
                    className="flex-1 bg-stone-100 border border-stone-300 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-amber-600 text-stone-800"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Enregistrer
                  </button>
                </div>
              ) : (
                /* Normal Composer Mode */
                <div className="flex items-center gap-2">
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Joindre un document ou une photo (max 15 Mo)"
                    className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={startRecording}
                    title="Enregistrer une note vocale"
                    className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Écrivez votre message au personnel..."
                    className="flex-1 bg-stone-100 border border-stone-200 px-4 py-2 text-xs rounded-xl focus:outline-none focus:bg-white focus:border-[#184f28] text-stone-800 transition-all"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || (!messageText.trim() && !selectedFile)}
                    className="p-2.5 bg-[#184f28] hover:bg-[#1f6634] disabled:bg-stone-300 text-white rounded-xl shadow-xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
            <MessageSquare className="w-12 h-12 text-stone-300 mb-3" />
            <h3 className="text-sm font-bold text-stone-700">Sélectionnez une conversation</h3>
            <p className="text-xs text-stone-400 max-w-sm mt-1">
              Choisissez un échange dans le volet de gauche ou créez un nouveau groupe de travail pour votre équipe.
            </p>
          </div>
        )}
      </div>

      {/* WebRTC Voice Call Modal Overlay */}
      {callSession && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl flex flex-col items-center">
            {/* Header info */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full mb-6 border border-emerald-800/80">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Chiffrement WebRTC DTLS-SRTP</span>
            </div>

            {/* Avatar Pulse Animation */}
            <div className="relative mb-4">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl ${
                  callSession.status === "CONNECTED"
                    ? "bg-[#184f28] ring-8 ring-[#184f28]/30 animate-pulse"
                    : "bg-amber-600 ring-8 ring-amber-600/30 animate-bounce"
                }`}
              >
                {callSession.receiverName.charAt(0)}
              </div>
            </div>

            {/* Name & Status */}
            <h3 className="text-base font-bold text-white mb-1">
              {callSession.receiverName}
            </h3>
            <p className="text-xs font-medium text-stone-400 mb-6 font-mono">
              {callSession.status === "RINGING" && "Appel en cours..."}
              {callSession.status === "CONNECTED" && `En communication • ${formatDuration(callSession.secondsElapsed)}`}
              {callSession.status === "ENDED" && "Appel terminé"}
              {callSession.status === "DECLINED" && "Appel refusé"}
            </p>

            {/* Call Controls */}
            <div className="flex items-center gap-4 mb-6">
              {/* Mute Mic */}
              <button
                onClick={() =>
                  setCallSession((s) => (s ? { ...s, isMuted: !s.isMuted } : null))
                }
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  callSession.isMuted
                    ? "bg-red-500 text-white"
                    : "bg-stone-800 hover:bg-stone-700 text-stone-200"
                }`}
                title={callSession.isMuted ? "Activer le micro" : "Couper le micro"}
              >
                {callSession.isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* End Call Button */}
              <button
                onClick={endWebRTCCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
                title="Raccrocher"
              >
                <PhoneOff className="w-6 h-6" />
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() =>
                  setCallSession((s) => (s ? { ...s, isSpeaker: !s.isSpeaker } : null))
                }
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  callSession.isSpeaker
                    ? "bg-stone-800 text-amber-300"
                    : "bg-stone-800 text-stone-400"
                }`}
                title="Haut-parleur"
              >
                {callSession.isSpeaker ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Disclaimer Security Notice */}
            <p className="text-[10px] text-stone-500 leading-tight">
              Appel voix sur IP interne via STUN. Pas d'enregistrement audio par défaut.
            </p>
          </div>
        </div>
      )}

      {/* New Group Creation Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#184f28]" />
                Créer un groupe de travail
              </h3>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nom du groupe *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="ex: Réception & Accueil Bohicon"
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-[#184f28] text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="ex: Coordination des arrivées VIP et navettes"
                  className="w-full bg-stone-50 border border-stone-300 px-3 py-2 text-xs rounded-xl focus:outline-none focus:border-[#184f28] text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Sélectionner les membres de l'équipe *
                </label>
                <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 p-1">
                  {SEED_USERS.map((user) => {
                    const isSelected = selectedMembers.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-stone-50 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers((prev) => [...prev, user.id]);
                            } else {
                              setSelectedMembers((prev) =>
                                prev.filter((id) => id !== user.id)
                              );
                            }
                          }}
                          className="rounded text-[#184f28] focus:ring-[#184f28]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-stone-900 truncate">
                            {user.fullName}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {user.roleName}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setShowNewGroupModal(false)}
                className="px-3 py-1.5 border border-stone-300 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleCreateGroup}
                disabled={creatingGroup}
                className="px-4 py-1.5 bg-[#184f28] hover:bg-[#1f6634] text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {creatingGroup ? "Création..." : "Créer le groupe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
