# テーマのコメント無効化機能実装計画

## 概要

QuestionDetailとThemeDetailページで使用されているFloatingChatコンポーネントについて、Theme.disableNewCommentがfalseであれば、チャットコンポーネントを無効化状態にする機能を実装します。

## 現状分析

1. `QuestionDetail.tsx`と`ThemeDetail.tsx`の両方で`FloatingChat`コンポーネントが使用されています
2. `Theme`モデルには現在`disableNewComment`フィールドが存在しません
3. 管理画面の`ThemeForm`コンポーネントにも`disableNewComment`の設定項目がありません
4. `FloatingChat`コンポーネントは現在、無効化モードをサポートしていません

## 実装内容

以下の3点を実装します：

1. テーマへの`disableNewComment`フィールドの追加（デフォルト値false、nullの場合もfalseと同じ挙動）
2. コンポーネントの無効化モードの実装
3. 管理画面への無効化・有効化切り替え機能の実装

## 実装手順

### 1. バックエンド: Themeモデルの拡張

#### 1.1 Themeモデルの型定義を更新

```typescript
// idea-discussion/backend/types/index.ts
export interface ITheme extends BaseDocument {
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  disableNewComment?: boolean; // 新規追加
}
```

#### 1.2 Themeスキーマの更新

```typescript
// idea-discussion/backend/models/Theme.ts
const themeSchema = new Schema<ITheme>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    disableNewComment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
```

#### 1.3 APIレスポンスの型定義を更新

```typescript
// idea-discussion/backend/types/index.ts
export interface ThemeDetailResponse {
  theme: ITheme & { disableNewComment?: boolean }; // disableNewCommentを追加
  keyQuestions: Array<
    ISharpQuestion & {
      issueCount: number;
      solutionCount: number;
      voteCount: number;
    }
  >;
  issues: IProblem[];
  solutions: ISolution[];
}
```

### 2. フロントエンド: FloatingChatコンポーネントの拡張

#### 2.1 FloatingChatコンポーネントに無効化モードを追加

```typescript
// frontend/src/components/chat/common/FloatingChat.tsx
interface FloatingChatProps {
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
  disabled?: boolean; // 新規追加
  disabledMessage?: string; // 新規追加（オプション）
}
```

#### 2.2 FloatingChatコンポーネントの実装を更新

```typescript
// frontend/src/components/chat/common/FloatingChat.tsx
const FloatingChatInner = forwardRef<FloatingChatRef, FloatingChatProps>(
  ({ onSendMessage, onClose, onOpen, disabled = false, disabledMessage = "このテーマではコメントが無効化されています" }, ref) => {
    // ...既存のコード...

    return (
      <>
        {/* On mobile: Show floating button when chat is closed */}
        {!isDesktop && !isOpen && (
          <FloatingChatButton onClick={handleOpen} hasUnread={hasUnread} disabled={disabled} />
        )}

        {/* Chat view - desktop: fixed sidebar, mobile: bottom sheet */}
        <div
          className={`
            ${
              isDesktop
                ? "fixed top-16 right-0 bottom-12 w-[40%] border-l border-b border-neutral-200 bg-white z-10 overflow-hidden"
                : ""
            }
          `}
        >
          {(isDesktop || isOpen) && (
            <ChatSheet
              isOpen={isOpen}
              onClose={handleClose}
              onSendMessage={handleSendMessage}
              isDesktop={isDesktop}
              disabled={disabled}
              disabledMessage={disabledMessage}
            />
          )}
        </div>
      </>
    );
  }
);
```

#### 2.3 ChatSheetコンポーネントの更新

```typescript
// frontend/src/components/chat/common/ChatSheet.tsx
interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => void;
  isDesktop?: boolean;
  disabled?: boolean; // 新規追加
  disabledMessage?: string; // 新規追加
}

export const ChatSheet: React.FC<ChatSheetProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isDesktop = false,
  disabled = false,
  disabledMessage = "このテーマではコメントが無効化されています",
}) => {
  // ...既存のコード...

  // 無効化状態の表示を追加
  const renderDisabledState = () => (
    <div className="p-4 bg-gray-100 text-gray-500 text-center border-t">
      <p>{disabledMessage}</p>
    </div>
  );

  // For desktop view
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full">
        <DesktopChatHeader onSendMessage={onSendMessage} />
        <div className="flex-grow overflow-auto h-[calc(100%-120px)]">
          <ExtendedChatHistory messages={messages} />
        </div>
        {disabled ? (
          renderDisabledState()
        ) : (
          <div className="p-4 border-t">
            {/* 既存の入力フォーム */}
          </div>
        )}
      </div>
    );
  }

  // Mobile view
  return (
    <BaseChatSheet open={isOpen} onOpenChange={onClose}>
      <ChatSheetContent
        className="p-0 h-auto rounded-t-xl overflow-hidden"
        style={{ height: `${height}px` }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          if (!disabled) inputRef.current?.focus();
        }}
      >
        <MobileChatHeader
          onDragStart={handleDragStart}
          onSendMessage={onSendMessage}
        />
        <div className="flex-grow overflow-auto h-[calc(100%-120px)]">
          <ExtendedChatHistory messages={messages} />
        </div>
        {disabled ? (
          renderDisabledState()
        ) : (
          <div className="p-4 border-t">
            {/* 既存の入力フォーム */}
          </div>
        )}
      </ChatSheetContent>
    </BaseChatSheet>
  );
};
```

### 3. フロントエンド: ThemeDetailとQuestionDetailページの更新

#### 3.1 ThemeDetail.tsxの更新

```typescript
// frontend/src/pages/ThemeDetail.tsx
const ThemeDetail = () => {
  // ...既存のコード...

  // テーマのdisableNewCommentフラグを取得
  const isCommentDisabled = isMockMode
    ? false
    : themeDetail?.theme?.disableNewComment === true;

  // ...既存のコード...

  return (
    <>
      <div className="md:mr-[50%]">
        <ThemeDetailTemplate {...templateProps} />
      </div>
      <FloatingChat
        ref={floatingChatRef}
        onSendMessage={handleSendMessage}
        disabled={isCommentDisabled}
      />
    </>
  );
};
```

#### 3.2 QuestionDetail.tsxの更新

```typescript
// frontend/src/pages/QuestionDetail.tsx
const QuestionDetail = () => {
  // ...既存のコード...

  // テーマ情報を取得するためのフックを追加
  const { themeDetail: themeInfo } = useThemeDetail(themeId || "");

  // テーマのdisableNewCommentフラグを取得
  const isCommentDisabled = isMockMode
    ? false
    : themeInfo?.theme?.disableNewComment === true;

  // ...既存のコード...

  return (
    <>
      <div className="md:mr-[50%]">
        {/* 既存のコード */}
      </div>
      <FloatingChat
        ref={chatRef}
        onSendMessage={handleSendMessage}
        disabled={isCommentDisabled}
      />
    </>
  );
};
```

### 4. 管理画面: ThemeFormコンポーネントの更新

#### 4.1 管理画面のTheme型定義を更新

```typescript
// admin/src/services/api/types.ts
export interface Theme {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  customPrompt?: string;
  disableNewComment?: boolean; // 新規追加
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateThemePayload {
  title: string;
  description?: string;
  slug: string;
  isActive?: boolean;
  customPrompt?: string;
  disableNewComment?: boolean; // 新規追加
}

export interface UpdateThemePayload {
  title?: string;
  description?: string;
  slug?: string;
  isActive?: boolean;
  customPrompt?: string;
  disableNewComment?: boolean; // 新規追加
}
```

#### 4.2 ThemeFormコンポーネントに設定項目を追加

```typescript
// admin/src/components/theme/ThemeForm.tsx
const ThemeForm: FC<ThemeFormProps> = ({ theme, isEdit = false }) => {
  const [formData, setFormData] = useState<
    CreateThemePayload | UpdateThemePayload
  >({
    title: "",
    description: "",
    slug: "",
    isActive: true,
    customPrompt: "",
    disableNewComment: false, // 初期値はfalse
  });

  useEffect(() => {
    if (isEdit && theme) {
      setFormData({
        title: theme.title,
        description: theme.description || "",
        slug: theme.slug,
        isActive: theme.isActive,
        customPrompt: theme.customPrompt || "",
        disableNewComment: theme.disableNewComment || false, // nullの場合はfalse
      });
    }
  }, [isEdit, theme]);

  // ...既存のコード...

  return (
    <form onSubmit={handleSubmit} className="max-w-8xl">
      {/* ...既存のフォーム項目... */}

      {/* 新規コメント無効化の設定項目 */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="disableNewComment"
          name="disableNewComment"
          checked={formData.disableNewComment as boolean}
          onChange={handleChange}
          className="mr-2"
        />
        <label htmlFor="disableNewComment" className="text-foreground">
          新規コメントを無効化
        </label>
      </div>

      {/* ...既存のフォーム項目... */}
    </form>
  );
};
```

### 5. バックエンド: APIコントローラーの更新

#### 5.1 テーマ作成・更新コントローラーの更新

```javascript
// idea-discussion/backend/controllers/themeController.js
// テーマ作成コントローラー
exports.createTheme = async (req, res) => {
  try {
    const { title, description, slug, isActive, customPrompt, disableNewComment } = req.body;

    const theme = new Theme({
      title,
      description,
      slug,
      isActive: isActive !== undefined ? isActive : true,
      customPrompt,
      disableNewComment: disableNewComment !== undefined ? disableNewComment : false,
    });

    // ...既存のコード...
  } catch (error) {
    // ...エラーハンドリング...
  }
};

// テーマ更新コントローラー
exports.updateTheme = async (req, res) => {
  try {
    const { title, description, slug, isActive, customPrompt, disableNewComment } = req.body;

    const updatedTheme = await Theme.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        slug,
        isActive,
        customPrompt,
        disableNewComment,
      },
      { new: true }
    );

    // ...既存のコード...
  } catch (error) {
    // ...エラーハンドリング...
  }
};
```

## テスト計画

1. バックエンド
   - Themeモデルに`disableNewComment`フィールドが追加されていることを確認
   - テーマ作成時に`disableNewComment`が正しく保存されることを確認
   - テーマ更新時に`disableNewComment`が正しく更新されることを確認

2. 管理画面
   - ThemeFormに「新規コメントを無効化」のチェックボックスが表示されることを確認
   - チェックボックスの状態が正しく保存されることを確認

3. フロントエンド
   - `disableNewComment`が`true`のテーマでは、FloatingChatが無効化状態で表示されることを確認
   - `disableNewComment`が`false`のテーマでは、FloatingChatが通常通り機能することを確認
   - `disableNewComment`が`null`のテーマでは、FloatingChatが通常通り機能することを確認（後方互換性）

## 注意点

- 既存のテーマデータには`disableNewComment`フィールドがないため、デフォルト値として`false`を使用します
- フロントエンドでは`disableNewComment === true`の場合のみ無効化するようにし、`undefined`や`null`の場合は有効状態とします
- 無効化状態のUIは、ユーザーに明確に伝わるようにメッセージを表示します

この実装により、管理者はテーマごとに新規コメントの受付を制御できるようになります。
