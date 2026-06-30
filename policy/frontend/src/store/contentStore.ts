import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { gitHubClient } from "../lib/api";
import { type GitHubDirectoryItem, type GitHubFile } from "../lib/github";

// Define Message type (assuming structure from ChatPanel.tsx)
interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

// Use specific types from the API client
type GitHubContent = GitHubFile | GitHubDirectoryItem[] | null;

// Structure for chat threads associated with file paths
interface ChatThread {
  messages: Message[];
  branchId: string | null;
  nextMessageId: number; // To manage message IDs within a thread
}

interface ContentState {
  repoOwner: string;
  repoName: string;
  currentPath: string;
  content: GitHubContent;
  contentType: "file" | "dir" | null;
  isLoading: boolean;
  error: Error | null;
  chatThreads: Record<string, ChatThread>; // Map file path to chat thread
  // アクションの型定義
  setRepoInfo: (owner: string, name: string) => void;
  fetchContent: (path: string, ref?: string) => Promise<void>; // Add optional ref parameter
  // Chat related actions
  getChatThread: (path: string) => ChatThread | null;
  createChatThread: (path: string) => ChatThread;
  addMessageToThread: (path: string, message: Omit<Message, "id">) => void; // Pass message content, ID is generated internally
  ensureBranchIdForThread: (path: string) => string; // Ensures branchId exists and returns it
  reloadCurrentContent: () => Promise<void>; // Action to reload content for the current path
  // Internal actions (optional, kept for consistency)
  _setContent: (content: GitHubContent, type: "file" | "dir" | null) => void;
  _setLoading: (loading: boolean) => void;
  _setError: (error: Error | null) => void;
  _setCurrentPath: (path: string) => void;
}

const useContentStore = create<ContentState>()(
  devtools(
    (set, get) => ({
      // --- State ---
      repoOwner: import.meta.env.VITE_GITHUB_REPO_OWNER || "",
      repoName: import.meta.env.VITE_GITHUB_REPO_NAME || "",
      currentPath: "",
      content: null,
      contentType: null,
      isLoading: false,
      error: null,
      chatThreads: {}, // Initialize chatThreads as an empty object

      // --- Actions ---
      setRepoInfo: (owner, name) => set({ repoOwner: owner, repoName: name }),

      fetchContent: async (path: string, ref?: string) => {
        console.log(`Fetching content for path: ${path}`);
        set({ isLoading: true, error: null, currentPath: path });

        const { repoOwner, repoName } = get();
        if (!repoOwner || !repoName) {
          const error = new Error(
            "Repository owner and name are not set in the store."
          );
          set({
            error,
            content: null,
            contentType: null,
            isLoading: false,
          });
          return;
        }

        const result = await gitHubClient.fetchContent(
          repoOwner,
          repoName,
          path,
          ref
        );

        if (result.isErr()) {
          const error = new Error(result.error.message);

          if (
            ref &&
            result.error.message.includes("404") &&
            (result.error.message.includes("Not Found") ||
              result.error.message.includes("No commit found for the ref"))
          ) {
            console.warn(
              `Ref '${ref}' not found for path '${path}'. Falling back to default branch.`
            );

            const fallbackResult = await gitHubClient.fetchContent(
              repoOwner,
              repoName,
              path
            );

            if (fallbackResult.isErr()) {
              const finalError = new Error(fallbackResult.error.message);
              set({
                error: finalError,
                content: null,
                contentType: null,
                isLoading: false,
              });
              return;
            }

            const fallbackData = fallbackResult.value;
            if (!Array.isArray(fallbackData)) {
              set({
                content: fallbackData,
                contentType: "file",
                error: null,
                isLoading: false,
              });
              return;
            }

            const sortedData = [...fallbackData].sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === "dir" ? -1 : 1;
            });
            set({
              content: sortedData,
              contentType: "dir",
              error: null,
              isLoading: false,
            });
          } else {
            set({
              error,
              content: null,
              contentType: null,
              isLoading: false,
            });
          }
          return;
        }

        const data = result.value;
        if (!Array.isArray(data)) {
          set({ content: data, contentType: "file", isLoading: false });
          return;
        }

        const sortedData = [...data].sort((a, b) => {
          if (a.type === b.type) {
            return a.name.localeCompare(b.name);
          }
          return a.type === "dir" ? -1 : 1;
        });
        set({ content: sortedData, contentType: "dir", isLoading: false });
      },

      // --- Chat Actions ---
      getChatThread: (path) => {
        const state = get();
        return state.chatThreads[path] || null;
      },

      createChatThread: (path) => {
        const state = get();
        if (!state.chatThreads[path]) {
          const welcomeMessage =
            import.meta.env.VITE_POLICY_CHAT_WELCOME_MESSAGE ||
            "こんにちは！私はこのドキュメントについて、質問に答えたり、変更提案を一緒に取りまとめるのが得意なAIです。何か気になることはありますか？";

          const welcomeMsg: Message = {
            id: 1,
            text: welcomeMessage,
            sender: "bot",
          };

          const newThread = {
            messages: [welcomeMsg],
            branchId: null,
            nextMessageId: 2,
          };

          set((prevState) => ({
            chatThreads: {
              ...prevState.chatThreads,
              [path]: newThread,
            },
          }));
          return newThread;
        }
        return state.chatThreads[path];
      },

      addMessageToThread: (path, messageContent) => {
        set((state) => {
          const thread = state.chatThreads[path];
          if (!thread) {
            console.warn(
              `Attempted to add message to non-existent thread: ${path}`
            );
            return {}; // No change if thread doesn't exist
          }
          const newMessage: Message = {
            ...messageContent,
            id: thread.nextMessageId,
          };
          return {
            chatThreads: {
              ...state.chatThreads,
              [path]: {
                ...thread,
                messages: [...thread.messages, newMessage],
                nextMessageId: thread.nextMessageId + 1,
              },
            },
          };
        });
      },

      ensureBranchIdForThread: (path) => {
        const state = get();
        let thread = state.chatThreads[path];

        // Ensure thread exists first
        if (!thread) {
          thread = state.createChatThread(path); // Create it if missing
        }

        if (thread.branchId) {
          return thread.branchId; // Return existing ID
        }
        // Generate new branch ID: idobata- + 6 random alphanumeric chars
        const randomPart = Math.random().toString(36).substring(2, 8);
        const newBranchId = `idobata-${randomPart}`;

        set((prevState) => ({
          chatThreads: {
            ...prevState.chatThreads,
            [path]: {
              ...prevState.chatThreads[path], // Get the latest state of the thread
              branchId: newBranchId,
            },
          },
        }));
        return newBranchId;
      },
      reloadCurrentContent: async () => {
        const { currentPath, fetchContent, chatThreads } = get();
        if (currentPath) {
          console.log(`Reloading content for path: ${currentPath}`);
          // Check if there's a branchId associated with the current path's chat thread
          const currentThread = chatThreads[currentPath];
          const ref = currentThread?.branchId ?? undefined; // Use branchId as ref if it exists, otherwise undefined
          await fetchContent(currentPath, ref); // Pass ref if available
        } else {
          console.warn(
            "Attempted to reload content, but currentPath is not set."
          );
        }
      },

      // --- Internal Actions --- (Kept for potential internal use)
      _setContent: (content, type) => set({ content, contentType: type }),
      _setLoading: (loading) => set({ isLoading: loading }),
      _setError: (error) => set({ error }),
      // _setCurrentPath was duplicated here, removed. The correct one is below.
      _setCurrentPath: (path) => set({ currentPath: path }),
    }),
    {
      name: "github-content-store", // devtoolsでの表示名
    }
  )
);

// 初期化処理: 環境変数から読み込む (createの外でも可能)
// useContentStore.getState().setRepoInfo(
//   import.meta.env.VITE_GITHUB_REPO_OWNER || '',
//   import.meta.env.VITE_GITHUB_REPO_NAME || ''
// );
// Note: create内の初期値設定で十分な場合が多い

export default useContentStore;
