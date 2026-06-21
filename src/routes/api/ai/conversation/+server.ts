import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ConversationDataAccess } from '$lib/layers/data-access/ConversationDataAccess';

const conversationDA = new ConversationDataAccess();

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const workspaceId = url.searchParams.get('workspaceId') || undefined;
    const conversationId = url.searchParams.get('conversationId');

    if (!userId && !conversationId) {
      return json({ error: 'userId or conversationId is required' }, { status: 400 });
    }

    if (conversationId) {
      const conversation = await conversationDA.getConversation(conversationId);
      if (!conversation) {
        return json({ error: 'Conversation not found' }, { status: 404 });
      }
      return json({ success: true, conversation });
    }

    const conversation = await conversationDA.findOrCreateConversation(userId!, workspaceId);
    return json({ success: true, conversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
};
