"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import {
  Headphones,
  Send,
  CheckCircle,
  LogOut,
  MessageCircle,
  User,
  MapPin,
  Building,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MessageBubble } from "@/components/MessageBubble";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatRelativeTime } from "@/lib/dateUtils";

interface Customer {
  id: string;
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  complaint: string;
}

interface Message {
  id: string;
  role: "customer" | "agent" | "system";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  customer: Customer;
  status: "active" | "waiting" | "resolved";
  unreadCount: number;
  lastMessage: string;
  messages: Message[];
  createdAt: string;
}

const STATUS_FILTERS = ["all", "active", "waiting", "resolved"];

/**
 * High-contrast palette per conversation status, replacing the ad-hoc
 * 500-level fills the starter used.
 */
function getStatusBadge(status: Conversation["status"]) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "waiting":
      return <Badge className="bg-yellow-100 text-yellow-800">Waiting</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">Resolved</Badge>;
  }
}

/** Seeded conversations, used the first time the dashboard loads. */
function initialConversations(): Conversation[] {
  const minutesAgo = (minutes: number) =>
    new Date(Date.now() - minutes * 60 * 1000).toISOString();

  return [
    {
      id: "1",
      customer: {
        id: "c1",
        fullName: "John Smith",
        address: "456 Oak Avenue",
        city: "Springfield",
        zipCode: "12345",
        complaint:
          "My trash wasn't collected last Tuesday. I've called twice already and nothing has been done.",
      },
      status: "active",
      unreadCount: 2,
      lastMessage: "This is unacceptable, I need help immediately!",
      createdAt: minutesAgo(30),
      messages: [
        {
          id: "m1",
          role: "system",
          content: "Customer connected to agent",
          timestamp: minutesAgo(30),
        },
        {
          id: "m2",
          role: "customer",
          content: "Hi, I need to report that my trash wasn't collected last Tuesday.",
          timestamp: minutesAgo(28),
        },
        {
          id: "m3",
          role: "customer",
          content: "I've called twice about this and nothing has been done. This is really frustrating.",
          timestamp: minutesAgo(15),
        },
        {
          id: "m4",
          role: "customer",
          content: "This is unacceptable, I need help immediately!",
          timestamp: minutesAgo(5),
        },
      ],
    },
    {
      id: "2",
      customer: {
        id: "c2",
        fullName: "Maria Garcia",
        address: "789 Pine Street",
        city: "Springfield",
        zipCode: "12346",
        complaint:
          "I need information about applying for a business permit for a new restaurant.",
      },
      status: "waiting",
      unreadCount: 0,
      lastMessage: "Thank you, I'll wait for your response.",
      createdAt: minutesAgo(60),
      messages: [
        {
          id: "m5",
          role: "system",
          content: "Customer connected to agent",
          timestamp: minutesAgo(60),
        },
        {
          id: "m6",
          role: "customer",
          content:
            "Hello, I want to open a new restaurant and need information about business permits.",
          timestamp: minutesAgo(58),
        },
        {
          id: "m7",
          role: "customer",
          content: "Thank you, I'll wait for your response.",
          timestamp: minutesAgo(56),
        },
      ],
    },
    {
      id: "3",
      customer: {
        id: "c3",
        fullName: "Robert Johnson",
        address: "321 Maple Drive",
        city: "Springfield",
        zipCode: "12347",
        complaint:
          "Question about property tax assessment - I believe my assessment is too high.",
      },
      status: "resolved",
      unreadCount: 0,
      lastMessage: "Thank you for your help!",
      createdAt: minutesAgo(1440),
      messages: [
        {
          id: "m8",
          role: "system",
          content: "Customer connected to agent",
          timestamp: minutesAgo(1440),
        },
        {
          id: "m9",
          role: "customer",
          content: "I'd like to dispute my property tax assessment.",
          timestamp: minutesAgo(1435),
        },
        {
          id: "m10",
          role: "agent",
          content: "I can help you with that. Let me pull up your property records.",
          timestamp: minutesAgo(1430),
        },
        {
          id: "m11",
          role: "customer",
          content: "Thank you for your help!",
          timestamp: minutesAgo(1425),
        },
      ],
    },
  ];
}

export default function AgentPage() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    "agentConversations",
    initialConversations()
  );
  const [agentStatus, setAgentStatus] = useLocalStorage<"online" | "away" | "offline">(
    "agentStatus",
    "online"
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  );
  const [messageInput, setMessageInput] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // One pass over the conversations produces every header count.
  const { active, waiting, resolved } = useMemo(
    () => ({
      active: conversations.filter((c) => c.status === "active").length,
      waiting: conversations.filter((c) => c.status === "waiting").length,
      resolved: conversations.filter((c) => c.status === "resolved").length,
    }),
    [conversations]
  );

  const visibleConversations = useMemo(() => {
    const term = query.trim().toLowerCase();

    return conversations
      .filter(
        (c) =>
          !term ||
          c.customer.fullName.toLowerCase().includes(term) ||
          c.customer.complaint.toLowerCase().includes(term)
      )
      .filter((c) => statusFilter === "all" || c.status === statusFilter);
  }, [conversations, query, statusFilter]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;
  const canReply = agentStatus !== "offline";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  // Opening a conversation clears its unread count on the conversations array,
  // which is what the header counts are derived from.
  const handleSelectConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id ? { ...conversation, unreadCount: 0 } : conversation
      )
    );
    setSelectedId(id);
  };

  const handleSendMessage = () => {
    if (!canReply || !messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `${Date.now()}`,
      role: "agent",
      content: messageInput,
      timestamp: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? {
              ...conversation,
              messages: [...conversation.messages, newMessage],
              lastMessage: messageInput,
              status: "active" as const,
            }
          : conversation
      )
    );
    setMessageInput("");
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setMessageInput("");
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleResolveConversation = () => {
    if (!selectedConversation) return;

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === selectedConversation.id
          ? { ...conversation, status: "resolved" as const }
          : conversation
      )
    );
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Headphones className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  City Hall Agent Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">Customer Support Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Status Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <select
                  value={agentStatus}
                  onChange={(e) =>
                    setAgentStatus(e.target.value as "online" | "away" | "offline")
                  }
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                  <option value="offline">Offline</option>
                </select>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-4 rounded-lg bg-muted px-4 py-2">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-600">{waiting}</p>
                  <p className="text-xs text-muted-foreground">Waiting</p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">{resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="border-b">
              <CardTitle>Conversations</CardTitle>
              <p className="text-sm text-muted-foreground">
                {visibleConversations.length} of {conversations.length} conversations
              </p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3 border-b p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((status) => {
                    const isActive = statusFilter === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="max-h-[calc(100vh-420px)] overflow-y-auto">
                {visibleConversations.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">
                    No conversations found
                  </p>
                ) : (
                  visibleConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation.id)}
                      className={`w-full border-b p-4 text-left transition-colors hover:bg-accent ${
                        selectedConversation?.id === conversation.id ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground truncate">
                              {conversation.customer.fullName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatRelativeTime(conversation.createdAt)}
                          </p>
                        </div>
                        <div className="ml-2">{getStatusBadge(conversation.status)}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversation ? (
              <>
                <div className="flex items-center justify-between border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {selectedConversation.customer.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {selectedConversation.customer.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.customer.city},{" "}
                        {selectedConversation.customer.zipCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.status !== "resolved" && (
                      <Button
                        onClick={handleResolveConversation}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    )}
                    {selectedConversation.status === "resolved" && (
                      <Badge variant="outline" className="px-4 py-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="h-[400px] space-y-4 overflow-y-auto p-4">
                  {selectedConversation.messages.map((message) => (
                    <MessageBubble key={message.id} message={message} viewer="agent" />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {selectedConversation.status !== "resolved" && (
                  <div className="border-t p-4">
                    {!canReply && (
                      <p className="mb-2 text-sm text-orange-600">
                        Set your status to online to reply
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        disabled={!canReply}
                        placeholder="Type your response..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!canReply || !messageInput.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Select a conversation to start</p>
                </div>
              </div>
            )}
          </Card>

          {/* Customer Details */}
          <Card className="lg:col-span-1">
            <CardHeader className="border-b">
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            {selectedConversation ? (
              <CardContent className="space-y-6 p-4">
                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-xs text-muted-foreground">Full Name</label>
                        <p className="font-medium text-foreground">
                          {selectedConversation.customer.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-xs text-muted-foreground">Address</label>
                        <p className="font-medium text-foreground">
                          {selectedConversation.customer.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <label className="text-xs text-muted-foreground">City &amp; ZIP</label>
                        <p className="font-medium text-foreground">
                          {selectedConversation.customer.city},{" "}
                          {selectedConversation.customer.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Complaint Details
                  </h3>
                  <p className="text-sm text-foreground">
                    {selectedConversation.customer.complaint}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Quick Actions
                  </h3>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Select a conversation to view details
                </p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
