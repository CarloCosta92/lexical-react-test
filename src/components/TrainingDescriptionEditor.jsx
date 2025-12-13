import React, { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";

import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
  $createParagraphNode,
} from "lexical";

import { $setBlocksType } from "@lexical/selection";

import { $getNearestNodeOfType } from "@lexical/utils";
import { HeadingNode, $createHeadingNode } from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { $generateHtmlFromNodes } from "@lexical/html";

import {
  Bold,
  Italic,
  Underline,
  Type,
  List as ListIcon,
  ListOrdered,
  RotateCcw,
  RotateCw,
} from "lucide-react";

// =======================
// TOOLBAR
// =======================
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading: "paragraph",
    bullet: false,
    number: false,
  });

  // 🔄 Sync selection → toolbar
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const anchor = selection.anchor.getNode();

        const heading = $getNearestNodeOfType(anchor, HeadingNode);
        const list = $getNearestNodeOfType(anchor, ListNode);

        setFormats({
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          underline: selection.hasFormat("underline"),
          heading: heading?.getTag() ?? "paragraph",
          bullet: list?.getListType() === "bullet",
          number: list?.getListType() === "number",
        });
      });
    });
  }, [editor]);

  // 🧱 Heading
  const setHeading = (type) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      if (type === "paragraph") {
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        $setBlocksType(selection, () => $createHeadingNode(type));
      }
    });
  };

  // 📋 Liste
  const toggleBullet = () =>
    editor.dispatchCommand(
      formats.bullet ? REMOVE_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND
    );

  const toggleNumber = () =>
    editor.dispatchCommand(
      formats.number ? REMOVE_LIST_COMMAND : INSERT_ORDERED_LIST_COMMAND
    );

  const btn = (active) =>
    `btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`;

  return (
    <div className="d-flex gap-2 mb-2 p-2 border rounded bg-light flex-wrap">
      {/* Undo / Redo */}
      <button
        className={btn()}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND)}
      >
        <RotateCcw size={16} />
      </button>
      <button
        className={btn()}
        onClick={() => editor.dispatchCommand(REDO_COMMAND)}
      >
        <RotateCw size={16} />
      </button>

      <div className="vr" />

      {/* Inline */}
      <button
        className={btn(formats.bold)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold size={16} />
      </button>
      <button
        className={btn(formats.italic)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic size={16} />
      </button>
      <button
        className={btn(formats.underline)}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
      >
        <Underline size={16} />
      </button>

      <div className="vr" />

      {/* Heading dropdown */}
      <select
        className="form-select form-select-sm"
        style={{ width: 140 }}
        value={formats.heading}
        onChange={(e) => setHeading(e.target.value)}
      >
        <option value="paragraph">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
      </select>

      <div className="vr" />

      {/* Lists */}
      <button
        className={btn(formats.bullet)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleBullet}
      >
        <ListIcon size={16} />
      </button>

      <button
        className={btn(formats.number)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleNumber}
      >
        <ListOrdered size={16} />
      </button>
    </div>
  );
}

// =======================
// CLEAR / SYNC
// =======================
function ClearEditorPlugin({ value }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (value !== "") return;
    editor.update(() => $getRoot().clear());
  }, [value, editor]);

  return null;
}

// =======================
// EDITOR
// =======================
export default function TrainingDescriptionEditor({ value, onChange }) {
  const config = {
    namespace: "training-editor",
    onError: console.error,
    nodes: [HeadingNode, ListNode, ListItemNode],
  };

  return (
    <LexicalComposer initialConfig={config}>
      <ToolbarPlugin />
      <ClearEditorPlugin value={value} />

      <div className="border rounded p-2">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="form-control border-0" />
          }
          placeholder={<div className="text-muted">Scrivi qui…</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <ListPlugin />
        <OnChangePlugin
          onChange={(editorState, editor) => {
            editorState.read(() => {
              onChange($generateHtmlFromNodes(editor));
            });
          }}
        />
      </div>
    </LexicalComposer>
  );
}
