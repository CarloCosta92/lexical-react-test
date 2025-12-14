import React, { useEffect, useState, useCallback } from "react";
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
  List as ListIcon,
  ListOrdered,
  RotateCcw,
  RotateCw,
} from "lucide-react";

// CONSTANTS

const INITIAL_FORMATS = {
  bold: false,
  italic: false,
  underline: false,
  heading: "paragraph",
  bullet: false,
  number: false,
};

const HEADING_OPTIONS = [
  { value: "paragraph", label: "Paragraph" },
  { value: "h1", label: "Heading 1" },
  { value: "h2", label: "Heading 2" },
];

// TOOLBAR BUTTON

const ToolbarButton = ({ active, onClick, onMouseDown, children, title }) => (
  <button
    className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"}`}
    onClick={onClick}
    onMouseDown={onMouseDown}
    title={title}
    aria-pressed={active}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="vr" />;

// TOOLBAR PLUGIN

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState(INITIAL_FORMATS);

  // Sync selection state to toolbar
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

  // Handlers
  const handleUndo = useCallback(
    () => editor.dispatchCommand(UNDO_COMMAND),
    [editor]
  );

  const handleRedo = useCallback(
    () => editor.dispatchCommand(REDO_COMMAND),
    [editor]
  );

  const handleFormat = useCallback(
    (format) => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format),
    [editor]
  );

  const handleHeadingChange = useCallback(
    (type) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const createNode =
          type === "paragraph"
            ? () => $createParagraphNode()
            : () => $createHeadingNode(type);

        $setBlocksType(selection, createNode);
      });
    },
    [editor]
  );

  const handleToggleList = useCallback(
    (listType) => {
      const isActive = listType === "bullet" ? formats.bullet : formats.number;
      const command = isActive
        ? REMOVE_LIST_COMMAND
        : listType === "bullet"
        ? INSERT_UNORDERED_LIST_COMMAND
        : INSERT_ORDERED_LIST_COMMAND;

      editor.dispatchCommand(command);
    },
    [editor, formats.bullet, formats.number]
  );

  const preventMouseDown = (e) => e.preventDefault();

  return (
    <div className="d-flex gap-2 mb-2 p-2 border rounded bg-light flex-wrap">
      {/* History controls */}
      <ToolbarButton onClick={handleUndo} title="Annulla">
        <RotateCcw size={16} />
      </ToolbarButton>
      <ToolbarButton onClick={handleRedo} title="Ripeti">
        <RotateCw size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Text formatting */}
      <ToolbarButton
        active={formats.bold}
        onClick={() => handleFormat("bold")}
        title="Grassetto"
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={formats.italic}
        onClick={() => handleFormat("italic")}
        title="Corsivo"
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={formats.underline}
        onClick={() => handleFormat("underline")}
        title="Sottolineato"
      >
        <Underline size={16} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Heading selector */}
      <select
        className="form-select form-select-sm"
        style={{ width: 140 }}
        value={formats.heading}
        onChange={(e) => handleHeadingChange(e.target.value)}
        aria-label="Seleziona tipo di paragrafo"
      >
        {HEADING_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <ToolbarDivider />

      {/* List controls */}
      <ToolbarButton
        active={formats.bullet}
        onClick={() => handleToggleList("bullet")}
        onMouseDown={preventMouseDown}
        title="Lista puntata"
      >
        <ListIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        active={formats.number}
        onClick={() => handleToggleList("number")}
        onMouseDown={preventMouseDown}
        title="Lista numerata"
      >
        <ListOrdered size={16} />
      </ToolbarButton>
    </div>
  );
}

// CLEAR EDITOR PLUGIN

function ClearEditorPlugin({ value }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (value === "") {
      editor.update(() => $getRoot().clear());
    }
  }, [value, editor]);

  return null;
}

// MAIN EDITOR COMPONENT

export default function TrainingDescriptionEditor({ value, onChange }) {
  const handleChange = useCallback(
    (editorState, editor) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor);
        onChange(html);
      });
    },
    [onChange]
  );

  const editorConfig = {
    namespace: "training-editor",
    onError: (error) => console.error("Lexical Error:", error),
    nodes: [HeadingNode, ListNode, ListItemNode],
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
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
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
