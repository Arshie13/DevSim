import prisma from '$lib/server/client';

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  created_at: Date;
}

export interface Conversation {
  id: string;
  user_id: string;
  workspace_id: string | null;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  messages: ConversationMessage[];
}

export class ConversationDataAccess {
  async findOrCreateConversation(userId: string, workspaceId?: string): Promise<Conversation> {
    let conversation = await prisma.conversation.findFirst({
      where: { user_id: userId, workspace_id: workspaceId ?? null },
      include: {
        messages: { orderBy: { created_at: 'asc' } }
      },
      orderBy: { updated_at: 'desc' }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { user_id: userId, workspace_id: workspaceId ?? null },
        include: {
          messages: { orderBy: { created_at: 'asc' } }
        }
      });
    }

    return conversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: { orderBy: { created_at: 'asc' } }
      }
    });
  }

  async addMessage(conversationId: string, role: string, content: string): Promise<ConversationMessage> {
    return prisma.message.create({
      data: { conversation_id: conversationId, role, content }
    });
  }

  async saveMessages(
    conversationId: string,
    messages: { role: string; content: string }[]
  ): Promise<void> {
    await prisma.message.createMany({
      data: messages.map(m => ({
        conversation_id: conversationId,
        role: m.role,
        content: m.content
      }))
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() }
    });
  }
}
