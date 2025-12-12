import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";

import { $generateHtmlFromNodes } from "@lexical/html";

import {
  Bold,
  Italic,
  Underline,
  Type,
  List as ListIcon,
  ListOrdered,
  Quote as QuoteIcon,
  RotateCcw,
  RotateCw,
} from "lucide-react";

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const applyText = (format) =>
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  const applyBlock = (format) =>
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  const undo = () => editor.dispatchCommand(UNDO_COMMAND);
  const redo = () => editor.dispatchCommand(REDO_COMMAND);

  const ToolbarButton = ({ title, onClick, icon: Icon }) => (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
      style={{ width: 36, height: 36 }}
      title={title}
      onClick={onClick}
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className="d-flex gap-2 mb-2 p-2 border rounded bg-light flex-wrap">
      <ToolbarButton title="Undo" onClick={undo} icon={RotateCcw} />
      <ToolbarButton title="Redo" onClick={redo} icon={RotateCw} />

      <div style={{ width: 1, background: "#ccc", margin: "4px 6px" }} />

      <ToolbarButton
        title="Bold"
        onClick={() => applyText("bold")}
        icon={Bold}
      />
      <ToolbarButton
        title="Italic"
        onClick={() => applyText("italic")}
        icon={Italic}
      />
      <ToolbarButton
        title="Underline"
        onClick={() => applyText("underline")}
        icon={Underline}
      />

      <div style={{ width: 1, background: "#ccc", margin: "4px 6px" }} />

      <ToolbarButton
        title="Heading 1"
        onClick={() => applyBlock("h1")}
        icon={Type}
      />
      <ToolbarButton
        title="Heading 2"
        onClick={() => applyBlock("h2")}
        icon={Type}
      />

      <div style={{ width: 1, background: "#ccc", margin: "4px 6px" }} />

      <ToolbarButton
        title="Bullet List"
        onClick={() => applyBlock("bullet")}
        icon={ListIcon}
      />
      <ToolbarButton
        title="Numbered List"
        onClick={() => applyBlock("number")}
        icon={ListOrdered}
      />

      <div style={{ width: 1, background: "#ccc", margin: "4px 6px" }} />

      <ToolbarButton
        title="Quote"
        onClick={() => applyBlock("quote")}
        icon={QuoteIcon}
      />
    </div>
  );
}

export default function TrainingDescriptionEditor({ value, onChange }) {
  const editorConfig = {
    namespace: "training-editor",
    onError: console.error,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode],
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
      <ToolbarPlugin />
      <div className="border rounded p-2">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="form-control border-0" />
          }
          placeholder={<div className="text-muted">Scrivi qui…</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              const html = $generateHtmlFromNodes(editor);
              onChange(html);
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}
