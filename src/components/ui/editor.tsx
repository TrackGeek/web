import type { Editor, Range } from "@tiptap/core";
import { mergeAttributes, Node } from "@tiptap/core";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import type { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { PluginKey } from "@tiptap/pm/state";
import {
  ReactRenderer,
  EditorProvider as TiptapEditorProvider,
  type EditorProviderProps as TiptapEditorProviderProps,
  useCurrentEditor,
} from "@tiptap/react";
import { BubbleMenu, type BubbleMenuProps, type FloatingMenuProps } from "@tiptap/react/menus";
import { Button } from "@/components/ui/button.tsx";
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils";

export type { Editor, JSONContent } from "@tiptap/react";

import { Icon } from "@iconify/react";
import Heading from "@tiptap/extension-heading";
import StarterKit from "@tiptap/starter-kit";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import Fuse from "fuse.js";
import type { FormEventHandler, HTMLAttributes, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import tippy, { type Instance as TippyInstance } from "tippy.js";

type SlashNodeAttrs = {
  id: string | null;
  label?: string | null;
};

type SlashOptions<SlashOptionSuggestionItem = unknown, Attrs = SlashNodeAttrs> = {
  HTMLAttributes: Record<string, unknown>;
  renderText: (props: { options: SlashOptions<SlashOptionSuggestionItem, Attrs>; node: ProseMirrorNode }) => string;
  renderHTML: (props: {
    options: SlashOptions<SlashOptionSuggestionItem, Attrs>;
    node: ProseMirrorNode;
  }) => DOMOutputSpec;
  deleteTriggerWithBackspace: boolean;
  suggestion: Omit<SuggestionOptions<SlashOptionSuggestionItem, Attrs>, "editor">;
};

const SlashPluginKey = new PluginKey("slash");

export type SuggestionItem = {
  title: string;
  description: string;
  icon: string;
  searchTerms: string[];
  command: (props: { editor: Editor; range: Range }) => void;
};

export const defaultSlashSuggestions: SuggestionOptions<SuggestionItem>["items"] = () => [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    searchTerms: ["p", "paragraph"],
    icon: "lucide:text",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    searchTerms: ["title", "big", "large"],
    icon: "lucide:heading-1",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    searchTerms: ["subtitle", "medium"],
    icon: "lucide:heading-2",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    searchTerms: ["subtitle", "small"],
    icon: "lucide:heading-3",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: "lucide:list",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: "lucide:list-ordered",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: "lucide:text-quote",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: "lucide:code",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Add a table view to organize data.",
    searchTerms: ["table"],
    icon: "lucide:table",
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

const Slash = Node.create<SlashOptions>({
  name: "slash",
  priority: 101,
  addOptions() {
    return {
      HTMLAttributes: {},
      renderText({ options, node }) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
      },
      deleteTriggerWithBackspace: false,
      renderHTML({ options, node }) {
        return [
          "span",
          mergeAttributes(this.HTMLAttributes, options.HTMLAttributes),
          `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
        ];
      },
      suggestion: {
        char: "/",
        pluginKey: SlashPluginKey,
        command: ({ editor, range, props }) => {
          // increase range.to by one when the next node is of type "text"
          // and starts with a space character
          const nodeAfter = editor.view.state.selection.$to.nodeAfter;
          const overrideSpace = nodeAfter?.text?.startsWith(" ");

          if (overrideSpace) {
            range.to += 1;
          }

          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              {
                type: this.name,
                attrs: props,
              },
              {
                type: "text",
                text: " ",
              },
            ])
            .run();

          // get reference to `window` object from editor element, to support cross-frame JS usage
          editor.view.dom.ownerDocument.defaultView?.getSelection()?.collapseToEnd();
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          const type = state.schema.nodes[this.name];
          const allow = !!$from.parent.type.contentMatch.matchType(type);

          return allow;
        },
      },
    };
  },

  group: "inline",

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }

          return {
            "data-id": attributes.id,
          };
        },
      },

      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => {
          if (!attributes.label) {
            return {};
          }

          return {
            "data-label": attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const mergedOptions = { ...this.options };

    mergedOptions.HTMLAttributes = mergeAttributes(
      { "data-type": this.name },
      this.options.HTMLAttributes,
      HTMLAttributes,
    );
    const html = this.options.renderHTML({
      options: mergedOptions,
      node,
    });

    if (typeof html === "string") {
      return ["span", mergeAttributes({ "data-type": this.name }, this.options.HTMLAttributes, HTMLAttributes), html];
    }
    return html;
  },

  renderText({ node }) {
    return this.options.renderText({
      options: this.options,
      node,
    });
  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;

          if (!empty) {
            return false;
          }

          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
              tr.insertText(
                this.options.deleteTriggerWithBackspace ? "" : this.options.suggestion.char || "",
                pos,
                pos + node.nodeSize,
              );

              return false;
            }
          });

          return isMention;
        }),
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

type EditorSlashMenuProps = {
  items: SuggestionItem[];
  command: (item: SuggestionItem) => void;
  editor: Editor;
  range: Range;
};

const EditorSlashMenu = ({ items, editor, range }: EditorSlashMenuProps) => (
  <Command
    className="border shadow"
    id="slash-command"
    onKeyDown={(e) => {
      e.stopPropagation();
    }}
  >
    <CommandEmpty className="flex w-full items-center justify-center p-4 text-gray-300 text-sm">
      <p>No results</p>
    </CommandEmpty>
    <CommandList>
      {items.map((item) => (
        <CommandItem
          className="flex items-center gap-3 pr-3"
          key={item.title}
          onSelect={() => item.command({ editor, range })}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded border bg-primary-foreground">
            <Icon icon={item.icon} className="text-white size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{item.title}</span>
            <span className="text-gray-300 text-xs">{item.description}</span>
          </div>
        </CommandItem>
      ))}
    </CommandList>
  </Command>
);

const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector("#slash-command");

    if (slashCommand) {
      event.preventDefault();

      slashCommand.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: event.key,
          cancelable: true,
          bubbles: true,
        }),
      );

      return true;
    }
  }
};

export type EditorProviderProps = TiptapEditorProviderProps & {
  className?: string;
  limit?: number;
  placeholder?: string;
};

export const EditorProvider = ({ className, extensions, limit, placeholder, ...props }: EditorProviderProps) => {
  const defaultExtensions = [
    StarterKit.configure({
      codeBlock: {
        HTMLAttributes: {
          class: cn("rounded-md border p-4 text-sm", "bg-muted font-mono", "overflow-x-auto"),
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: cn("list-outside list-disc pl-4"),
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: cn("list-outside list-decimal pl-4"),
        },
      },
      listItem: {
        HTMLAttributes: {
          class: cn("leading-normal"),
        },
      },
      blockquote: {
        HTMLAttributes: {
          class: cn("border-l border-l-2 pl-2"),
        },
      },
      code: {
        HTMLAttributes: {
          class: cn("rounded-md bg-muted px-1.5 py-1 font-medium font-mono"),
          spellcheck: "false",
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: cn("mt-4 mb-6 border-muted-foreground border-t"),
        },
      },
      dropcursor: {
        color: "var(--border)",
        width: 4,
      },
      paragraph: {
        HTMLAttributes: {
          class: cn("leading-normal"),
        },
      },
    }),
    Heading.extend({
      // @ts-expect-error
      levels: [1, 2, 3],
      renderHTML({ node, HTMLAttributes }) {
        const level = this.options.levels.includes(node.attrs.level) ? node.attrs.level : this.options.levels[0];
        const classes: { [index: number]: string } = {
          1: "text-2xl",
          2: "text-xl",
          3: "text-lg",
        };
        return [
          `h${level}`,
          mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
            class: `${classes[level]} font-bold`,
          }),
          0,
        ];
      },
    }).configure({ levels: [1, 2, 3] }),
    Typography,
    Placeholder.configure({
      placeholder,
      emptyEditorClass:
        "before:text-muted-foreground before:content-[attr(data-placeholder)] before:float-left before:h-0 before:pointer-events-none",
    }),
    CharacterCount.configure({
      limit,
    }),
    Superscript,
    Subscript,
    Slash.configure({
      suggestion: {
        items: async ({ editor, query }) => {
          const items = await defaultSlashSuggestions({ editor, query });

          if (!query) {
            return items;
          }

          const slashFuse = new Fuse(items, {
            keys: ["title", "description", "searchTerms"],
            threshold: 0.2,
            minMatchCharLength: 1,
          });

          const results = slashFuse.search(query);

          return results.map((result) => result.item);
        },
        char: "/",
        render: () => {
          let component: ReactRenderer<EditorSlashMenuProps>;
          let popup: TippyInstance;

          return {
            onStart: (onStartProps) => {
              component = new ReactRenderer(EditorSlashMenu, {
                props: onStartProps,
                editor: onStartProps.editor,
              });

              popup = tippy(document.body, {
                getReferenceClientRect: () => onStartProps.clientRect?.() || new DOMRect(),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },

            onUpdate(onUpdateProps) {
              component.updateProps(onUpdateProps);

              popup.setProps({
                getReferenceClientRect: () => onUpdateProps.clientRect?.() || new DOMRect(),
              });
            },

            onKeyDown(onKeyDownProps) {
              if (onKeyDownProps.event.key === "Escape") {
                popup.hide();
                component.destroy();

                return true;
              }

              return handleCommandNavigation(onKeyDownProps.event) ?? false;
            },

            onExit() {
              popup.destroy();
              component.destroy();
            },
          };
        },
      },
    }),
    Table.configure({
      HTMLAttributes: {
        class: cn("relative m-0 mx-auto my-3 w-full table-fixed border-collapse overflow-hidden rounded-none text-sm"),
      },
      allowTableNodeSelection: true,
    }),
    TableRow.configure({
      HTMLAttributes: {
        class: cn("relative box-border min-w-[1em] border p-1 text-start align-top"),
      },
    }),
    TableCell.configure({
      HTMLAttributes: {
        class: cn("relative box-border min-w-[1em] border p-1 text-start align-top"),
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: cn(
          "relative box-border min-w-[1em] border bg-secondary p-1 text-start align-top font-medium font-semibold text-white bg-primary-foreground",
        ),
      },
    }),
    TaskList.configure({
      HTMLAttributes: {
        // 17px = the width of the checkbox + the gap between the checkbox and the text
        class: "before:translate-x-[17px]",
      },
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: "flex items-start gap-1",
      },
    }),
  ];

  return (
    <TooltipProvider>
      <div className={cn(className, "[&_.ProseMirror-focused]:outline-none")}>
        <TiptapEditorProvider
          editorProps={{
            handleKeyDown: (_view, event) => {
              handleCommandNavigation(event);
            },
          }}
          extensions={[...defaultExtensions, TextStyleKit, ...(extensions ?? [])]}
          immediatelyRender={false}
          {...props}
        />
      </div>
    </TooltipProvider>
  );
};

export type EditorFloatingMenuProps = Omit<FloatingMenuProps, "editor">;
export type EditorBubbleMenuProps = Omit<BubbleMenuProps, "editor">;

export const EditorBubbleMenu = ({ className, children, ...props }: EditorBubbleMenuProps) => {
  const { editor } = useCurrentEditor();
  return (
    <BubbleMenu
      className={cn(
        "flex rounded-xl border bg-background p-0.5 shadow",
        "[&>*:first-child]:rounded-l-[9px]",
        "[&>*:last-child]:rounded-r-[9px]",
        className,
      )}
      editor={editor ?? undefined}
      {...props}
    >
      {children && Array.isArray(children)
        ? children.reduce((acc: ReactNode[], child, index) => {
            if (index === 0) {
              return [child];
            }

            // biome-ignore lint/suspicious/noArrayIndexKey: "only iterator we have"
            acc.push(<Separator key={index} orientation="vertical" />);
            acc.push(child);
            return acc;
          }, [])
        : children}
    </BubbleMenu>
  );
};

type EditorButtonProps = {
  name: string;
  isActive: () => boolean;
  command: () => void;
  icon: string;
  hideName?: boolean;
};

const BubbleMenuButton = ({ name, isActive, command, icon, hideName }: EditorButtonProps) => (
  <Button className={`flex gap-4 ${hideName ? "" : "w-full"}`} onClick={() => command()} size="sm" variant="ghost">
    <Icon icon={icon} className="shrink-0 text-muted-foreground size-3" />
    {!hideName && <span className="flex-1 text-left">{name}</span>}
    {isActive() ? <Icon icon={"lucide:check"} className="shrink-0 text-muted-foreground size-3" /> : null}
  </Button>
);

export type EditorClearFormattingProps = Pick<EditorButtonProps, "hideName">;

export const EditorClearFormatting = ({ hideName = true }: EditorClearFormattingProps) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      hideName={hideName}
      icon={"lucide:remove-formatting"}
      isActive={() => false}
      name="Clear Formatting"
    />
  );
};

export type EditorNodeTextProps = Pick<EditorButtonProps, "hideName">;

export const EditorNodeText = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleNode("paragraph", "paragraph").run()}
      hideName={hideName}
      icon={"lucide:text"}
      isActive={() => editor?.isActive("paragraph") ?? false}
      name="Text"
    />
  );
};

export type EditorNodeHeading1Props = Pick<EditorButtonProps, "hideName">;

export const EditorNodeHeading1 = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      hideName={hideName}
      icon={"lucide:heading-1"}
      isActive={() => editor.isActive("heading", { level: 1 }) ?? false}
      name="Heading 1"
    />
  );
};

export type EditorNodeHeading2Props = Pick<EditorButtonProps, "hideName">;

export const EditorNodeHeading2 = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      hideName={hideName}
      icon={"lucide:heading-2"}
      isActive={() => editor.isActive("heading", { level: 2 }) ?? false}
      name="Heading 2"
    />
  );
};

export type EditorNodeHeading3Props = Pick<EditorButtonProps, "hideName">;

export const EditorNodeHeading3 = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      hideName={hideName}
      icon={"lucide:heading-3"}
      isActive={() => editor.isActive("heading", { level: 3 }) ?? false}
      name="Heading 3"
    />
  );
};

export type EditorNodeBulletListProps = Pick<EditorButtonProps, "hideName">;

export const EditorNodeBulletList = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleBulletList().run()}
      hideName={hideName}
      icon={"lucide:list"}
      isActive={() => editor.isActive("bulletList") ?? false}
      name="Bullet List"
    />
  );
};

export type EditorNodeOrderedListProps = Pick<EditorButtonProps, "hideName">;

export const EditorNodeOrderedList = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleOrderedList().run()}
      hideName={hideName}
      icon={"lucide:list-ordered"}
      isActive={() => editor.isActive("orderedList") ?? false}
      name="Numbered List"
    />
  );
};
export type EditorNodeQuoteProps = Pick<EditorButtonProps, "hideName">;

export const EditorNodeQuote = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleNode("paragraph", "paragraph").toggleBlockquote().run()}
      hideName={hideName}
      icon={"lucide:text-quote"}
      isActive={() => editor.isActive("blockquote") ?? false}
      name="Quote"
    />
  );
};

export type EditorNodeCodeProps = Pick<EditorButtonProps, "hideName">;

export const EditorNodeCode = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleCodeBlock().run()}
      hideName={hideName}
      icon={"lucide:code"}
      isActive={() => editor.isActive("codeBlock") ?? false}
      name="Code"
    />
  );
};

export type EditorNodeTableProps = Pick<EditorButtonProps, "hideName">;

export const EditorNodeTable = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      hideName={hideName}
      icon={"lucide:table"}
      isActive={() => editor.isActive("table") ?? false}
      name="Table"
    />
  );
};

export type EditorSelectorProps = HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
};

export const EditorSelector = ({ open, onOpenChange, title, className, children, ...props }: EditorSelectorProps) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button className="gap-2 rounded-none border-none" size="sm" variant="ghost">
          <span className="whitespace-nowrap text-xs">{title}</span>
          <Icon icon={"lucide:chevron-down"} className={"size-3"} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-48 p-1", className)} sideOffset={5} {...props}>
        {children}
      </PopoverContent>
    </Popover>
  );
};

export type EditorFormatBoldProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatBold = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleBold().run()}
      hideName={hideName}
      icon={"lucide:bold"}
      isActive={() => editor.isActive("bold") ?? false}
      name="Bold"
    />
  );
};

export type EditorFormatItalicProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatItalic = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleItalic().run()}
      hideName={hideName}
      icon={"lucide:italic"}
      isActive={() => editor.isActive("italic") ?? false}
      name="Italic"
    />
  );
};

export type EditorFormatStrikeProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatStrike = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleStrike().run()}
      hideName={hideName}
      icon={"lucide:strikethrough"}
      isActive={() => editor.isActive("strike") ?? false}
      name="Strikethrough"
    />
  );
};

export type EditorFormatCodeProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatCode = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleCode().run()}
      hideName={hideName}
      icon={"lucide:code"}
      isActive={() => editor.isActive("code") ?? false}
      name="Code"
    />
  );
};

export type EditorFormatSubscriptProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatSubscript = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleSubscript().run()}
      hideName={hideName}
      icon={"lucide:subscript"}
      isActive={() => editor.isActive("subscript") ?? false}
      name="Subscript"
    />
  );
};

export type EditorFormatSuperscriptProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatSuperscript = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleSuperscript().run()}
      hideName={hideName}
      icon={"lucide:superscript"}
      isActive={() => editor.isActive("superscript") ?? false}
      name="Superscript"
    />
  );
};

export type EditorFormatUnderlineProps = Pick<EditorButtonProps, "hideName">;

export const EditorFormatUnderline = ({ hideName = false }: Pick<EditorButtonProps, "hideName">) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenuButton
      command={() => editor.chain().focus().toggleUnderline().run()}
      hideName={hideName}
      icon={"lucide:underline"}
      isActive={() => editor.isActive("underline") ?? false}
      name="Underline"
    />
  );
};

export type EditorLinkSelectorProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const EditorLinkSelector = ({ open, onOpenChange }: EditorLinkSelectorProps) => {
  const [url, setUrl] = useState<string>("");
  const inputReference = useRef<HTMLInputElement>(null);
  const { editor } = useCurrentEditor();

  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const getUrlFromString = (text: string): string | null => {
    if (isValidUrl(text)) {
      return text;
    }
    try {
      if (text.includes(".") && !text.includes(" ")) {
        return new URL(`https://${text}`).toString();
      }

      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    inputReference.current?.focus();
  }, []);

  if (!editor) {
    return null;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    const href = getUrlFromString(url);

    if (href) {
      editor.chain().focus().setLink({ href }).run();
      onOpenChange?.(false);
    }
  };

  const defaultValue = (editor.getAttributes("link") as { href?: string }).href;

  return (
    <Popover modal onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger asChild>
        <Button className="gap-2 rounded-none border-none" size="sm" variant="ghost">
          <Icon icon={"lucide:external-link"} className={"size-3"} />
          <p
            className={cn("text-xs underline decoration-text-muted underline-offset-4", {
              "text-primary": editor.isActive("link"),
            })}
          >
            Link
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <form className="flex p-1" onSubmit={handleSubmit}>
          <input
            aria-label="Link URL"
            className="flex-1 bg-background p-1 text-sm outline-none"
            defaultValue={defaultValue ?? ""}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste a link"
            ref={inputReference}
            type="text"
            value={url}
          />
          {editor.getAttributes("link").href ? (
            <Button
              className="flex h-8 items-center rounded-sm p-1 text-destructive transition-all hover:bg-destructive-foreground dark:hover:bg-destructive"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                onOpenChange?.(false);
              }}
              size="icon"
              type="button"
              variant="outline"
            >
              <Icon icon={"lucide:trash"} className={"size-3"} />
            </Button>
          ) : (
            <Button className="h-8" size="icon" variant="secondary">
              <Icon icon={"lucide:check"} className={"size-3"} />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};

export type EditorTableMenuProps = {
  children: ReactNode;
};

export const EditorTableMenu = ({ children }: EditorTableMenuProps) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  const isActive = editor.isActive("table");

  return (
    <div
      className={cn({
        hidden: !isActive,
      })}
    >
      {children}
    </div>
  );
};

export type EditorTableGlobalMenuProps = {
  children: ReactNode;
};

export const EditorTableGlobalMenu = ({ children }: EditorTableGlobalMenuProps) => {
  const { editor } = useCurrentEditor();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on("selectionUpdate", () => {
      const selection = window.getSelection();

      if (!selection) {
        return;
      }

      const range = selection.getRangeAt(0);
      let startContainer = range.startContainer as HTMLElement | string;

      if (!(startContainer instanceof HTMLElement)) {
        startContainer = range.startContainer.parentElement as HTMLElement;
      }

      const tableNode = startContainer.closest("table");

      if (!tableNode) {
        return;
      }

      const tableRect = tableNode.getBoundingClientRect();

      setTop(tableRect.top + tableRect.height);
      setLeft(tableRect.left + tableRect.width / 2);
    });

    return () => {
      editor.off("selectionUpdate");
    };
  }, [editor]);

  return (
    <div
      className={cn(
        "-translate-x-1/2 absolute flex translate-y-1/2 items-center rounded-full border bg-background shadow-xl",
        {
          hidden: !(left || top),
        },
      )}
      style={{ top, left }}
    >
      {children}
    </div>
  );
};

export type EditorTableColumnMenuProps = {
  children: ReactNode;
};

export const EditorTableColumnMenu = ({ children }: EditorTableColumnMenuProps) => {
  const { editor } = useCurrentEditor();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on("selectionUpdate", () => {
      const selection = window.getSelection();

      if (!selection) {
        return;
      }

      const range = selection.getRangeAt(0);
      let startContainer = range.startContainer as HTMLElement | string;

      if (!(startContainer instanceof HTMLElement)) {
        startContainer = range.startContainer.parentElement as HTMLElement;
      }

      // Get the closest table cell (td or th)
      const tableCell = startContainer.closest("td, th");

      if (!tableCell) {
        return;
      }

      const cellRect = tableCell.getBoundingClientRect();

      setTop(cellRect.top);
      setLeft(cellRect.left + cellRect.width / 2);
    });

    return () => {
      editor.off("selectionUpdate");
    };
  }, [editor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 absolute flex h-4 w-7 overflow-hidden rounded-md border bg-background shadow-xl",
          {
            hidden: !(left || top),
          },
        )}
        style={{ top, left }}
      >
        <Button size="icon" variant="ghost">
          <Icon icon={"lucide:ellipsis"} className="text-muted-foreground size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
};

export type EditorTableRowMenuProps = {
  children: ReactNode;
};

export const EditorTableRowMenu = ({ children }: EditorTableRowMenuProps) => {
  const { editor } = useCurrentEditor();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.on("selectionUpdate", () => {
      const selection = window.getSelection();

      if (!selection) {
        return;
      }

      const range = selection.getRangeAt(0);
      let startContainer = range.startContainer as HTMLElement | string;

      if (!(startContainer instanceof HTMLElement)) {
        startContainer = range.startContainer.parentElement as HTMLElement;
      }

      const tableRow = startContainer.closest("tr");

      if (!tableRow) {
        return;
      }

      const rowRect = tableRow.getBoundingClientRect();

      setTop(rowRect.top + rowRect.height / 2);
      setLeft(rowRect.left);
    });

    return () => {
      editor.off("selectionUpdate");
    };
  }, [editor]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={cn(
            "-translate-x-1/2 -translate-y-1/2 absolute flex h-7 w-4 overflow-hidden rounded-md border bg-background shadow-xl",
            {
              hidden: !(left || top),
            },
          )}
          size="icon"
          style={{ top, left }}
          variant="ghost"
        >
          <Icon icon={"lucide:ellipsis-vertical"} className="text-muted-foreground size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
};

export const EditorTableColumnBefore = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnBefore().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <Icon icon={"lucide:arrow-left"} className="text-muted-foreground size-4" />
      <span>Add column before</span>
    </DropdownMenuItem>
  );
};

export const EditorTableColumnAfter = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().addColumnAfter().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <Icon icon={"lucide:arrow-right"} className="text-muted-foreground size-4" />
      <span>Add column after</span>
    </DropdownMenuItem>
  );
};

export const EditorTableRowBefore = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowBefore().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <Icon icon={"lucide:arrow-up"} className="text-muted-foreground size-4" />
      <span>Add row before</span>
    </DropdownMenuItem>
  );
};

export const EditorTableRowAfter = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().addRowAfter().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <Icon icon={"lucide:arrow-down"} className="text-muted-foreground size-4" />
      <span>Add row after</span>
    </DropdownMenuItem>
  );
};

export const EditorTableColumnDelete = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteColumn().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <Icon icon={"lucide:trash"} className="text-destructive size-4" />
      <span>Delete column</span>
    </DropdownMenuItem>
  );
};

export const EditorTableRowDelete = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteRow().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DropdownMenuItem className="flex items-center gap-2" onClick={handleClick}>
      <Icon icon={"lucide:trash"} className="text-destructive size-4" />
      <span>Delete row</span>
    </DropdownMenuItem>
  );
};

export const EditorTableHeaderColumnToggle = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleHeaderColumn().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex items-center gap-2 rounded-full" onClick={handleClick} size="icon" variant="ghost">
          <Icon icon={"lucide:columns"} className="text-muted-foreground size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Toggle header column</span>
      </TooltipContent>
    </Tooltip>
  );
};

export const EditorTableHeaderRowToggle = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleHeaderRow().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex items-center gap-2 rounded-full" onClick={handleClick} size="icon" variant="ghost">
          <Icon icon={"lucide:rows"} className="text-muted-foreground size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Toggle header row</span>
      </TooltipContent>
    </Tooltip>
  );
};

export const EditorTableDelete = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex items-center gap-2 rounded-full" onClick={handleClick} size="icon" variant="ghost">
          <Icon icon={"lucide:trash"} className="text-destructive size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Delete table</span>
      </TooltipContent>
    </Tooltip>
  );
};

export const EditorTableMergeCells = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().mergeCells().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex items-center gap-2 rounded-full" onClick={handleClick} size="icon" variant="ghost">
          <Icon icon={"lucide:table-cells-merge"} className="text-muted-foreground size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Merge cells</span>
      </TooltipContent>
    </Tooltip>
  );
};

export const EditorTableSplitCell = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().splitCell().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex items-center gap-2 rounded-full" onClick={handleClick} size="icon" variant="ghost">
          <Icon icon={"lucide:table-columns-split"} className="text-muted-foreground size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Split cell</span>
      </TooltipContent>
    </Tooltip>
  );
};

export const EditorTableFix = () => {
  const { editor } = useCurrentEditor();

  const handleClick = useCallback(() => {
    if (editor) {
      editor.chain().focus().fixTables().run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className="flex items-center gap-2 rounded-full" onClick={handleClick} size="icon" variant="ghost">
          <Icon icon={"lucide:bolt"} className="text-muted-foreground size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span>Fix table</span>
      </TooltipContent>
    </Tooltip>
  );
};
