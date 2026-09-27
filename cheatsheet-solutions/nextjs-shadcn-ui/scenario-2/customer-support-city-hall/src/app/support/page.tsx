"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Send,
  Bot,
  Headphones,
  ArrowLeft,
  LogOut,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "@/components/MessageBubble";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Message {
  id: string;
  role: "customer" | "agent" | "system";
  content: string;
  timestamp: string;
}

interface Complaint {
  id: string;
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
  complaint: string;
  submittedAt: string;
}

/** Canned assistant replies, keyed by the first matching keyword. */
const aiResponses: Record<string, string> = {
  default:
    "I'm your City Hall AI Assistant. I can help you with information about city services, permits, taxes, public utilities, and more. How can I assist you today?",
  permits:
    "For permits and licenses, visit the City Hall Building Division on the 2nd floor. Bring a valid ID, proof of property ownership and a completed application form.",
  taxes:
    "The City Treasurer's Office handles tax inquiries Monday to Friday, 8am-5pm. Property taxes can also be paid online through the city portal.",
  utilities:
    "For water, electricity and other utilities, contact the Public Utilities Department at (555) 123-4567.",
  trash:
    "Trash collection runs Monday to Friday in residential areas - place bins out by 7am. Recycling is collected on Wednesdays.",
  parking:
    "Parking permits come from the Traffic Management Office. Street parking is free for two hours.",
  hours:
    "City Hall is open Monday to Friday, 8:00 AM to 5:00 PM.",
};

const GREETING: Message = {
  id: "greeting",
  role: "agent",
  content:
    "Welcome to City Hall Customer Support! I'm your AI Assistant. I can help you with information about city services, permits, taxes, utilities, and more. How can I assist you today?",
  timestamp: new Date().toISOString(),
};

const MIN_NAME_LENGTH = 2;
const MIN_COMPLAINT_LENGTH = 10;
const ZIP_PATTERN = /^\d{5}$/;

export default function SupportPage() {
  const [messages, setMessages] = useLocalStorage<Message[]>("supportMessages", [GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [complaints, setComplaints] = useLocalStorage<Complaint[]>("customerComplaints", []);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [isConnectedToAgent, setIsConnectedToAgent] = useState(false);
  const [agentQueuePosition, setAgentQueuePosition] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    zipCode: "",
    complaint: "",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isNameValid = formData.fullName.trim().length >= MIN_NAME_LENGTH;
  const isZipValid = ZIP_PATTERN.test(formData.zipCode);
  const isComplaintValid = formData.complaint.trim().length >= MIN_COMPLAINT_LENGTH;
  const isFormValid = isNameValid && isZipValid && isComplaintValid;

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    for (const [key, response] of Object.entries(aiResponses)) {
      if (lowerInput.includes(key)) return response;
    }

    return aiResponses.default;
  };

  const handleSendMessage = () => {
    // Whitespace-only messages are not sendable.
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `${Date.now()}`,
      role: "customer",
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now() + 1}`,
          role: "agent",
          content: getAIResponse(userMessage.content),
          timestamp: new Date().toISOString(),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /** Persists the complaint, then moves the citizen into the agent queue. */
  const handleSubmitAgentRequest = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid) return;

    setComplaints((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        zipCode: formData.zipCode,
        complaint: formData.complaint.trim(),
        submittedAt: new Date().toISOString(),
      },
    ]);

    setShowAgentForm(false);
    setAgentQueuePosition(3);
  };

  const handleBackToMain = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackToMain}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">City Hall Support</h1>
                <p className="text-sm text-muted-foreground">Customer Portal</p>
              </div>
            </div>
            <Link
              href="/support/history"
              className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm hover:bg-accent"
            >
              <History className="h-4 w-4" />
              View History
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {showAgentForm ? (
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Connect with an Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAgentRequest} className="space-y-4" noValidate>
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                  {formData.fullName.length > 0 && !isNameValid && (
                    <p className="mt-1 text-sm text-red-600">
                      Full name must be at least {MIN_NAME_LENGTH} characters
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Address</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">ZIP Code</label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="ZIP Code"
                      className="mt-1"
                    />
                    {formData.zipCode.length > 0 && !isZipValid && (
                      <p className="mt-1 text-sm text-red-600">ZIP code must be 5 digits</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">How can we help?</label>
                  <Input
                    value={formData.complaint}
                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                    placeholder="Describe your issue"
                    className="mt-1"
                  />
                  {formData.complaint.length > 0 && !isComplaintValid && (
                    <p className="mt-1 text-sm text-red-600">
                      Complaint must be at least {MIN_COMPLAINT_LENGTH} characters
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAgentForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={!isFormValid}>
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-[calc(100vh-200px)] flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarFallback className={isConnectedToAgent ? "bg-green-500" : "bg-blue-500"}>
                      {isConnectedToAgent ? (
                        <Headphones className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                      isConnectedToAgent ? "bg-green-500" : "bg-blue-500"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {isConnectedToAgent ? "Agent Sarah" : "AI Assistant"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isConnectedToAgent ? "Online" : isTyping ? "Typing..." : "Always available"}
                  </p>
                </div>
              </div>
              {!isConnectedToAgent && (
                <Button
                  onClick={() => setShowAgentForm(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Headphones className="h-4 w-4 mr-2" />
                  Talk to Agent
                </Button>
              )}
            </div>

            {/* Messages */}
            <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} viewer="customer" />
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
              {agentQueuePosition !== null && agentQueuePosition > 0 && (
                <div className="flex justify-center">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    Connecting to agent... ({agentQueuePosition} in queue)
                  </Badge>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    isConnectedToAgent
                      ? "Type your message to the agent..."
                      : "Type your message to AI Assistant..."
                  }
                />
                <Button onClick={handleSendMessage} disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
