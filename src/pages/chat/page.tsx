import { useParams } from "react-router-dom";
import NewChatView from "./_components/new-chat-view.tsx";
import ConversationView from "./_components/conversation-view.tsx";

export default function ChatPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  return id ? <ConversationView conversationId={id} /> : <NewChatView />;
}
